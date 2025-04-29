import { Description } from '@radix-ui/react-dialog'
import React from 'react'
import AddCarForm from '../_component/AddcarForm'


export const metadata = {
    tittle: "Add new Car ! vehql Admin",
    description: "Add a new car to the marketplace"
}
const AddCarPage = () => {
    return (
        <div className='p-6'>
            <div className='text-2xl font-bold mb-6'>
                <h1 className='text-2xl font-bold mb-6'>Add new Car</h1>
              <AddCarForm></AddCarForm>
            </div>
        </div>
    )
}

export default AddCarPage