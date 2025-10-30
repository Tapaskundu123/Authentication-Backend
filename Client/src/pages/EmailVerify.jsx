// src/pages/EmailVerify.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import faviconImg from '../assets/favicon.svg';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Mail } from 'lucide-react';

const EmailVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [emailField, setEmailField] = useState(false);
  const [email, setEmail] = useState('');

  const { isForgotPassword, isEmailVerify } = location.state || {};

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const HandleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailField(true);
      setIsLoading(false);
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/auth/verify-Email-ChangePassword`,
        { email },
        { withCredentials: true }
      );

      setIsLoading(false);
      
      if (response.data.success) {
        if (isForgotPassword) {
          toast.success('OTP sent to your Email (valid for 15 minutes)');
          navigate('/otp-verify', { state: { GoForgotPage: true, GoLandingPage: false, email } });
        } else if (isEmailVerify) {
          toast.success('OTP sent to your Email');
          navigate('/otp-verify', { state: { GoLandingPage: true, GoForgotPage: false, email } });
        }
      }
    } catch (err) {
      setIsLoading(false);
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 400) {
        toast.error(data?.message || 'Email is required');
      } else if (status === 404) {
        toast.error(data?.message || 'User not found');
      } else {
        toast.error(data?.message || 'Something went wrong');
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-200 to-purple-400">
      <div 
        className="flex gap-0.5 p-4 cursor-pointer absolute top-0 left-0"
        onClick={() => navigate('/')}
      >
        <img className="h-10 w-28" src={faviconImg} alt="logo-img" />
        <h1 className="font-bold text-3xl">auth</h1>
      </div>

      <form className="flex flex-1 justify-center items-center" onSubmit={HandleSubmit}>
        <div className="flex flex-col bg-blue-950 text-white py-7 px-10 rounded-3xl w-[90%] max-w-md shadow-xl">
          <div className="flex flex-col gap-5 w-full mt-4">
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-center">Email Verify</h1>
              <p className="text-sm text-blue-400 px-4 py-1.5 text-center">
                Enter the email to verify
              </p>
            </div>

            <div className="relative w-full">
              <input
                className={`w-full border-none rounded-3xl bg-blue-800 py-3 pr-10 pl-12 text-md text-white placeholder-white autofill:bg-blue-800 ${
                  emailField ? 'border border-red-500' : ''
                }`}
                type="email"
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
            </div>
          </div>

          <button
            disabled={isLoading}
            className={`bg-blue-600 py-3 mt-6 rounded-3xl font-medium hover:bg-blue-700 transition cursor-pointer ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
          >
            {isLoading ? 'Processing...' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailVerify;