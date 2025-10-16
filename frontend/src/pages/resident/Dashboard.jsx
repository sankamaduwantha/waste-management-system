import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendar, FaRecycle, FaTrophy, FaCoins, FaPlus, FaTrash, FaFileDownload, FaFilePdf, FaCalendarAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import PlasticSuggestionsWidget from '../../components/dashboard/PlasticSuggestionsWidget'
import WasteCircularChart from '../../components/waste-entry/WasteCircularChart'
import WasteEntryForm from '../../components/waste-entry/WasteEntryForm'
import useWasteEntryStore from '../../store/wasteEntryStore'
import useAuthStore from '../../store/authStore'

const ResidentDashboard = () => {
  const navigate = useNavigate()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const { statistics, fetchStatistics, fetchChartData } = useWasteEntryStore()
  const { user } = useAuthStore()

  // Fetch statistics on component mount
  useEffect(() => {
    console.log('🏠 Dashboard mounted, fetching initial data...')
    const loadData = async () => {
      await fetchStatistics(30)
      await fetchChartData(30)
      console.log('📊 Statistics loaded:', statistics)
    }
    loadData()
  }, [fetchStatistics, fetchChartData])

  // Log statistics whenever they change
  useEffect(() => {
    console.log('📊 Statistics updated:', statistics)
  }, [statistics])

  // Calculate derived statistics - with safe defaults
  const totalWaste = statistics?.totalWaste || 0
  const recyclingRate = statistics?.recyclingRate || 0
  const breakdown = statistics?.breakdown || { general: 0, recyclable: 0, organic: 0, hazardous: 0 }
  const entryCount = statistics?.entryCount || 0
  const averagePerDay = statistics?.averagePerDay || 0
  
  console.log('💡 Dashboard render with:', { totalWaste, recyclingRate, breakdown, entryCount, averagePerDay })
  
  // Calculate points based on recycling and waste reduction
  const calculatePoints = () => {
    const recyclePoints = Math.round((breakdown.recyclable + breakdown.organic) * 10)
    const consistencyBonus = entryCount * 5
    const points = recyclePoints + consistencyBonus
    console.log('🏆 Points calculated:', { recyclePoints, consistencyBonus, total: points })
    return points
  }

  // Calculate level based on points
  const calculateLevel = () => {
    const points = calculatePoints()
    const level = Math.floor(points / 250) + 1
    console.log('📊 Level calculated:', { points, level })
    return level
  }

  // Calculate environmental impact
  const calculateCO2Saved = () => {
    // Assume recycling 1kg saves ~2kg CO2
    const co2 = ((breakdown.recyclable + breakdown.organic) * 2).toFixed(0)
    console.log('🌍 CO2 calculated:', co2)
    return co2
  }

  const calculateTreesEquivalent = () => {
    // Assume 1 tree absorbs ~21kg CO2 per year
    const co2Saved = parseFloat(calculateCO2Saved())
    const trees = Math.round(co2Saved / 21)
    console.log('🌳 Trees calculated:', trees)
    return trees
  }

  // Report Generation Functions
  const generateCSVReport = () => {
    try {
      setIsGeneratingReport(true)
      console.log('📄 Generating CSV report...')

      // Prepare report data
      const reportDate = new Date().toLocaleDateString()
      const userName = user?.name || 'Resident'
      
      // CSV Header
      let csvContent = "Waste Management Report\n"
      csvContent += `Generated Date:,${reportDate}\n`
      csvContent += `Resident Name:,${userName}\n`
      csvContent += `Report Period:,Last 30 Days\n`
      csvContent += "\n"
      
      // Summary Statistics
      csvContent += "SUMMARY STATISTICS\n"
      csvContent += "Metric,Value\n"
      csvContent += `Total Entries,${entryCount}\n`
      csvContent += `Total Waste,${totalWaste.toFixed(2)} kg\n`
      csvContent += `Daily Average,${averagePerDay.toFixed(2)} kg\n`
      csvContent += `Recycling Rate,${recyclingRate.toFixed(1)}%\n`
      csvContent += `Points Earned,${calculatePoints()}\n`
      csvContent += `Current Level,${calculateLevel()}\n`
      csvContent += "\n"
      
      // Waste Breakdown
      csvContent += "WASTE BREAKDOWN BY CATEGORY\n"
      csvContent += "Category,Amount (kg),Percentage\n"
      csvContent += `General Waste,${breakdown.general.toFixed(2)},${totalWaste > 0 ? ((breakdown.general / totalWaste) * 100).toFixed(1) : 0}%\n`
      csvContent += `Recyclable,${breakdown.recyclable.toFixed(2)},${totalWaste > 0 ? ((breakdown.recyclable / totalWaste) * 100).toFixed(1) : 0}%\n`
      csvContent += `Organic,${breakdown.organic.toFixed(2)},${totalWaste > 0 ? ((breakdown.organic / totalWaste) * 100).toFixed(1) : 0}%\n`
      csvContent += `Hazardous,${breakdown.hazardous.toFixed(2)},${totalWaste > 0 ? ((breakdown.hazardous / totalWaste) * 100).toFixed(1) : 0}%\n`
      csvContent += "\n"
      
      // Environmental Impact
      csvContent += "ENVIRONMENTAL IMPACT\n"
      csvContent += "Metric,Value\n"
      csvContent += `Waste Recycled,${(breakdown.recyclable + breakdown.organic).toFixed(2)} kg\n`
      csvContent += `CO2 Saved,${calculateCO2Saved()} kg\n`
      csvContent += `Trees Equivalent,${calculateTreesEquivalent()}\n`
      csvContent += "\n"
      
      // Performance Analysis
      csvContent += "PERFORMANCE ANALYSIS\n"
      csvContent += "Category,Status\n"
      csvContent += `Recycling Performance,${recyclingRate > 50 ? 'Excellent' : recyclingRate > 30 ? 'Good' : recyclingRate > 0 ? 'Needs Improvement' : 'Not Started'}\n`
      csvContent += `Consistency,${entryCount > 20 ? 'Excellent' : entryCount > 10 ? 'Good' : entryCount > 0 ? 'Fair' : 'No Data'}\n`
      csvContent += `Environmental Impact,${calculateTreesEquivalent() > 5 ? 'High' : calculateTreesEquivalent() > 2 ? 'Moderate' : 'Low'}\n`
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `waste_report_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('CSV report downloaded successfully!')
      console.log('✅ CSV report generated and downloaded')
    } catch (error) {
      console.error('❌ Error generating CSV report:', error)
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const generateHTMLReport = () => {
    try {
      setIsGeneratingReport(true)
      console.log('📄 Generating HTML report...')

      const reportDate = new Date().toLocaleDateString()
      const userName = user?.name || 'Resident'
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Waste Management Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 {
            color: #333;
            margin: 0;
        }
        .meta {
            color: #666;
            margin-top: 10px;
        }
        .section {
            margin-bottom: 30px;
        }
        h2 {
            color: #667eea;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        .stat-value {
            color: #333;
            font-size: 1.5em;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f9fafb;
            color: #667eea;
            font-weight: 600;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .badge-excellent {
            background: #d1fae5;
            color: #065f46;
        }
        .badge-good {
            background: #dbeafe;
            color: #1e40af;
        }
        .badge-fair {
            background: #fef3c7;
            color: #92400e;
        }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌱 Waste Management Report</h1>
            <div class="meta">
                <p><strong>Resident:</strong> ${userName}</p>
                <p><strong>Generated:</strong> ${reportDate}</p>
                <p><strong>Period:</strong> Last 30 Days</p>
            </div>
        </div>

        <div class="section">
            <h2>📊 Summary Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Entries</div>
                    <div class="stat-value">${entryCount}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Waste</div>
                    <div class="stat-value">${totalWaste.toFixed(2)} kg</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Daily Average</div>
                    <div class="stat-value">${averagePerDay.toFixed(2)} kg</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Recycling Rate</div>
                    <div class="stat-value">${recyclingRate.toFixed(1)}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Points Earned</div>
                    <div class="stat-value">${calculatePoints()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Current Level</div>
                    <div class="stat-value">${calculateLevel()}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🗑️ Waste Breakdown</h2>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount (kg)</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>General Waste</td>
                        <td>${breakdown.general.toFixed(2)}</td>
                        <td>${totalWaste > 0 ? ((breakdown.general / totalWaste) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                        <td>Recyclable</td>
                        <td>${breakdown.recyclable.toFixed(2)}</td>
                        <td>${totalWaste > 0 ? ((breakdown.recyclable / totalWaste) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                        <td>Organic</td>
                        <td>${breakdown.organic.toFixed(2)}</td>
                        <td>${totalWaste > 0 ? ((breakdown.organic / totalWaste) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                        <td>Hazardous</td>
                        <td>${breakdown.hazardous.toFixed(2)}</td>
                        <td>${totalWaste > 0 ? ((breakdown.hazardous / totalWaste) * 100).toFixed(1) : 0}%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🌍 Environmental Impact</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Waste Recycled</div>
                    <div class="stat-value">${(breakdown.recyclable + breakdown.organic).toFixed(2)} kg</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">CO₂ Saved</div>
                    <div class="stat-value">${calculateCO2Saved()} kg</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Trees Equivalent</div>
                    <div class="stat-value">${calculateTreesEquivalent()}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>⭐ Performance Analysis</h2>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Recycling Performance</td>
                        <td>
                            <span class="badge ${recyclingRate > 50 ? 'badge-excellent' : recyclingRate > 30 ? 'badge-good' : 'badge-fair'}">
                                ${recyclingRate > 50 ? 'Excellent' : recyclingRate > 30 ? 'Good' : recyclingRate > 0 ? 'Needs Improvement' : 'Not Started'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>Consistency</td>
                        <td>
                            <span class="badge ${entryCount > 20 ? 'badge-excellent' : entryCount > 10 ? 'badge-good' : 'badge-fair'}">
                                ${entryCount > 20 ? 'Excellent' : entryCount > 10 ? 'Good' : entryCount > 0 ? 'Fair' : 'No Data'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>Environmental Impact</td>
                        <td>
                            <span class="badge ${calculateTreesEquivalent() > 5 ? 'badge-excellent' : calculateTreesEquivalent() > 2 ? 'badge-good' : 'badge-fair'}">
                                ${calculateTreesEquivalent() > 5 ? 'High' : calculateTreesEquivalent() > 2 ? 'Moderate' : 'Low'}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Generated by Urban Waste Management System</p>
            <p>Keep tracking to improve your environmental impact! 🌱</p>
        </div>
    </div>

    <script>
        // Auto-print on load (optional)
        // window.onload = () => window.print();
    </script>
</body>
</html>
      `

      // Create and download file
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `waste_report_${new Date().toISOString().split('T')[0]}.html`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('HTML report downloaded successfully!')
      console.log('✅ HTML report generated and downloaded')
    } catch (error) {
      console.error('❌ Error generating HTML report:', error)
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const printReport = () => {
    generateHTMLReport()
    setTimeout(() => {
      toast.info('Report downloaded. Open the file and use your browser\'s print function.')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Resident Dashboard</h1>

      {/* Debug Info - Remove after testing */}
      {totalWaste === 0 && entryCount === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ℹ️ <strong>No waste data yet.</strong> Add your first waste entry to see statistics!
          </p>
        </div>
      )}

      {/* Stats Cards - Now using real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <FaCalendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{entryCount}</p>
              <p className="text-xs text-gray-500">Last 30 days</p>
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
              <p className="text-2xl font-bold text-gray-900">{recyclingRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">
                {recyclingRate > 50 ? '🌟 Excellent!' : recyclingRate > 30 ? '👍 Good' : recyclingRate > 0 ? '📈 Keep going!' : 'Start recycling!'}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">{calculatePoints().toLocaleString()}</p>
              <p className="text-xs text-gray-500">From recycling</p>
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
              <p className="text-2xl font-bold text-gray-900">{calculateLevel()}</p>
              <p className="text-xs text-gray-500">Eco Warrior</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Button - Quick Access */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <FaCalendarAlt className="mr-2 text-green-600" />
              Waste Collection Appointments
            </h2>
            <p className="text-sm text-gray-600">
              Schedule waste collection appointments for your location
            </p>
          </div>
          <button
            onClick={() => navigate('/resident/appointments')}
            className="btn btn-primary flex items-center px-6 py-3 text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <FaCalendarAlt className="mr-2" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Collection Schedule - Enhanced with statistics */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Waste Collection Insights</h2>
        <p className="text-sm text-gray-600 mb-4">Track your waste by category and prepare for collection</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-500 mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">General Waste</p>
                <p className="text-sm text-gray-600">
                  {breakdown.general > 0 
                    ? `${breakdown.general.toFixed(1)} kg recorded (Last 30 days)`
                    : 'No data yet - Add entries to track'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-700">
                {totalWaste > 0 ? `${(breakdown.general / totalWaste * 100).toFixed(0)}%` : '0%'}
              </p>
              <p className="text-xs text-gray-500">of total</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">Recyclables</p>
                <p className="text-sm text-gray-600">
                  {breakdown.recyclable > 0 
                    ? `${breakdown.recyclable.toFixed(1)} kg recorded (Last 30 days)`
                    : 'Start recycling to see impact'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-700">
                {totalWaste > 0 ? `${(breakdown.recyclable / totalWaste * 100).toFixed(0)}%` : '0%'}
              </p>
              <p className="text-xs text-gray-500">of total</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-600 mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">Organic Waste</p>
                <p className="text-sm text-gray-600">
                  {breakdown.organic > 0 
                    ? `${breakdown.organic.toFixed(1)} kg recorded (Last 30 days)`
                    : 'Track organic waste for composting'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-yellow-700">
                {totalWaste > 0 ? `${(breakdown.organic / totalWaste * 100).toFixed(0)}%` : '0%'}
              </p>
              <p className="text-xs text-gray-500">of total</p>
            </div>
          </div>

          {breakdown.hazardous > 0 && (
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">Hazardous Waste</p>
                  <p className="text-sm text-gray-600">
                    {breakdown.hazardous.toFixed(1)} kg recorded - Requires special disposal
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-700">
                  {totalWaste > 0 ? `${(breakdown.hazardous / totalWaste * 100).toFixed(0)}%` : '0%'}
                </p>
                <p className="text-xs text-gray-500">of total</p>
              </div>
            </div>
          )}
        </div>

        {entryCount === 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Start tracking your daily waste to see detailed collection insights and earn rewards!
            </p>
          </div>
        )}
      </div>

      {/* Environmental Impact - Now using real data */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Environmental Impact</h2>
        <p className="text-sm text-gray-600 mb-4">Based on your waste tracking data (Last 30 days)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-3xl font-bold text-green-700">
              {(breakdown.recyclable + breakdown.organic).toFixed(1)} kg
            </p>
            <p className="text-sm text-gray-700 font-medium mt-1">Waste Recycled</p>
            <p className="text-xs text-gray-600 mt-1">
              {totalWaste > 0 ? `${((breakdown.recyclable + breakdown.organic) / totalWaste * 100).toFixed(0)}% of total` : 'Start tracking!'}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-3xl font-bold text-blue-700">{calculateCO2Saved()} kg</p>
            <p className="text-sm text-gray-700 font-medium mt-1">CO₂ Saved</p>
            <p className="text-xs text-gray-600 mt-1">Estimated carbon offset</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
            <p className="text-3xl font-bold text-teal-700">{calculateTreesEquivalent()}</p>
            <p className="text-sm text-gray-700 font-medium mt-1">Trees Equivalent</p>
            <p className="text-xs text-gray-600 mt-1">Annual CO₂ absorption</p>
          </div>
        </div>
        
        {/* Waste Breakdown Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Waste Category Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-600">{breakdown.general.toFixed(1)} kg</p>
              <p className="text-xs text-gray-600">General</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{breakdown.recyclable.toFixed(1)} kg</p>
              <p className="text-xs text-gray-600">Recyclable</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-600">{breakdown.organic.toFixed(1)} kg</p>
              <p className="text-xs text-gray-600">Organic</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">{breakdown.hazardous.toFixed(1)} kg</p>
              <p className="text-xs text-gray-600">Hazardous</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plastic Reduction Suggestions Widget */}
      <PlasticSuggestionsWidget />

      {/* Report Generator Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaFileDownload className="text-green-600" />
              Download Reports
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Export your waste tracking data and environmental impact reports
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CSV Report Button */}
          <button
            onClick={generateCSVReport}
            disabled={isGeneratingReport}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border-2 border-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="p-4 bg-blue-500 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <FaFileDownload className="text-white text-2xl" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">CSV Report</h3>
            <p className="text-xs text-gray-600 text-center">
              Download data in spreadsheet format
            </p>
          </button>

          {/* HTML Report Button */}
          <button
            onClick={generateHTMLReport}
            disabled={isGeneratingReport}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border-2 border-purple-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="p-4 bg-purple-500 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <FaFilePdf className="text-white text-2xl" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">HTML Report</h3>
            <p className="text-xs text-gray-600 text-center">
              Download styled report for viewing
            </p>
          </button>

          {/* Print Report Button */}
          <button
            onClick={printReport}
            disabled={isGeneratingReport}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border-2 border-green-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="p-4 bg-green-500 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <FaFilePdf className="text-white text-2xl" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Print Report</h3>
            <p className="text-xs text-gray-600 text-center">
              Generate printable HTML report
            </p>
          </button>
        </div>

        {isGeneratingReport && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">Generating your report...</span>
          </div>
        )}
      </div>

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
