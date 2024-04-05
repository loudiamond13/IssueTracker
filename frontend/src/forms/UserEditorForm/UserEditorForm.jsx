import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UserRoles } from '../../utilities/constants';
import { Link } from 'react-router-dom';

const UserEditorForm = ({ mutation, user }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Reset the form fields when the user data changes
  useEffect(() => {
    reset(user);
  }, [reset, user]);

  // Handle form submission
  const onSubmit = handleSubmit((formData) => {
    mutation.mutate(formData);
  });

  // Function to check if a user has a specific role
  // const hasRole = (role) => {
  //   return  user && user.role && user.role.includes(role);
  // };


  return (
    <div className="card shadow">
      <div className="card-body">
        <h1 className="card-title fw-bold text-dark mb-4">Edit User</h1>
        <form onSubmit={onSubmit} autoComplete="off" className="row">
          {/* Given Name */}
          <div className="mb-3 col-lg">
            <label htmlFor="givenName" className="form-label">
              Given Name:
            </label>
            <input
              id="givenName"
              type="text"
              className="form-control"
              {...register("givenName", { required: "Given Name is required." })}
            />
            {errors.givenName && (
              <span className="text-danger">{errors.givenName.message}</span>
            )}
          </div>
          {/* Family Name */}
          <div className="mb-3 col-lg">
            <label htmlFor="familyName" className="form-label">
              Family Name:
            </label>
            <input
              id="familyName"
              type="text"
              className="form-control"
              {...register("familyName", { required: "Family Name is required." })}
            />
            {errors.familyName && (
              <span className="text-danger">{errors.familyName.message}</span>
            )}
          </div>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              Full Name:
            </label>
            <input
              id="fullName"
              type="fullName"
              className="form-control"
              {...register("fullName", { required: "Full Name is required." })}
            />
            {errors.fullName && (
              <span className="text-danger">{errors.fullName.message}</span>
            )}
          </div>
          {/* Password and Email */}
          <div className='col-lg mb-3'>
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="example@email.com"
              {...register("email", { required: "Please provide an email address." })}
            />
            {errors.email && (
              <span className="text-danger">{errors.email.message}</span>
            )}
          </div>
          <div className="col-lg mb-3">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              {...register("password", {
                minLength: { value: 6, message: "Must be at least 6 characters." },
              })}
            />
            {errors.password && (
              <span className="text-danger">{errors.password.message}</span>
            )}
          </div>
          {/* Roles */}
          <div className="mb-3 mt-2">
            <label className="form-label">Roles:</label>
            <div>
              {Object.values(UserRoles).map(role => (
                <div key={role} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={role}
                    value={role}
                    {...register("role")}
                    // defaultChecked={hasRole(role)} // check if user already has this role
                  />
                  <label className="form-check-label" htmlFor={role}>
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Submit Button */}
          <div className="col-12 mt-2">
            <button type="submit" className="btn btn-sm btn-outline-secondary fw-medium">
              Edit User
            </button>
            <span>
              <Link to='/users' className="mx-2 btn btn-sm btn-outline-secondary fw-medium">Cancel</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

UserEditorForm.propTypes = {
  mutation: PropTypes.func.isRequired,
  user: PropTypes.object,
}

export default UserEditorForm;
