"use client"

import { getCars } from '@/actions/car-listing'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import CarListingsLoading from './CarListingLoading'

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

  if(loading || !result )
    return <CarListingsLoading/>
  return (
    <div>CarListing</div>
  )
}

export default CarListing