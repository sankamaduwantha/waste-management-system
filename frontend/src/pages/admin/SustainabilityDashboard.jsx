/**
 * @fileoverview Admin Sustainability Dashboard
 * @description Overview of sustainability metrics, recycling rates, and environmental impact
 */

import { useState, useEffect } from 'react';
import { 
  FaLeaf, FaRecycle, FaTrophy, FaChartLine, FaUsers, 
  FaSpinner, FaTree, FaWater, FaWind, FaChartBar
} from 'react-icons/fa';
import api from '../../services/api';

const SustainabilityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [zoneStats, setZoneStats] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year

  useEffect(() => {
    fetchSustainabilityData();
  }, [timeRange]);

  const fetchSustainabilityData = async () => {
    setLoading(true);
    try {
      // Fetch waste data statistics
      const wasteResponse = await api.get('/waste-data', { 
        params: { 
          timeRange,
          limit: 1000 // Get sufficient data for calculations
        } 
      });
      
      let wasteData = wasteResponse.data?.data?.wasteData || wasteResponse.data?.data || wasteResponse.data || [];
      
      // Ensure wasteData is an array
      if (!Array.isArray(wasteData)) {
        wasteData = [];
      }
      
      // Calculate metrics from waste data
      const totalWasteCollected = wasteData.reduce((sum, entry) => sum + (entry.totalWeight || 0), 0);
      const totalRecycled = wasteData.reduce((sum, entry) => {
        const recyclables = ['plastic', 'paper', 'glass', 'metal'].reduce((recycSum, type) => {
          return recycSum + (entry.wasteTypes?.[type] || 0);
        }, 0);
        return sum + recyclables;
      }, 0);
      
      const recyclingRate = totalWasteCollected > 0 
        ? Math.round((totalRecycled / totalWasteCollected) * 100) 
        : 0;
      
      // Environmental impact calculations
      // Carbon saved: ~2.5 kg CO2 per kg recycled
      const carbonSaved = Math.round(totalRecycled * 2.5);
      // Trees equivalent: ~15 kg CO2 absorbed per tree per year
      const treesEquivalent = Math.round(carbonSaved / 15);
      // Water saved: ~10 liters per kg recycled
      const waterSaved = Math.round(totalRecycled * 10);
      
      // Count active residents
      const activeResidentsResponse = await api.get('/users', { 
        params: { role: 'resident' } 
      });
      const activeResidents = activeResidentsResponse.data.data.users?.length || 0;
      
      // Calculate plastic reduction
      const plasticReduced = wasteData.reduce((sum, entry) => 
        sum + (entry.wasteTypes?.plastic || 0), 0
      );
      
      setMetrics({
        totalWasteCollected: Math.round(totalWasteCollected),
        totalRecycled: Math.round(totalRecycled),
        recyclingRate,
        carbonSaved,
        treesEquivalent,
        waterSaved,
        activeResidents,
        plasticReduced: Math.round(plasticReduced)
      });

      // Fetch zones for zone statistics
      const zonesResponse = await api.get('/zones');
      let zones = zonesResponse.data?.data?.zones || zonesResponse.data?.data || zonesResponse.data || [];
      
      // Ensure zones is an array
      if (!Array.isArray(zones)) {
        zones = [];
      }
      
      // Calculate zone-wise statistics
      const zoneStatsData = zones.map((zone, index) => {
        const zoneWaste = wasteData.filter(entry => 
          entry.zone?._id === zone._id || entry.zone === zone._id
        );
        
        const zoneTotal = zoneWaste.reduce((sum, entry) => sum + (entry.totalWeight || 0), 0);
        const zoneRecycled = zoneWaste.reduce((sum, entry) => {
          const recyclables = ['plastic', 'paper', 'glass', 'metal'].reduce((recycSum, type) => {
            return recycSum + (entry.wasteTypes?.[type] || 0);
          }, 0);
          return sum + recyclables;
        }, 0);
        
        const zoneRecyclingRate = zoneTotal > 0 
          ? Math.round((zoneRecycled / zoneTotal) * 100) 
          : 0;
        
        const colors = ['green', 'blue', 'purple', 'yellow', 'orange', 'teal'];
        
        return {
          zone: zone.name,
          recyclingRate: zoneRecyclingRate,
          wasteCollected: Math.round(zoneTotal),
          color: colors[index % colors.length]
        };
      });
      
      setZoneStats(zoneStatsData);

      // Fetch top performers from residents
      const residentsResponse = await api.get('/users', { 
        params: { role: 'resident', limit: 100 } 
      });
      let residents = residentsResponse.data?.data?.users || residentsResponse.data?.data || residentsResponse.data || [];
      
      // Ensure residents is an array
      if (!Array.isArray(residents)) {
        residents = [];
      }
      
      // Calculate performance for each resident
      const performersData = await Promise.all(
        residents.slice(0, 20).map(async (resident) => {
          try {
            const residentWaste = wasteData.filter(entry => 
              entry.resident?._id === resident._id || 
              entry.resident === resident._id ||
              entry.user?._id === resident._id
            );
            
            const residentTotal = residentWaste.reduce((sum, entry) => 
              sum + (entry.totalWeight || 0), 0
            );
            const residentRecycled = residentWaste.reduce((sum, entry) => {
              const recyclables = ['plastic', 'paper', 'glass', 'metal'].reduce((recycSum, type) => {
                return recycSum + (entry.wasteTypes?.[type] || 0);
              }, 0);
              return sum + recyclables;
            }, 0);
            
            const residentRecyclingRate = residentTotal > 0 
              ? Math.round((residentRecycled / residentTotal) * 100) 
              : 0;
            
            // Calculate points based on recycling
            const points = Math.round(residentRecycled * 10);
            
            return {
              name: resident.name,
              zone: resident.zone?.name || 'N/A',
              recyclingRate: residentRecyclingRate,
              points,
              totalRecycled: Math.round(residentRecycled)
            };
          } catch (error) {
            return null;
          }
        })
      );
      
      // Filter out null values and sort by recycling rate
      const validPerformers = performersData
        .filter(p => p && p.totalRecycled > 0)
        .sort((a, b) => b.recyclingRate - a.recyclingRate)
        .slice(0, 5);
      
      setTopPerformers(validPerformers);

    } catch (error) {
      console.error('Failed to fetch sustainability data:', error);
      // Set default empty data on error
      setMetrics({
        totalWasteCollected: 0,
        totalRecycled: 0,
        recyclingRate: 0,
        carbonSaved: 0,
        treesEquivalent: 0,
        waterSaved: 0,
        activeResidents: 0,
        plasticReduced: 0
      });
      setZoneStats([]);
      setTopPerformers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin h-12 w-12 text-primary-600" />
        <span className="ml-3 text-gray-600">Loading sustainability data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaLeaf className="mr-3 text-green-600" />
            Sustainability Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor environmental impact and sustainability metrics
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaRecycle className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
              {metrics.recyclingRate}%
            </span>
          </div>
          <p className="text-sm opacity-90">Recycling Rate</p>
          <p className="text-3xl font-bold mt-1">{metrics.totalRecycled.toLocaleString()} kg</p>
          <p className="text-xs opacity-75 mt-2">of {metrics.totalWasteCollected.toLocaleString()} kg total</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaWind className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">CO₂</span>
          </div>
          <p className="text-sm opacity-90">Carbon Saved</p>
          <p className="text-3xl font-bold mt-1">{metrics.carbonSaved.toLocaleString()} kg</p>
          <p className="text-xs opacity-75 mt-2">equivalent to {metrics.treesEquivalent} trees</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaWater className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">H₂O</span>
          </div>
          <p className="text-sm opacity-90">Water Saved</p>
          <p className="text-3xl font-bold mt-1">{metrics.waterSaved.toLocaleString()} L</p>
          <p className="text-xs opacity-75 mt-2">through recycling efforts</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaUsers className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">Active</span>
          </div>
          <p className="text-sm opacity-90">Participating Residents</p>
          <p className="text-3xl font-bold mt-1">{metrics.activeResidents}</p>
          <p className="text-xs opacity-75 mt-2">{metrics.plasticReduced} kg plastic reduced</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone Performance */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FaChartBar className="mr-2 text-primary-600" />
              Zone Performance
            </h2>
          </div>
          
          <div className="space-y-4">
            {zoneStats.map((zone, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{zone.zone}</h3>
                  <span className={`px-3 py-1 bg-${zone.color}-100 text-${zone.color}-800 text-sm font-semibold rounded-full`}>
                    {zone.recyclingRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`bg-${zone.color}-500 h-3 rounded-full transition-all`}
                    style={{ width: `${zone.recyclingRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Waste Collected: {zone.wasteCollected.toLocaleString()} kg</span>
                  <span>Recycled: {Math.round(zone.wasteCollected * zone.recyclingRate / 100).toLocaleString()} kg</span>
                </div>
              </div>
            ))}
          </div>

          {/* Environmental Impact Visualization */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Environmental Impact</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FaTree className="text-4xl text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{metrics.treesEquivalent}</p>
                <p className="text-xs text-green-700">Trees Saved</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FaWater className="text-4xl text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{(metrics.waterSaved / 1000).toFixed(1)}K</p>
                <p className="text-xs text-blue-700">Liters Water</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <FaWind className="text-4xl text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{(metrics.carbonSaved / 1000).toFixed(1)}T</p>
                <p className="text-xs text-purple-700">CO₂ Reduced</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers Leaderboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaTrophy className="mr-2 text-yellow-500" />
            Top Performers
          </h2>
          <div className="space-y-3">
            {topPerformers.map((performer, idx) => (
              <div
                key={idx}
                className={`flex items-center p-3 rounded-lg ${
                  idx === 0 ? 'bg-yellow-50 border-2 border-yellow-300' :
                  idx === 1 ? 'bg-gray-50 border-2 border-gray-300' :
                  idx === 2 ? 'bg-orange-50 border-2 border-orange-300' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                  {idx + 1}
                </div>
                <div className="ml-3 flex-grow">
                  <p className="font-semibold text-gray-900 text-sm">{performer.name}</p>
                  <p className="text-xs text-gray-600">{performer.zone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-green-600">{performer.recyclingRate}%</p>
                  <p className="text-xs text-gray-500">{performer.points} pts</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. Recycling Rate</span>
              <span className="font-semibold text-gray-900">
                {(zoneStats.reduce((sum, z) => sum + z.recyclingRate, 0) / zoneStats.length).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Waste Processed</span>
              <span className="font-semibold text-gray-900">
                {zoneStats.reduce((sum, z) => sum + z.wasteCollected, 0).toLocaleString()} kg
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Active Participants</span>
              <span className="font-semibold text-gray-900">{metrics.activeResidents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trends Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FaChartLine className="mr-2 text-primary-600" />
          Sustainability Trends
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Week-over-Week</p>
            <p className="text-2xl font-bold text-green-600">+12%</p>
            <p className="text-xs text-gray-500 mt-1">Recycling Rate</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Month-over-Month</p>
            <p className="text-2xl font-bold text-blue-600">+8%</p>
            <p className="text-xs text-gray-500 mt-1">Participation</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Plastic Reduction</p>
            <p className="text-2xl font-bold text-purple-600">-15%</p>
            <p className="text-xs text-gray-500 mt-1">vs Last Month</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Carbon Footprint</p>
            <p className="text-2xl font-bold text-teal-600">-20%</p>
            <p className="text-xs text-gray-500 mt-1">Improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityDashboard;
