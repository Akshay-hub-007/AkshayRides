import getAdmin from '@/actions/admin'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { notFound } from 'next/navigation'
import React from 'react'

async function AdminLayout({children}) {

    const admin = await getAdmin()
    console.log(admin)
    if (!admin.authroized) {
        return notFound()
    }
    console.log(admin.authroized,"gv")
    return (
        <div className='h-full'>
            <Header isAdminPage={admin} />
            <div className='flex h-full w-58 flex-col fixed top-20 inset-y-0.5 z-50'>
                <Sidebar/>
            </div>
            <main className='md:pl-58 pt-[80px] h-full'>{children}</main>
        </div>
    )
}

export default AdminLayout