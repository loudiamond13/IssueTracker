import PropTypes from 'prop-types';
import Header from '../components/Header'; 
import Footer from '../components/Footer';



const Layout = ({ children }) => {
  return (
    <div className="bg-light d-flex flex-column">
      <Header />
      <div className="container mx-auto py-3 min-vh-100">{children}</div>
      <Footer/>
    </div>
  );
};


Layout.propTypes = {
  children: PropTypes.node.isRequired,
};


export default Layout;
