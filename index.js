const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const db = require('./db.js')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const dotenv = require('dotenv')
dotenv.config();

const moment = require('moment');
const multer = require('multer');


const app = express();
app.use(cors({ origin: true, credentials:true}))
app.use(cookieParser());//to get the cookies from request.
app.use(express.json())


app.use('/images', express.static(path.join(__dirname, 'public/images')));




const cookieOptions = {
    httpOnly:false,//false?
    path: '/',
    secure: true, //set to true only in production, as now cookies can be only be served in https requests and not http requests
    //secure: false, means to allow both http requests and https api requests
    domain:process.env.DOMAIN,
    sameSite: 'None',//None?
}


const secretKey = process.env.KEY





app.get('/', (req, res) => {
    res.json('am i working?')
})


app.get('/getRooms', async (req, res) => {
    try {

        const getRooms = await db.query('SELECT * from rooms ORDER BY id DESC;')
        return res.status(200).json(getRooms[0])
    }
    catch (err) {
        return res.status(400).json(err)
    }
})

app.get('/getSelected', async (req, res) => {
    try {
        const { getAmount, getPage, filter } = req.query;//please note that the getPage will start on the specified value and going by the limit, 1->0, 2->5 so every page has 5 rows, which offset starts on.
        const limit = parseInt(getAmount);
        const offset = parseInt(getPage)

        if (filter === '') {
            const getRooms = await db.query('SELECT * FROM rooms ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
            return res.status(200).json(getRooms[0])
        }
        else {
            const getRooms = await db.query(`SELECT * FROM rooms WHERE name LIKE '%${filter}%' ORDER BY id DESC LIMIT ? OFFSET ?`, [limit, offset]);
            return res.status(200).json(getRooms[0])
        }


        
    }
    catch (err) {
        return res.status(400).json(err)
    }
})



app.get('/getUser', async (req, res) => {
    //pass in foreign key query

    try {
        const { id } = req.query;//http://localhost:8000/getUser?id=29
        const user = await db.query('SELECT * FROM users WHERE id = ? ', [id])
        //refer to the value given: id
        if (user[0].length === 0) {
            return res.status(200).json('no user found')
        }
        return res.status(200).json(user[0][0])//the first array(holds the actual data)
    }
    catch (error) {
        return res.status(400).json(error)
    }

})





app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;//req.query for get requests in cases
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!username || !password || !email) {
            return res.status(400).json('All fields are required');
        }
        //test the accounts validity
        const usernamePattern = /^[a-zA-Z0-9_]{3,16}$/;
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
                            
        if (!usernamePattern.test(username)) {
            return res.status(400).json('username:  size has to be between 3-16 characters, no special characters');
        }
        
        else if(!passwordPattern.test(password)){
            return res.status(400).json('Password: Needs to have at least 8 characters, one uppercase letter, one number, and a special character');
        }
        else if(!emailPattern.test(email)){
            return res.status(400).json('Email: @  and period required!');
        }
        
        const checkRecords = await db.query(`SELECT * FROM users WHERE username = ?`, [username])

        if (checkRecords[0].length > 0) {//another array of binary is included, figure out how to remove it.
            return res.status(400).json('user already exists')
        }

        await db.query(`INSERT INTO users (username, password, email) VALUES (?, ?, ?)`, [username, hashedPassword, email])
        const getNewUser = await db.query(`SELECT * FROM users WHERE username = ?`, [username])


        const user = {//get the userinfo with id...
            username: getNewUser[0][0].username,
            total_rooms: getNewUser[0][0].total_rooms,
            email: getNewUser[0][0].email,
            profilepic: getNewUser[0][0].profile_pic || null,
            id: getNewUser[0][0].id,
        };


        const token = jwt.sign(user, secretKey, { expiresIn: '2h' });//this token you can use for the user to request their token again
        res.cookie('token', token, cookieOptions)//FIX THIS, WE NEED COOKIES SO WE KNOW THAT THE USER CAN BE LOGGED IN AND DOSENT GET LOGGED OUT
        return res.json('token has been created, you have successfully created an account')


    }
    catch (err) {
        return res.status(400).json(err)

    }
})



