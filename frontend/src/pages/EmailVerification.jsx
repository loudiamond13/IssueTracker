import axios from "axios";
import { Fragment, useEffect, useState } from "react"
import { useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { BsCheck2Circle } from "react-icons/bs";



const EmailVerification =()=> {

  const [validURL, setValidURL] = useState(true);
  const [verificationInitiated, setVerificationInitiated] = useState(false);
  const queryClient = useQueryClient();
  const {userId, token} = useParams();

  useEffect(() => {
    const verifyUserEmail =async() =>{
      try {
        if(!verificationInitiated){
          setValidURL(true);
          await axios.post(`${import.meta.env.VITE_API_BASE_URL || ''}/api/user/${userId}/verify/${token}`);
          setVerificationInitiated(true); // prevent re-fetching
         
        }
      } 
      catch (error) {
          setValidURL(false);
          console.log(error);
      }
    };
    verifyUserEmail();
  }, [userId, token, queryClient,verificationInitiated]);

  return(
    <Fragment>
      {validURL ? (
         <div className="text-center mt-5"><h1>Your email is verified! <span className="text-success"><BsCheck2Circle /></span></h1></div>
      ):(
        <div className="text-center"><h1>404 URL NOT FOUND!</h1></div>
      )}
    </Fragment>
  );
}

export default EmailVerification; 