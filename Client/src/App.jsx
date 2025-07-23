
import './App.css'
import { Routes, Route } from 'react-router-dom'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword.jsx'
import Login from './pages/Login'
import Home from './pages/Home';
// App.jsx or main.jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SetNewPassword from './pages/SetNewPassword.jsx'


function App() {

  return (
  <div>
    {/* Your app components */}
      <ToastContainer position="top-center" autoClose={3000} />
    <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='/set-new-password' element={<SetNewPassword/>}/>
    </Routes>
  </div>
  )
}

export default App;
