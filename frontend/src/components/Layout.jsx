import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'
import { toast } from 'react-toastify'

const Layout = () => {
  const { user } = useAuthStore()

  useEffect(() => {
    // Connect to Socket.io
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')

    socket.on('connect', () => {
      // console.log('Connected to socket server')
      if (user) {
        socket.emit('join-room', user.id)
      }
    })

    socket.on('notification', (notification) => {
      toast.info(notification.message, {
        position: 'top-right',
        autoClose: 5000,
      })
    })

    socket.on('disconnect', () => {
      // console.log('Disconnected from socket server')
    })

    return () => {
      socket.disconnect()
    }
  }, [user])

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 flex flex-col">
          <main className="flex-1 p-6">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default Layout
