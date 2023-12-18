import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'react-bootstrap';
import Login from './Login';
import axios from 'axios';
import './Login.css'
import { updateMyState} from './stateManager';
import { useDispatch } from 'react-redux';
import Error from './Error';


function Register({ opener }) {

    const [show, setShow] = useState(false);
    const [choose, setChoose] = useState(false);


    const handleClose = () => setShow(false);//closes modal
    const [logincounter, setLoginCounter] = useState(0)


    const [user, setUser] = useState({username:'', password:'', email: ''})
    
    const [error, setError] = useState(false)

    const [details, setDetails] = useState('')

    const dispatch = useDispatch()
    useEffect(() => {//each time this renders, which is when opener changes.
        const handleShow = () => setShow(true);
        handleShow()
    }, [opener])


    const getLogin = () => {
        handleClose()
        setChoose(true)//renders the login page instead of the reigster, while calling a useState upon it to rerender the useEffect.

    }
    const handleClick = () => {
        setLoginCounter(logincounter + 1)
    }

    const axiosCredentials = { withCredentials: true, credentials: 'include' }
    
    const Register = async()=>{
        try{
            const createUser = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, user,axiosCredentials)//current huge problem, need to get cookies somehow...
            console.log(createUser)
            handleClose()
            dispatch(updateMyState())
            window.location.reload()

            
            
        }
        catch(error){
            console.log(error)
            setError(true)
            setDetails(error.response.data)
        }
    }
    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value })

    }


    return (
        <div>
            {choose ? <Login opener={handleClick} /> :
                <Modal color='black' show={show} onHide={handleClose} size='lg'>
                    <Modal.Header closeButton>
                        <Modal.Title className = 'modal-top'>Register</Modal.Title>
                    </Modal.Header>
                    <Modal.Body >
                        <form>
                            <div className='form-container'>
                                <h1>Username:</h1>
                                <input className = 'modal-input' name='username' type='username' onChange={handleChange}  />
                                <h1>Password:</h1>
                                <input  className = 'modal-input'name='password' type='password' onChange={handleChange} />
                                <h1>Email:</h1>
                                <input  className = 'modal-input'name='email' type='email' onChange={handleChange} />
                            </div>
                        </form>
                        {error && <Error error={details} />}
                    </Modal.Body>
                    <Modal.Footer className = 'modal-footer'>
                        <Button className= 'button' onClick={handleClose}> 
                            Close
                        </Button>
                        <Button className= 'large-button' onClick={Register}>
                            Register
                        </Button>
                        
                        <Button className= 'large-button' onClick={getLogin} >
                            Already Have an account?
                        </Button>
                    </Modal.Footer>
                
                </Modal>
            }
        </div>
    )
}

export default Register