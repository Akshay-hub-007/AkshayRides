import React from 'react'
import  { TestDrivesList } from './_components/test-drive-list'

const page = () => {
  return (
    <div className='p-6'>
      <h1 className='text-2xl  font-bold  mb-6'>Test  Drive Management</h1>
      <TestDrivesList/>
    </div>
  )
}

export default page
