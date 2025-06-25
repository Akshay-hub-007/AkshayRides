import { getCarById } from '@/actions/car-listing'
import { notFound } from 'next/navigation'
import React from 'react'
import TestDriveForm from '../_components/test-drive-form'


export async function generateMetaData() {
  return {
    title: `Book  a test drive | AkshayCarverse`,
    description: ` Schedule a test drive in few seconds`
  }
}
async function page({ params }) {

  const { id } = await params

  const result = await getCarById(id)

  if (!result.success) {
    notFound()
  }

  return (
    <div className='container mx-auto px-4 py-12'>

      <h1 className='text-6xl mb-6  gradient-title'>
        Book a test drive
      </h1>
      <TestDriveForm />
    </div>
  )
}

export default page
