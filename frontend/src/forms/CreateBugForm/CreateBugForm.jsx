import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import { useEffect } from "react";

const CreateBugForm = ({ mutation, bug }) => {
  const { register, reset,handleSubmit, formState: { errors } } = useForm();

  const onSubmit = handleSubmit((formData) => {
    mutation.mutate(formData);
  });

  useEffect(()=> {
    if(bug){
      reset(bug);
    }
  },[reset,bug])

  return (
    <div className="card shadow mt-2">
      <div className="card-body">
        <h3 className="card-title text-dark">Create a Bug</h3>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title:</label>
            <input type="text" id="title" className="form-control" {...register("title", { required: "Title is required" })} />
            {errors.title && <span className="text-danger">{errors.title.message}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description:</label>
            <input type="text" id="description" className="form-control" {...register("description", { required: "Description is required" })} />
            {errors.description && <span className="text-danger">{errors.description.message}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="stepsToReproduce" className="form-label">Steps to Reproduce:</label>
            <input type="text" id="stepsToReproduce" className="form-control" {...register("stepsToReproduce", { required: "Steps to Reproduce are required" })} />
            {errors.stepsToReproduce && <span className="text-danger">{errors.stepsToReproduce.message}</span>}
          </div>
          <button type="submit" className="btn fw-medium btn-outline-secondary me-2">Submit</button>
          <span>
            <Link to='/bugs' className="btn fw-medium btn-outline-secondary ">Back</Link>
          </span>
          
        </form>
      </div>
    </div>
  );
}

CreateBugForm.propTypes = {
  mutation: PropTypes.object.isRequired,
  bug: PropTypes.object,
}

export default CreateBugForm;
