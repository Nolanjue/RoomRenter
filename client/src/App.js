
import {BrowserRouter as Router, Route,Routes, Link} from 'react-router-dom'
import Home from './Pages/Home'
import Add from './Pages/Add'
import Book from './Pages/Book'
import ProfilePage from './Pages/ProfilePage'
import Users from './Pages/Users'
import Friends from './Pages/Friends'
import Search from './Pages/Search'

function App() {
  //<Route path="/user/:id/details" element={<Users />} />, this is needed if you want to render to different routes from a /user/:id
  //its good to note that you cant render to another /user/id if you are already in one.

  
  return (
    <Router>
      <Routes>
        <Route path = '/Home' exact element = {<Home/>}/>
        <Route path = '/add' exact element = {<Add/>}/>
        <Route path='/page' exact element={<Book/>} />
        <Route path = '/Add' exact element = {<Add/>} />
        <Route path = '/ProfilePage' exact element = {<ProfilePage/>}/>
        <Route path = '/user/:id' exact element = {<Users />}/>
        <Route path = '/Friends' exact element = {<Friends />}/>
        <Route path = '/Search' exact element = {<Search />}/>
      </Routes>
    </Router>
  );
}

export default App;
