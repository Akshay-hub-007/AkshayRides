import { chatbot } from '@/actions/chatbot'
import { getFeaturedCars } from '@/actions/home'
import CarCard from '@/components/CarCard'
import HomeSearch from '@/components/home-search'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { bodyTypes, carMakes, faqItems } from '@/lib/data'
import { SignedOut } from '@clerk/nextjs'
import { Calendar, Car, CarIcon, ChevronRight, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

async function page() {
   chatbot()
  const featuredCars=await getFeaturedCars()
  return (
    <div className='flex flex-col pt-20'>
      <section className='relative py-16 md:py-28 dotted-background'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='mb-8'>
            <h1 className='text-5xl md:text-8xl mb-4 gradient-title'>Find your Dream Car</h1>
            <p className='text-xl text-gray-500 mb-8 max-w-2xl mx-auto'>
              Advance AI Car Search and testDrive from thousand ofvehicles
            </p>
          </div>

          {/* {search} */}
          <HomeSearch />
        </div>
      </section>

      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center mb-8'>
            <h2 className='text-2xl font-bold'>Featuered Cars</h2>
            <Button varint="ghost" className={"flex items-center"}>
              <Link href="/cars" />
              View All <ChevronRight className='ml-1 h-4 w-4' /></Button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {featuredCars.map((car) => {
              return <CarCard key={car.id} car={car} />
            })}

          </div>
        </div>
      </section>


      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center mb-8'>
            <h2 className='text-2xl font-bold'>Browse by Make</h2>
            <Button varint="ghost" className={"flex items-center"}>
              <Link href="/cars" />
              View All <ChevronRight className='ml-1 h-4 w-4' /></Button>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {carMakes.map((car) => {

              return <Link key={car.id}
                href={`/car/make=${car.name}`}
                className='bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition cursor-pointer'
              >
                <div className='h-16 w-auto mx-auto mb-2 relative'>
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    style={{ objectFit: "contain" }}
                  />

                </div>
                <h3 className='font-medium'>{car.name}</h3>
              </Link>
            })}

          </div>
        </div>
      </section>

      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <h2 className='text-2xl font-bold  text-center mb-12'>Why Choose Our Platform</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                {" "}
                <Car className='w-8 h-8' />
              </div>

              <h3 className='text-xl font-bold mb-2'>Wide Selection</h3>
              <p className='text-gray-600'>
                Thousands of Verified vehicles from trusted dealership and private sellers
              </p>
            </div>

            <div className='text-center'>
              <div className='bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                {" "}
                <Calendar className='w-8 h-8' />
              </div>

              <h3 className='text-xl font-bold mb-2'>Easy Test Drive</h3>
              <p className='text-gray-600'>
                Book Your test drive online in minutes ,with flexible scheduling options.
              </p>
            </div>
            <div className='text-center'>
              <div className='bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                {" "}
                <Shield className='w-8 h-8' />
              </div>

              <h3 className='text-xl font-bold mb-2'>Secure Process</h3>
              <p className='text-gray-600'>
                Verified listing and secure booking process for peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center mb-8'>
            <h2 className='text-2xl font-bold'>Browse by Make</h2>
            <Button varint="ghost" className={"flex items-center"}>
              <Link href="/cars" />
              View All <ChevronRight className='ml-1 h-4 w-4' /></Button>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {bodyTypes.map((type) => {

              return <Link key={type.id}
                href={`/cars?bodyType=${type.name}`}
                className='relative group cursor-pointer'
              >
                <div className='overflow-hidden rounded-lg flex justify-end h-28 mb-4 relative'>
                  <Image
                    src={type.image}
                    alt={type.name}
                    fill
                    className='object-cover group-hover:scale-105 transition duration-300'
                    style={{ objectFit: "contain" }}
                  />

                </div>
                <div className='absoulte inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex items-end'>
                  <h3 className='text-white text-xl font-bold pl-4 pb-2'>{type.name}</h3>

                </div>
              </Link>
            })}

          </div>
        </div>
      </section>

      <section className='py-12 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <h2 className='text-2xl font-bold text-center mb-8'>
            Frequently Askes Questions
          </h2>
         {
          faqItems.map((faq,index)=>{
          return   <Accordion type="single" collapsible className="w-full" key={index}>
            <AccordionItem value={`item1${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          })
         }
        </div>
      </section>

      <section className='py-16 dotted-background text-white'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold mb-4'>Ready to Find Your Dream Car?</h2>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Join Thousand of statisfied customers who found their perfect vehocle through our platform
          </p>
          <div className='flex flex-col sm:flex-row justify-center gap-4'>
          <Button size="lg" variant={"secondary"} asChild>
              <Link href="/cars">View All Cars</Link>
            </Button>
          <SignedOut>
          <Button size="lg" variant={"secondary"} asChild>
              <Link href="/sign-up">Sign Up Now</Link>
            </Button>
          </SignedOut>

          </div>
        </div>
      </section>
    </div>
  )
}

export default page