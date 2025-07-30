'use client'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-gray-800 rounded-lg shadow-md p-5">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p className="text-3xl font-bold">1,204</p>
          <p className="text-sm text-gray-400 mt-1">+4.8% from last week</p>
        </div>

        {/* Card 2 */}
        <div className="bg-gray-800 rounded-lg shadow-md p-5">
          <h2 className="text-xl font-semibold mb-2">Revenue</h2>
          <p className="text-3xl font-bold">$8,340</p>
          <p className="text-sm text-gray-400 mt-1">+7.1% this month</p>
        </div>

        {/* Card 3 */}
        <div className="bg-gray-800 rounded-lg shadow-md p-5">
          <h2 className="text-xl font-semibold mb-2">Active Sessions</h2>
          <p className="text-3xl font-bold">321</p>
          <p className="text-sm text-gray-400 mt-1">Real-time</p>
        </div>
      </div>
    </div>
  )
}
