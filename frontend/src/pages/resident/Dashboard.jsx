import { useState, useEffect } from 'react'
import { FaCalendar, FaRecycle, FaTrophy, FaCoins, FaPlus, FaTrash } from 'react-icons/fa'
import PlasticSuggestionsWidget from '../../components/dashboard/PlasticSuggestionsWidget'
import WasteCircularChart from '../../components/waste-entry/WasteCircularChart'
import WasteEntryForm from '../../components/waste-entry/WasteEntryForm'
import useWasteEntryStore from '../../store/wasteEntryStore'

const ResidentDashboard = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { statistics, fetchStatistics, fetchChartData } = useWasteEntryStore()

  // Fetch statistics on component mount
  useEffect(() => {
    console.log('🏠 Dashboard mounted, fetching initial data...')
    fetchStatistics(30)
    fetchChartData(30)
  }, [fetchStatistics, fetchChartData])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Resident Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <FaCalendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Next Collection</p>
              <p className="text-2xl font-bold text-gray-900">Tomorrow</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaRecycle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recycling Rate</p>
              <p className="text-2xl font-bold text-gray-900">68%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaTrophy className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Points</p>
              <p className="text-2xl font-bold text-gray-900">1,250</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaCoins className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Level</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Schedule */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Collections</h2>
        <div className="space-y-3">
          {[
            { type: 'General Waste', date: 'Tomorrow, 8:00 AM', color: 'bg-gray-500' },
            { type: 'Recyclables', date: 'Thu, Dec 21, 8:00 AM', color: 'bg-green-500' },
            { type: 'Organic Waste', date: 'Fri, Dec 22, 8:00 AM', color: 'bg-yellow-600' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                <div>
                  <p className="font-medium text-gray-900">{item.type}</p>
                  <p className="text-sm text-gray-600">{item.date}</p>
                </div>
              </div>
              <button className="btn-secondary text-sm">Remind Me</button>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Environmental Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">125 kg</p>
            <p className="text-sm text-gray-600">Waste Recycled</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">250 kg</p>
            <p className="text-sm text-gray-600">CO2 Saved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">15</p>
            <p className="text-sm text-gray-600">Trees Equivalent</p>
          </div>
        </div>
      </div>

      {/* Plastic Reduction Suggestions Widget */}
      <PlasticSuggestionsWidget />

      {/* Waste Tracking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Breakdown Chart */}
        <WasteCircularChart days={30} chartType="donut" />

        {/* Quick Actions Card */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Waste Tracking</h2>
          
          {/* Add Entry Button */}
          <button 
            onClick={() => setIsFormOpen(true)}
            className="btn-primary w-full mb-4 flex items-center justify-center gap-2"
          >
            <FaPlus />
            Add Today's Waste Entry
          </button>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Waste (30 days)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics?.totalWaste?.toFixed(2) || '0.00'} kg
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-100">
                  <FaTrash className="text-gray-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Recycling Rate</p>
                  <p className="text-2xl font-bold text-green-900">
                    {statistics?.recyclingRate?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <FaRecycle className="text-green-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Daily Average</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {statistics?.averagePerDay?.toFixed(2) || '0.00'} kg
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100">
                  <FaCalendar className="text-yellow-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Track your daily waste to monitor your environmental impact and earn rewards!
            </p>
          </div>
        </div>
      </div>

      {/* Waste Entry Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <WasteEntryForm 
              onClose={() => setIsFormOpen(false)}
              onSuccess={() => {
                console.log('✅ Waste entry saved, closing form and refreshing data...')
                setIsFormOpen(false)
                // Note: Store already refreshes data, but we call again as backup
                fetchStatistics(30)
                fetchChartData(30)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ResidentDashboard
