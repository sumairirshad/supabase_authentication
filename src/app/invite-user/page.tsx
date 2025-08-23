'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { PostgrestError } from '@supabase/supabase-js'

type UserRoleRow = {
  email: string
  status: string
  roles?: { type: string } | { type: string }[] | null
}

export default function UserManagement() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [roleId, setRoleId] = useState('1')
  const [users, setUsers] = useState<{ email: string; type: string[]; status: string }[]>([])
  const [showModal, setShowModal] = useState(false)

    useEffect(() => {
    const fetchUsers = async () => {
        const {
        data: { user: currentUser },
        } = await supabase.auth.getUser()

        const { data, error } = await supabase
        .from('user_roles')
        .select(`
            email,
            status,
            roles (type)
        `) as { data: UserRoleRow[]; error: PostgrestError | null }

        if (error) {
            console.error('Error loading users:', error.message)
            return
        }

        const usersFromDB =
        data?.map((row) => {
            const roles = row.roles
            let types: string[] = ['Unknown']

            if (Array.isArray(roles)) {
            types = roles.map(role => role.type)
            } else if (roles && typeof roles === 'object' && 'type' in roles) {
            types = [(roles as { type: string }).type]
            }

            return {
            email: row.email,
            type: types,
            status: row.status || 'pending',
            }
        }) || []

        if (currentUser?.email) {
        const alreadyExists = usersFromDB.some(
            (u) => u.email === currentUser.email
        )

            if (!alreadyExists) {
                usersFromDB.unshift({
                email: currentUser.email,
                type: ['Admin'],
                status: 'confirmed',
                })
            }
        }

        setUsers(usersFromDB)
    }

    fetchUsers()
    }, [])

  const handleInvite = async () => {
    setStatus('Sending...')
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, roleId }),
    })

    const data = await res.json()
    if (res.ok) {
      setStatus('✅ Invitation sent to ' + email)
      setUsers([...users, { email, type: [getRoleName(roleId)], status: 'pending' }])
      setEmail('')
      setShowModal(false)
    } else {
        console.log(data.error)
      setStatus('❌ ' + data.error)
    }
  }

  const getRoleName = (id: string) => {
    switch (id) {
      case '1': return 'Admin'
      case '2': return 'Editor'
      case '3': return 'Viewer'
      default: return 'Unknown'
    }
  }

   return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 flex justify-center items-start p-8">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-extrabold">Users</h1>
              <button
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                onClick={() => setShowModal(true)}
              >
                Invite User
              </button>
            </div>

            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative">
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>

                  <label className="block mb-1 text-sm font-semibold">Email</label>
                  <input
                    type="email"
                    className="w-full p-3 mb-4 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <label className="block mb-1 text-sm font-semibold">Role</label>
                  <select id='roleid' title='role'
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded"
                  >
                    <option value="1">Admin</option>
                    <option value="2">Editor</option>
                    <option value="3">Viewer</option>
                  </select>

                  <button
                    onClick={handleInvite}
                    className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Send Invite
                  </button>

                  {status && <p className="mt-2 text-sm text-gray-300">{status}</p>}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Invited Users</h2>
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-gray-800 text-gray-300">
                    <th className="p-3 border-b border-gray-700">#</th>
                    <th className="p-3 border-b border-gray-700">User</th>
                    <th className="p-3 border-b border-gray-700">Role</th>
                    <th className="p-3 border-b border-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={i} className="hover:bg-gray-800">
                      <td className="p-3 border-b border-gray-700">{i + 1}</td>
                      <td className="p-3 border-b border-gray-700">{user.email}</td>
                      <td className="p-3 border-b border-gray-700">{user.type}</td>
                      <td className="p-3 border-b border-gray-700">  
                        <span className={`text-xs font-semibold px-3 py-1 rounded-md 
                          ${user.status === 'confirmed' ? 'bg-blue-600 text-white' : ''}
                          ${user.status === 'pending' ? 'bg-yellow-500 text-black' : ''}
                        `}>
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No users invited yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
