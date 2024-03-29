
import Layout from './layouts/Layout';
import './App.scss';
import{BrowserRouter as Router,Route,Routes, Navigate} from "react-router-dom";
import BugList from './pages/BugList.jsx';
import LogIn from './pages/LogIn.jsx';
import Register from './pages/Register.jsx';
import { useAppContext } from './contexts/AppContext.jsx';
import CreateBug from './pages/CreateBug.jsx';
import BugEditor from './pages/BugEditor.jsx';


function App() {
  const {isLoggedIn} = useAppContext();
  return (
   <Router>
    <Routes>
      <Route path='/' element={<Layout><p>Home</p></Layout>}/>
      <Route path='/register'element={<Layout><Register/></Layout>}/>
      <Route path='/login' element={<Layout><LogIn/></Layout>}/>

      {/* Protected routes for logged-in users */}
      {isLoggedIn ? (
          <>
            <Route path='/bugs' element={<Layout><BugList /></Layout>} />
            <Route path='/bugs/create-bug' element={<Layout><CreateBug /></Layout>} />
            <Route path='/bugs/edit/bug/:bugId' element={<Layout><BugEditor/></Layout>}/>
          </>
        ) : (
          // Redirect unauthorized users to the login page
          <Route path='/bugs/*' element={<Navigate to="/login" />} />
        )}


      <Route path='*' element={<Layout><p>404 Not Found</p></Layout>} />
    </Routes>
   </Router>
  );
}

export default App;

