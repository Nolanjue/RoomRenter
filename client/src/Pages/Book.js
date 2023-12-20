import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { Link } from 'react-router-dom';


import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import './Book.css'

function Book() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const location = useLocation();
    const navigate = useNavigate();//maybe we should get a useParams instead here and a sql query here
    
   const room = location.state;
   const [totalDays, setTotalDays] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            if (room.yourData === null) {
                navigate('/Home')
            }

            try {//always use async here

                const startDate= new Date(room.yourData.start_datetime);
                const endDate= new Date(room.yourData.end_datetime);
                const difference = Math.abs(endDate.getTime() - startDate.getTime())//value of the day in terms of miliseconds
                const total_days = Math.ceil(difference/ (1000 * 60 * 60 * 24));
                
                setLoading(true);
                console.log(room);
                setTotalDays(total_days)//update the state to render
                setLoading(false);
            } catch (error) {
                setError(true);
                console.log(error);

            }
 
        };

        fetchData();
    }, []);

    const goToHome = (e) => {
        e.preventDefault()
        navigate('/Home')
    }



    



    return (
        <div className = 'body'>
            <Navbar />
            {loading ? <Loader /> : (error ? <h1>error...</h1> :
                <div className='container'>
                    <div className='col'>
                            <h1>{room.yourData.name}</h1>
                            <div className = 'profile'>
                                <Link className = 'profile-link' to = {`/user/${room.yourData.userId}`}>{room.yourData.owner}</Link>
                            </div>
                            
                            <div className='image-holder'>
                                <img className='image' src={`data:image/png;base64,${room.yourData.image}`} />
                            </div> 
                            <div className = 'button-holder'>
                                <button className='getout' onClick={(e) => goToHome(e)}>
                                    Cancel
                                </button>
                            </div> 
                    </div>
                    <div className='col'>
                        <div className='details-holder'>
                            <h1>Booking details</h1>
                            <hr />
                                <span> Location: {room.yourData.address} </span>
                                <span>start date: {room.yourData.start_datetime.substring(0,10)}</span>
                                <span>end date: {room.yourData.end_datetime.substring(0,10)}</span>
                                <span>Max Count: {room.yourData.maxCount}</span>
                                <span>Phone Number: {room.yourData.phonenumber}</span>
                            <hr />
                            <h1>Total:</h1>
                            <hr />
                            <span>Total days: {totalDays}</span>
                            <span>Rent per day: {room.yourData.rentPerDay}$</span>
                            <h1>Total Amount: {totalDays * room.yourData.rentPerDay}$</h1>
                            <button onClick ={()=>(alert('payment system currently unavaliable'))}className = 'pay'>Pay Now</button>
                            
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}

export default Book