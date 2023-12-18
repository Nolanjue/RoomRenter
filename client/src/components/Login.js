import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'react-bootstrap';
import Register from './Register';
import Error from './Error';
import axios from 'axios';
import { updateMyState} from './stateManager';
import { useDispatch } from 'react-redux';
import './Login.css'







function Login() {


    const [show, setShow] = useState(false);
    const [choose, setChoose] = useState(false);


    const [user, setUser] = useState({ username: '', password: '' })//we will be able to get this back using redux..
    const dispatch = useDispatch();


    
    const [error, setError] = useState(false)
    const [details, setDetails] = useState('')

    useEffect(() => {//each time this renders, im using an opener useState here
        const handleShow = () => setShow(true);
        handleShow()
    }, [])




    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value })

    }

    const handleClose = () => setShow(false);//closes modal
    
   
    const axiosCredentials = { withCredentials: true, credentials: 'include' }
    const Check = async () => {
        try {//check for token expiration date..
            const sendData = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, user, axiosCredentials)//put user token in cookies, we should get the data here..
           //bad idea: localStorage.setItem('user',JSON.stringify(sendData.data))              //3rd argument fixed the cookie issue
            //maybe use context to have a useState that changes that will run each time for it..
            //or
            console.log(sendData)
            dispatch(updateMyState())//calls the redux addition state, should call the useEffect in navbar
            handleClose()
        }
        catch (error) {
            console.log(error)
            setError(true)
            setDetails(error.response.data)
        }


    }
    const getRegister = () => {
        handleClose()
        setChoose(true)
    }



    return (
        <div>
            {choose ? <Register /> :
                <Modal color='black' show={show} onHide={handleClose} size= 'md'>
                    <Modal.Header closeButton >
                        <Modal.Title className = 'modal-top'>Login</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className = 'modal-body'>
                        <form>
                            <div className='form-container'>
                                <h1>Username:</h1>
                                <input className = 'modal-input' name='username' type='username' onChange={handleChange} />
                                <h1>Password:</h1>
                                <input className = 'modal-input' name='password' type='password'  onChange={handleChange}/>
                            </div>
                        </form>
                        {error && <Error error={details} />}
                    </Modal.Body>
                    <Modal.Footer className = 'modal-footer'>
                        <Button className = 'button' onClick={handleClose}>
                            Close
                        </Button>
                        <Button type='submit' onClick = {Check} className = 'large-button' >
                            Login
                        </Button>
                        <Button className = 'large-button' onClick={getRegister} >
                            Dont have an account?
                        </Button>
                        
                    </Modal.Footer>
                </Modal>
            }
        </div>
    )
}

export default Login