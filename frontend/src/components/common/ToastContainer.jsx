/**
 * @fileoverview Toast Notification Component
 * @description Reusable toast notification system for success, error, warning, and info messages
 */

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

let toastId = 0;
const toastListeners = new Set();

export const showToast = (message, type = 'success', duration = 3000) => {
  const id = toastId++;
  const toast = { id, message, type, duration };
  toastListeners.forEach(listener => listener(toast));
  return id;
};

export const showSuccessToast = (message, duration) => showToast(message, 'success', duration);
export const showErrorToast = (message, duration) => showToast(message, 'error', duration);
export const showWarningToast = (message, duration) => showToast(message, 'warning', duration);
export const showInfoToast = (message, duration) => showToast(message, 'info', duration);

const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-xl" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500 text-xl" />;
      case 'info':
        return <FaInfoCircle className="text-blue-500 text-xl" />;
      default:
        return <FaCheckCircle className="text-green-500 text-xl" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500 shadow-lg';
      case 'error':
        return 'bg-white border-l-4 border-red-500 shadow-lg';
      case 'warning':
        return 'bg-white border-l-4 border-yellow-500 shadow-lg';
      case 'info':
        return 'bg-white border-l-4 border-blue-500 shadow-lg';
      default:
        return 'bg-white border-l-4 border-green-500 shadow-lg';
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-r-lg mb-3 min-w-80 max-w-md transition-all duration-300 ${getStyles()} ${
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <p className="text-gray-800 font-medium">{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FaTimes />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) => {
      setToasts(prev => [...prev, toast]);
    };

    toastListeners.add(listener);

    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
