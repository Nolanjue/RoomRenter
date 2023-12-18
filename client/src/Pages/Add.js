import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Add.css'
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useDispatch } from 'react-redux';
import { updateUserState } from '../components/stateManager';

function Add() {//the link to Add will also be calling the updateState as well to protect it.


    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        maxCount: 0,
        phonenumber: '',
        rentPerDay: 0,
        frontimage: null,
        slideimage1: null,
        slideimage2: null,
        description: '',
        userId: null, //get id from token...
        total_likes: 0,
        start_datetime: '',
        end_datetime: '',
        address: '',
        owner: null,
    });
    const dispatch = useDispatch();
    const Check = async () => {
        try {
            const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/checkUser`, {
                //what if client deletes this axios post? better to secure individual endpoints for user by checking for token...
                withCredentials: true,//YOU NEED THIS!!!!!
            })
            const userData = userResponse.data


            if (!userData.isAuthenticated) {//make sure every route is protected, leave authentication in server side
                console.log(userData)
                console.log('user is not authenticated')
                navigate('/Home')

            }
            else {
                setFormData((prevData) => ({ ...prevData, userId: userData.info.id, owner: userData.info.username}));//add user, and maybe add a created date..
                //best todirectly update the state, however if you assign a value based on a updated useState(userid),there will be issues in using the useState for anything other than rendering the page... you should use useEffect then
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
        Check()//render when we get to the page
        console.log('user Checked')
    }, [])//renders once when the page is opened, and another when the state is called..






    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const file = type === 'file' ? e.target.files[0] : null;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'file' ? file : value,
        }));
    };


    const handleLeave = (e)=>{
        e.preventDefault()
        navigate('/Home')
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        Check()
        alert('Images currently will not load, I will fix this soon!')
        // Convert date and time to ISO format
        const formattedStartDate = formData.start_datetime
            ? new Date(formData.start_datetime).toISOString()
            : null;

        const formattedEndDate = formData.end_datetime
            ? new Date(formData.end_datetime).toISOString()
            : null;

        try {

            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/addRoom`, {
                ...formData,
                start_datetime: formattedStartDate,
                end_datetime: formattedEndDate,
            },
                {
                    //add this with the headers you want to send(like bearer tokens, images)
                    withCredentials: true,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'multipart/form-data',//to send the image files to database(will be encoded)
                    },
                }

            );
            dispatch(updateUserState())
            console.log('Room added successfully:', response.data);
            navigate('/Home');
            //maybe make another redux state here to render something with changes? (as we are sending data, and we want something to render without having to render it in our scope)

        } catch (error) {
            console.error('Error adding room:', error);
            console.log(formData)
        }
    };

    return (
        <div className='body'>
            <Navbar />
            <div className='add-content'>
                <h1>Create Your New Room!</h1>
                <div className='create-room'>
                    <form onSubmit={handleSubmit} encType='multipart/form-data'>
                        <div className='item'>
                            <h3>Room Name: </h3>
                            <input className=' room-input' type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className='item'>
                            <h3>Max Count:</h3>
                            <input className='room-input' type="number" id="maxCount" name="maxCount" min={1} value={formData.maxCount} onChange={handleChange} required />
                        </div>
                        <div className='item'>
                            <h3>Phone Number:</h3>
                            <input className='room-input' type="text" id="phonenumber" name="phonenumber" value={formData.phonenumber} onChange={handleChange} required />
                        </div>
                        <div className='item'>
                            <h3>Rent per day</h3>
                            <input type="number" className='room-input' id="rentPerDay" min={50} name="rentPerDay" value={formData.rentPerDay} onChange={handleChange} required />
                        </div>
                        <div className='item'>
                            <h3>Description</h3>
                            <textarea className='description' name="description" value={formData.description} onChange={handleChange} required />

                        </div>
                        <div className='item'>
                            <h3>Address:</h3>
                            <input className=' room-input' type="text" name="address" value={formData.address} onChange={handleChange} required />
                        </div>
        
                        <div className='image-container'>
                            <div className='img'>
                                <h3>preview image:</h3>
                                <input type="file" id='file-input' name="frontimage" onChange={handleChange} accept="image/*" required />
                            </div>
                            <div className='img'>
                                <h3> Slide image:</h3>
                                <input type="file" id='file-input' name="slideimage1" onChange={handleChange} accept="image/*" required />
                            </div>
                            <div className='img'>
                                <h3>Slide image 2: </h3>
                                <input type="file" id='file-input' name="slideimage2" onChange={handleChange} accept="image/*" required />
                            </div>
                        </div>

                        <div className = 'date-holder'>
                            <h3>Start Date & Time</h3>
                            <input type="datetime-local"  id='date' name="start_datetime" value={formData.start_datetime} onChange={handleChange} required />
                        </div>
                        <div className = 'date-holder'>
                            <h3>End Date & Time</h3>
                            <input type="datetime-local" id = 'date' name="end_datetime" value={formData.end_datetime} onChange={handleChange} required />
                        </div>
                        
                        <div className = 'button-holder'>
                            <button className='cancel-button' onClick = {(e)=>handleLeave(e)}>Cancel</button>
                            <button className='create-button' type="submit">Create Room</button>
                        </div>
                      
                    </form>
                </div>
            </div>
        </div>

    );
}

export default Add;