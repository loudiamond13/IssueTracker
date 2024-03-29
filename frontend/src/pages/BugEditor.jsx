import { useMutation, useQuery } from "react-query";
import CreateBugForm from "../forms/CreateBugForm/CreateBugForm";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../contexts/AppContext";


const BugEditor = ()=> {
  const navigate = useNavigate();
  const {showToast}  = useAppContext();
  //get the bugId from the params
  const {bugId} = useParams();
  
  //useQuery hook to get the bug
  const {data: bug} = useQuery('bug', 
    async ()=> {
      try {
        // get the bug using bugId from the params
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/${bugId}`, // api url
          {withCredentials: true}
        );

        //return the response
        return response.data;  
      } 
      catch (error) {
        throw new Error('Error on getting a bug.')
      }
    }
  );

  //useMutation hook  for updating a bug
  const mutation = useMutation(async(formData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/${bugId}`, // api url
        formData, // data sent with the request
        {withCredentials: true}
      );

      return response.data;
    } 
    catch (error) {
      throw new Error('Error on updating a bug');
    }
  },{
    //show success message on success
    onSuccess: async() => {
      navigate('/bugs');
      showToast({message: 'Bug updated successfully.', type: 'success'});
    },
    //show error message on error
    onError: ()=>{
      showToast({message: 'Bug update failed.'});
    }
  });



  //reuse the create bug form for edit
  return(<CreateBugForm mutation={mutation} bug={bug}/>);
}

export default  BugEditor;