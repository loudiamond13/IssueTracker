
import Layout from './layouts/Layout';

import './App.scss'
import{BrowserRouter as Router,Route,Routes} from "react-router-dom";
import Bugs from './pages/Bugs.jsx';
import LogIn from './pages/LogIn.jsx';


function App() {

  return (
   <Router>
    <Routes>
      <Route path='/' element={<Layout><p>asdasddd</p></Layout>}/>
      <Route path='/bugs'element={<Layout><Bugs/></Layout>}/>
      <Route path='/register'element={<Layout>Register</Layout>}/>
      <Route path='/login' element={<Layout><LogIn/></Layout>}/>
    </Routes>
   </Router>
  )
}

export default App

