
import { useMutation, useQueryClient } from 'react-query';
import * as apiClient from '../api-client'
import {useNavigate} from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import LoginForm from '../forms/LoginForm/LoginForm';


const LogIn =()=>
{
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {showToast} = useAppContext();

  const mutation = useMutation(apiClient.logIn,
    {
      onSuccess: async()=>{
        showToast({message: 'Logged in successfully.', type:'success'});
        await queryClient.invalidateQueries('currentUser');
        //navigate to homepage
        navigate('/');
      },
      onError:() => {
        showToast({message: 'Invalid Email/Password.'});
      }
    });

  return(<LoginForm mutation={mutation}/>);
}

export default LogIn;