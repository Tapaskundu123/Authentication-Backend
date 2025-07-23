import React from 'react'
import faviconImg from '../assets/favicon.svg';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate= useNavigate();
  return (
    <div className='flex justify-between py-6 px-6  '>
        <div className='flex gap-0.5 '>
           <img className='h-10 w-28' src={faviconImg} alt="logo-img" />
           <h1 className='font-bold text-3xl'>auth</h1>
        </div>
     
        <div className='flex items-center justify-between '>
          <button onClick={()=>navigate('/login')} className='border-2 py-2 px-7 relative rounded-2xl  hover:bg-blue-500 hover:text-white  hover:cursor-pointer'>Login</button>
          <ArrowRight className='absolute right-4 px-1 mr-2 ml-2 '/>
        </div>
    </div>
  )
}

export default Navbar;