import PropTypes from 'prop-types';
import {useForm} from 'react-hook-form';
import { useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {  UserRoles } from '../../utilities/constants';

const BugEditorForm =({mutation, bug})=>{
  const {role, user_id} = useAppContext();


  const {register, handleSubmit, reset,formState: {errors}} = useForm();

  useEffect(()=> {
    reset(bug);
  },[reset,bug]);
  

  const onSubmit =handleSubmit((formData) => {
    mutation.mutate(formData);
  }); 

  
  //users with the role of business analyst can edit any bug
  //user who created this bug can edit  it as well
  //user that is assigned to this bug can edit the bug as well
  //check if the current user can edit the bug
  const canEditBug = () => {
    if ((role && role.includes(UserRoles.BUSINESS_ANALYST)) || //check if user is a business analyst
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
      <div className='row'>
        {/*  Title input, disable the title input if the current user has no permission to edit the passed in bug */}
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title:</label>
          <input type="text" id="title" className="form-control" disabled={!canEditBug()}
            {...register("title", { required: "Title is required" })} 
          />
          {errors.title && <span className="text-danger">{errors.title.message}</span>}
        </div>
        {/* Description Text Area, Disable the description text area if the current user is not allowed to edit this bug */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description:</label>
          <textarea id="description" className="form-control" disabled={!canEditBug()}
            {...register('description', {required: 'Description is requred.'})}
          />
          {errors.description && <span className="text-danger">{errors.description.message}</span>}
        </div>
        <div className="mb-3">
          <label htmlFor="stepsToReproduce" className="form-label">Steps to Reproduce:</label>
          <textarea id="stepsToReproduce" className="form-control" disabled={!canEditBug()}
            {...register("stepsToReproduce", { required: "Steps to Reproduce are required." })}
          />
          {errors.stepsToReproduce && <span className="text-danger">{errors.stepsToReproduce.message}</span>}
        </div>
      </div>
      {/* Only show the submit button when the current user is allowed to edit this bug */}
      { canEditBug() &&
        <button type="submit" className="btn fw-medium btn-outline-secondary btn-sm me-2">Edit Bug</button>
      }
    </form>
  );
}

//props
BugEditorForm.propTypes = {
  mutation: PropTypes.func.isRequired,
  bug: PropTypes.object.isRequired,
}

export default BugEditorForm;