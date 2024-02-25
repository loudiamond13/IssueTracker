import {Link} from 'react-router-dom'


const Header =()=>
{
  return(
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
    <div className="container-fluid">
      <a className="navbar-brand" href="#">Issue Tracker</a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">
          <a className="nav-link" aria-current="page" href="/api/user/list">Users</a>
          <Link className="nav-link " to='/bugs'>Bugs</Link>
        </div>
      </div>
    </div>
  </nav>
  );
};


export default Header;