import {Link} from 'react-router-dom'
import { useAppContext } from '../contexts/AppContext';
import LogOutBtn from './LogOutBtn';


const Header =()=>
{
  const {isLoggedIn, givenName, familyName, user_id} = useAppContext();


  return(
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="container-fluid">
      <a className="navbar-brand" href="#">Issue Tracker</a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <ul className="navbar-nav">
          <li className='nav-item'>
            <a className="nav-link" aria-current="page" href="/api/user/list">Users</a>
          </li>
          <li className='nav-item'>
            <Link className="nav-link " to='/bugs'>Bugs</Link>
          </li>
        </ul>
       
        {!isLoggedIn?
        (<>
          <span className='navbar-nav ms-auto'>
            <Link to='/register' className='nav-link'>Register</Link>
          </span>
          <span className='navbar-nav'>
            <Link to='/login' className='nav-link'>Log In</Link>
          </span>
        </>):(
        <>
          <span className="navbar-nav ms-auto">
            <Link className="me-5 my-3 nav-link" to={`/user-profile/${user_id}`}>
             {`  Hello, ${givenName} ${familyName}`}
            </Link>  
          </span>
          <span className='navbar-nav'>
            <LogOutBtn/>
          </span>
        </>)

        }
      </div>
    </div>
  </nav>
  );
};


export default Header;