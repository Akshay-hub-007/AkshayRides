"use client"
import { toggleSavedCars } from "@/actions/car-listing"
import useFetch from "@/hooks/use-fetch"
import { useAuth } from "@clerk/nextjs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function CarDetails({ car, testDrivingInfo }) {

    const router = useRouter()
    const { isSignedIn } = useAuth()
    const [isWishlisted, setWishlisted] = useState(carMakes.isWishlisted)
    const [currentImageIndes, setCurrentImageIndex] = useState(0)
    const [isSaved, setIsSaved] = useState()
    const {
        loading: savedCar,
        fn: toggleSavedCarFn,
        data: toggleResult,
        error: toggleError
    } = useFetch(toggleSavedCars)

    useEffect(() => {
        if (toggleResult.success && toggleResult.saved !== isWishlisted) {
            setWishlisted(toggleResult.saved)
            toast.success(toggleResult.message)
        }

    }, [toggleResult, isSaved])
    useEffect(() => {
        if (toggleError) {
            toast.error("Failed to update favorites");
        }
    }, [toggleError])
    const handleToggleSave = async (e) => {

        e.preventDefault();

        if (!isSignedIn) {
            toast.error("Please Sign in to save cars")
            router.push("/sign-in")
            return;
        }

        await toggleSavedCarFn(car.id)
    }
    return (
        <>
            <div>
                <div>
                    <div>
                        <div>
                            {car.images && car.images.length>0 ?(
                                <Image
                                 src={car.images[currentImageIndes]}
                                 alt={`${car.year} ${car.make} ${car.model}`}
                                />
                            ):<></>}
                        </div>
                    </div>
                    <div></div>
                </div>
            </div>
        </>
    )

}