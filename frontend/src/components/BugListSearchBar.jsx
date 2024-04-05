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
            <option value="">Classification:</option>
            <option value="unclassified">Unclassified</option>
            <option value="approved">Approved</option>
            <option value="unapproved">Unapproved</option>
            <option value="duplicate">Duplicate</option>
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
            <option value="">Sort by:</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title</option>
            <option value="classification">Classification</option>
            <option value="assignedTo">Assigned To</option>
            <option value="createdBy">Created By</option>
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
