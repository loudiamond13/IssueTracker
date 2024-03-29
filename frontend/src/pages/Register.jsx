
import { useMutation, useQueryClient } from "react-query";
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../forms/RegisterForm/RegisterForm";
import axios from 'axios';

const Register = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {showToast} = useAppContext();

  //useMutation Hook  to make POST request to /api/user/register endpoint on the server.
  const mutation = useMutation(async(formData) => {
    try {
      //send a POST request to the backend/server and sent the formData as well.
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/register`, 
        formData,
        {withCredentials: true}
      );

      //return the response data
      return response.data;
    } 
    catch (error) {
      throw new Error('Invalid Email/Email already exists');  
    }
  },{
    //show success message
    onSuccess: async() => {
      await queryClient.invalidateQueries('currentUser');
      navigate('/'); //navigate to homepage
      showToast({message:'Registration successful!', type:"success"});
    },
    //on error, show error message
    onError: (error)=>{
      showToast({message: error.message});
    }
  });

  

  return (<RegisterForm mutation={mutation}/>);
};

export default Register;
