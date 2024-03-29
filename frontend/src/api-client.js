
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








