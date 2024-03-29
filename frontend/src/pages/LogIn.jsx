
import { useMutation, useQueryClient } from 'react-query';
import {useNavigate} from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import LoginForm from '../forms/LoginForm/LoginForm';
import axios from 'axios';


const LogIn =()=>
{
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {showToast} = useAppContext();

  //mutation using the useMutation hook
  const mutation = useMutation(async(formData) => {
    try {
      //send POST request to login
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/login`, 
        formData, 
        {withCredentials: true}
      );
      //return the result/response from the server
      return response.data;
    } 
    catch (error) {
      throw new Error(error.message || 'Invalid Password/Email.');
    }
  },{
    onSuccess: async() => {
      showToast({message: 'Logged in successfully.', type:'success'});
      //invalidate the currentUser query
      await queryClient.invalidateQueries('currentUser');
      //navigate to homepage
      navigate('/');
    },
    onError: ()=> {
      showToast({message: 'Invalid Email/Password.'});
    }
  });

  return(<LoginForm mutation={mutation}/>);
}

export default LogIn;