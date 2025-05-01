"use client"
import { deleteCar, getCars, updateCar } from '@/actions/cars'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import useFetch from '@/hooks/use-fetch'
import { formatCurrency } from '@/lib/helper'
import { CarIcon, Eye, Loader, Loader2, MoreHorizontal, Plus, Search, Star, StarOff, Trash, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

function CarList() {


    const [search, setSearch] = useState("")
    const [carToDelete, setCarToDelete] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)


    const router = useRouter()
    const {
        loading: loadingCars,
        fn: fetchCars,
        data: carsData,
        error: carsError
    } = useFetch(getCars);

    useEffect(() => {
        fetchCars(search)
    }, [search])


    const {
        loading: deletingCar,
        fn: deleteCarFn,
        data: deleteResult,
        error: deleteError
    } = useFetch(deleteCar);

    const {
        loading: updatingCars,
        fn: updateCarFN,
        data: updateCarResult,
        error: updateCarError
    } = useFetch(updateCar)
    useEffect(() => {
        if (updateCarResult?.success) {
            toast.success("Car Updated Successfully")
            fetchCars(search)
        }
        if (deleteResult?.success) {
            toast.success("Car deleted Successfully")
            fetchCars(search)
        }
    }, [updateCarResult, deleteResult, search])
    useEffect(() => {
        if (carsError?.error) {
            toast.error("Failed to load car")
        }

        if (updateCarError?.error) {
            toast.error("Failed to update car")
        }

        if (deleteError?.error) {
            toast.error("Failed to delete car")
        }
    }, [updateCarError, deleteError, carsError])
    const getStatusBadge = (status) => {
        switch (status) {
            case "AVAILABLE":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Available
                    </Badge>
                );
            case "UNAVAILABLE":
                return (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        Unavailable
                    </Badge>
                );
            case "SOLD":
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        Sold
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleDeleteCar = async () => {
        if (!carToDelete) return

        await deleteCarFn(carToDelete.id)
        setDeleteDialogOpen(false)
        setCarToDelete(null)
    }
    const handleSearch = (e) => {
        e.preventDefault()
        fetchCars(search)
    }
    const handleToggleCar = async (car) => {
        await updateCarFN(car.id, { featured: !car.featured })
    }

    const handleStatusUpdate = async (car, newStatus) => {
        await updateCarFN(car.id, { status: newStatus })
    }
    return (

        <div className='space-y-4'>
            <div className='flex flex-col sm:flex-row items-start  sm:items-center justify-between' >
                <Button
                    onClick={() => router.push("/admin/cars/create")}
                    className="flex items-center"
                > <Plus className='w-4 h-4' />ADD</Button>
                <form action="" className=' flex w-full sm:w-auto'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-2.5 top-2.5 h-4 w-4  text-gray-500' />
                        <Input
                            className="pl-9  w-full  sm:w-60 "
                            value={search}
                            onChange={() => setSearch(e.target.value)}
                            type="search"
                            placeholder="Search Cars..."
                        />
                    </div>
                </form>
            </div>


            <Card>
                <CardContent>
                    {
                        loadingCars && !carsData ? (
                            <div className='flex justify-center items-center py-12'>
                                <Loader className="h-8 w-8 animate-spin text-gray-500" />
                            </div>
                        ) : carsData?.success && carsData?.data.length > 0 ? (
                            <div className='overflow-x-auto'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"></TableHead>
                                            <TableHead>Make & Model</TableHead>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Featured</TableHead>
                                            <TableHead className={"text-right"}>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {carsData?.data.map((car, index) => {
                                            return <TableRow key={car.id}>
                                                <TableCell className={"h-10 w-10 rounded-e-md overflow-hidden"}>
                                                    {car?.images && car?.images.length > 0 ?
                                                        <Image src={car.images[0]} height={40} width={40} alt={`${car.make}-${car.model}`} className='w-full h-full object-cover' priority />
                                                        :
                                                        <div className='w-full h-full flex items-center justify-center bg-gray-200'>
                                                            <CarIcon className='h-4 w-4 text-gray-400' />
                                                        </div>
                                                    }
                                                </TableCell>
                                                <TableCell className={"font-medium"}>
                                                    {car?.Make}   {car?.model}
                                                </TableCell>
                                                <TableCell>{car.year}</TableCell>
                                                <TableCell>{formatCurrency(car.price)}</TableCell>
                                                <TableCell>{getStatusBadge(car.status)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size={"sm"}
                                                        className={"p-0 h-9 w-9"}
                                                        onClick={() => handleToggleCar(car)}
                                                        disabled={updatingCars}
                                                    >
                                                        {car.featured ?
                                                            (<>
                                                                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                                            </>) : (<>
                                                                <StarOff className='h-5 w-5 text=gray-400' />
                                                            </>)
                                                        }

                                                    </Button>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                className={"h-8 w-8 p-0"}
                                                                variant={"ghost"}
                                                                size={"sm"}
                                                            >
                                                                <MoreHorizontal />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => router.push(`/cars/${car.id}`)}
                                                            >
                                                                <Eye className='h-8 w-8 mr-2' />
                                                                View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    handleStatusUpdate(car, "AVAILABLE")
                                                                }}
                                                                disabled={car?.status == "AVAILABLE" || updatingCars}
                                                            >Set Available</DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    handleStatusUpdate(car, "UNAVAILABLE")
                                                                }}
                                                                disabled={car?.status == "UNAVAILABLE" || updatingCars}
                                                            >Set Unavailable</DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    handleStatusUpdate(car, "SOLD")
                                                                }}
                                                                disabled={car?.status == "SOLD" || updatingCars}
                                                            >Mark As Sold</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className={"text-red-500 flex items-center"}
                                                                onClick={() => {
                                                                    setCarToDelete(car)
                                                                    setDeleteDialogOpen(true)
                                                                }}
                                                            >
                                                                <Trash2 className='mr-2 h-4 w-4 text-red-500' />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                </TableCell>
                                            </TableRow>
                                        })}
                                    </TableBody>
                                </Table>

                            </div>
                        ) : <>
                        </>


                    }
                </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure want to delete {carToDelete?.make}{" "} {carToDelete?.model}
                            {carToDelete?.year} ? This can be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deletingCar}
                        >Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteCar}
                            disabled={deletingCar}
                        >
                            {deletingCar ? (
                                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            ) : (
                                "Delete Car"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default CarList