"use client"

import { getCars } from '@/actions/car-listing'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import CarListingsLoading from './CarListingLoading'
import useFetch from '@/hooks/use-fetch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import CarCard from '@/components/CarCard'

const CarListing = () => {
  const searchParams = useSearchParams()

  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 6

  const search = searchParams.get("search") || "";
  const make = searchParams.get("make") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const transmission = searchParams.get("transmission") || "";
  const minPrice = searchParams.get("minPrice") || 0;
  const maxPrice = searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  // Use the useFetch hook
  const { loading, fn: fetchCars, data: result, error } = useFetch(getCars);

  useEffect(() => {
    fetchCars({
      search,
      make,
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });
  }, [
    search,
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  if (loading || !result)
    return <CarListingsLoading />

  if (error || (!result && !result.success)) {
    return <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load cars.Please try again.
      </AlertDescription>
    </Alert>

  }
  if (!result && !result.data) {
    return null
  }



  const { data: cars, pagination } = result
 console.log(cars[0])
  if (cars.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Info className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No cars found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          We couldn't find any cars matching your search criteria. Try adjusting
          your filters or search term.
        </p>
        <Button variant="outline" asChild>
          <Link href="/cars">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <p>
          Showing
          <span>{(page - 1) * limit + 1}- {Math.min(page * limit, pagination.total)}</span>{" "}
          of <span className='font-medium'>{pagination.total}</span> Cars
        </p>
      </div>
      <div>
        {
          cars.map((car,index)=>{
           return  <CarCard  key={index} car={car}/>
          })
        }
      </div>
    </div>
  )
}

export default CarListing