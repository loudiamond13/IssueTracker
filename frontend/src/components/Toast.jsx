import { useEffect } from "react";
import PropTypes from "prop-types";



//TOAST
const Toast =({message, type, onClose}) =>{
  useEffect(()=>{
    //sets the toast timer
    const timer = setTimeout(()=>{
      onClose();
    },5000);

    //clear the toast timer
    return ()=>
    {
      clearTimeout(timer)
    };
  },[onClose]);

  const styles = 
  type === 'success'
  ? "position-fixed end-0 top-3 p-3 m-2 me-auto bg-success text-dark rounded toast-body"
  : "position-fixed end-0 top-3 p-3 m-2 me-auto bg-danger text-light rounded toast-body";


   //return the toast  component with the given props and style.
   return (
    <div className=" toast-container" role="alert">
      <div className={styles} >
        <span>{message}</span>
      </div>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Toast;