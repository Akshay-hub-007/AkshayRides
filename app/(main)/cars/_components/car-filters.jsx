"use client"
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { bodyTypes } from '@/lib/data'
import { Badge, Filter } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import CarFilterControls from './CarFilterControls'

const CarFilters = ({ filters }) => {

    console.log(filters.priceRange)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentMake = searchParams.get("make") || ""
    const currentBodyType = searchParams.get("bodyType") || ""
    const currentFuelType = searchParams.get("fuelType") || ""
    const currentTransmission = searchParams.get("transmission") || ""
    const currentMinPrice = searchParams.get("minPrice") ?
        parseInt(searchParams.get("minPrice")) :
        filters.priceRange.min;
    const currentMaxPrice = searchParams.get("maxPrice") ?
        parseInt(searchParams.get("maxPrice")) :
        filters.priceRange.max
    const currentSortBy = searchParams.get("sortBy") || "newest"

    const [make, setMake] = useState(currentMake)
    const [bodyType, setBodyType] = useState(currentBodyType)
    const [fuelType, setFuelType] = useState(currentFuelType)
    const [transmission, setTransmission] = useState(currentTransmission)
    const [priceRange, setPriceRange] = useState([
        currentMinPrice,
        currentMaxPrice
    ])
    const [sortBy, setSortBy] = useState(currentSortBy)

    useEffect(() => {
        setMake(currentMake)
        setBodyType(bodyType)
        setFuelType(fuelType)
        setTransmission(transmission)
        setPriceRange([currentMinPrice, currentMaxPrice])
        setSortBy(currentSortBy)
    }, [
        currentMake,
        currentBodyType,
        currentFuelType,
        currentTransmission,
        currentSortBy,
        currentMinPrice,
        currentMaxPrice
    ])

    const [sheetOpen, setIsSheetOpen] = useState(false)

    const activeFilterCount = [
        make,
        bodyType,
        fuelType,
        transmission,
        currentMinPrice > filters?.priceRange.min ||
        currentMaxPrice < filters.priceRange.max
    ].filter(Boolean).length

    const currentFilters = {
        make,
        bodyType,
        fuelType,
        transmission,
        priceRange,
        priceRangeMin: filters?.priceRange?.min,
        priceRangeMax: filters.priceRange.max
    }

    const handleFilterChange = (filterName, value) => {
        switch (filterName) {
            case "make":
                setMake(value);
                break;
            case "bodyType":
                setBodyType(value);
                break;
            case "fuelType":
                setFuelType(value);
                break;
            case "transmission":
                setTransmission(value);
                break;
            case "priceRange":
                setPriceRange(value);
                break;
        }
    };

    // Handle clearing specific filter
    const handleClearFilter = (filterName) => {
        handleFilterChange(filterName, "");
    };

    // Clear all filters
    const clearFilters = () => {
        setMake("");
        setBodyType("");
        setFuelType("");
        setTransmission("");
        setPriceRange([filters?.priceRange?.min, filters.priceRange.max]);
        setSortBy("newest");

        // Keep search term if exists
        const params = new URLSearchParams();
        const search = searchParams.get("search");
        if (search) params.set("search", search);

        const query = params.toString();
        const url = query ? `${pathname}?${query}` : pathname;

        router.push(url);
        setIsSheetOpen(false);
    };
    return (
        <div>

            <div className='lg:hidden'>
                <div className='flex items-center'>
                    <Sheet open={sheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger>
                            <Button variant={"outline"} className={"fex items-center gap-2"}>
                                <Filter className='w-4 h-4 ' /> Filters {" "}
                                {
                                    activeFilterCount > 0 && (
                                        <Badge className='ml-1  h-5 w-5  rounded-full p-0 flex  items-center justify-center'>{activeFilterCount}</Badge>
                                    )
                                }
                            </Button>
                        </SheetTrigger>
                        <SheetContent side='left'
                            className={"w-full sm:max-w-md overflow-y-auto"}>
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <div className='py-6'>
                                <CarFilterControls
                                    filters={filters}
                                    currentFilters={currentFilters}
                                    onFilterChange={handleFilterChange}
                                    onClearFilter={handleClearFilter}
                                />
                            </div>
                            <SheetFooter className="sm:justify-between flex-row pt-2 border-t  space-x-4 mt-auto">
                                <Button
                                onClick={clearFilters}
                                type="button"
                                variant="outline"
                                className={"flex-1"}
                                >Reset</Button>
                                <Button
                                type="button"
                                // onClick={applyFilters}
                                variant="outline"
                                className={"flex-1"}
                                >Show Result</Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>

            </div>

            <div></div>
        </div>
    )
}

export default CarFilters