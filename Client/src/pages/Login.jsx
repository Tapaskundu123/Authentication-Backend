import {useState} from 'react'
import faviconImg from '../assets/favicon.svg';
import { User, Mail, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResetPassword from './ResetPassword';

const Login = () => {

   const navigate= useNavigate();
   
   const [signUp,setSignUp]= useState(false);
   const [name, setName]= useState('');
   const [email,setEmail]= useState('');
   const [password,setPassword]= useState('');
   
 return(
    <div className='h-screen flex flex-col bg-gradient-to-br from-blue-200 to-purple-400'>
      {/* Header */}
      <div className='flex gap-0.5 p-4 cursor-pointer' onClick={()=>navigate('/')}>
        <img className='h-10 w-28' src={faviconImg} alt='logo-img' />
        <h1 className='font-bold text-3xl'>auth</h1>
      </div>

      {/* Form Centered Vertically */}
      <form className='flex flex-1 justify-center items-center'>
        <div className='flex flex-col bg-blue-950 text-white py-7 px-10 rounded-3xl w-[90%] max-w-md shadow-xl'>
         {signUp?
           ( <h1 className='text-3xl font-medium text-center'>Create Account</h1>):(<h1 className='text-3xl font-medium text-center'>Login</h1>)
           }
           {signUp?
           ( <p className='text-center p-2'>Create your account</p>)
           :
           (<p className='text-center p-2'>Login to your account</p>)}

          {/* Inputs */}
          <div className='flex flex-col gap-5 w-full mt-8'>

            {signUp && 
               ( <div className='relative w-full'>
              <input
                className='w-full border-none rounded-3xl bg-blue-800 py-3 pr-10 pl-12 text-md text-white placeholder-white autofill:bg-blue-800'
                type='text'
                placeholder='Full name'
                value={name}
                onChange={(e)=>setName(e.target.value)}
              />
              <User className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white' />
            </div>
           )}
       
            <div className='relative w-full'>
              <input
                className='w-full border-none rounded-3xl bg-blue-800 py-3 pr-10 pl-12 text-md text-white placeholder-white autofill:bg-blue-800'
                type='email'
                placeholder='Email ID'
                   value={email}
                onChange={(e)=>setEmail(e.target.value)}
                
              />
              <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white' />
            </div>

            <div className='relative w-full'>
              <input
                className='w-full border-none rounded-3xl bg-blue-800 py-3 pr-10 pl-12 text-md text-white placeholder-white autofill:bg-blue-800'
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
              <LockKeyhole className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white' />
            </div>
          </div>
   {!signUp && (
    <p className='p-2 text-sm text-right'>
       <span className='cursor-pointer' onClick={()=>navigate('/reset-password')}>Forgot password?</span>
    </p>
  )}   
     {signUp?
        (<button className='bg-blue-600 py-3 mt-6 rounded-3xl font-medium hover:bg-blue-700 transition cursor-pointer' onClick={()=>navigate('/')}>
            Sign up
          </button>)
          :
          (<button className='bg-blue-600 py-3 mt-2 rounded-3xl font-medium hover:bg-blue-700 transition cursor-pointer' onClick={()=>navigate('/')}>
            Login
          </button>)}
          
          {signUp? (<p className='text-sm p-2 text-center'>
            Already have an account?
            <span className='text-blue-400 cursor-pointer' onClick={()=>setSignUp((prev)=> !prev) }>Login here</span>
          </p>)
          :
          (<p className='text-sm p-2 text-center'>
           Don't have an account?
            <span className='text-blue-400 cursor-pointer' onClick={()=>setSignUp((prev)=> !prev) }>Signup here</span>
          </p>)}
          
        </div>
      </form>
    </div>
  );
}


export default Login;
