import Select from 'react-select';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useEffect,useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UserRoles } from '../../utilities/constants';


const AssignBugForm =({users, bug, mutation})=>{
  const {role, user_id} = useAppContext();
  const { handleSubmit, reset, formState: {isDirty}} = useForm();
  const [selectedUserId, setSelectedUserId] = useState(null);


  
  useEffect(()=>{
    reset(bug);
  },[reset,bug]);

  useEffect(()=> {
    reset(users);
  },[reset,users]);

  //mutate formData on submit
  const onSubmit = handleSubmit((formData) => {
    const data ={...formData, assignTo: selectedUserId}
    mutation.mutate(data);
  });


  //users with the role of business analyst can re-assign any bug
  //user who created this bug can re-assign  it as well
  //user that is assigned to this bug can re-assign the bug as well
  //check if the current user can re-assign the bug
  const canReassignBug = () => {
    if ((role && role.includes(UserRoles.BUSINESS_ANALYST)) || //check if user is a business analyst
        (role && role.includes(UserRoles.TECHNICAL_MANAGER)) || //check if user is technical manager
        (user_id && bug && bug.assignedTo && user_id === bug.assignedTo.userId) || //check if user is assigned to the bug
        (user_id && bug && bug.createdBy && user_id === bug.createdBy.userId)) {//check if user created the bug
      return true;
    } 
    else {
      return false;
    }
  };

  return(
    <form onSubmit={onSubmit}>
      <div className="mb-3 col-lg-6 col-md-12">
        <p>
          Currently Assigned To: {bug && bug.assignedTo.fullName} ({bug && bug.assignedTo.email})
        </p>
        {canReassignBug() && 
          <div>
            <label htmlFor="assignedTo" className='form-label'>Reassign to:</label>
            <Select id="assignedTo" name='assignedTo' className="" isDisabled={!canReassignBug()} 
              // defaultValue={{
              //   value: bug && bug.assignedTo.userId,
              //   label: `${bug && bug.assignedTo.fullName} (${bug && bug.assignedTo.email})`,
              // }}
              options={users && users.map(user => ({
                value: user._id,
                label: `${user.fullName} (${user.email})`
              }))}
              isSearchable // Enable search functionality
              onChange={(event) => setSelectedUserId(event.value)}
            /> 
          </div>
        }
      </div>
      { canReassignBug() &&
        <button type="submit" disabled={!isDirty} className="btn fw-medium btn-outline-secondary btn-sm me-2">Reassign Bug</button>
      }
    </form>
  );
}


AssignBugForm.propTypes = {
  users: PropTypes.array.isRequired,
  bug: PropTypes.object.isRequired,
  mutation: PropTypes.func.isRequired
}


export default AssignBugForm;