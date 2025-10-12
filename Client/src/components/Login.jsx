import { useState } from 'react';
import faviconImg from '../assets/favicon.svg';
import { User, Mail, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [signUp, setSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameField, setNameField] = useState(false);
  const [emailField, setEmailField] = useState(false);
  const [passwordField, setPasswordField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const HandleSubmit = async (e) => {
    e.preventDefault();

    // Reset all error states
    setNameField(false);
    setEmailField(false);
    setPasswordField(false);

    let hasError = false;

    if (signUp && name.trim() === '') {
      setNameField(true);
      hasError = true;
      toast.error('Name is required');
    }
    if ( email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ) {
      setEmailField(true);
      hasError = true;
      toast.error('Please enter a valid email address');
    }
    if (password.trim() === '' || password.length < 6) {
      setPasswordField(true);
      hasError = true;
      toast.error('Password must be at least 6 characters');
    }

    if (hasError) {
      toast.error('Please fix the errors in the form!');
      return;
    }

    setIsLoading(true);
    try {
      if (signUp) {
        const SignUpSend = { name, email, password };
        const res = await axios.post('http://localhost:3000/api/auth/register', SignUpSend, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.status === 201 || res.status === 200) {
          if (res.data.success === false) {
            toast.error(res.data.message || 'Registration failed');
            return;
          }
          toast.success('Successfully registered your account'); 
          localStorage.setItem('User',JSON.stringify(res.data.User));
          // navigate('/dashboard');
          navigate('/otp-verify',{state:{ GoForgotPage: false, GoLandingPage: true, email }})
        } else {
          toast.error(res.data.message || 'Registration failed');
        }
      } else {
        const LoginDataSend = { email, password };
        const res = await axios.post('http://localhost:3000/api/auth/login', LoginDataSend, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.data.success === false) {
          toast.error(res.data.message || 'Login failed');
          return;
        }
        if ( res.status === 200 ){
          toast.success('Successfully logged in your account');
          localStorage.setItem('User',JSON.stringify(res.data.user));
          navigate('/dashboard');
        } 
        else {
          toast.error(res.data.message || 'Login failed');
          return;
        }
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (signUp) {
          // Handle signup errors
          if (status === 400) {
            toast.error(data.message || 'Invalid registration details');
          } else if (status === 404) {
            toast.error('Registration service unavailable');
          } else if (status === 409) {
            toast.error(data.message || 'Email already registered');
          } else {
            toast.error(data.message || 'An error occurred during registration');
          }
        } else {
          // Handle login errors
          if (status === 400) {
            toast.error(data.message || 'Invalid login details');
          } else if (status === 404) {
            toast.error('Invalid Email!');
          } else if (status === 401) {
            toast.error('Invalid Password!');
          } else {
            toast.error(data.message || 'An error occurred during login');
          }
        }
        // Log detailed error for debugging
        console.error('Request failed:', {
          status,
          data,
          payload: signUp ? { name, email, password } : { email, password },
        });
      } else if (err.request) {
        toast.error('Unable to reach the server. Please try again later.');
      } else {
        toast.error('Error setting up request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-200 to-purple-400">
      <div className="flex gap-0.5 p-4 cursor-pointer absolute top-0 left-0" onClick={() => navigate('/')}>
        <img className="h-10 w-28" src={faviconImg} alt="logo-img" />
        <h1 className="font-bold text-3xl">auth</h1>
      </div>

      <form className="flex flex-1 justify-center items-center" onSubmit={HandleSubmit}>
        <div className="flex flex-col bg-blue-950 text-white py-7 px-10 rounded-3xl w-[90%] max-w-md shadow-xl">
          {signUp ? (
            <h1 className="text-3xl font-medium text-center">Create Account</h1>
          ) : (
            <h1 className="text-3xl font-medium text-center">Login</h1>
          )}
          {signUp ? (
            <p className="text-center p-2">Create your account</p>
          ) : (
            <p className="text-center p-2">Login to your account</p>
          )}

          <div className="flex flex-col gap-5 w-full mt-8">
            {signUp && (
              <div className="relative w-full">
                <input
                  className={`w-full border-none rounded-3xl bg-blue-800 py-3 pr-10 pl-12 text-md text-white placeholder-white autofill:bg-blue-800 ${nameField ? 'border border-red-500' : ''}`}
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
              </div>
            )}

            <div className="relative w-full">
              <input
                className={`w-full border-none rounded-3xl bg-blue-800 py-3 pr-10 pl-12 text-md text-white placeholder-white autofill:bg-blue-800 ${emailField ? 'border border-red-500' : ''}`}
                type="email"
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
            </div>

            <div className="relative w-full">
              <input
                className={`w-full border-none rounded-3xl bg-blue-800 py-3 pr-10 pl-12 text-md text-white placeholder-white autofill:bg-blue-800 ${passwordField ? 'border border-red-500' : ''}`}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
            </div>
          </div>

          {!signUp && (
            <p className="p-2 text-sm text-right">
              <span className="cursor-pointer" onClick={()=>navigate('/email-verify',{state: {isEmailVerify:false, isForgotPassword:true}})}>
                Forgot password?
              </span>
            </p>
          )}

          <button
            disabled={isLoading}
            className={`bg-blue-600 py-3 mt-6 rounded-3xl font-medium hover:bg-blue-700 transition cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
          >
            {isLoading ? 'Processing...' : signUp ? 'Sign up' : 'Login'}
          </button>

          {signUp ? (
            <p className="text-sm p-2 text-center">
              Already have an account?
              <span className="text-blue-400 cursor-pointer" onClick={() => setSignUp((prev) => !prev)}>
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm p-2 text-center">
              Don't have an account?
              <span className="text-blue-400 cursor-pointer" onClick={() => setSignUp((prev) => !prev)}>
                Signup here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;