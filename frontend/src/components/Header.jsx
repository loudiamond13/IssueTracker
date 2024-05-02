import { Link, NavLink } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import LogOutBtn from './LogOutBtn';

const Header = () => {
  const { isLoggedIn, givenName, familyName, user_id } = useAppContext();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Issue Tracker
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/bugs">
                    Bugs
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/users">
                    Users
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          <div className="navbar-nav">
            {isLoggedIn ? (
              <>
                <span className="nav-item">
                  <NavLink className="nav-link" to={`/user-profile/${user_id}`}>
                    Hello, { givenName} {familyName}
                  </NavLink>
                </span>
                <LogOutBtn />
              </>
            ) : (
              <>
                <span className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    Register
                  </NavLink>
                </span>
                <span className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Log In
                  </NavLink>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header;
