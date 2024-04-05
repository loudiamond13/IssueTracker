import { useMutation, useQueryClient } from "react-query";
import CreateBugForm from '../forms/CreateBugForm/CreateBugForm';
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateBug =()=>{
  const queryClient = useQueryClient();
  const {showToast} = useAppContext();
  const navigate = useNavigate();

  //mutation using the useMutation hook
  const mutation = useMutation( async(formData) => {
    try {
      // send a POST request to the server to create a new bug
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/new`, 
        formData, 
        {withCredentials: true}
      );  
      //return the result/response from the server
      return response.data;
    } 
    catch (error) {
      throw new Error(error.message || 'Failed to create bug.');
    }
  },{
    //show  success message after successful submission of data
    onSuccess: async() => {
      await queryClient.invalidateQueries('bugs');
      navigate("/bugs");
      showToast({ message: 'Created Bug successfully!', type:'success' });
    },
    // on error display the error toast
    onError: ()=> {
      showToast({message: 'Error on creating bug.'});
    }
  });


  return(<CreateBugForm mutation={mutation}/>);
}

export default  CreateBug;