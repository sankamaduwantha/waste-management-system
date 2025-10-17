import { FaBell, FaUserCircle } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import useAuthStore from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const [showProfile, setShowProfile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showLogoutConfirm) {
        setShowLogoutConfirm(false)
      }
    }
    
    if (showLogoutConfirm) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showLogoutConfirm])

  const handleLogoutClick = () => {
    setShowProfile(false)
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false)
    // Call logout first to clear auth state
    logout()
    // Navigate to home page after logout
    setTimeout(() => {
      navigate('/', { replace: true })
    }, 100)
  }

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowLogoutConfirm(false)
    }
  }

  const getProfileImageUrl = () => {
    if (user?.profileImage) {
      // Check if it's a full URL or just a filename
      if (user.profileImage.startsWith('http')) {
        return user.profileImage;
      }
      // Don't show default avatar
      if (user.profileImage === 'default-avatar.png' || user.profileImage === 'default.png') {
        return null;
      }
      return `http://localhost:5000/uploads/profiles/${user.profileImage}`;
    }
    return null;
  }

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome back, {user?.name}!
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none">
          <FaBell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            {getProfileImageUrl() ? (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 ring-2 ring-white shadow">
                <img 
                  src={getProfileImageUrl()} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>';
                  }}
                />
              </div>
            ) : (
              <FaUserCircle className="h-8 w-8" />
            )}
            <span className="text-sm font-medium">{user?.name}</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <button
                onClick={handleLogoutClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-slideIn">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You will need to sign in again to access your account.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
