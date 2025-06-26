"use client"
import { Card, CardContent } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod'


const testDriveSchema = z.object({
  date: z.date({
    required_error: "Please select a date for your test drive",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot"
  }),
  notes: z.string().optional()
})

function TestDriveForm({ car, testDriveInfo }) {

  console.log(car)
  const router = useRouter();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(testDriveSchema),
    defaultValues: {
      date: undefined,
      timeSlot: undefined,
      notes: "",
    },
  });


  const dealership = testDriveInfo?.dealership
  const existingBookings = testDriveInfo?.existingBooking || []



  const selctedDate = watch("date")

  return (
    <div>
      <div>
        <Card>
          <CardContent>
            <h2 className='text-xl font-bold mb-4'>Car Details</h2>
            <div className='aspect-video rounded-lg overflow-hidden relative mb-4'>
              {
                car?.images && car?.images.length > 0 ? (
                  <img src={car.images[0]} alt="car-image" />
                ) : (
                  <>
                    <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                      <Car className='h-12 w-12  text-gray-400' />
                    </div>
                  </>
                )
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestDriveForm
