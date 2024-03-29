import React, { useContext, useState } from "react";
import { useQuery } from "react-query";
import Toast from '../components/Toast';
import PropTypes from 'prop-types'; // Import PropTypes
import axios from 'axios';





const AppContext = React.createContext();


export const AppContextProvider = ({children}) => {
  const [toast, setToast] = useState(undefined);
  //const {isError, data} = useQuery('currentUser', apiClient.currentUser, {retry:false});

  //useQuery hook
  const {data, isError} = useQuery(
    `currentUser`,
    async() => {
      //send a get request to the the server to get the current user
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/me`, // api url
        {withCredentials: true}
      );
      return response.data;
    }
  );

  return(
    <AppContext.Provider
      value={{ showToast: (toastMessage) => {setToast(toastMessage)},
      isLoggedIn: !isError, 
      givenName: data?.givenName,
      familyName: data?.familyName, 
      role: data?.role, 
      user_id: data?._id,
      }}>
      {toast &&
      (<Toast message={toast.message} type={toast.type} onClose={()=> setToast(undefined)} />)}
      {children}
    </AppContext.Provider>
  );
}

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired // Validate the children prop
};


export const useAppContext=()=>{
  const context = useContext(AppContext);
  return context;
}