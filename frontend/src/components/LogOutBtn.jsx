import { useMutation, useQueryClient } from "react-query";
import * as apiClient from '../api-client';
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";



const LogOutBtn =()=>{
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {showToast} = useAppContext();

  const mutation = useMutation(apiClient.logOut,
    {
      onSuccess: async()=>{
        //invalidate the validatetoken
        await queryClient.invalidateQueries('validateToken');

        //redirect to login page after logout
        navigate('/login');

        showToast({type:"success", message:"Logged out successfully"});
      },
      onError: (error) =>{
        //show error toast
        showToast({type: 'error', message: error.message})
      }
    });


    const handleClick =()=>{
      mutation.mutate();
    }

    return (
      <button onClick={handleClick} className="btn btn-primary">Log Out</button>
    );
}


export default LogOutBtn;