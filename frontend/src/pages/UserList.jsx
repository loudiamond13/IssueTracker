import axios from "axios";
import { useState } from "react";
import { useQuery } from "react-query";
import Pagination from '../components/Pagination'
import UserListItem from "../components/UserListItem";
import {Link} from 'react-router-dom'
import UserListSearchBar from "../components/UserListSearchBar";

const UserList = () => {
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    role: '',
    maxAge: '',
    minAge: '',
    sortBy: '',
  });

  const pageSize = 5;

  const [pageNumber, setPageNumber] = useState(1);

  // useQuery hook to get users
  const { data: userListData, isLoading } = useQuery(
    ['users', searchParams, pageNumber],
    async () => {
      try {
        // send get request using axios to the backend to get users
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/list`, {
          params: { ...searchParams, pageNumber,pageSize },
          withCredentials: true
        });
        return response.data;
      }
      catch (error) {
        throw new Error('Error on getting users.');
      }
    }
  );

  //to be added
  const handleSearch = (params) => {
    setSearchParams(params);
    setPageNumber(1);
  };

  const handlePageChange =(page)=>{
    setPageNumber(page);
  }

  return (
    <div>
      <h3 className="text-dark">User List</h3>
      {/*  Search bar to be added*/}
      < UserListSearchBar onSearch={handleSearch} />
      {isLoading ? (
        //loading indicator while fetching users
        <h3 className="text-center mt-3">Loading...</h3>
      ) : (
        //render users if there is users 
        <>
          {userListData && userListData.users && userListData.users.length > 0 ? (
            <div>
              {userListData.users.map((user) => (
                <UserListItem user={user}  key={user._id} />
              ))}
              {/* pagination Component to be added */}
              <Pagination
                totalPages={Math.ceil(userListData.totalCount / pageSize)}
                currentPage={pageNumber}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            <h3 className="text-center text-dark mt-3">No Users Found...</h3>
          )}
        </>
      )}
      <span>
        <Link to='/' className="btn btn-outline-secondary mt-2">Back</Link>
      </span>
    </div>
  );
};

export default UserList;
