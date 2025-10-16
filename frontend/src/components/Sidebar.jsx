import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { 
  FaHome, FaCalendar, FaClipboardList, FaCreditCard, FaUser,
  FaTruck, FaRoute, FaTrash, FaTasks, FaUsers, FaMapMarkedAlt,
  FaCog, FaChartLine, FaFileAlt, FaLeaf, FaBars, FaTimes 
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
      { name: 'Profile', href: '/resident/profile', icon: FaUser },
    ],
    city_manager: [
      { name: 'Dashboard', href: '/city-manager/dashboard', icon: FaHome },
      { name: 'Fleet Management', href: '/city-manager/fleet', icon: FaTruck },
      { name: 'Routes', href: '/city-manager/routes', icon: FaRoute },
      { name: 'Bins', href: '/city-manager/bins', icon: FaTrash },
      { name: 'Requests', href: '/city-manager/requests', icon: FaTasks },
      { name: 'Profile', href: '/city-manager/profile', icon: FaUser },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: FaHome },
      { name: 'Users', href: '/admin/users', icon: FaUsers },
      { name: 'Zones', href: '/admin/zones', icon: FaMapMarkedAlt },
      { name: 'Settings', href: '/admin/settings', icon: FaCog },
      { name: 'Profile', href: '/admin/profile', icon: FaUser },
    ],
    sustainability_manager: [
      { name: 'Dashboard', href: '/sustainability/dashboard', icon: FaHome },
      { name: 'Plastic Management', href: '/sustainability-manager', icon: FaLeaf },
      { name: 'Analytics', href: '/sustainability/analytics', icon: FaChartLine },
      { name: 'Reports', href: '/sustainability/reports', icon: FaFileAlt },
      { name: 'Impact', href: '/sustainability/impact', icon: FaLeaf },
      { name: 'Profile', href: '/sustainability/profile', icon: FaUser },
    ],
  }

  const userNavigation = navigation[user?.role] || []

  return (
    <div className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-primary-600">
            🗑️ Waste Manager
          </h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FaBars className="h-5 w-5" /> : <FaTimes className="h-5 w-5" />}
        </button>
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
    </div>
  )
}

export default Sidebar
