import { useForm } from "react-hook-form";
import { useAppContext } from "../../contexts/AppContext";
import { UserRoles, Classifications } from "../../utilities/constants";
import PropTypes from 'prop-types';
import { useEffect } from "react";


const BugClassificationForm =({bug, mutation})=>{
  const {role, user_id} = useAppContext();
  const {register,handleSubmit,reset} = useForm();

  useEffect(()=>{
    reset(bug)
  },[reset,bug]);

  const onSubmit =handleSubmit((formData) => {
    mutation.mutate(formData)
  });

  //users with the role of business analyst can classify any bug
  //user who created this bug can classify it as well
  //user that is assigned to this bug can classify the bug as well
  //check if the current user can edit the bug
  const canClassifyBug = () => {
    if ((role && role.includes(UserRoles.BUSINESS_ANALYST)) || //check if user is a business analyst
        (user_id && bug && bug.assignedTo && user_id === bug.assignedTo.userId) || //check if user is assigned to the bug
        (user_id && bug && bug.createdBy && user_id === bug.createdBy.userId)) {//check if user created the bug
        return true;
      } else {
        return false;
      }
    };

  return(
    <form onSubmit={onSubmit}>
      <div className="mb-3 col-lg-6 col-md-12">
          <label htmlFor="classification" className='form-label'>Classification:</label>
          <select name="classification" id="classification" className='form-select' 
            disabled={!canClassifyBug()} //disable  for non business analysts
            {...register("classification")}
          >
            {Object.values(Classifications).map(classification => (
              <option value={classification} key={classification}>
                {classification}
              </option>
            ))}
          </select>
      </div>
      { canClassifyBug() &&
        <button type="submit" className="btn fw-medium btn-outline-secondary btn-sm me-2">Classify Bug</button>
      }
    </form>
  );
}

BugClassificationForm.propTypes = {
  bug:  PropTypes.object.isRequired,
  mutation: PropTypes.func.isRequired,
}


export default BugClassificationForm