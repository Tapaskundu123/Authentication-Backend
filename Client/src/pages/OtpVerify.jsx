// src/pages/OtpVerify.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import faviconImg from '../assets/favicon.svg';
import axios from 'axios';
import { toast } from 'react-toastify';

const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const backendURL = import.meta.env.BACKEND_URL;

  const { GoForgotPage, GoLandingPage, email } = location?.state || {};

  useEffect(() => {
    setTimeLeft(GoForgotPage ? 900 : 300);
  }, [GoForgotPage]);

  useEffect(() => {
    if (timeLeft <= 0 && timeLeft !== 0) {
      setIsExpired(true);
      toast.error('Session expired. Please try again.');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleInputChange = (index, value) => {
    if (isExpired) return;
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isExpired) {
      toast.error('Session expired. Please try again.');
      navigate('/login');
      return;
    }

    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    if ((GoForgotPage || GoLandingPage) && !email) {
      setError('Email missing');
      return;
    }

    try {
      const payload = { otp: otpString, email };
      const url = GoForgotPage 
        ? `${backendURL}/api/auth/verify-OTP-changePassword`
        : `${backendURL}/api/auth/verify-registration-otp`;

      const response = await axios.post(url, payload, { withCredentials: true });

      if (response.data.success) {
        if (GoForgotPage) {
          toast.success(response.data.message || 'OTP verified successfully!');
          const resetToken = response.data.resetToken;
          navigate('/set-new-password', { state: { resetToken, email } });
        } else if (GoLandingPage) {
          toast.success(response.data.message || 'Email verified successfully!');
          localStorage.setItem('User', JSON.stringify(response.data.user));
          navigate('/dashboard');
        }
      } else {
        setError(response.data.message || 'Verification failed');
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      const message = err.response?.data?.message || 'Failed to verify OTP. Please try again.';
      setError(message);
      toast.error(message);
      
      if (message.includes('expired')) {
        setIsExpired(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  const handleResendOtp = async () => {
    if (isExpired) {
      toast.error('Session expired. Please try again.');
      navigate('/login');
      return;
    }

    if (!email) {
      setError('Email missing');
      return;
    }

    try {
      const url = GoForgotPage 
        ? `${backendURL}/api/auth/verify-Email-ChangePassword` 
        : `${backendURL}/api/auth/resend-otp`;
      
      const response = await axios.post(url, { email }, { withCredentials: true });

      if (response.data.success) {
        toast.success(response.data.message || 'New OTP sent to your email');
        setTimeLeft(GoForgotPage ? 900 : 300);
        setOtp(['', '', '', '', '', '']);
        setIsExpired(false);
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <form
      className="h-screen bg-gradient-to-br from-blue-200 to-purple-400 flex justify-center items-center"
      onSubmit={handleSubmit}
    >
      <div className="absolute top-0 left-0 flex gap-1 p-2">
        <img src={faviconImg} alt="auth-logo" />
        <h1 className="text-3xl font-bold">auth</h1>
      </div>

      <div className="bg-blue-950 text-white px-10 py-8 rounded-3xl flex flex-col">
        <h1 className="text-4xl font-bold text-center">Email Verify OTP</h1>
        <p className="text-sm text-blue-400 px-4 py-1.5 text-center">
          Enter the 6-digit code sent to your email
        </p>
        <p className="text-sm text-blue-400 text-center">
          Time remaining: {formatTime(timeLeft)}
        </p>
        
        {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}
        
        <div className="flex flex-col">
          <div className="flex gap-1 p-4 mt-2 mb-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                className="h-12 w-12 rounded-xl border-2 bg-blue-950 text-center text-white"
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isExpired}
                required
              />
            ))}
          </div>
          
          <button
            type="button"
            className="text-blue-400 text-sm text-center mb-2 hover:text-blue-300"
            onClick={handleResendOtp}
            disabled={isExpired}
          >
            Resend OTP
          </button>
        </div>
        
        <button
          className="bg-blue-600 py-4 px-20 rounded-3xl mt-6 hover:bg-blue-700 transition"
          type="submit"
          disabled={isExpired}
        >
          Verify Email
        </button>
        
        {isExpired && (
          <p className="text-sm text-center mt-4">
            <span
              className="text-blue-400 cursor-pointer hover:text-blue-300"
              onClick={() => navigate('/login')}
            >
              Try again
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default OtpVerify;