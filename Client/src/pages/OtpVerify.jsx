import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import faviconImg from '../assets/favicon.svg';
import axios from 'axios';
import { toast } from 'react-toastify';
// import {LockKeyhole, Mail} from 'lucide-react'
import { useLocation } from 'react-router-dom';

const OtpVerify = () => {
   const navigate = useNavigate();
   const location = useLocation();

  // State for OTP digits and authentication status
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');


  const {GoForgotPage,  GoLandingPage, email} = location?.state || {};

  // Handle input change for each OTP box
  const handleInputChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)){
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError(''); // Clear error on input change

      // Auto-focus next input if current is filled
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join('');

    // Validate OTP length
    if (otpString.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
       // For forgot-password flow we must have email
    if (GoForgotPage && !email) {
      setError('Email missing for password-reset flow');
      return;
    }

    try{

       const payload = GoForgotPage ? { otp: otpString, email } : { otp: otpString };

      const response = await axios.post(
        'http://localhost:3000/api/auth/verify-OTP-changePassword',
        payload,
        { withCredentials: true }
      );

      if (response.data.success && GoForgotPage ) {
        toast.success(response.data.message || 'OTP verified successfully!');
        // pass email forward if needed for set-new-password
        navigate('/set-new-password', { state: { email } });
        return;
      } 

      if (response.data.success && GoLandingPage ){
        toast.success(response.data.message || 'Email verified successfully!');
        navigate('/dashboard');
        return;
      }

      setError(response.data.message || 'Verification failed');
    }
     catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP. Please try again.');
      toast.error('failed retry')
    }
  };

    return (
      <form
        className="h-screen bg-gradient-to-br from-blue-200 to-purple-400 flex justify-center items-center"
        onSubmit={handleSubmit}
      >
        {/* Header positioned absolutely at the top */}
        <div className="absolute top-0 left-0 flex gap-1 p-2">
          <img src={faviconImg} alt="auth-logo" />
          <h1 className="text-3xl font-bold">auth</h1>
        </div>

        {/* Centered verification form */}
        <div className="bg-blue-950 text-white px-10 py-8 rounded-3xl flex flex-col">
          <h1 className="text-4xl font-bold text-center">Email Verify OTP</h1>
          <p className="text-sm text-blue-400 px-4 py-1.5 text-center">
            Enter the 6-digit code sent to your email
          </p>
          {error && (
            <p className="text-red-400 text-sm text-center mb-2">{error}</p>
          )}
          <div className='flex flex-col '>

             <div className="flex gap-1 p-4 mt-2 mb-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                className="h-12 w-12 rounded-xl border-2 bg-blue-950 no-spinner text-center text-white"
                type="text" // Changed to text to prevent spinner
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                required
              />
            ))}
            </div>

           </div> 
          <button className="bg-blue-600 py-4 px-20 rounded-3xl mt-6" type="submit">
            Verify Email
          </button>
        </div>
      </form>
    );
  };


export default OtpVerify;