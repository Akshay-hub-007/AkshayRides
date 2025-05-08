import React from 'react'
import SettingsForm from './_components/settings-from'

export const metadata={
    title:"Setting | AkshayRides",
    description:"Manage  dealership working hours and admin users"
}

const SettingsPage = () => {
  return (
    <div className='p-6'>
      <h1 className='text-2xl mb-6 font-bold'>Settings</h1>
      <SettingsForm/>
    </div>
  )
}

export default SettingsPage