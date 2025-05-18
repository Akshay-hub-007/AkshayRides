import { getCarFilters } from '@/actions/car-listing'
import React from 'react'
import CarListing from './_components/car-listing';
import CarFilters from './_components/car-filters';


export const metadata={
  title:"Cars | AkshayRides",
  description:"Browser and search for your  dream car."
}
async function CarPage({params}) 
{
    const filtersData=await getCarFilters();
  return (
    <div className='container mx-auto px-4 py-12'>
      <h1 className='text-6xl mb-4 gradient-title'>Browser cars</h1>


      <div className='flex flex-col lg:flex-row gap-8'>
        <div className='w-full lg:w-80 flex-shrink-0'>
            <CarFilters filters={filtersData.data}/>
        </div>

        <div className='flex-1'>
           <CarListing/>
        </div>

      </div>
    </div>
  )
}

export default CarPage