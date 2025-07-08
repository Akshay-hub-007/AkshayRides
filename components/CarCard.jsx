"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import Image from 'next/image'
import { CarIcon, Heart, Loader } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useRouter } from 'next/navigation'
import useFetch from '@/hooks/use-fetch'
import { toggleSavedCars } from '@/actions/car-listing'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

function CarCard({ car }) {

    console.log(car?.images[0])
    const { isSignedIn } = useAuth()
    const [isSaved, setIsSaved] = useState(car.wishlisted)
    const router = useRouter()

    const {
        loading: isToggling,
        fn: toggleSavedCar,
        data: toggleResult,
        error: toggleError
    } = useFetch(toggleSavedCars)

    useEffect(() => {
        if (toggleResult?.success && toggleResult?.saved != isSaved) {
            console.log("saved")
            setIsSaved(toggleResult.saved)
            console.log(toggleResult)
            toast.success(toggleResult.message)
        }
    }, [toggleResult, isSaved])
    const handleToggleSave = async (e) => {
        if (!isSignedIn) {
            toast.error("Please sign in to save car").

                router.push("/sign-in")
            return;
        }
        if (isToggling) return

        await toggleSavedCar(car.id)
    }

    useEffect(() => {
        if (toggleError) {
            toast.error("failed to update favorites")
        }
    }, [toggleError])
    // Card with animation
    return (
      <Card
        className="overflow-hidden group py-2 shadow transition duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03] animate-fade-in"
        style={{ animation: 'fadeInUp 0.7s cubic-bezier(.23,1.01,.32,1)' }}
      >
        <div className='relative h-48'>
            {car.images && car.images.length > 0 ? (
                <div className='relative w-full h-full'>
                    <Image
                        src={car.images[0]}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className='object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500 ease-in-out'
                    />
                </div>
            ) : (
                <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                    <CarIcon className="h-12 w-12 text-gray-400 animate-pulse" />
                </div>
            )}
            <Button variant="ghost" size="icon" className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${isSaved ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-gray-900"} transition-transform duration-300 hover:scale-125`}
                onClick={handleToggleSave} >
                {isToggling ? (<Loader className='animate-spin' />)
                    : (<Heart className={isSaved ? "fill-current" : ""} />)}
            </Button>
        </div>

        <CardContent>
            <div className='flex flex-col mb-2'>
                <h3 className='text-lg font-bold line-clamp-1 group-hover:text-blue-700 transition-colors duration-300'>
                    {car.make} {car.model}
                </h3>
                <span className='text-xl font-bold text-blue-600 group-hover:text-blue-800 transition-colors duration-300'>${car.price.toLocaleString()}</span>
            </div>
            <div className='text-gray-600 mb-2 flex items-center'>
                <span>{car.year}</span>
                <span className='mx-2'>*</span>
                <span>{car.transmission}</span>
                <span className='mx-2'>*</span>
                <span>{car.fuelType}</span>
            </div>

            <div className='flex flex-wrap gap-1 mb-4'>
                <Badge variant='outline' className="bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                    {car.bodyType}
                </Badge>
                <Badge variant='outline' className="bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                    {car.mileage.toLocaleString()}
                </Badge>
                <Badge variant='outline' className="bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                    {car.color}
                </Badge>
            </div>

            <div className='flex justify-between'>
                <Button className={"flex-1 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300"}
                    onClick={() => router.push(`/cars/${car.id}`)}
                >View Car</Button>
            </div>
        </CardContent>
        {/* Animation keyframes */}
        <style>{`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Card>
    )
}

export default CarCard