import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">Issue Tracker</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div className="navbar-nav">
                <a className="nav-link active" aria-current="page" href="/api/user/list">Users</a>
                <a className="nav-link" href="/api/bug/list">Bugs</a>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <div className='row'>
          <div className="col-6">
            <div className="h2 text-center">Users</div>
            <ol className="list-group list-group-numbered">
              <li className="list-group-item" ><a href="/api/user/1">Lou</a></li>
              <li className="list-group-item" ><a href="/api/user/2">Nohea</a></li>
              <li className="list-group-item" ><a href="/api/user/3">Danielle</a></li>
            </ol>
          </div>
          <div className="col-6">
            <div className="h2 text-center">Bugs</div>
            <ol className="list-group list-group-numbered">
              <li className="list-group-item"><a href="/api/bug/1">Curson Don't Work!</a></li>
              <li className="list-group-item"><a href="/api/bug/2">404 Error When Clicking Links</a></li>
              <li className="list-group-item"><a href="/api/bug/3">Site Crashes When Opening Home Page</a></li>
            </ol>
          </div>
        </div>
      </main>
      <footer className='footer'>
        <p className='text-center'>Lou Loyloy 2024</p>
      </footer>

    </>
  )
}

export default App

