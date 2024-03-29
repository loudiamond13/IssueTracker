import { useMutation, useQueryClient } from "react-query";

import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";




const LogOutBtn =()=>{
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {showToast} = useAppContext();

  //use mutation hook
  const mutation = useMutation(async() => {
    try {
      //send a POST request to the backend to logout (clears the cookie)
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/logout`, //api url
        {
          method: "POST",
          credentials: "include" // include cookies
        }
      );
      
      //return the response from the server
      return  response.data;
    } 
    catch (error) {
      throw new Error('Error on logging out.');  
    }
  },{
    //show 
    onSuccess: async() => {
      //invalidate the validatetoken
      await queryClient.invalidateQueries('currentUser');
      //redirect to login page after logout
      navigate('/login');

      showToast({type:"success", message:"Logged out successfully."});
    },
    onError: (error)=> {
       //show error toast
       showToast({message: error.message});
    }
  }); 

    const handleClick =()=>{
      mutation.mutate();
    }

    return (
      <button onClick={handleClick} className="btn btn-primary btn-md">Log Out</button>
    );
}


export default LogOutBtn;