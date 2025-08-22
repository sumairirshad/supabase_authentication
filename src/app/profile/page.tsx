'use client'

import { useUser } from '@/app/context/UserContext'
import Image from 'next/image'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function ProfilePage() {
  const { name, avatar, provider, email } = useUser()

 return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <main className="flex-1 flex justify-center items-start p-8">
          <div className="w-full bg-gray-800 rounded-lg p-10 shadow-lg">
            <div className="flex items-center gap-6 mb-8">
              <Image
                src={avatar || '/assets/icons8-user-50.png'}
                alt="User Avatar"
                width={100}
                height={100}
                className="rounded-full border-4 border-gray-700"
              />
              <div>
                <h1 className="text-3xl font-bold mb-1">{name}</h1>
                <p className="text-gray-400">
                  Logged in via <span className="font-semibold capitalize">{provider}</span>
                </p>
              </div>
            </div>

            <div className="bg-gray-700 rounded-md p-6">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Account Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="text-white font-medium">{email}</p>
                </div>
                <div>
                  <p className="text-gray-400">Login Method</p>
                  <p className="text-white font-medium capitalize">{provider}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