app.post('/login', async (req, res) => {
    const getToken = req.cookies.token;
    if (getToken) {
        return res.status(400).json('You are already logged in!')
    }

    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json('Username and password are required');
        }

        const getlogin = await db.query('SELECT * FROM users WHERE username = ?', [username])
        if (getlogin[0].length < 1) {
            return res.status(400).json('account does not exist, please enter a valid account');
        }

        const userPassword = getlogin[0][0].password;
        const valid = await bcrypt.compare(password, userPassword)//compare the user password with the stated password
        if (!valid) {
            return res.status(400).json('invalid credentials')
        }

        else {
            const user = {//get the userinfo with id...
                username: getlogin[0][0].username,
                total_rooms: getlogin[0][0].total_rooms,
                email: getlogin[0][0].email,
                id: getlogin[0][0].id,
                profile_pic: getlogin[0][0].profile_pic,
                
            }
           
            const token = jwt.sign(user, secretKey, { expiresIn: '2h' });//this token you can use for the user to request their token again
            //try to make cookies
        
            res.cookie('token', token, cookieOptions)
            return res.json('you have successfully logged in to your account')


            //we will send to cookies,cookies is a failure, must try to fix this.. and then rerender out navbar to check for a token to get the user.
        }

    }
    catch (err) {
        return res.status(400).json(err)
    }
})





app.get('/checkUser', async (req, res) => {//be careful of infinite loops with redux and other things
    try {

        const getToken = req.cookies.token;//token has a required size limit
        console.log(getToken)
        if (!getToken) {//this method will not work on endpoints, as it relies on the default "let" value which is '', cookies hold values from logged in states... thus we can check it easily, however cookies it not working for us, 
            console.log('token does not exist,no user found')
            return res.json({ isAuthenticated: false });
        }
        else {
            const secretKey = process.env.KEY
            const decodedToken = jwt.verify(getToken, secretKey);//dictionary



            //get user info here.... through sql by  the decoded token...
            console.log('verified token', decodedToken)
            return res.json({ isAuthenticated: true, info: decodedToken });//is authenticated will then display all the things that I need
        }

    }
    catch (err) {
        return res.status(400).json(err);
    }
})


app.get('/logout', (req, res) => {
    //force rerender through useState as soon as well call log out, to check if theres no token, usually we would clear cookies and then call to check if cookies exist, 
    res.clearCookie('token', cookieOptions);//you need credentials to log out of the user as well..
    console.log('you have been logged out')
    res.json('you have been logged out')
})




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./client/public/upload")//where we store the images
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname)//creates a unique file name
    }
  })

//const upload = multer({ storage: multer.memoryStorage() });//memory storage stores the objects as buffer that contains the image
const upload = multer({ storage: storage})



const profilePicStorage = multer.diskStorage({//for profile Pictures
    destination: function (req, file, cb) {
      cb(null, "./client/public/profileImages")//where we store the images
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname)//creates a unique file name
    }
  })

const profileUpload = multer({storage: profilePicStorage})


