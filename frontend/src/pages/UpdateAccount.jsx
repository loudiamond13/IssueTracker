import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAppContext } from '../contexts/AppContext';
import axios from 'axios';
import UpdateAccountForm from '../forms/UpdateAccountForm/UpdateAccountForm';
import { useNavigate } from 'react-router-dom';


const UpdateAccount = () => {
  


  const queryClient = useQueryClient();
  const {showToast} = useAppContext();
  const navigate = useNavigate();


  //get the current user data
  const {data : currentUser} = useQuery('currentUser', 
    async() => {
      try {
        //get request 
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || ''}/api/user/me`, 
          {withCredentials: true})  ;

          return response.data
      } 
      catch (error) {
        showToast({message: `${error.response.data.message}`});
      }
    });


    //useMutation hook to send the formData to the backend/server
    const mutation = useMutation(async(formData) => {
      try {
        //put request
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/me`, 
          formData,
        {withCredentials: true}
      );  

      await queryClient.invalidateQueries('currentUser');
      await queryClient.invalidateQueries('bugs');
      navigate('/')
      showToast({message: 'Account updated successfully.', type:'success'});
      } 
      catch (error) {
        showToast({message: `${error.response.data.message}`});
      }
    });


  return(<UpdateAccountForm user={currentUser} mutation={mutation}/>);
}



export default UpdateAccount;