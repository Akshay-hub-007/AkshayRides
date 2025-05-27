import { getCarById } from '@/actions/car-listing'
import { notFound } from 'next/navigation'
import React from 'react'

export async function generateMetadata({params})
{
    const  {id}=await params
    const result=await getCarById(id)

    if(!result.success)
    {
        return {
             title:"Car Not Found | AkshayRides",
             description:"The requested Car is not found"
        }
    }

    const car=result?.data

    return {
        title:`${car.year} ${car.make} ${car.model} | AkshayRides`,
        description:car?.description(0,160),
        openGraph:{
            images:car?.images?.[0] ?[car.images[0]]:[]
        }
    }
}

async function CarDetailsPage({params}) {

     const  {id}=await params
    const result=await getCarById(id)
   
    if(!result.success)
    {
        notFound()
    }
  return (
    <div>CarDetailsPage</div>
  )
}

export default CarDetailsPage