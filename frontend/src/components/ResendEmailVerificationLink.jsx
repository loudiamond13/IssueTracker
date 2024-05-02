import { useMutation, useQueryClient } from "react-query";
import { useAppContext } from "../contexts/AppContext";
import axios from "axios";
import { Link } from "react-router-dom";


const ResendEmailVerificationLink =()=>{
  const {showToast} = useAppContext();
  const queryClient = useQueryClient();

  const mutation = useMutation(async()=> {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/resend-email-verification`, '',
        {withCredentials:true}
      );
      queryClient.invalidateQueries('currentUser');
      showToast({message: 'Email verification link sent.' , type:'success'});
    } 
    catch (error) {
      showToast({message: `${error.response.data.message}`});  
    }
  });

  const handleClick =()=>{
    mutation.mutate();
  }

  return(<Link to='#' onClick={handleClick}>Resend Verification Email.</Link>);
}

export default ResendEmailVerificationLink