import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function CarDetails()
{

    const router=useRouter()
    const {isSignedIn}=useAuth()
    const [isWishlisted,setWishlisted]=useState(carMakes.isWishlisted)
    const [currentImageIndes,setCurrentImageIndex]=useState(0)
    return(
        <>
        <div>

        </div>
        </>
    )

}