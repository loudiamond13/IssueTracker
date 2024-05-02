import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

const CommentForm =({mutation})=> {

  const {register,reset, handleSubmit,formState: {errors, isDirty}} = useForm();


  const onSubmit = handleSubmit((formData)=> {
    mutation.mutate(formData);
    reset();
  });

  return(
    <form onSubmit={onSubmit}>
      <div className='mt-5'>
        <textarea placeholder='Comment...' id="commentText" className="form-control"
              {...register('commentText', {required: 'Comment is requred.'})}
        />
        {errors.commentText && <span className='text-danger'>{errors.commentText.message}</span>}
      </div>
      <button type='submit' disabled={!isDirty} className='mt-2 btn btn-outline-secondary btn-sm'>Add Comment</button>
    </form>
  );
}

CommentForm.propTypes = {
  mutation: PropTypes.func.isRequired, // Function to call when the form is submitted
}
export default CommentForm;