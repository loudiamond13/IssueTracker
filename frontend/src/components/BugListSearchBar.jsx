import { useState } from 'react';
import PropTypes from 'prop-types';

const BugListSearchBar = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    classification: '',
    maxAge: '',
    minAge: '',
    isClosed: 'false',
    sortBy: '',
  });

  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(searchParams);
  };

  const handleChange = (event, field) => {
    setSearchParams({ ...searchParams, [field]: event.target.value });
  };

  return (
    <form onSubmit={handleSearch} role='search'>
      <div className='row gx-1'>
        <div className="col-md-2">
        <select className="form-select form-select-sm"
            value={searchParams.classification}
            onChange={(event) => handleChange(event, 'classification')}
          >
            <option value="">-Select Classification-</option>
            <option value="Unclassified">Unclassified</option>
            <option value="Approved">Approved</option>
            <option value="Unapproved">Unapproved</option>
            <option value="Duplicate">Duplicate</option>
          </select>
        </div>
        <div className="col-md-1">
          <input
            className="form-control form-control-sm"
            type="number"
            placeholder="Max Age (days)"
            value={searchParams.maxAge}
            onChange={(event) => handleChange(event, 'maxAge')}
          />
        </div>
        <div className="col-md-1">
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
            <option value="">Sort by: Default</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="title">Sort by: Title</option>
            <option value="classification">Sort by: Classification</option>
            <option value="assignedTo">Sort by: Assigned To</option>
            <option value="createdBy">Sort by: Created By</option>
          </select>
        </div>
        <div className="col-md-1">
          <select
            className="form-select form-select-sm"
            value={searchParams.isClosed}
            onChange={(event) => handleChange(event, 'isClosed')}
          >
            <option value="false">Open</option>
            <option value="true">Closed</option>
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
};

BugListSearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired
}

export default BugListSearchBar;
