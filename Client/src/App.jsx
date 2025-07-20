
import './App.css'
import { Routes, Route } from 'react-router-dom'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword.jsx'
import Login from './pages/Login'
import Home from './pages/Home';

function App() {

  return (
  <div>
    <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
    </Routes>
  </div>
  )
}

export default App
