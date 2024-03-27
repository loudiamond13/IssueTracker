
import axios from  'axios';



const API_BASE_URL = import.meta.env.VITE_API_Base_URL || '';

export const register = async(formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/user/register`, formData,
    {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || 'Server error'); // Throw an error with the response message if available
  }
};

//log in api call
export const logIn = async(formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/user/login`, formData,
    {
      withCredentials: true,
      headers: {'Content-Type': 'application/json'}
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || 'Server error'); // Throw an error with the response message if available
  }
};

export const currentUser = async() =>{
  const response = await axios.get(`${API_BASE_URL}/api/user/me`, 
  {
    withCredentials: true
  });

  if(response.status !== 200)
  {
    throw new Error('Could not fetch bugs');
  }
  return response.data;
}

//log out api call
export const logOut = async()=>{
  const response = await fetch(`${API_BASE_URL}/api/user/logout`,
  {
    credentials: 'include',
    method: "POST"
  });

  if(!response.ok)
  {
    throw new Error("ERROR ON SIGNING OUT!");
  }
}


export const getAllBugs = async() =>
{
  const response = await axios.get(`${API_BASE_URL}/api/bug/list`,
  {
    withCredentials: true,
  });

  if(response.status !== 200)
  {
    throw new Error('Could not fetch bugs');
  }
  return response.data;
};