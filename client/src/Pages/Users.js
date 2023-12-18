import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './ProfilePage.css'
import Loader from '../components/Loader'
import axios from 'axios'
import Room from '../components/Room';
import { Tab, Tabs } from 'react-bootstrap'
import Login from '../components/Login'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'



function Users() {

  const { id } = useParams()//get the user id of the person

  const [userData, setUserData] = useState([])
  const [loading, setLoading] = useState(false)
  const [postloading, setPostLoading] = useState(false)

  const [posts, setPosts] = useState([])
  const [friends, setFriends] = useState([])

  const navigate = useNavigate();

  const [notSent, setNotSent] = useState(true);

  const [raise, setRaise] = useState(false)//raise login in case user is not authenticated..


  const getUser = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getUser?id=${id}`);
      if(response.data == 'no user found'){
        setUserData([])
      }
      else if (!response.data.profile_pic) {
        setUserData({ id: response.data.id, username: response.data.username, total_rooms: response.data.total_rooms, email: response.data.email, profile_pic: 'default-image.png' });
      }
      else {
        setUserData(response.data);
       

      }
      setLoading(false)
     
      

    }
    catch (error) {
      console.log(error)
    }

  }


  const checkFriend = async () => {
    try {
      const axiosCredentials = {
        withCredentials: true,
        credentials: 'include',
      }
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/checkFriend?id=${id}`, axiosCredentials)
      console.log(response.data);
      if (response.data.hide) {
        setNotSent(false)
        console.log('friend request already sent')
      }
      else {
        console.log('friend request not sent')
        return '';//basically do nothing
      }
    }
    catch (error) {
      console.log(error)
    }
  }



  const addFriend = async (e) => {
    e.preventDefault();
    try {
      const axiosCredentials = {
        withCredentials: true,
        credentials: 'include',
      }
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/addFriend`, { id }, axiosCredentials);
      console.log(response.data);
      if (!response.data) {//if null(user is not authenticated)
        setRaise(true)
      }
      else {
        setNotSent(false)
        console.log('friend request sent')

      }
    }
    catch (error) {
      console.log(error)
    }

  }



  useEffect(() => {
    getUser()
    checkFriend()
    console.log('user has been recieved')
  }, [])




  const getValues = async (value) => {
    if (value === 'rooms') {
      try {
        setPostLoading(true)
        
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/usersPosts?id=${userData.id}`);
        setPosts(response.data)//need this for the data
        console.log('data has been recieved')
        console.log(posts)
        setPostLoading(false)
      }
      catch (error) {
        console.log(error)
      }

    }

    else if (value === 'friends') {
      try {
        const axiosCredentials = { withCredentials: true, credentials: 'include' }
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getFriends?profileParam=${id}`, axiosCredentials);
        setFriends(response.data)//need this for the data
        console.log('data has been recieved')
        console.log(friends)
        console.log(friends[0].id)
      
      }
      catch (error) {
        console.log(error)
      }
    }


  }





  const handleLinkClick = (e, id) => {
      e.preventDefault()
      navigate(`/user/${id}`)
      window.location.reload();//quick fix to refresh the page to display the changes from the same urls
     
  };

  //to = { `/user/${friend.id}`}

  return (
    
    <div className='body'>
      <Navbar />
      {raise && <Login />}

      <div className='profile-content'>
        {loading && <Loader />}
        {userData.length === 0 && <h1>User does not exist </h1>}
        <div className='profile-holder'>
          <div className='public-details'>

            <div className='name-holder'>
              <h1>{userData.username}</h1>
            </div>

            <span>{userData.email}</span>
          </div>

          <div className='profile-image-holder'>
            <img className='profile-image' name='picture' src={`/profileImages/${userData.profile_pic}`} />
            {notSent && <button className='view' onClick={(e) => { addFriend(e) }}>Send friend request?</button>}
          </div>
          <div className='profile-details'>
            This user has {userData.total_rooms} total rooms
          </div>

          <div className='room-details'>
            <Tabs className='mb-3' defaultActiveKey={null} onSelect={(key) => getValues(key)}>

              <Tab eventKey="rooms" title="User's Rooms">

                <div className='hold-data'>
                  {posts.length === 0 ? <h1>User has no Rooms</h1> : posts.map((post) => (
                    <Room rooms={post} key={post.id} />
                  ))}
                  {postloading && <Loader />}

                </div>
              </Tab>
              <Tab eventKey="friends" title="Friends">
                <div className='hold-data'>
                  {friends.length === 0 ? (<span>User currently has no Friends</span>) :(
                    <div className = 'second-container' >
                      <h1>This user has {friends.length} friends</h1>
                      {friends.map((friend) =>
                      <div className='current-friend'>
                        <Link className='profiler-link'  onClick = {(e)=>handleLinkClick(e, friend.id)}>

                            {friend.username}
                      
                        </Link>
                        <div className='email-holder'>
                          <h1>{friend.email}</h1>
                        </div>
                      </div>)}
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

export default Users