import React from 'react'
import headerImg from '../assets/header_img.png'
const Header = () => {
  return (
    <div className='flex flex-col flex-grow justify-center items-center'>
        <div className='flex flex-col items-center'>
           <img className='h-50 w-50 pt-2' src={headerImg} alt="" /> 
           <div className='text-center'>
               <h1 className='text-4xl font-medium p-4'>Hey Developer 👋</h1>
               <h2 className='text-5xl'>Welcome to our App</h2>
               <p className='p-4'>Let's start with a quick product tour and we will have you up and running on time</p>
               <button className='border py-2 px-4 rounded-2xl hover:bg-gray-100 hover:cursor-pointer'>Get Started</button>
           </div>
       </div>
    </div>
  )
}

export default Header