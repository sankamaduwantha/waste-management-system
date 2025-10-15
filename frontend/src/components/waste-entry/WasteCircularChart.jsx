import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FaTrash, FaRecycle, FaLeaf, FaExclamationTriangle } from 'react-icons/fa';
import useWasteEntryStore from '../../store/wasteEntryStore';
import './WasteCircularChart.css';

/**
 * WasteCircularChart Component
 * 
 * Displays waste breakdown data in a circular pie chart visualization.
 * Implements Strategy Pattern for different chart rendering strategies.
 * 
 * @component
 * @param {Object} props
 * @param {number} props.days - Number of days to display data for (default: 30)
 * @param {string} props.chartType - Type of chart: 'pie' or 'donut' (default: 'donut')
 * @param {boolean} props.showLegend - Whether to show legend (default: true)
 * @param {boolean} props.showTotal - Whether to show total waste in center (default: true)
 * 
 * Design Patterns:
 * - Strategy Pattern: Different rendering strategies for pie vs donut
 * - Observer Pattern: Reactive updates when chartData changes
 * - Presenter Pattern: Transform data for visualization
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles chart visualization
 * - Open/Closed: Extensible through props without modification
 * - Dependency Inversion: Depends on store abstraction
 */
const WasteCircularChart = ({ 
  days = 30, 
  chartType = 'donut',
  showLegend = true,
  showTotal = true 
}) => {
  const { chartData, loading, error, fetchChartData } = useWasteEntryStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch chart data on mount and when days change
  useEffect(() => {
    const loadData = async () => {
      await fetchChartData(days);
      setIsInitialLoad(false);
    };
    loadData();
  }, [days, fetchChartData]);

  /**
   * Color scheme for waste categories
   * - Gray: General waste
   * - Green: Recyclable waste
   * - Yellow: Organic waste
   * - Red: Hazardous waste
   */
  const COLORS = {
    general: '#6b7280',      // Gray
    recyclable: '#059669',   // Green
    organic: '#ca8a04',      // Yellow
    hazardous: '#dc2626'     // Red
  };

  /**
   * Icons for each waste category
   */
  const ICONS = {
    general: FaTrash,
    recyclable: FaRecycle,
    organic: FaLeaf,
    hazardous: FaExclamationTriangle
  };

  /**
   * Transform chart data into format suitable for Recharts
   * Implements Presenter Pattern
   */
  const formatChartData = () => {
    console.log('🔍 Chart Data:', chartData);
    
    if (!chartData?.datasets?.[0]?.data) {
      console.log('❌ No chart data available');
      return [];
    }

    const formatted = chartData.labels.map((label, index) => ({
      name: label,
      value: chartData.datasets[0].data[index],
      percentage: parseFloat(chartData.percentages?.[index]) || 0,
      color: COLORS[label.toLowerCase().split(' ')[0]]
    }));

    console.log('✅ Formatted Chart Data:', formatted);
    return formatted;
  };

  /**
   * Custom label renderer for pie chart
   * Shows percentage on each segment
   */
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (percentage < 5) return null; // Don't show label for small segments

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="chart-label"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  /**
   * Custom tooltip renderer
   * Shows detailed information on hover
   */
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{data.name}</p>
        <p className="tooltip-value">
          <strong>{data.value.toFixed(2)} kg</strong>
        </p>
        <p className="tooltip-percentage">
          {data.percentage.toFixed(1)}% of total
        </p>
      </div>
    );
  };

  /**
   * Custom legend renderer
   * Shows category name, icon, amount, and percentage
   */
  const CustomLegend = ({ payload }) => {
    return (
      <div className="chart-legend">
        {payload.map((entry, index) => {
          const category = entry.value.toLowerCase().split(' ')[0];
          const Icon = ICONS[category];
          
          return (
            <div key={`legend-${index}`} className="legend-item">
              <div className="legend-icon-container">
                {Icon && <Icon className="legend-icon" style={{ color: entry.color }} />}
              </div>
              <div className="legend-content">
                <span className="legend-label">{entry.value}</span>
                <span className="legend-value">
                  {entry.payload.value.toFixed(2)} kg ({entry.payload.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Loading state
  if (loading && isInitialLoad) {
    return (
      <div className="chart-container">
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading waste data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="chart-container">
        <div className="chart-error">
          <FaExclamationTriangle className="error-icon" />
          <p>Failed to load chart data</p>
          <button 
            onClick={() => fetchChartData(days)}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  const formattedData = formatChartData();
  
  console.log('📊 Chart State:', {
    loading,
    error,
    chartData,
    formattedData,
    hasData: formattedData.length > 0,
    allZero: formattedData.length > 0 ? formattedData.every(item => item.value === 0) : true,
    totalValue: formattedData.reduce((sum, item) => sum + (item.value || 0), 0)
  });
  
  // Check if we have no data or all values are zero
  const hasNoData = !formattedData.length;
  const allZero = formattedData.length > 0 && formattedData.every(item => !item.value || item.value === 0);
  
  if (hasNoData || allZero) {
    console.log('ℹ️ Showing empty state - hasNoData:', hasNoData, 'allZero:', allZero);
    return (
      <div className="chart-container">
        <div className="chart-empty">
          <FaTrash className="empty-icon" />
          <p>No waste data recorded yet</p>
          <span className="empty-subtitle">
            Start tracking your daily waste to see insights here
          </span>
        </div>
      </div>
    );
  }
  
  console.log('✅ Rendering chart with data:', formattedData);

  // Calculate total waste
  const totalWaste = formattedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Waste Breakdown</h3>
        <span className="chart-period">Last {days} days</span>
      </div>

      <div className="chart-content">
        {formattedData && formattedData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={chartType === 'donut' ? 100 : 110}
                  innerRadius={chartType === 'donut' ? 60 : 0}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend content={<CustomLegend />} />}
              </PieChart>
            </ResponsiveContainer>

            {/* Center total for donut chart */}
            {chartType === 'donut' && showTotal && (
              <div className="chart-center-text">
                <div className="center-total">
                  <span className="total-label">Total Waste</span>
                  <span className="total-value">{totalWaste.toFixed(2)} kg</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="chart-empty">
            <p>⚠️ Chart data exists but cannot be rendered</p>
            <pre style={{fontSize: '10px', textAlign: 'left'}}>
              {JSON.stringify(formattedData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Additional statistics */}
      <div className="chart-stats">
        <div className="stat-card">
          <FaRecycle className="stat-icon recyclable" />
          <div className="stat-content">
            <span className="stat-label">Recyclable</span>
            <span className="stat-value">
              {formattedData.find(d => d.name.includes('Recyclable'))?.percentage.toFixed(1) || 0}%
            </span>
          </div>
        </div>
        <div className="stat-card">
          <FaLeaf className="stat-icon organic" />
          <div className="stat-content">
            <span className="stat-label">Organic</span>
            <span className="stat-value">
              {formattedData.find(d => d.name.includes('Organic'))?.percentage.toFixed(1) || 0}%
            </span>
          </div>
        </div>
        {!showTotal && (
          <div className="stat-card">
            <FaTrash className="stat-icon general" />
            <div className="stat-content">
              <span className="stat-label">Total</span>
              <span className="stat-value">{totalWaste.toFixed(2)} kg</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteCircularChart;
