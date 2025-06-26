"use client"
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Car } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
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

  const isDayDisabled = (day) => {
    // Disable past dates
    if (day < new Date()) {
      return true;
    }

    // Get day of week
    const dayOfWeek = format(day, "EEEE").toUpperCase();

    // Find working hours for the day
    const daySchedule = dealership?.workingHours?.find(
      (schedule) => schedule.dayOfWeek === dayOfWeek
    );

    // Disable if dealership is closed on this day
    return !daySchedule || !daySchedule.isOpen;
  };

  const onSubmit = () => {

  }
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
      <div>
        <Card>
          <CardContent>
            <h2 className='text-xl font-bold mb-4'>Car Details</h2>
            <div className='aspect-video rounded-lg overflow-hidden relative mb-4'>
              {
                car?.images && car?.images.length > 0 ? (
                  <img src={car.images[0]} alt="car-image" className='w-full h-full object-cover' />
                ) : (
                  <>
                    <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                      <Car className='h-12 w-12  text-gray-400' />
                    </div>
                  </>
                )
              }
            </div>

            <h3 className='text-lg font-bold'>
              {car.year} {car.make}
            </h3>

            <div className='mt-2text-xl font-bold text-blue-600'>
              ₹ {car.price}
            </div>
            <div className="mt-2 text-xl font-bold text-blue-600">
              ${car.price.toLocaleString()}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <div className="flex justify-between py-1 border-b">
                <span>Mileage</span>
                <span className="font-medium">
                  {car.mileage.toLocaleString()} miles
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Fuel Type</span>
                <span className="font-medium">{car.fuelType}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Transmission</span>
                <span className="font-medium">{car.transmission}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Body Type</span>
                <span className="font-medium">{car.bodyType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Color</span>
                <span className="font-medium">{car.color}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Dealership Info</h2>
            <div className="text-sm">
              <p className="font-medium">
                {dealership?.name || "Vehiql Motors"}
              </p>
              <p className="text-gray-600 mt-1">
                {dealership?.address || "Address not available"}
              </p>
              <p className="text-gray-600 mt-3">
                <span className="font-medium">Phone:</span>{" "}
                {dealership?.phone || "Not available"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span>{" "}
                {dealership?.email || "Not available"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>


      <div className='md:col-span-1'>
        <Card>
          <CardContent>
            <h2>Schedule a test drive</h2>
            <form onSubmit={handleSubmit(onSubmit)} classname="spcace-y-6">
              <div className='space-y-2'>

              </div>  <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Select a Date
                </label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isDayDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && (
                        <p className="text-sm font-medium text-red-500 mt-1">
                          {errors.date.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
              <div>

              </div>

            </form>
          </CardContent>
        </Card>
      </div>  
    </div>
  )
}

export default TestDriveForm
