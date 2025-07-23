import React, { useState } from 'react';
import faviconImg from '../assets/favicon.svg';
import axios from 'axios';

const ResetPassword = () => {
  // State to store the 6 OTP digits
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  // Handle input change for each OTP box
  const handleInputChange = (index, value) => {
    // Allow only single digits
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
      await axios.post(
        'http://localhost:3000/api/auth/verifyEmail',
        { otp: otpString },
        { withCredentials: true }
      );
      // Handle success (e.g., redirect or show success message)
      console.log('OTP verified successfully');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP. Please try again.');
    }
  };

  return (
    <form
      className="h-screen bg-gradient-to-br from-blue-200 to-purple-400 flex justify-center items-center"
      onSubmit={handleSubmit}>
      {/* Header positioned absolutely at the top */}
      <div className="absolute top-0 left-0 flex gap-1 p-2">
        <img src={faviconImg} alt="auth-logo" />
        <h1 className="text-3xl font-bold">auth</h1>
      </div>

      {/* Centered verification form */}
      <div className="  bg-blue-950 text-white px-10 py-8 rounded-3xl flex flex-col">
        <h1 className="text-4xl font-bold text-center">Email Verify OTP</h1>
        <p className="text-sm text-blue-400 px-4 py-1.5 text-center">
          Enter the 6 digit code sent to your email id
        </p>
        {error && (
          <p className="text-red-400 text-sm text-center mb-2">{error}</p>
        )}
        <div className="flex gap-1 p-4 mb-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              className="h-12 w-12 rounded-xl border-2 bg-blue-950 no-spinner text-center"
              type="number"
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
};

export default ResetPassword;
