import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import UserEditorForm from "../forms/UserEditorForm/UserEditorForm";



const UserEditor =()=> {
  const {userId} = useParams(); //get the passed  userId parameter from URL
  const {showToast} = useAppContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  //useQuery hook to get a user
  const {data: user} = useQuery(
    'user', //this key will be used for caching purposes.
    async()=> {
      try {
        //send GET request using axios
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/${userId}`,{
            withCredentials: true
          }
        );

        //return the response data
        return response.data;
      } 
      catch (error) {
        throw new Error('Error on getting a user.');  
      }
    }
  );

  //useMutation hook to send the formData to the backend/server
  const mutation = useMutation( async(formData) => {
    try {
      //send a PUT request using axios
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/${userId}`, 
        formData,
        {withCredentials: true}
      );

      //return response
      return response.data;
    } 
    catch (error) {
      throw new Error(error.message || `Error on updating the user.`);
    }
  },{
    //show success  message after successfully sending the data
    onSuccess: async() => {
      await queryClient.invalidateQueries('users');
      navigate('/users');
      showToast({message: 'User Successfully  Updated!', type:'success'});
    },
    //show error message on error
    onError: (error)=> {
      console.log('err',error)
      showToast({message: 'An error occurred while updating the user.'})
    }
  });


  return(<UserEditorForm mutation={mutation} user={user} />);
}

export default UserEditor;