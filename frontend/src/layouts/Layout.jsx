import PropTypes from 'prop-types';
import Header from '../components/Header'; 



const Layout = ({ children }) => {
  return (
    <div className="bg-light d-flex flex-column">
      <Header />
      <div className="container mx-auto py-5 min-vh-100">{children}</div>
      <div className=''>
      </div>
    </div>
  );
};


Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
