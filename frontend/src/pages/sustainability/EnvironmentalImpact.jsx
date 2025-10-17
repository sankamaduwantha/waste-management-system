import { useState, useEffect } from 'react';
import { FaLeaf, FaTint, FaBolt, FaTrash, FaGlobe, FaCalendar, FaSpinner, FaTrophy } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import usePerformanceStore from '../../store/performanceStore';

const EnvironmentalImpact = () => {
  const { 
    environmentalImpact, 
    trends,
    loading, 
    fetchEnvironmentalImpact,
    fetchTrends 
  } = usePerformanceStore();

  const [period, setPeriod] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = () => {
    fetchEnvironmentalImpact({ period });
    fetchTrends({ months: 6 });
  };

  // Impact metrics with icons and colors
  const impactMetrics = [
    {
      key: 'co2Saved',
      label: 'CO₂ Saved',
      icon: FaGlobe,
      color: 'from-green-500 to-green-600',
      unit: 'kg',
      description: 'Carbon dioxide emissions prevented'
    },
    {
      key: 'wasteDiverted',
      label: 'Waste Diverted',
      icon: FaTrash,
      color: 'from-blue-500 to-blue-600',
      unit: 'kg',
      description: 'Waste diverted from landfills'
    },
    {
      key: 'waterSaved',
      label: 'Water Saved',
      icon: FaTint,
      color: 'from-cyan-500 to-cyan-600',
      unit: 'L',
      description: 'Water conserved through recycling'
    },
    {
      key: 'energySaved',
      label: 'Energy Saved',
      icon: FaBolt,
      color: 'from-yellow-500 to-yellow-600',
      unit: 'kWh',
      description: 'Energy saved through waste reduction'
    }
  ];

  // Calculate equivalencies
  const calculateEquivalencies = () => {
    const co2 = environmentalImpact?.co2Saved || 0;
    const waste = environmentalImpact?.wasteDiverted || 0;
    const water = environmentalImpact?.waterSaved || 0;
    const energy = environmentalImpact?.energySaved || 0;

    return {
      trees: Math.round(co2 / 21), // 1 tree absorbs ~21kg CO2/year
      cars: Math.round(co2 / 4600), // Average car emits ~4.6 tons/year
      showers: Math.round(water / 65), // Average shower uses ~65L
      homes: Math.round(energy / 10800), // Average home uses ~30kWh/day
      plasticBottles: Math.round(waste / 0.03), // Average plastic bottle ~30g
      garbageTrucks: Math.round(waste / 8000) // Average garbage truck load ~8 tons
    };
  };

  const equivalencies = calculateEquivalencies();

  // Prepare trend data for charts
  const trendChartData = trends.map(trend => ({
    month: new Date(trend.year, trend.month - 1).toLocaleDateString('en-US', { month: 'short' }),
    co2: trend.environmentalImpact?.co2Saved || 0,
    waste: trend.environmentalImpact?.wasteDiverted || 0,
    water: (trend.environmentalImpact?.waterSaved || 0) / 10, // Scale down for visibility
    energy: trend.environmentalImpact?.energySaved || 0
  }));

  // Pie chart data
  const pieData = [
    { name: 'CO₂ Saved', value: environmentalImpact?.co2Saved || 0, color: '#10b981' },
    { name: 'Waste Diverted', value: environmentalImpact?.wasteDiverted || 0, color: '#3b82f6' },
    { name: 'Water Saved', value: (environmentalImpact?.waterSaved || 0) / 100, color: '#06b6d4' },
    { name: 'Energy Saved', value: environmentalImpact?.energySaved || 0, color: '#eab308' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaLeaf className="text-green-600" />
            Environmental Impact Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track the positive environmental impact of waste management activities</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="quarterly">This Quarter</option>
            <option value="yearly">This Year</option>
            <option value="all-time">All Time</option>
          </select>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <FaCalendar />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <FaSpinner className="animate-spin text-5xl text-primary-500" />
        </div>
      ) : (
        <>
          {/* Impact Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactMetrics.map((metric) => {
              const Icon = metric.icon;
              const value = environmentalImpact?.[metric.key] || 0;
              
              return (
                <div
                  key={metric.key}
                  className={`bg-gradient-to-br ${metric.color} text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform cursor-pointer`}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="text-4xl opacity-80" />
                    <span className="text-sm bg-white bg-opacity-30 px-3 py-1 rounded-full">
                      {metric.unit}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{metric.label}</h3>
                  <p className="text-3xl font-bold mb-2">{value.toLocaleString()}</p>
                  <p className="text-sm opacity-90">{metric.description}</p>
                </div>
              );
            })}
          </div>

          {/* Real-World Equivalencies */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Real-World Impact Equivalencies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <div className="text-4xl mb-3">🌳</div>
                <p className="text-3xl font-bold text-green-700">{equivalencies.trees}</p>
                <p className="text-gray-600 mt-1">Trees planted equivalent</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="text-4xl mb-3">🚗</div>
                <p className="text-3xl font-bold text-blue-700">{equivalencies.cars}</p>
                <p className="text-gray-600 mt-1">Cars off the road (1 year)</p>
              </div>
              
              <div className="bg-cyan-50 rounded-lg p-6 border-2 border-cyan-200">
                <div className="text-4xl mb-3">🚿</div>
                <p className="text-3xl font-bold text-cyan-700">{equivalencies.showers}</p>
                <p className="text-gray-600 mt-1">Showers worth of water</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200">
                <div className="text-4xl mb-3">🏠</div>
                <p className="text-3xl font-bold text-yellow-700">{equivalencies.homes}</p>
                <p className="text-gray-600 mt-1">Homes powered (1 day)</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                <div className="text-4xl mb-3">🥤</div>
                <p className="text-3xl font-bold text-purple-700">{equivalencies.plasticBottles.toLocaleString()}</p>
                <p className="text-gray-600 mt-1">Plastic bottles recycled</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
                <div className="text-4xl mb-3">🚛</div>
                <p className="text-3xl font-bold text-orange-700">{equivalencies.garbageTrucks}</p>
                <p className="text-gray-600 mt-1">Garbage trucks diverted</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Line Chart */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Impact Trends (6 Months)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="co2" stroke="#10b981" name="CO₂ (kg)" strokeWidth={2} />
                  <Line type="monotone" dataKey="waste" stroke="#3b82f6" name="Waste (kg)" strokeWidth={2} />
                  <Line type="monotone" dataKey="water" stroke="#06b6d4" name="Water (10L)" strokeWidth={2} />
                  <Line type="monotone" dataKey="energy" stroke="#eab308" name="Energy (kWh)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Impact Distribution Pie Chart */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Impact Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value.toFixed(0)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Comparison Bar Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Monthly Impact Comparison</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="co2" fill="#10b981" name="CO₂ (kg)" />
                <Bar dataKey="waste" fill="#3b82f6" name="Waste (kg)" />
                <Bar dataKey="energy" fill="#eab308" name="Energy (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Impact Summary */}
          <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <FaLeaf className="text-5xl text-green-600 mt-2" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Total Environmental Impact</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Through effective waste management and resident participation, we have achieved significant 
                  environmental benefits. Our collective efforts have saved <strong>{environmentalImpact?.co2Saved || 0} kg of CO₂</strong>, 
                  diverted <strong>{environmentalImpact?.wasteDiverted || 0} kg of waste</strong> from landfills, 
                  conserved <strong>{environmentalImpact?.waterSaved || 0} liters of water</strong>, and 
                  saved <strong>{environmentalImpact?.energySaved || 0} kWh of energy</strong>.
                </p>
                <p className="text-gray-600 mt-4 italic">
                  This is equivalent to planting {equivalencies.trees} trees or taking {equivalencies.cars} cars 
                  off the road for a year!
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnvironmentalImpact;
