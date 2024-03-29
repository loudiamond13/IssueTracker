import { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import Pagination from "../components/Pagination";
import BugListSearchBar from "../components/BugListSearchBar";
import { useAppContext } from "../contexts/AppContext";
import { Classfication, UserRole } from "../utilities/constants";
import moment from 'moment';

const BugList = () => {
  const { role, user_id } = useAppContext();

  const [searchParams, setSearchParams] = useState({
    keywords: "",
    classification: "",
    maxAge: "",
    minAge: "",
    isClosed: "false",
    sortBy: "",
  });

  const [pageNumber, setPageNumber] = useState(1);
  const [showAllBugs, setShowAllBugs] = useState(true); // State to toggle between all bugs and my bugs
  const pageSize = 5;

  // useQuery hook to get bug list
  const { data: bugListData, isLoading } = useQuery(
    ['bugs', searchParams, pageNumber, showAllBugs], // dependencies
    async () => {
      try {
        // if showAllbugs is true, get all the bugs
        if (showAllBugs) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/list`, {
            params: { ...searchParams, pageNumber },
            withCredentials: true,
          }
          )
          return response.data;
        }
        // if not, get only the assigned bugs for the current logged in user
        else {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || ''}/api/bug/my-bugs`, {
            params: { ...searchParams, pageNumber },
            withCredentials: true,
          }
          )
          return response.data;
        }
      }
      catch (error) {
        throw new Error('Error on getting bugs.')
      }
    });

  const handleSearch = (params) => {
    setSearchParams(params);
    setPageNumber(1);
  };

  const handlePageChange = (page) => {
    setPageNumber(page);
  };

  // check if user is business analyst
  // business analyst can edit any bug
  const isBusinessAnalyst = () => {
    return role && role.some((r) => r === UserRole.BUSINESS_ANALYST);
  };

  return (
    <div>
      <h3 className="text-dark">Bugs</h3>
      <span>
        <Link to='/bugs/create-bug' className="btn btn-outline-secondary btn-sm">Create Bug</Link>
      </span>
      <div className="mt-2">
        <button
          className={`me-2 btn-sm btn btn-outline-secondary ${showAllBugs ? "active" : ""}`}
          onClick={() => setShowAllBugs(true)}>All Bugs
        </button>

        <button
          className={`btn btn-sm btn-outline-secondary ${!showAllBugs ? "active" : ""}`}
          onClick={() => setShowAllBugs(false)}>My Bugs
        </button>
      </div>

      <div className="mt-2">
        <BugListSearchBar onSearch={handleSearch} />
      </div>
      {isLoading ? (
        // Show loading indicator while data is being fetched
        <h3 className="text-center mt-3">Loading...</h3>
      ) : (
        // Render bugs if data is available
        <>
          {bugListData && bugListData.bugs && bugListData.bugs.length > 0 ? (
            <div>
              {bugListData.bugs.map((bug) => (
                <div className="card my-2" key={bug._id}>
                  <div className="card-body">
                    <div>
                      <h5 className="card-title">
                        {bug.title}
                      </h5>
                      {/* Open/Closed badge */}
                      <span className={`badge text-dark me-2 ${bug.isClosed ? 'bg-danger' : 'bg-success'}`}>
                        {bug.isClosed ? 'Closed' : 'Open'}
                      </span>
                      {/*classification badge */}
                      <span className={`badge text-dark
                        ${bug.classification === Classfication.APPROVED ? 'bg-success' : 
                          bug.classification === Classfication.UNAPPROVED ? 'bg-danger' : 
                          bug.classification === Classfication.DUPLICATE ? 'bg-danger' : 'bg-warning'}`}>
                        {bug.classification}
                      </span>
                      <p>Assigned To: {bug.assignedTo.fullName}</p>
                      <span>
                        <Link to="/" className="btn btn-outline-secondary btn-sm me-2">
                          Bug Summary
                        </Link>
                      </span>
                      {/* if the current user is a Business Analyst or id the bug is assigned to the current user */}
                      {isBusinessAnalyst() || user_id === bug.assignedTo.userId  ? (
                        <span>
                          <Link to={`/bugs/edit/bug/${bug._id}`} className="btn btn-outline-secondary btn-sm">
                            Edit Bug
                          </Link>
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="card-footer mt-2">
                    <span className="fw-light fst-italic">Created {moment(bug.creationDate).fromNow()} by {bug.createdBy.fullName}</span>
                  </div>
                </div>
              ))}
              <Pagination
                totalPages={Math.ceil(bugListData.totalCount / pageSize)}
                currentPage={pageNumber}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            <h3 className="text-center text-dark mt-3">No Bugs Found...</h3>
          )}
        </>
      )}
      <span>
        <Link to="/" className="btn btn-outline-secondary mt-3">
          Back
        </Link>
      </span>
    </div>
  );
};

export default BugList;
