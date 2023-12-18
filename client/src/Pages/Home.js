import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import './Home.css'
import Room from '../components/Room'
import Loader from '../components/Loader'
import Error from '../components/Error'
function Home() {


  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [details, setDetails] = useState('');

  const [input, setInput] = useState('')

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

 
  

  const [page, setPage] = useState(0);//we will basically add 5 to this to get the next 5 values, and save the last few by making a copy...
  let pageAmount = 2;


  //redo pagination here, maybe use a useEffect to rerender the component with how many?
  const fetchData = async () => {
    try {
      setLoading(true);//using pages to reprsent how many pages we want to fetch, then we can edit this by adding more and more with each render
      
      const roomData = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getSelected?getAmount=${pageAmount}&getPage=${page}&filter=${input}`);
      const selectedRooms = roomData.data;
     // If it's a new search or a page reset, set the new data directly

     if (page === 0) {
      setRooms(selectedRooms);
      setFilteredRooms(selectedRooms);

    } else {
      // Otherwise, append to the existing data
      setRooms((prevRooms) => [...prevRooms, ...selectedRooms]);
      setFilteredRooms((prevRooms) => [...prevRooms, ...selectedRooms]);
    }
      //this will be displayed to user, we are creating one array, as spreading both arrays will add both to one array
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError(true);
      setDetails(error);
     
    }
  };


  useEffect(() => {
    fetchData();
  }, [page]); // Fetch data when the page state changes, this should 


  const handleChange = (e)=>{
    setInput(e.target.value)
  }


  const FilterData = async(e)=>{
    e.preventDefault();
    setLoading(true);
    setPage(0)
    await fetchData()
    setLoading(false);
  }


  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100 && !loading) {
      setPage((prevPage) => prevPage + 2);
    }
  };



  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading]);



    return (
    <div className = 'body'>
      <Navbar/>
      <div className = 'search-bar'>
        <input className = 'filter-search' onChange = {(e)=>handleChange(e)}placeholder= 'Enter Room Name here' required/>
        <button className = 'search-button' onClick = {(e)=>FilterData(e)}>Search</button>
      </div>
      <div className='content'>
        {error ? (
          <Error error={details} />
        ) : (
          <>
            {filteredRooms.map((room) => (
              <Room key={room.id} roomId = {room.id} permissions = {false} rooms={room} />
            ))}
            {loading && <Loader />}
          </>
        )}
      </div>
    </div>
  );
}
export default Home