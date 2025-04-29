import React from 'react'
import CarList from './_component/car-list'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export const metadata = {
    title: "Cars | vehi",
    description: "Manage Cars in your marketplace"
}
function CarPage() {
    return (
        <div className='p-6'>
            <h1 className=' text-2xl font-bold  mb-6'>Car Management</h1>
            <CarList />

        
        </div>
    )
}

export default CarPage