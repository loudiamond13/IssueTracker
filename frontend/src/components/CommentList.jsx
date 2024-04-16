import {useMutation, useQuery, useQueryClient} from "react-query";
import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import axios from 'axios';
import { useParams } from "react-router-dom";
import CommentForm from '../forms/BugEditorForms/CommentForm';
import Pagination from '../components/Pagination'
import moment from 'moment';
import { BsPersonFill } from "react-icons/bs";

const CommentList =() => {
  const queryClient = useQueryClient();
  const {showToast} = useAppContext();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;
  const {bugId} = useParams();

  //getting comments for the current bug
  const {data: commentListData, isLoading} =  useQuery(
    ["comments", pageNumber], 
    async ()=> {
      try {
        //get request using axios
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/${bugId}/comments/list`,{
            withCredentials: true,
            params: {pageNumber}
          }
        );

        return response.data;
      } 
      catch (error) {
        console.log(error)
       showToast({message: 'Error on getting comments'});
      }
    }
  );

  const addCommentMutation = useMutation(async(formData)=> {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/${bugId}/comment/new`, 
        formData,
        {withCredentials: true}
      );

      queryClient.invalidateQueries('comments');
      showToast({message: 'Comment added successfully.', type: 'success'});
    } 
    catch (error) {
      console.log(error)
      showToast({message: `${error.response.data.error}`})  
    }
  });


  const handlePageChange =(page)=>{
    setPageNumber(page);
  }

  return(
    <div>
      {isLoading ? (
        <h6 className="text-center mt-3">Loading...</h6>
      ) : (
        <>
          {commentListData && commentListData.comments && commentListData.comments.length > 0 ? (
            <div>
              {commentListData.comments.map((comment)=> (
                <div className='card my-2 bg-light' key={comment._id}>
                  <div className='card-body'>
                    <p className='card-title fw-bold'><BsPersonFill /> {comment.author.fullName}</p>
                    <span className='card-text'>{comment.commentText}</span>
                  </div>
                  <div className='card-footer text-muted'>
                    <small className='fw-light fst-italic'>{moment(comment.createdOn).fromNow()}</small>
                  </div>
                </div>
              ))}
              {Math.ceil(commentListData.totalCount / pageSize) > 1 &&
                <div className='mt-2'>
                  <Pagination
                    totalPages={Math.ceil(commentListData.totalCount / pageSize)}
                    currentPage={pageNumber}
                    onPageChange={handlePageChange}
                  />
              </div>
              }
            </div>
          ) : (<h6 className='mt-3'>No Comments Yet.</h6>)}
        </>
      )}
      <div>
        <CommentForm mutation={addCommentMutation}/>
      </div>
    </div>
  );
}

// CommentList.propTypes = {
//   comment: PropTypes.object.isRequired,
// }

export default CommentList;