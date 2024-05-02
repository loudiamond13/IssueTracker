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

  //useQuery hook to get the user to be edited
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
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/${userId}`, 
        formData,
        {withCredentials: true}
      );

      await queryClient.invalidateQueries('user');
      navigate('/users');
      showToast({message: 'User Successfully Updated!', type:'success'});
    } 
    catch (error) {
      showToast({message: `${error.response.data.message}`})
    }
  });


  return(<UserEditorForm mutation={mutation} user={user} />);
}

export default UserEditor;