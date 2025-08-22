'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../lib/utils' 
export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Users', href: '/invite-user', icon: '👥' },
  ]

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white shadow-2xl">
      <div className="p-6 text-sm font-bold border-b border-gray-700">
         <div className="flex items-center">
            <h5 className="text-1xl font-semibold">
                Supabase Authentication
            </h5>
         </div>
      </div>
      <nav className="flex flex-col p-4 gap-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all',
              pathname === link.href
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            <span>{link.icon}</span>
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
