import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { ArrowLeft, CarFront, Layout } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { checkUser } from '@/lib/checkUser'

async function Header({ isAdminPage = false }) {

  const user = await checkUser()
  const isAdmin = user?.role === "ADMIN"
  console.log(isAdmin)
  return (
    <header className='fixed top-0 w-full  bg-white/80 back z-50 border-b'>
      <nav className='mx-auto px-4 py-4 flex items-center justify-between'>
        <Link href={isAdminPage ? "/admin" : "/"} className='flex items-center gap-2'>
          <Image
            src={"/icon.png"}
            alt="AkshayRides Logo"
            height={48}
            width={48}
            className="h-12 w-12 object-contain"
            draggable={false}
          />
          {isAdminPage && (
            <span className="text-sm text-white font-light">Admin</span>
          )}
        </Link>


        <div className='flex items-center space-x-4'>
          {
            isAdminPage ? (
              <Link href={"/"}>
                <Button variant={"outline"} className={"flex items-center gap-2"}>
                  <ArrowLeft size={18} />
                  <span>Back to App</span>
                </Button>
              </Link>
            ) : (
              <SignedIn>
                <Link
                  href="/saved-cars"
                >
                  <Button>
                    <CarFront size={18} />
                    <span className='hidden md:inline'>Saved Cars</span>
                  </Button>
                </Link>
                {isAdmin ? (
                  <Link
                    href="/reservations"
                  >
                    <Button variant={"outline"}>
                      <Layout size={18} />
                      <span className='hidden md:inline'>Admin Portal</span>
                    </Button>
                  </Link>
                ) :
                  <Link
                    href="/reservations"
                  >
                    <Button variant={"outline"}>
                      <Layout size={18} />
                      <span className='hidden md:inline'>My Reservations</span>
                    </Button>
                  </Link>

                }

              </SignedIn>
            )
          }
          <SignedOut>
            <SignInButton forceRedirectUrl="/">
              <Button variant={"outline"}>Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                }
              }}>

            </UserButton>
          </SignedIn>
        </div>
      </nav>

    </header>
  )
}

export default Header