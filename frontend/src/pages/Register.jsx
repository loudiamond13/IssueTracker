import * as apiClient from '../api-client';
import { useMutation, useQueryClient } from "react-query";
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../forms/RegisterForm/RegisterForm";

const Register = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {showToast} = useAppContext();

  const mutation = useMutation(apiClient.register, {
    onSuccess: async()=>{
      await queryClient.invalidateQueries('currentUser');
      navigate('/'); //navigate to homepage
      showToast({message:'Registration successful!', type:"success"});
    },
    onError: (error)=>{
      showToast({message: error.message});
    }
  });

  

  return (<RegisterForm mutation={mutation}/>);
};

export default Register;
