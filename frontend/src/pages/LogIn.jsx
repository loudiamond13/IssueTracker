import {useForm} from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query';
import * as apiClient from '../api-client'
import {useNavigate} from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';


const LogIn =()=>
{
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  const {register,handleSubmit, formState:{errors}} = useForm();

  const {showToast} = useAppContext();

  const mutation = useMutation(apiClient.logIn,
    {
      onSuccess:async()=>{
        showToast({message: 'Logged in successfully.', type:'success'});
        await queryClient.invalidateQueries('validateToken');
        //navigate to homepage
        navigate('/');
      },
      onError:() => {
        showToast({message: 'Invalid Email/Password.'});
      }
    });

  const onSubmit = handleSubmit((data)=>
  {
    mutation.mutate(data);
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

export default LogIn;