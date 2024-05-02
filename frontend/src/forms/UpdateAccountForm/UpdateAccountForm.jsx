import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';



const UpdateAccountForm =({user, mutation})=>{
  const {register, handleSubmit, reset, watch, formState: {errors, isDirty}} = useForm();


  useEffect(() => {
    reset(user);
  },[reset, user]);

  const onSubmit = handleSubmit((formData) => {
    mutation.mutate(formData);
  });
  

  return(
    <div className="card shadow">
    <div className="card-body">
      <h1 className="card-title fw-bold text-dark mb-4">Update Account</h1>
      <form onSubmit={onSubmit} autoComplete="off" className="row">
        <div className="mb-3 col-lg">
          <label htmlFor="firstName" className="form-label">
            Given Name
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
        <div className="mb-3 col-lg">
          <label htmlFor="familyName" className="form-label">
            Family Name
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
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
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

        <h4 className='mt-4'>Change Password</h4>
          <p>(Leave the password fields empty if you don`t wish to change.)</p>
        <div className="col-lg-6 mb-3">
            <label htmlFor="currentPassword" className="form-label">
            Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              className="form-control"
              {...register("currentPassword", {
                minLength: { value: 6, message: "Must be at least 6 characters." },
              })}
            />
            {errors.password && (
              <span className="text-danger">{errors.password.message}</span>
            )}
          </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className="form-control"
              {...register("newPassword", {
                minLength: { value: 6, message: "Must be at least 6 characters." },
              })}
            />
            {errors.newPassword && (
              <span className="text-danger">{errors.newPassword.message}</span>
            )}
          </div>
          <div className="col-md-6">
            <label htmlFor="confirmNewPassword" className="form-label">
              Confirm new Password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              className="form-control"
              {...register("confirmNewPassword", {
                validate: (value) => {
                 if (watch("newPassword") !== value) {
                    return "Passwords do not match!";
                  }
                },
              })}
            />
            {errors.confirmNewPassword && (
              <span className="text-danger">{errors.confirmNewPassword.message}</span>
            )}
          </div>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-dark fw-medium" disabled={!isDirty}>
            Update Account
          </button>
        </div>
      </form>
    </div>
  </div>
  );

}

UpdateAccountForm.propTypes = {
  user: PropTypes.object.isRequired,
  mutation: PropTypes.func.isRequired,
}


export default UpdateAccountForm;