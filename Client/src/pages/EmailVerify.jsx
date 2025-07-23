import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import faviconImg from '../assets/favicon.svg';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailVerify = () => {
  // State for OTP digits and authentication status
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true = authenticated, false = not authenticated
  const navigate = useNavigate();

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.post(
          'http://localhost:3000/api/auth/is-Auth',
          {}, // Empty body for POST
          { withCredentials: true } // Include cookies (token)
        );

        if (response.data.success) {
          setIsAuthenticated(true); // User is authenticated, show OTP form
        } else {
          setIsAuthenticated(false);
          toast.error(response.data.message || 'Please log in to verify your email');
          navigate('/login'); // Redirect to login page
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        toast.error('Authentication failed. Please log in.');
        navigate('/login');
      }
    };

    checkAuthentication();
  }, []); // Include navigate in dependencies

  // Handle input change for each OTP box
  const handleInputChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
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

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/verifyEmail',
        { otp: otpString },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Email verified successfully!');
        navigate('/'); // Redirect to Home after successful verification
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP. Please try again.');
      toast.error('failed retry')
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-200 to-purple-400 flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Render OTP form if authenticated
  if (isAuthenticated) {
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
          <div className="flex gap-1 p-4 mb-2">
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
          <button className="bg-blue-600 py-4 px-20 rounded-3xl" type="submit">
            Verify Email
          </button>
        </div>
      </form>
    );
  }

  // If not authenticated, return null (navigate will handle redirect)
  return null;
};

export default EmailVerify;