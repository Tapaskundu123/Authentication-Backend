import React from 'react'
import faviconImg from '../assets/favicon.svg';
const Login = () => {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-br from-blue-200 to-purple-400'>
     <div className='flex gap-0.5 p-4'>
        <img className='h-10 w-28' src={faviconImg} alt="logo-img" />
         <h1 className='font-bold text-3xl'>auth</h1>
     </div>

<div className='flex flex-col justify-center items-center'>
     <div className='flex flex-col  bg-blue-950 text-white py-7 px-10 rounded-2xl'>
        <h1 className='text-3xl font-medium text-center'>Create Account</h1>
        <p className='text-center p-2'>Create your account</p>

     <div className='flex flex-col gap-5 mt-8'>
        <input className='border-none rounded-3xl bg-blue-800 py-3 px-8 text-md' type="text" placeholder='Full name' />
        <input className='border-none rounded-3xl bg-blue-800 py-3 px-8' type="text" placeholder='Email ID'/>
        <input className='border-none rounded-3xl bg-blue-800 py-3 px-8' type="text" placeholder='Password'/>
     </div>

     
        <p className='p-2 text-sm'>Forgot password?</p>
     
     <button className='bg-blue-600 py-3 rounded-3xl '>Sign up</button>
     <p className='text-sm p-2'>Already have an account? <span className='text-blue-400'> Login here</span></p>
     </div>
        
</div>

</div>
  )
}

export default Login;