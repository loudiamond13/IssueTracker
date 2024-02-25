
import axios from  'axios';

const API_URL = import.meta.env.API_URL || '';


export const getAllBugs = async() =>
{
  const response = await axios.get(`${API_URL}/api/bug/list`,
  {
    withCredentials: 'include',
  });

  if(response.status !== 200)
  {
    throw new Error('Could not fetch bugs');
  }

  return response.json();
}