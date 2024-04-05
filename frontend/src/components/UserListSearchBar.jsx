import PropTypes from 'prop-types';
import { useState } from 'react';
import { UserRoles } from '../utilities/constants';


const UserListSearchBar =({onSearch})=>{
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    role: '',
    minAge: '',
    maxAge: '',
    sortBy: '',
  });

  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(searchParams);
  }

  const handleChange =(event, field)=> {
    setSearchParams({...searchParams, [field]: event.target.value});
  }

  return(
    <form onSubmit={handleSearch}>
      <div className='row gx-1'>
        <div className="col-md-2">
          {/* select dropdown */}
        <select
            className="form-select form-select-sm"
            value={searchParams.classification}
            onChange={(event) => handleChange(event, 'role')}
          >
            <option value="">Role:</option>
            {Object.values(UserRoles).map((role)=> (
              <option key={role} value={role}>{role}</option>
            ))}
        </select>
        </div>
        <div className="col-md-2">
          <input
            className="form-control form-control-sm"
            type="number"
            placeholder="Max Age (days)"
            value={searchParams.maxAge}
            onChange={(event) => handleChange(event, 'maxAge')}
          />
        </div>
        <div className="col-md-2">
          <input
            className="form-control form-control-sm"
            type="number"
            placeholder="Min Age (days)"
            value={searchParams.minAge}
            onChange={(event) => handleChange(event, 'minAge')}
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select form-select-sm"
            value={searchParams.sortBy}
            onChange={(event) => handleChange(event, 'sortBy')}
          >
          
            <option value="givenName">Given Name</option>
            <option value="familyName">Family Name</option>
            <option value="role">Role</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        <div className="col-md-2">
          <input
            className="form-control form-control-sm"
            type="text"
            placeholder="Search..."
            value={searchParams.keywords}
            onChange={(event) => handleChange(event, 'keywords')}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-outline-secondary btn-sm" type='submit'>Search</button>
        </div>
      </div>
    </form>
  );
}

UserListSearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired
}

export default UserListSearchBar;