import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import faviconImg from '../assets/favicon.svg';
import axios from 'axios';
import { toast } from 'react-toastify';
import {LockKeyhole, Mail} from 'lucide-react'

const SetNewPassword = () => {

  const [error, setError] = useState('');
  
  const [newPassword,setNewPassword]= useState('');
  const [confirmPassword,setConfirmPassword]= useState('');
  
  const navigate = useNavigate();



  // Handle form submission
  const HandleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.trim() === '' || newPassword.length < 6) {
      setPasswordField(true);
      toast.error('Password must be at least 6 characters');
      return;
    }

     if (confirmPassword.trim() === '' || confirmPassword.length < 6) {
      setPasswordField(true);
      toast.error('Password must be at least 6 characters');
      return;
    }

    if(newPassword!==confirmPassword){
       toast.error('new password and confirm password are not same');
       return;
    }

    try{
      const response = await axios.post(
        'http://localhost:3000/api/auth/reset-password',
         {
           newPassword
         },
        { withCredentials: true }
      );
      if (response.status===200) {
        toast.success('Password changed successfully!');
        navigate('/'); // Redirect to Home after successful verification
      } 
      else {
        setError(response.data.message || 'Verification failed');
      }
    }
     catch (err) {
      console.error(err);
      setError(err.response.data.message);
      toast.error(err.response.data.message)
    }
  };

    return (
      <form
        className="h-screen bg-gradient-to-br from-blue-200 to-purple-400 flex justify-center items-center"
        onSubmit={HandleSubmit}
      >
        {/* Header positioned absolutely at the top */}
        <div className="absolute top-0 left-0 flex gap-1 p-2">
          <img src={faviconImg} alt="auth-logo" />
          <h1 className="text-3xl font-bold">auth</h1>
        </div>

        {/* Centered verification form */}
        <div className="bg-blue-950 text-white px-10 py-8 rounded-3xl flex flex-col">
          <h1 className="text-3xl font-bold text-center">Change Password</h1>
          <p className="text-sm text-blue-400 px-4 py-1.5 text-center">
           change your old password
          </p>
          {error && (
            <p className="text-red-400 text-sm text-center mb-2">{error}</p>
          )}
          <div className='flex flex-col gap-2'>
           
             <div className="relative w-full mt-2">
              <input
                className={`w-full border-none rounded-3xl bg-blue-800 py-3 pr-10 pl-12 text-md text-white placeholder-white autofill:bg-blue-800 `}
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
            </div>

            <div className="relative w-full mt-2">
              <input
                className={`w-full border-none rounded-3xl bg-blue-800 py-3 pr-10 pl-12 text-md text-white placeholder-white autofill:bg-blue-800 `}
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
            </div>

           </div> 
          <button className="bg-blue-600 py-4 px-20 rounded-3xl mt-6" type="submit">
            Change Password
          </button>
        </div>
      </form>
    );
  };


export default SetNewPassword;