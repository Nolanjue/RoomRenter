import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import './ProfilePage.css'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Loader from '../components/Loader';
import Room from '../components/Room'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'
import { updateUserState } from '../components/stateManager'
function ProfilePage() {

    const currentImage = document.querySelector('.profile-image');

    const navigate = useNavigate()
    const [max, setMax] = useState(false)
    const [change, setChange] = useState(false)
    const [values, setValues] = useState([]);
    const [loading, setLoading] = useState(false);

    const [checker, setChecker]= useState(0);

    const [user, setUser] =
        useState({ id: null, username: null, email: '', total_rooms: 0, profile_pic: 'default-image.png' })

    const [pic, setPic] = useState({ picture: null })


    const [friends, setFriends] = useState([])


    const changeState = useSelector(((state) => state.changeUser.changeState))



    const dispatch = useDispatch()


    const Check = async () => {
        if (user.total_rooms === 5) {
            setMax(true)
            console.log('maximum rooms achieved')
        }
        try {
            //what if client deletes this axios post? better to secure individual endpoints for user by checking for token...
            const axiosCredentials = { withCredentials: true, credentials: 'include' }
            const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/checkUser`, axiosCredentials)

            const userData = userResponse.data;

            if (!userData.isAuthenticated) {//make sure every route is protected, leave authentication in server side
                console.log(userData)
                console.log('user is not authenticated')
                navigate('/Home')

            }
            else {
                console.log(userData.info)
                setUser(userData.info);

                if (!userData.info.profile_pic) {
                    setUser({ id: userData.info.id, username: userData.info.username, total_rooms: userData.info.total_rooms, email: userData.info.email, profile_pic: 'default-image.png' });
                }
                else {
                    console.log(userData.info.profile_pic)
                    console.log('user profile recieved')
                }
                console.log('user is authenticated')
                getValues('rooms')

            }
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                console.log('Please Login again, your token has expired')
                navigate('/Home')

            }
            else {
                console.log(error)
            }
        }
    }


    useEffect(() => {
        console.log('user Checked')
        Check()
        //console.log(users) -> remember states are not asyncronous, so you wont be able to log the changes, only display them
    }, [checker])//refresh when we do things with the user..


    const getValues = async (value) => {

        if (value === 'rooms') {
            try {
                setLoading(true)
                const getId = user.id;
                //const axiosCredentials = { withCredentials: true, credentials: 'include' }
                //only use credentials and check for token if im editing or doing anything the user should be doing
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/usersPosts?id=${getId}`);
                setValues(response.data)//need this for the data
                console.log('data has been recieved')
                setLoading(false)
            }
            catch (error) {
                console.log(error)
            }

        }

        else if (value === 'friends') {
            try {
                setLoading(true)
                const axiosCredentials = { withCredentials: true, credentials: 'include' }
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getFriends`, axiosCredentials);
                setFriends(response.data)//need this for the data
                console.log('data has been recieved')
                console.log(friends)
                setLoading(false)
            }
            catch (error) {
                console.log(error)
            }
        }

    }

    const Clicker = (e) => {
        e.preventDefault()
        const profileChanger = document.querySelector('.profile-changer');
        profileChanger.click()
    }

    const changeImage = (e) => {
        try {
            const newImage = e.target.files[0];
            currentImage.src = URL.createObjectURL(newImage);
            setPic({ picture: newImage })//profilepic is a key, make sure you do a [] to get a key value..
            setChange(true)
        }
        catch (err) {
            console.log(err)
        }

    }
    const changeProfilePic = async (e) => {
        e.preventDefault()
        //axios call here to change profile image using headers.
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/changePic`,
                {
                    id: user.id,
                    picture: pic.picture
                }, {
                withCredentials: true,
                credentials: 'include',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            console.log('picture changed');
            //dispatch not currently working, better use alert to notify
            alert('to see your new profile picture, please relogin! This will need to be fixed')
            setChange(false)
        }
        catch (error) {
            console.log(error)
        }
    }


    return (

        <div className='body'>
            <Navbar />
            <div className='profile-content'>
                <div className='profile-holder'>
                    <div className='public-details'>
                        <div className='name-holder'>
                            <h1>Hi {user.username}!</h1>
                        </div>

                        <span>{user.email}</span>
                    </div>
                    <div className='profile-image-holder'>
                        <img className='profile-image' name='picture' src={`${user.profile_pic}`}/>

                        <button className='picture-button' onClick={(e) => Clicker(e)}>+</button>
                        {change && <button className='change-button' onClick={(e) => { changeProfilePic(e) }}>Change Profile Picture?</button>}

                        <input type="file" className='profile-changer' name='profilepic' onChange={(e) => changeImage(e)} accept="image/*" required />

                    </div>
                    <div className='profile-details'>
                        You have {user.total_rooms} total rooms
                    </div>


                    {max &&
                        <div className='max'>
                            You have reached the max amount of rooms, please delete a room to add more..
                        </div>}

                    <div className='room-details'>
                        <Tabs className='mb-3' defaultActiveKey={null} onSelect={(key) => getValues(key)}>
                            <Tab eventKey="rooms" title="Your Rooms">
                                <div className='hold-data'>
                                    {values.length === 0 ? <h1>You have no Rooms</h1> :

                                        values.map((value) => (
                                            <Room rooms={value} permissions={true} roomId={value.id} key={value.id} />
                                        ))}

                                    {loading && <Loader />}

                                </div>
                            </Tab>
                            <Tab eventKey="friends" title="Friends">
                                <div className='hold-data'>
                                    {friends.length === 0 ? (
                                        <span>You currently have no Friends</span>
                                    ) : (
                                        <div className = 'second-container' >
                                            <h1>You have {friends.length} friends</h1>
                                            {friends.map((friend) => (
                                                <div className='current-friend' key={friend.id}>
                                                    <Link className='profiler-link' to={`/user/${friend.id}`}>
                                                        {friend.username}
                                                    </Link>
                                                    <div className='email-holder'>
                                                        <h1>{friend.email}</h1>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Tab>
                        </Tabs>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage