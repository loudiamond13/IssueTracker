import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../contexts/AppContext";
import BugEditorForm from "../forms/BugEditorForms/BugEditorForm";
import AssignBugForm from '../forms/BugEditorForms/AssignBugForm';
import BugClassificationForm from "../forms/BugEditorForms/BugClassificationForm";
import CloseOpenBugForm from "../forms/BugEditorForms/CloseOpenBugForm";


const BugEditor = ()=> {
  const queryClient = useQueryClient();
  // const navigate = useNavigate();
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
    },{
      onError:()=>{
        showToast({message:"Error on getting bugs."});
      }
    }
  );

  // useQuery hook to get users
  const { data: users } = useQuery('users',
    async () => {
      try {
        // send get request using axios to the backend to get users
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/get-all-users`, 
          {withCredentials: true}
          );
        return response.data;
      }
      catch (error) {
        throw new Error('Error on getting users.');
      }
    },{
      onError: ()=> {
        showToast({message: 'Failed to load users.'});
      }
    }
  );

  //useMutation hook  for updating a bug
  const editBugMutation = useMutation(async(formData) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/${bugId}`, // api url
        formData, // data sent with the request
        {withCredentials: true}
      );

      await queryClient.invalidateQueries('bug');// remove cache of bugs
      showToast({message: 'Bug updated successfully.', type: 'success'});
    } 
    catch (error) {
      showToast({message: `${error.response.data.message}`});
    }
  });

  //bug classification mutation
  const classifyBugMutation = useMutation(async(formData) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/${bugId}/classify`,
        formData,
        {withCredentials: true}
      );

      await queryClient.invalidateQueries('bug');// remove cache of bugs
      showToast({message: 'Classified bug successfully.', type: 'success'});
    }
    catch(error){
      showToast({message: `${error.response.data.message}`});
    }
  });

  //assign bug mutation
  const assignBugMutation = useMutation(async(formData) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/${bugId}/assign`,
        formData,
        {withCredentials: true}
      );

      await queryClient.invalidateQueries('bug');
      showToast({message: 'Reassigned bug successfully.', type: 'success'});
    } 
    catch (error) {
      showToast({message: `${error.response.data.message}`});
    }
  });


  //handles for closing and opening a bug
  const handleCloseOpenBug = async (isClosed) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/bug/${bugId}/close-open`,
        { isClosed: isClosed.toString() },
        { withCredentials: true }
      );
      await queryClient.invalidateQueries('bug');
      const actionMessage = isClosed ? 'closed' : 'reopened';
      showToast({ message: `Bug ${actionMessage} successfully.`, type: 'success' });
    } catch (error) {
      showToast({ message: `You are not authorized to open/close a bug.` });
    }
  };4
  


  return(
    <div className="card shadow mt-2">
      <div className="card-body">
        <h3 className="card-title">Edit Bug</h3>
        <div className="">
          <BugEditorForm mutation={editBugMutation} bug={bug} users={users}/>
        </div>
        <hr />
        <div className="mt-5">
          <h3 className="card-title">Bug Classification</h3>
          <BugClassificationForm bug={bug} mutation={classifyBugMutation}/>
        </div>
        <hr />
        <div className="mt-5">
          <h3 className="card-title">Assign/Reassign Bug</h3>
          <AssignBugForm users={users} bug={bug} mutation={assignBugMutation}/>
        </div>
        <hr />
        <div className="mt-5">
          <h3 className="card-title">Close/Open Bug</h3>
          <CloseOpenBugForm bug={bug} onCloseOpenBug={handleCloseOpenBug}/>
        </div>
      </div>
    </div>
  );
}

export default  BugEditor;