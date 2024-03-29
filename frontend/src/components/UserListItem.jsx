import moment from "moment";
import PropTypes from 'prop-types';
import {Link} from  "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import { UserRole } from "../utilities/constants";

const UserListItem =({user})=> {

  const {role} = useAppContext();


  const isTechnicalManager =()=>{
    return role && role.some((role) => role === UserRole.TECHNICAL_MANAGER);
  }

  return(
    <div className="card shadow my-3" key={user._id}>
      <div className="card-body">
        <h5 className="card-title">{user.fullName}</h5>
        <p className="card-text">Email: {user.email}</p>
        <div>
          {user.role && user.role.length > 0 ? (
            user.role.map((r) => (
              <span key={r} className={`badge bg-primary me-1`}>{r}</span>
            ))
          ) : (
            <span className="badge bg-danger">No Role</span>
          )}
        </div>
        {isTechnicalManager() &&
          <span>
            <Link to={`/users/user/${user._id}`} className="btn btn-outline-secondary btn-sm mt-2">Edit User</Link>
          </span>
        }
      </div>
      <div className="card-footer">
        <span className="fw-light fst-italic">Registered {moment(user.creationDate).fromNow()}</span>
      </div>
    </div>
  );
}

UserListItem.propTypes = {
  user: PropTypes.object.isRequired
}

export default UserListItem;