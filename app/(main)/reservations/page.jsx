

import { getUserTestDrive } from '@/actions/test-drive'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/dist/server/api-utils'
import React from 'react'
import { ReservationsList } from './_components/reservationsList'


export const metadata = {
    title: "My Reservation Page | AkshayCarverse",
    description: "Manage you test drive reservations"
}
const ReservationsPage = async() => {

    const userId = auth()
    if (!userId)
        redirect("/sign-in?redirect=/reservations")

    const reservations =await getUserTestDrive()
    console.log(reservations)

    return (
        <div className='container mx-auto px-4 py-12'>
            {/* <h1 className='text-6xl  mb-6 gradient-title'>Your Reservations</h1> */}
            <ReservationsList    initialData={reservations} />
        </div>
    )
}

export default ReservationsPage
