import { useState } from 'react'
import Layout from './layouts/Layout';

// import './App.css'
import{BrowserRouter as Router,Route,Routes} from "react-router-dom";
import Bugs from './pages/Bugs.jsx';


function App() {
  const [count, setCount] = useState(0)

  return (
   <Router>
    <Routes>
      <Route path='/' element={<Layout><p>asdasddd</p></Layout>}/>
      <Route path='/bugs'element={<Layout><Bugs/></Layout>}/>
    </Routes>
   </Router>
  )
}

export default App

