import React, { useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar';
import './Search.css'
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';


function Search() {
    const location = useLocation()
    const searchValue = location.state.yourData;//using state from user input

    console.log(searchValue)

    const [loading, setLoading] = useState(false);


    const [users, setUsers]= useState([]);

    const [more, setMore] = useState(true)

    const [page, setPage] = useState(0);//we will basically add 5 to this to get the next 5 values, and save the last few by making a copy...
    let pageAmount = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {//always use async here
                setLoading(true);
                //get user based on the query, should be an array
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getUsers?getSearch=${searchValue}&getAmount=${pageAmount}&getPage=${page}`);
                if (page === 0) {
                    setUsers(response.data)//set the initial data, as you will get an empty array in response
                } else {
                    // Otherwise, append to the existing data(should be given)
                    setUsers((prevData) => [...prevData, ...response.data]);//keep appending
                    if(response.data.length === 0){//if theres no more users(when we are returned an empty array)
                        setMore(false)//dont show button anymore
                    } 
                }
                setLoading(false);
            }
            catch (error) {
                console.log(error);
            }
    } 
    fetchData();
},[page]);

    //<h1>total results: {users.length}</h1>
    const getMoreUsers = (e)=>{
        e.preventDefault()
        setPage(page + 10)
    }
    return (
    <div className='body'>
    <Navbar />
    {loading ? (
      <Loader />
    ) : (
      <div className='user-content'>
        {users.length === 0 ? (
          <h1>No results for "{searchValue}"</h1>
        ) : (
          <div className='user-holder'>
            <h1>{users.length} results for "{searchValue}"</h1>
            <div className='user-holder'>
              {users.map((user) => (
                <div className='user' key={user.id}>
                    <div className = 'holder'>
                        <h1 className='username'>{user.username}</h1>
                        <img className = 'nav-profile-pic' src ={`../profileImages/${user.profile_pic ? user.profile_pic : 'default-image.png'}`}/>
                    </div>
                  <div className = 'email'>
                     <span>{user.email}</span>
                    </div>
                  <Link className='profile-view' to={`/user/${user.id}`}>
                    View profile
                  </Link>
                </div>
              ))}
              {more &&<button className = 'view' onClick = {(e)=>{getMoreUsers(e)}}>Load more Users</button>}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
    );
}

export default Search