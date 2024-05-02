import PropTypes from 'prop-types';
import Header from '../components/Header'; 
import Footer from '../components/Footer';
import axios from 'axios';
import { useQuery } from 'react-query';
import ResendEmailVerificationLink from '../components/ResendEmailVerificationLink';
import { useAppContext } from '../contexts/AppContext';



const Layout = ({ children }) => {

  const {isLoggedIn} = useAppContext();

  //useQuery hook
  const {data: currentUser} = useQuery(
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

  return (
    <div className="bg-light d-flex flex-column">
      <Header />
      {currentUser && !currentUser.isEmailVerified && isLoggedIn &&
        <p className='text-center my-3 '>Please Verify Your Email! <ResendEmailVerificationLink/></p>
      }
      <div className="container mx-auto py-3 min-vh-100">{children}</div>
      <Footer/>
    </div>
  );
};


Layout.propTypes = {
  children: PropTypes.node.isRequired,
};


export default Layout;
