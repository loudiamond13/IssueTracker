import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';


const RegisterForm =({mutation})=>{
  const {handleSubmit,register, watch, formState:{errors}} = useForm();

  const onSubmit = handleSubmit((formData) => {
    mutation.mutate(formData);
  });

  return(
    <div className="card shadow">
    <div className="card-body">
      <h1 className="card-title fw-bold text-dark mb-4">Create An Account</h1>
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
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              {...register("password", {
                required: "Password is required.",
                minLength: { value: 6, message: "Must be at least 6 characters." },
              })}
            />
            {errors.password && (
              <span className="text-danger">{errors.password.message}</span>
            )}
          </div>
          <div className="col-md-6">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-control"
              {...register("confirmPassword", {
                validate: (value) => {
                  if (!value) {
                    return "This field is required.";
                  } else if (watch("password") !== value) {
                    return "Passwords do not match!";
                  }
                },
              })}
            />
            {errors.confirmPassword && (
              <span className="text-danger">{errors.confirmPassword.message}</span>
            )}
          </div>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-dark fw-medium">
            Create Account
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

RegisterForm.propTypes = {
  mutation: PropTypes.func.isRequired,
};

export default RegisterForm;