"use client"
import { toggleSavedCars } from "@/actions/car-listing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import useFetch from "@/hooks/use-fetch"
import { formatCurrency } from "@/lib/helper"
import { useAuth } from "@clerk/nextjs"
import { Calendar, Car, Currency, Fuel, Gauge, Heart, LocateFixed, MessageSquare, Share2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import EmiCalculator from "./Emicalculator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CarDetails({ car, testDriveInfo }) {
    console.log(testDriveInfo)
    const router = useRouter()
    const { isSignedIn } = useAuth()
    const [isWishlisted, setWishlisted] = useState(car.isWishlisted)
    const [currentImageIndes, setCurrentImageIndex] = useState(0)
    const [isSaved, setIsSaved] = useState()
    const {
        loading: savingCar,
        fn: toggleSavedCarFn,
        data: toggleResult,
        error: toggleError
    } = useFetch(toggleSavedCars)

    useEffect(() => {
        console.log(toggleResult)
        if (toggleResult?.success && toggleResult.saved !== isWishlisted) {
            setWishlisted(toggleResult.saved)
            toast.success(toggleResult.message)
        }

    }, [toggleResult, isSaved])
    useEffect(() => {
        if (toggleError) {
            toast.error("Failed to update favorites");
        }
    }, [toggleError])
    const handleSaveCar = async (e) => {

        e.preventDefault();

        if (!isSignedIn) {
            toast.error("Please Sign in to save cars")
            router.push("/sign-in")
            return;
        }

        await toggleSavedCarFn(car.id)
    }
    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
    }
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                text: `${car.year} ${car.make} ${car.model}`,
                text: `Check out this ${car.year} ${car.make} ${car.model} on akshay.carverse`,
                url: window.location.href
            }).catch((error) => {
                console.log("error in sharing")
                copyToClipboard();
            })
        } else {
            copyToClipboard
        }
    }

    const handleBookTestDrive = () => {
        if (!isSignedIn) {
            toast.error("Please sign in to book a test drive")
            router.push("/sign-in")

            return;
        }
        router.push(`/test-drive/${car.id}`)
    }
    return (
        <>
            <div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-7/12">
                        <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
                            {car.images && car.images.length > 0 ? (
                                <Image
                                    src={car.images[currentImageIndes]}
                                    alt={`${car.year} ${car.make} ${car.model}`}
                                    className="object-cover"
                                    priority
                                    // width={800} 
                                    fill
                                // height={600}
                                />
                            ) : <>
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <Car className="h-24 w-24 text-gray-400"></Car>

                                </div>
                            </>
                            }
                        </div>

                        {car.images && car.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {
                                    car.images.map((img, index) => {
                                        return (
                                            <div key={index}
                                                className={`relative cursor-pointer rounded-md h-20 w-24 flex-shrink-0 transition ${index == currentImageIndes
                                                    ? "border-2 border-blue-600" :
                                                    "opacity-70 hover-opacity-100"
                                                    }`}
                                                onClick={() => setCurrentImageIndex(index)}
                                            >
                                                <Image
                                                    src={img}
                                                    alt={`${car.year} ${car.make} ${car.model} -view${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )
                                    })
                                }

                            </div>
                        )}


                        <div className="flexmt-4 gap-4">
                            <Button
                                variant="outline"
                                className={`flex items-center gap-2 flex-1 ${isWishlisted ? "text-red-500" : ""
                                    }`}
                                onClick={handleSaveCar}
                                disabled={savingCar}
                            >

                                <Heart
                                    className={`h-5 w-5 ${isWishlisted ? "text-red-500" : ""}`} />
                                {isWishlisted ? "Saved" : "save"}
                            </Button>

                            <Button
                                variant={"outline"}
                                className={"flex items-center gap-2 flex-1"}
                                onClick={handleShare}

                            >
                                <Share2 className="w-5 h-5 " />
                                Share
                            </Button>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <Badge className="mb-2">{car.model}</Badge>

                        </div>

                        <h1>
                            {car.year} {car.model}  {car.make}
                        </h1>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(car.price)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
                            <div className="flex items-center gap-2">
                                <Gauge className="text-gray-500 h-5 w-5" />
                                <span>{car.mileage.toLocaleString()} miles</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Fuel className="text-gray-500 h-5 w-5" />
                                <span>{car.fuelType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Car className="text-gray-500 h-5 w-5" />
                                <span>{car.transmission}</span>
                            </div>
                        </div>

                        <Dialog>
                            <DialogTrigger>
                                <Card>
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-lg font-medium mb-2">
                                            <Currency className="w-5 h-5 text-blue-600" />
                                            <h3>EMI Calculator</h3>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Estimated Monthly Amount:{" "}
                                            <span className="font-bold text-gray-900">
                                                {formatCurrency(car.price / 60)}
                                            </span>
                                            for 60 months

                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            *Based on zero down payment and 4.5% interset rate
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        EMI Calculator
                                        <EmiCalculator price={car.price} />
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogDescription></DialogDescription>
                            </DialogContent>
                        </Dialog>
                        <Card className="my-6">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-lg font-medium mb-2">
                                    <MessageSquare className="h-5 w-5 text-blue-600" />
                                    <h3>Have Questions?</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    Our representatives are available to answer all your queries
                                    about this vehicle.
                                </p>
                                <a href="mailto:help@vehiql.in">
                                    <Button variant="outline" className="w-full">
                                        Request Info
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>

                        {
                            car.status === "SOLD" || car.status === "UNAVAILABLE" && (
                                <Alert variant="destructive">
                                    <AlertTitle className={"captalize"}>
                                        This car is {car?.status?.toLowerCase()}
                                    </AlertTitle>
                                    <AlertDescription>Please try again later.</AlertDescription>
                                </Alert>
                            )
                        }

                        {
                            car.status !== "SOLD" && car.status !== "UNAVAILABLE" && (
                                <Button
                                    className={"w-full py-6 text-lg cursor-pointer"}
                                    onClick={handleBookTestDrive}
                                    diabled={testDriveInfo.userTestDrive}
                                >
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Book a test Drive
                                    {
                                        testDriveInfo.userTestDrive ?
                                            `Booked for ${format(new Date(testDriveInfo.userTestDrive.bookingDate), "EEEE,MMMM d,yyyy")}` : "Book your test Drive"
                                    }
                                </Button>
                            )
                        }
                    </div>


                </div>
                <div>
                    <div className="grid grid-cols-1 ">
                        <div>
                            <h3 className="text2xl font-bold mb-6">Description</h3>
                            <p className="whitespace-pre-line text-gray-700">
                                {car.description}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-6">Features</h3>
                            <ul className="grid grid-cols-1 gap-2">
                                <li className="flex items-center gap-2">
                                    <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                                    {car.transmission} Transmission
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                                    {car.fuelType} Engine
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                                    {car.bodyType} Body Style
                                </li>
                                {car.seats && (
                                    <li className="flex items-center gap-2">
                                        <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                                        {car.seats} Seats
                                    </li>
                                )}
                                <li className="flex items-center gap-2">
                                    <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                                    {car.color} Exterior
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Specifications</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Make</span>
                                <span className="font-medium">{car.make}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Model</span>
                                <span className="font-medium">{car.model}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Year</span>
                                <span className="font-medium">{car.year}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Body Type</span>
                                <span className="font-medium">{car.bodyType}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Fuel Type</span>
                                <span className="font-medium">{car.fuelType}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Transmission</span>
                                <span className="font-medium">{car.transmission}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Mileage</span>
                                <span className="font-medium">
                                    {car.mileage.toLocaleString()} miles
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Color</span>
                                <span className="font-medium">{car.color}</span>
                            </div>
                            {car.seats && (
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">Seats</span>
                                    <span className="font-medium">{car.seats}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold mb-6"> Dealership Location</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex-col md:flex-row gap-6 justify-between">
                            <div className="flex items-start gap-3">
                                <LocateFixed className="h-5 w-5 text-blue-600mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium">AkshayCarverse</h4>
                                    <p className="text-gray-600">
                                        {testDriveInfo.dealership?.address || "Not Available"}
                                    </p>

                                     <p className="text-gray-600 mt-1">
                                        {testDriveInfo.dealership?.phone || "Not Available"}
                                    </p>
                                     <p className="text-gray-600 mt-1">
                                        {testDriveInfo.dealership?.email || "Not Available"}
                                    </p>
                                </div>

                            </div>
                            <div className="md:w-1/2 lg:w-1/3">
                                <h4 className="font-medium mb-2">Working Hours</h4>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )

}