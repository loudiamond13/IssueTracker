import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';

const LoginForm =({mutation})=>{
  const {handleSubmit, register, formState: {errors}} = useForm();

  const onSubmit = handleSubmit((formData)=>
  {
    mutation.mutate(formData);
  });

  return(
    <form onSubmit={onSubmit}>
     <div className='row'>
      <div className='col-md-6'>
          <label className='form-label' htmlFor="email">Email:</label>
          <input className='form-control' type="email" id="email" {...register('email', {required: "Email is required."})}/>
          {errors.email && (<span className='text-danger'>{errors.email.message}</span>)}
        </div>
        <div className='col-md-6'>
          <label className='form-label' htmlFor="password">Password:</label>
          <input className='form-control' type="password" id="password"  {...register("password", 
          {
            required:'Password is required.',
            minLength: {value:6, message:"Should be at least 6 characters."}
          })}/>
          {errors.password &&
          (<span className='text-danger'>{errors.password.message}</span>)}
        </div>
     </div>
      <div className="col-12 my-3">
          <button type="submit" className="btn btn-dark fw-medium">Sign In</button>
        </div>
    </form>
  );
}

LoginForm.propTypes = {
  mutation: PropTypes.func.isRequired,
}

export default LoginForm;