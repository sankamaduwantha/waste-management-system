// Add this file to frontend/src/utils/axiosConfig.js

import axios from 'axios';

// Global axios configuration to ensure proper handling of array data
axios.interceptors.request.use((config) => {
  // Only process if there's data in the request
  if (config.data) {
    // Process assignedCrew properly if it exists
    if (config.data.assignedCrew) {
      // Ensure it's always an array
      if (typeof config.data.assignedCrew === 'string' && 
          (config.data.assignedCrew.includes('[') || config.data.assignedCrew.includes("'"))) {
        try {
          // Try to extract IDs if it's a string representation of an array
          const matches = config.data.assignedCrew.match(/['"]([^'"]+)['"]/g);
          if (matches) {
            config.data.assignedCrew = matches.map(m => m.replace(/['"]/g, ''));
          } else {
            // Fallback to empty array if can't parse
            config.data.assignedCrew = [];
          }
        } catch (e) {
          console.error('Error processing assignedCrew', e);
          config.data.assignedCrew = [];
        }
      } else if (!Array.isArray(config.data.assignedCrew)) {
        // Convert single value to array
        config.data.assignedCrew = [config.data.assignedCrew].filter(Boolean);
      }
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axios;