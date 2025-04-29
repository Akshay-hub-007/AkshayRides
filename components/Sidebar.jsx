"use client"
import { cn } from '@/lib/utils';
import { Calendar, Car, Cog, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const routes = [
  {
    label: 'DashBoard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: 'Cars',
    icon: Car,
    href: '/admin/cars',
  },
  {
    label: 'Test Drives',
    icon: Calendar,
    href: '/admin/test-drive',
  },
  {
    label: 'Settings',
    icon: Cog,
    href: '/admin/settings',
  },
];

function Sidebar() {

    const pathname=usePathname()
  return (
   <>
     <div className='hidden md:flex flex-col h-full overflow-auto shadow-sm border-r bg-white'>
      {routes.map((route, index) => (
        <Link href={route.href} key={index}
        className={cn(" flex items-center gap-x-2 h-12 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-100/50 ",
            pathname===route.href?"text-blue-600 bg-blue-100/50 hover:text-blue-700 hover:bg-blue-100":""
        )}
        >
          <route.icon className="w-5 h-5" />
          {route.label}
        </Link>
      ))}
    </div>
    <div className='md:hidden fixed bottom-0 right-0 left-0   bg-white border-t flex justify-around items-center h-16'>
    {routes.map((route, index) => (
        <Link href={route.href} key={index}
        className={cn(" flex items-center gap-x-2 h-12 text-slate-500 text-xm font-medium transition-all flex-1 py-1",
            pathname===route.href?"text-blue-600 bg-blue-100/50 hover:text-blue-700 hover:bg-blue-100":""
        )}
        >
          <route.icon className="w-5 h-5" />
          {route.label}
        </Link>
      ))}
    </div>
   </>
  );
}

export default Sidebar;
