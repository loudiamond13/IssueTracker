
import axios from  'axios';



const API_BASE_URL = import.meta.env.VITE_API_Base_URL || '';


export const validateToken = async() => {
  const response = await axios.get(`${API_BASE_URL}/api/auth/validate-token`, {withCredentials: true});

  if(response.status !== 200)
  {
    throw new Error(`Not Authorized`);
  }

  return response.data;
}

//log in api call
export const logIn = async(formdata) => 
{
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formdata,
    {
      withCredentials: true,
      headers: {'Content-Type': 'application/json'}
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || 'Server error'); // Throw an error with the response message if available
  }
};

//log out api call
export const logOut = async()=>{
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`,
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