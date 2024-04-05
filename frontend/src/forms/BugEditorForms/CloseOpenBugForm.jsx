import PropTypes from 'prop-types';
import { useState } from 'react';


const CloseOpenBugForm = ({ bug, onCloseOpenBug }) => {
  const [isLoading, setIsLoading] = useState(false);


  const handleChange = async (event) => {
    const isClosed = event.target.checked;
    setIsLoading(true);
    await onCloseOpenBug(isClosed);
    setIsLoading(false);
  };

  return (
    <div>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" 
          checked={bug && bug.isClosed} 
          onChange={handleChange} 
        />
        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
          Toggle to {bug && bug.isClosed ? 'open' : 'close'} the bug
        </label>
      </div>
      {isLoading && <p>Loading...</p>}
      {bug && bug.isClosed ? <p>Bug status closed</p> : <p>Bug status open</p>}
    </div>
  );
};

CloseOpenBugForm.propTypes = {
  bug: PropTypes.object.isRequired,
  onCloseOpenBug: PropTypes.func.isRequired,
};

export default CloseOpenBugForm;