app.post('/addRoom', upload.fields([
    { name: 'frontimage', maxCount: 1 },
    { name: 'slideimage1', maxCount: 1 },
    { name: 'slideimage2', maxCount: 1 },
]), async (req, res) => {

    const { name, maxCount, phonenumber, rentPerDay, description, userId, total_likes, start_datetime, end_datetime, address, owner } = req.body;

    //be careful when sending images and trying to detect tokens
    const getToken = req.cookies.token;//prevent against client side code manipulation

    if (!getToken) {//needed for all important routes only user can do, as what if someone tries to edit the client side code???
        return res.json('404: user has not signed in!')
    }
    try {
        const getRoomTotal = await db.query(`SELECT total_rooms FROM users WHERE id = ?;`, [userId]);
        console.log(userId)

        if (getRoomTotal[0][0].total_rooms >= 5) {
            return res.status(400).json('You have reached the maximum number of rooms you can create, please delete a room');
        }


        // Access the uploaded file data

        const images = req.files;
        console.log(images['frontimage'][0].filename)
        console.log(images['frontimage'])
        if (!images) {
            return res.status(400).json('No images uploaded');
        }


        const formattedStartDate = start_datetime ? moment(start_datetime).format('YYYY-MM-DD HH:mm:ss') : null;
        const formattedEndDate = end_datetime ? moment(end_datetime).format('YYYY-MM-DD HH:mm:ss') : null;

        await db.query(`
            INSERT INTO rooms (name, maxCount, phonenumber, rentPerDay, image, description, userId, total_likes, start_datetime, end_datetime, image2, image3, address, owner)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, [name, maxCount, phonenumber, rentPerDay, images['frontimage'][0].filename, description, userId, total_likes, formattedStartDate, formattedEndDate, images['slideimage1'][0].filename, images['slideimage2'][0].filename, address, owner]);
        //[name, maxCount, phonenumber, rentPerDay, images['frontimage'][0].buffer.toString('base64'), description, userId, total_likes, formattedStartDate, formattedEndDate, images['slideimage1'][0].buffer.toString('base64'), images['slideimage2'][0].buffer.toString('base64'), address, owner]);


        await db.query(`UPDATE users SET total_rooms = total_rooms + 1 WHERE id = ?;`, [userId]);

        return res.status(200).json(`New room ${name} has been added. You can add ${5 - getRoomTotal[0][0].total_rooms - 1} more rooms.`);
    } catch (err) {
        console.error(err);
        return res.status(400).json(err);
    }
});


//Profile Page
app.get('/usersPosts', async (req, res) => {
    //pass in foreign key query
    /*const getToken = req.cookies.token;
    if (!getToken) {
        return res.json('404-user is not signed in')
    }*/
    try {
        const { id } = req.query;//http://localhost:8000/usersPosts?id=29
        const usersPosts = await db.query('SELECT * FROM rooms WHERE userId = ? ', [id])
        //refer to the value given: id
        return res.status(200).json(usersPosts[0])//the first array(holds the actual data)
    }
    catch (error) {
        return res.status(400).json(error)
    }

})


//maybe got to add multer again here...
app.post('/changePic', profileUpload.fields([{ name: 'picture', maxCount: 1 }]), async (req, res) => {

    const getToken = req.cookies.token;
    if (!getToken) {
        return res.json('404-user is not signed in')
    }
    //we should be able to select a query, changing the profile pic.
    try {
        const images = req.files;//for picture

        console.log(images['picture'][0].filename)

        const { id } = req.body;
        console.log(id)

        await db.query(
            `UPDATE users 
        SET profile_pic = ? 
        WHERE id = ?;`, [images['picture'][0].filename, id]);

        return res.status(200).json('picture successfully changed')
    }
    catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }


})

app.post('/deleteRoom', async (req, res) => {
    const getToken = req.cookies.token;
    if (!getToken) {
        res.status(400).json('you are not logged in!')
    }
    else {
        const user = req.body;//id of the user
        const secretKey = process.env.KEY;

        const decodedToken = jwt.verify(getToken, secretKey);//ensures the user is actually logged into the account
        console.log(decodedToken.id);
        console.log(parseInt(user.id))

        if (!user.id) {
            // Handle the undefined user.id case(big problem)
            return res.status(400).json('User ID is undefined.');
        }

        if (decodedToken.id == parseInt(user.id)) {

            await db.query(`DELETE FROM rooms WHERE id = ?;`, [user.postId])//delete account based on id

            db.query(`UPDATE users SET total_rooms = total_rooms - 1 WHERE id = ?;`, [user.id]);
            res.status(200).json('you have successfully deleted your room')
        }
        else {
            res.status(400).json('you are not logged into required account')
        }


    }

})





app.get('/checkFriend', async (req, res) => {
    //check if theres a sentId(the person's online), this should be done through the tokens id..., and the users id we send
    try {
        const getToken = req.cookies.token;
        if (!getToken) {
            return res.status(200).json('user is not authenticated')//ill just have to call !response.data or something
        }
        else {
            const { id } = req.query;//please note that is a string in a dictionary, queries are put in dictionaries
            const getId = parseInt(id)
            const secretKey = process.env.KEY;
            const decodedToken = jwt.verify(getToken, secretKey);

            if (getId == decodedToken.id) {
                console.log('this is the logged in user')
                return res.status(200).json({ hide: true });//if user looking is looking at his own userProfile...
            }

            const seeIfFriends = await db.query(`SELECT * FROM friends
            WHERE senders_id = ? AND friends_id = ?;`, [decodedToken.id, getId]);//if i sent the request...

            const requestAlreadySent = await db.query(`SELECT * FROM friends
            WHERE senders_id = ? AND friends_id = ?;`, [getId, decodedToken.id]);
            //if the user has sent a request to me, i dont need to send another request to him

            if (seeIfFriends[0].length > 0|| requestAlreadySent[0].length > 0) {//remember the first array
                console.log('friend request already sent')
                return res.status(200).json({ hide: true });//basically we already sent a friend request...maybe use redux to update the state immediately
            }
            else {
                console.log('no friend request has been sent')
                return res.status(200).json({ hide: false })
            }
        }
    }
    catch (error) {
        console.log(error)
    }

})


app.post('/addFriend', async (req, res) => {
    try {
        const getToken = req.cookies.token;
        if (!getToken) {
            console.log('user is not authenticated')
            return res.status(200).json(null)//ill just have to call !response.data or something to raise Login
        }
        else {

            const id = req.body.id;//the users id...A string!!! parse into a int
            console.log(parseInt(id))
            const secretKey = process.env.KEY;
            const decodedToken = jwt.verify(getToken, secretKey);

            await db.query(`INSERT INTO friends (senders_id, friends_id, accepted)
            VALUES (?, ?, false);`, [decodedToken.id, parseInt(id)]);

            return res.status(200).json('friend request sent');
        }
    }
    catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }

})



// we should get all the ids here, select where id = true and is false for accepted..

//note:friend_id should be the person we should check for in cookies... this is the user that has been sent the request. the current
//the senders_id user is the person we need to get info from as thats the person who sent the user info
app.get('/getRequests', async (req, res) => {
    try {
        const getToken = req.cookies.token;
        if (!getToken) {
            return res.json({ isAuthenticated: false });
        }

        else {
            const secretKey = process.env.KEY;
            const decodedToken = jwt.verify(getToken, secretKey);
            const getFriendRequests = await db.query(`SELECT friends.*, users.*
            FROM friends
            JOIN users ON friends.senders_id = users.id
            WHERE friends_id = ? AND friends.accepted = false;`, [decodedToken.id]);
            console.log('all friend requests recieved');

            return res.status(200).json(getFriendRequests[0]);//an array
        }
    }
    catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
})


//we should render here for all the ids are there(for user only) WHERE true for accepted(should render for friends only)

app.post('/acceptRequest', async(req,res)=>{
    //where senders_id is sent, and user_id is the one we will be use token for..
    try {
        const getToken = req.cookies.token;
        const senderId = req.body.senderId;//getting the value sent from the frontend {senderId}
        console.log(senderId)

        if (!getToken) {
            return res.status(400).json('user is not authenticated');
        }
        const secretKey = process.env.KEY;
        const decodedToken = jwt.verify(getToken, secretKey);
        //decodedToken is our ID
        await db.query(`UPDATE friends SET accepted = TRUE WHERE (senders_id = ? AND friends_id = ?)`,[senderId, decodedToken.id])
        res.status(200).json('friend request accepted')
    }
    catch(error){
        res.status(400).json(error)
    }


})

app.post('/declineRequest', async(req,res)=>{
    //delete where user_id(from token) and senders id
    try {
        const getToken = req.cookies.token;
        const senderId = req.body.senderId;//getting the value sent from the frontend {senderId}
        console.log(senderId)

        if (!getToken) {
            return res.status(400).json('user is not authenticated');
        }
        const secretKey = process.env.KEY;
        const decodedToken = jwt.verify(getToken, secretKey);
        //decodedToken is our ID
        await db.query(`DELETE FROM friends
        WHERE (senders_id = ? AND friends_id = ?)`,[senderId, decodedToken.id]);

        res.status(200).json('friend request declined')
    }
    catch(error){
        res.status(400).json(error)
    }

})



app.get('/getFriends', async(req,res)=>{
    try {
        const getToken = req.cookies.token;

        const { profileParam } = req.query;

        if (!getToken) {
            return res.status(400).json('user is not authenticated');
        }
        else{   
            const secretKey = process.env.KEY;
            const decodedToken = jwt.verify(getToken, secretKey);

            if(profileParam){//if theres a query param(we can call this in profile picture), not needed to use token..
                const getUsersFriends = await db.query(`SELECT *
                FROM users
                WHERE id IN (
                    SELECT
                        CASE
                            WHEN senders_id = ? AND accepted = TRUE THEN friends_id
                            WHEN friends_id = ? AND accepted = TRUE THEN senders_id
                        END AS friend_id
                    FROM friends
                    WHERE (senders_id = ? OR friends_id = ?) AND accepted = TRUE);`
                ,[parseInt(profileParam), parseInt(profileParam), parseInt(profileParam),parseInt(profileParam)]);

                return res.status(200).json(getUsersFriends[0])

            }
            else{//if its the user...

            const getUsersFriends = await db.query(`SELECT *
                FROM users
                WHERE id IN (
                    SELECT
                        CASE
                            WHEN senders_id = ? AND accepted = TRUE THEN friends_id
                            WHEN friends_id = ? AND accepted = TRUE THEN senders_id
                        END AS friend_id
                    FROM friends
                    WHERE (senders_id = ? OR friends_id = ?) AND accepted = TRUE);`
                ,[parseInt(decodedToken.id),parseInt(decodedToken.id),parseInt(decodedToken.id),parseInt(decodedToken.id)]);

            return res.status(200).json(getUsersFriends[0])
            
            }
        }
    }
    catch(error){
        return res.status(400).json(error)
    }

})


app.get('/getUsers', async (req, res) => {
    const {getSearch, getAmount, getPage} = req.query;
    const limit = parseInt(getAmount);
    const offset = parseInt(getPage);
    console.log(getSearch);

    try {
        if(getSearch === ''){//undefined
            const getTable = await db.query('SELECT * from users ORDER BY id DESC LIMIT ? OFFSET ?;',[limit, offset])
            res.status(200).json(getTable[0])//just get all the data, which is an array of dictionaries(the rest is buffer data)
        }
        else{
            const getTable = await db.query(`SELECT * FROM users WHERE username LIKE '%${getSearch}%' LIMIT ? OFFSET ?;`,[limit, offset])
            res.status(200).json(getTable[0])//array format
        }
    }
        
    catch (err) {
        return res.status(400).json(err)
    }

})








PORT = process.env.PORT
app.listen(PORT, () => {
    console.log('backend established')
})