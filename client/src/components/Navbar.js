import React, { useEffect, useState } from 'react'
import './Navbar.css'
import Login from './Login'
import Register from './Register'
import axios from 'axios'
import { updateMyState } from './stateManager'
import { useSelector, useDispatch } from 'react-redux';
import './Navbar.css'
import { useNavigate } from 'react-router-dom'
import NavDropdown from 'react-bootstrap/NavDropdown';


function Navbar() {

  //all we really need to know are the links here which we will use here...
  const [exist, setExist] = useState(false)
  const [user, setUser] = useState('')



  const myState = useSelector(((state) => state.reducer.myState))

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [type, setType] = useState('');
  const [input, setInput] = useState('');
  const [friends, setFriends] = useState(0);


  useEffect(() => {
    const checkUser = async () => {//make an axios endpoint to check if a token exists.. and if it does, then get the user..
      try {
        //may want to do set loading here to display a loader here
        //i.e setLoading(True)
        const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/checkUser`, {
          withCredentials: true,
          credentials: 'include',
        })
        const userData = userResponse.data;
        console.log(myState);

        const getFriends = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getRequests`, {
          withCredentials: true,
          credentials: 'include',
        })

        setFriends(getFriends.data);//an array


        if (!userData.isAuthenticated) {
          setExist(false)
          console.log(userData)
        }
        else {
          setExist(true)

          if (!userData.info.profile_pic) {
            setUser({ ...userData.info, profile_pic: 'default-image.png' })
          }
          else {
            setUser(userData.info)
          }

        }
      }
      catch (error) {//catching API responses.
        //since token expire errors will lead to log outs...
        if (error.response.data.name === 'TokenExpiredError') {
          console.log('Please Login again, your token has expired')
        }
        else {
          console.log(error.response.data)
        }
      }
    }
    checkUser()
  }, [myState])//initially runs when it renders..



  const handleClick = (type) => {//will use usestate, as im relying on useEffect to render the modals, they render when again when i change this value
    //dosent click any button initally(when it starts to render)
    if (type === 'login') {
      setType('login')

    }

    else if (type === 'register') {
      setType('register')

    }

  }


  const logOut = async (e) => {
    e.preventDefault()
    try {
      await axios.get(`${process.env.REACT_APP_BACKEND_URL}/logout`, {
        withCredentials: true,
        credentials: 'include',
      })
      navigate('/Home')//only navigates if the current room is not /Home(dosent refresh or anything if it is)
      
      
      dispatch(updateMyState())//becareful of using state


      console.log('You have successfully logged out of your account')
      window.location.reload()//just in case the state dosent work...
    }
    catch (error) {
      console.log(error.response.data)
    }


  }

  const pageCheck = (e, value) => {//for protected routes..
    e.preventDefault()//getting infinite loops because you are not preventing this..
    dispatch(updateMyState())//might want to change this, as we dont need to add things, we are just checking.
    if (exist) {
      navigate(value)
    }
    else {
      console.log('you are not authenticated')
    }

  }

  const searchUser = (e) => {
    e.preventDefault()
    console.log('searching');
    navigate('/search', { state: { yourData: input } });//send value to the search page, which will display users..   
    window.location.reload();//force the url to reload in the case we are redirecting to same urls.
    //basically rerenders so that the state can be refreshed to get the new search...
  }

  const handleChange = (e) => {
    setInput(e.target.value)
    console.log(input)
  }
  //the user will have another component that will show data as needed, or do we can show profile if needed
  return (
    <div className='navigation-bar'>
      <div className='home'>
        <a class="nav-home" href="/Home">RoomRenter</a>
        <img src='../images/logo.png' />
      </div>

      <div className='search-container'>
        <input className='user-search' placeholder='Search User' onChange={handleChange} />
        <button className='user-search-button' onClick={(e) => { searchUser(e) }}>Search </button>
      </div>

      <div className='details'>
        {exist
          ? (
            <div className='box'>
              <img className='nav-profile-pic' src={`../profileImages/${user.profile_pic}`} alt='pic' />
              {friends.length > 0 && <div className='friend-amount'>
                <span>{friends.length}</span>
              </div>}
              <NavDropdown
                title={user.username}
                menuVariant="dark"
              >
                <NavDropdown.Item onClick={(e) => pageCheck(e, '/ProfilePage')}>Your Profile</NavDropdown.Item>
                <NavDropdown.Item onClick={(e) => pageCheck(e, '/Add')}>Add a Room! </NavDropdown.Item>
                <NavDropdown.Item onClick={(e) => pageCheck(e, '/Friends')}>Friend Requests: {friends.length} </NavDropdown.Item>
                <NavDropdown.Item onClick={(e) => logOut(e)}>Log Out </NavDropdown.Item>
              </NavDropdown>

            </div>
          )
          : (
            <div className='box'>
              <a class="nav-link " aria-current="page" onClick={() => handleClick('register')}>Register</a>
              <a class="nav-link " aria-current="page" onClick={() => handleClick('login')}>Login</a>
            </div>
          )
        }
      </div>
      {type === 'login' && <Login />}
      {type === 'register' && <Register />}
    </div>

  )
}
export default Navbar