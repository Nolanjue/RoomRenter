import React, { useEffect, useState } from 'react'
import './Room.css'
import { Modal, Button, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'
import NavDropdown from 'react-bootstrap/NavDropdown';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateUserState } from './stateManager';

function Room({ rooms, permissions, roomId }) {//function Room({rooms, userId})//use to determine what rooms we can Edit...
    //next time use Useparams here
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);//closes modal
    const handleShow = () => setShow(true);//opens modal

    const [auth, setAuth] = useState(false)


    const [user, setUser] = useState({})//set expected values before we set them, can lead to undefined values if not done so

    const navigateToBooking = (room, e) => {
        e.preventDefault()
        navigate('/page', { state: { yourData: room } });
    }



    useEffect(() => {//used to set useState values when you need them...
        if (permissions) {
            setAuth(true)
        }
        console.log()

    }, [])


    //im going to check this first.. and then if everything is ok, we are going to run the delete after i get the user info
    const Check = async (e) => {
        e.preventDefault()
        try {
            const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/checkUser`, {
                //what if client deletes this axios post? better to secure individual endpoints for user by checking for token...
                withCredentials: true,//YOU NEED THIS!!!!!
            })
            const userData = userResponse.data;
            if (!userData.isAuthenticated) {//make sure every route is protected, leave authentication in server side
                console.log(userData)
                console.log('user is not authenticated')
                navigate('/Home')
            }
            else {
                console.log('user is authenticated')
                setUser({ ...userData.info, postId: roomId });//spreading is copying the values basically

                await deletePost()//make sure this is secure

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

    const deletePost = async () => {
        //need the user.id from the useState, and i need the roomId to delete the room..
        /*  const userValues = {id: user.id, postId: roomId};user.id maybe undefined. so if i set to values of useStates,may return undefined*/
        try {
            if (!user.id) {
                alert('sorry, please try again, the user id is not being recieved correctly')
                return ''
            }
            else {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/deleteRoom`, user,
                    { withCredentials: true, credentials: 'include' })

                console.log(response.data)
                console.log(user)
                dispatch(updateUserState())
                window.location.reload();//so we see some changes
            }

        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='row'>
            <div className='column-1'>
                <img alt='embedded image' src={`data:image/png;base64,${rooms.image}`} className='front-image' />
                {auth && <div className='options'>
                    <NavDropdown title='...' menuVariant="dark">
                        <NavDropdown.Item onClick={(e) => Check(e)}>Delete your Room</NavDropdown.Item>
                    </NavDropdown>
                </div>}
            </div>
            <div className='column-2'>
                <h1>{rooms.name}</h1>
                <p>Space for: {rooms.maxCount}</p>
                <p>phone number : {rooms.phonenumber}</p>
                <p>Owner: {rooms.owner}</p>
                <div style={{ float: 'right' }}>
                    <button className='view' onClick={handleShow}>View Details</button>
                </div>
            </div>

            <Modal color='black' show={show} onHide={handleClose} size='md'>
                <Modal.Header closeButton>
                    <Modal.Title>Room details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Carousel>
                        <Carousel.Item>
                            <img
                                className="slide-image"
                                src={`data:image/png;base64,${rooms.image}`}
                                alt="First slide"
                            />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img
                                className="slide-image"
                                src={`data:image/png;base64,${rooms.image2}`}
                                alt="Second slide"
                            />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img
                                className="slide-image"
                                src={`data:image/png;base64,${rooms.image3}`}
                                alt="Third slide"
                            />
                        </Carousel.Item>
                    </Carousel>
                    <p>{rooms.description}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={(e) => navigateToBooking(rooms, e)}>
                        Book
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    )
}

export default Room