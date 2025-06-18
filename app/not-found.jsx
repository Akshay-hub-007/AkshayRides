import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import image from "../public/NotFound.png"
function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[100vh] p-4'>
        <Image src={image}  />
        <h1 className='text-6xl font-bold gradient-title'>404</h1>
        <h2 className='font-bold text-4xl '>Page Not Found</h2>
        <p className='font-bold text-2xl text-gray-600 mb-8'>Page Not Found return to Home Bage</p>
        <Link href="/" >
        <Button className={"cursor-pointer"}>Home</Button>
        </Link>
    </div>
  )
}

export default NotFound