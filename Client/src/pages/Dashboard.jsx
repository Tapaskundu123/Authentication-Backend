import React from 'react'
import Header from '../components/Header'
import Navbar from '../components/Navbar'

const Dashboard = () => {

  return(
    <div className='flex flex-col min-h-screen'>
      <Navbar/>
      <Header/>
    </div>
  )
  
}

export default Dashboard