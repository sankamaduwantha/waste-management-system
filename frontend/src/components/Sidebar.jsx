import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { 
  FaHome, FaCalendar, FaClipboardList, FaCreditCard, FaUser,
  FaTruck, FaRoute, FaTrash, FaTasks, FaUsers, FaMapMarkedAlt,
  FaCog, FaChartLine, FaFileAlt, FaLeaf, FaBars, FaTimes, FaTrophy, FaGift, FaUserTie,
  FaQrcode, FaExclamationTriangle, FaTachometerAlt
} from 'react-icons/fa'
import useAuthStore from '../store/authStore'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigation = {
    resident: [
      { name: 'Dashboard', href: '/resident/dashboard', icon: FaHome },
      { name: 'Schedule', href: '/resident/schedule', icon: FaCalendar },
      { name: 'Service Requests', href: '/resident/requests', icon: FaClipboardList },
      { name: 'Payments', href: '/resident/payments', icon: FaCreditCard },
      { name: 'Performance', href: '/resident/performance', icon: FaChartLine },
      { name: 'Profile', href: '/resident/profile', icon: FaUser },
    ],
    city_manager: [
      { name: 'Dashboard', href: '/city-manager/dashboard', icon: FaHome },
      { name: 'Fleet Management', href: '/city-manager/fleet', icon: FaTruck },
      { name: 'Drivers', href: '/city-manager/drivers', icon: FaUserTie },
      { name: 'Routes', href: '/city-manager/routes', icon: FaRoute },
      { name: 'Bins', href: '/city-manager/bins', icon: FaTrash },
      { name: 'Zones', href: '/city-manager/zones', icon: FaMapMarkedAlt },
      { name: 'Requests', href: '/city-manager/requests', icon: FaTasks },
      { name: 'Profile', href: '/city-manager/profile', icon: FaUser },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: FaHome },
      { name: 'User Management', href: '/admin/users', icon: FaUsers },
      { name: 'Zone Management', href: '/admin/zones', icon: FaMapMarkedAlt },
      { name: 'Zone Assignment', href: '/admin/zone-assignment', icon: FaMapMarkedAlt },
      { name: 'Appointments', href: '/admin/appointments', icon: FaCalendar },
      { name: 'Fleet Management', href: '/admin/fleet', icon: FaTruck },
      { name: 'Drivers', href: '/admin/drivers', icon: FaUserTie },
      { name: 'Routes', href: '/admin/routes', icon: FaRoute },
      { name: 'Bins', href: '/admin/bins', icon: FaTrash },
      { name: 'Service Requests', href: '/admin/requests', icon: FaTasks },
      { name: 'Collectors', href: '/admin/collectors', icon: FaQrcode },
      { name: 'Sustainability', href: '/admin/sustainability', icon: FaLeaf },
      { name: 'Payments', href: '/admin/payments', icon: FaCreditCard },
      { name: 'Reports', href: '/admin/reports', icon: FaFileAlt },
      { name: 'Settings', href: '/admin/settings', icon: FaCog },
      { name: 'Profile', href: '/admin/profile', icon: FaUser },
    ],
    sustainability_manager: [
      { name: 'Dashboard', href: '/sustainability-manager/dashboard', icon: FaHome },
      { name: 'Task Management', href: '/sustainability-manager/tasks', icon: FaTasks },
      { name: 'Plastic Management', href: '/sustainability-manager', icon: FaLeaf },
      { name: 'Reward System', href: '/sustainability-manager/rewards', icon: FaGift },
      { name: 'Performance', href: '/sustainability-manager/performance', icon: FaChartLine },
      { name: 'Leaderboard', href: '/sustainability/leaderboard', icon: FaTrophy },
      { name: 'Reports', href: '/sustainability/reports', icon: FaFileAlt },
      { name: 'Impact', href: '/sustainability/impact', icon: FaLeaf },
      { name: 'Profile', href: '/sustainability/profile', icon: FaUser },
    ],
    garbage_collector: [
      { name: 'Dashboard', href: '/collector/dashboard', icon: FaHome },
      { name: 'My Route', href: '/collector/route', icon: FaRoute },
      { name: 'QR Scanner', href: '/collector/scanner', icon: FaQrcode },
      { name: 'Report Issue', href: '/collector/report-issue', icon: FaExclamationTriangle },
      { name: 'Performance', href: '/collector/performance', icon: FaTachometerAlt },
    ],
  }

  const userNavigation = navigation[user?.role] || []

  return (
    <div className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
        {isCollapsed ? (
          <Link 
            to="/" 
            className="text-2xl hover:scale-110 transition-transform cursor-pointer mx-auto"
            title="Waste Hub - Go to Home"
          >
            🗑️
          </Link>
        ) : (
          <Link 
            to="/" 
            className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
            title="Go to Home"
          >
            🗑️ Waste Hub
          </Link>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors"
            title="Collapse sidebar"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {userNavigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center px-4' : 'px-6'} py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
      
      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors"
            title="Expand sidebar"
          >
            <FaBars className="h-5 w-5 mx-auto" />
          </button>
        </div>
      )}
    </div>
  )
}

export default Sidebar
