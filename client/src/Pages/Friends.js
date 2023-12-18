import React, { useEffect, useState} from 'react'
import Navbar from '../components/Navbar'
import './Friends.css'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { updateUserState } from '../components/stateManager';


function Friends() {

    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeState = useSelector(((state) => state.changeUser.changeState))


    const Check = async () => {
        try {
            const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/checkUser`, {
                //what if client deletes this axios post? better to secure individual endpoints for user by checking for token...
                withCredentials: true,//YOU NEED THIS!!!!!
            });

            const userData = userResponse.data//of the user..

            if (!userData.isAuthenticated) {//make sure every route is protected, leave authentication in server side
                console.log(userData)
                console.log('user is not authenticated')
                navigate('/Home')

            }
            else {//maybe try to fix the useState to check if the id is there
                const getFriends = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getRequests`, {
                    withCredentials: true,
                    credentials: 'include',
                });//may fix this later: we need to account for when we log out and have to dispatch this again and throws a 400

                console.log(getFriends.data)
                setFriends(getFriends.data);

                console.log('user is authenticated')
            }
        }
        catch (error) {
            if (error.response.data.name === 'TokenExpiredError') {
                console.log('Please Login again, your token has expired')
                navigate('/Home')

            }
            else {
                console.log(error)
            }
        }
    }


    useEffect(() => {
        Check()
    }, [changeState])





    const acceptRequest = async(e,senderId) => {
        e.preventDefault();
        
        console.log(senderId)
        try{
            const axiosCredentials= {
                withCredentials: true,
                credentials: 'include',
            }
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/acceptRequest`, {senderId} ,axiosCredentials);
            console.log(response.data);
            dispatch(updateUserState())//update the state



        }
        catch(error){
            console.log(error);
        }


    }


    const declineRequest = async(e,senderId) => {
        e.preventDefault();
        console.log(senderId)
        try{
            const axiosCredentials= {
                withCredentials: true,
                credentials: 'include',
            }
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}declineRequest`, {senderId} ,axiosCredentials);
            console.log(response.data);
            dispatch(updateUserState())//update the state
        }
        catch(error){
            console.log(error);
        }


    }
        
    





    return (

        <div className='body'>
            <Navbar />
            <div className='content'>
                <div className='friend-container'>
                    <div className='friend-header'>
                        <h1>Friend Requests</h1>
                    </div>
                    <div className='friend-content'>
                        {friends.length === 0 ? <h1>No Requests found :C</h1> :
                            friends.map((friend) => 
                            <div className='friend'>
                                <Link className='profiler-link' to= {`/user/${friend.senders_id}`}>
                                    {friend.username}
                                </Link>
                                <h1>{friend.email}</h1>
                                <div className='button-holder'>
                                    <button className='accept'onClick= {(e)=> {acceptRequest(e, friend.senders_id)}}> Accept</button>
                                    <button className='decline'onClick= {(e)=> {declineRequest(e, friend.senders_id)}}>Decline</button>
                                </div>
                            </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Friends