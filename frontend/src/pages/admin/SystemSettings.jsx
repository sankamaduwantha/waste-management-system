import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiBell,
  FiSettings,
  FiDatabase,
  FiZap,
  FiTrendingUp,
  FiSmartphone,
  FiLink,
  FiSave,
  FiRefreshCw,
  FiAlertTriangle,
  FiMap,
  FiDollarSign,
  FiMail,
  FiMessageSquare,
  FiCpu,
  FiActivity
} from 'react-icons/fi';
import api from '../../services/api';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState({});

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'waste_thresholds', label: 'Waste Thresholds', icon: FiDatabase },
    { id: 'rewards', label: 'Rewards System', icon: FiTrendingUp },
    { id: 'realtime', label: 'Real-time Features', icon: FiZap },
    { id: 'analytics', label: 'Analytics', icon: FiActivity },
    { id: 'mobile', label: 'Mobile Settings', icon: FiSmartphone },
    { id: 'integrations', label: 'Integrations', icon: FiLink },
    { id: 'api', label: 'API Settings', icon: FiCpu },
    { id: 'general', label: 'General', icon: FiSettings }
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/system-config');
      const configMap = {};
      
      // Backend returns data: { configs: [...] }
      const configsArray = response.data.data.configs || [];
      
      configsArray.forEach(config => {
        if (!configMap[config.category]) {
          configMap[config.category] = {};
        }
        configMap[config.category][config.key] = config.value;
      });
      
      setConfigs(configMap);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setSaving(true);
      await api.post('/system-config/initialize');
      toast.success('Default settings initialized successfully!');
      fetchConfigs();
    } catch (error) {
      console.error('Error initializing defaults:', error);
      toast.error('Failed to initialize defaults');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async (category, key, value, dataType = 'string') => {
    try {
      setSaving(true);
      await api.put(`/system-config/${category}/${key}`, { value, dataType });
      toast.success('Setting saved successfully!');
      
      // Update local state
      setConfigs(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }));
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error(error.response?.data?.message || 'Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSave = async (category, updates) => {
    try {
      setSaving(true);
      await api.put('/system-config/bulk-update', { configs: updates });
      toast.success('Settings saved successfully!');
      fetchConfigs();
    } catch (error) {
      console.error('Error saving configs:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-gray-600">Configure email, SMS, and push notification templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Email Notifications */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiMail className="text-2xl text-blue-600" />
            <h3 className="text-lg font-semibold">Email Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">Bin Full Alert Template</label>
              <textarea
                value={configs.notifications?.email_bin_full_template || ''}
                onChange={(e) => setConfigs({
                  ...configs,
                  notifications: { ...configs.notifications, email_bin_full_template: e.target.value }
                })}
                className="input-field"
                rows="3"
                placeholder="Your bin {binId} in zone {zone} is {fillLevel}% full..."
              />
              <p className="text-xs text-gray-500 mt-1">Use {`{binId}, {zone}, {fillLevel}`} as placeholders</p>
            </div>

            <div>
              <label className="label">Appointment Confirmation Template</label>
              <textarea
                value={configs.notifications?.email_appointment_template || ''}
                onChange={(e) => setConfigs({
                  ...configs,
                  notifications: { ...configs.notifications, email_appointment_template: e.target.value }
                })}
                className="input-field"
                rows="3"
                placeholder="Your appointment is confirmed for {date} at {time}..."
              />
            </div>

            <div>
              <label className="label">Payment Confirmation Template</label>
              <textarea
                value={configs.notifications?.email_payment_template || ''}
                onChange={(e) => setConfigs({
                  ...configs,
                  notifications: { ...configs.notifications, email_payment_template: e.target.value }
                })}
                className="input-field"
                rows="3"
                placeholder="Payment of {amount} received successfully..."
              />
            </div>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiMessageSquare className="text-2xl text-green-600" />
            <h3 className="text-lg font-semibold">SMS Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">SMS Template (Max 160 chars)</label>
              <textarea
                value={configs.notifications?.sms_template || ''}
                onChange={(e) => setConfigs({
                  ...configs,
                  notifications: { ...configs.notifications, sms_template: e.target.value }
                })}
                className="input-field"
                rows="2"
                maxLength={160}
                placeholder="Bin {binId} is {fillLevel}% full. Please take action."
              />
              <p className="text-xs text-gray-500 mt-1">
                {(configs.notifications?.sms_template || '').length}/160 characters
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smsEnabled"
                checked={configs.notifications?.sms_enabled || false}
                onChange={(e) => handleSaveConfig('notifications', 'sms_enabled', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="smsEnabled" className="text-sm font-medium">Enable SMS Notifications</label>
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiBell className="text-2xl text-purple-600" />
            <h3 className="text-lg font-semibold">Push Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pushEnabled"
                checked={configs.notifications?.push_enabled || false}
                onChange={(e) => handleSaveConfig('notifications', 'push_enabled', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="pushEnabled" className="text-sm font-medium">Enable Push Notifications</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="criticalAlertsOnly"
                checked={configs.notifications?.critical_alerts_only || false}
                onChange={(e) => handleSaveConfig('notifications', 'critical_alerts_only', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="criticalAlertsOnly" className="text-sm font-medium">Critical Alerts Only (above 90%)</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              const updates = Object.entries(configs.notifications || {}).map(([key, value]) => ({
                category: 'notifications',
                key,
                value,
                dataType: typeof value
              }));
              handleBulkSave('notifications', updates);
            }}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save All'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderWasteThresholdsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Waste Threshold Settings</h2>
          <p className="text-gray-600">Configure bin fill level alerts and thresholds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiAlertTriangle className="text-2xl text-yellow-600" />
            <h3 className="text-lg font-semibold">Alert Thresholds</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">Critical Level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={configs.waste_thresholds?.bin_full_threshold || 80}
                onChange={(e) => setConfigs({
                  ...configs,
                  waste_thresholds: { ...configs.waste_thresholds, bin_full_threshold: parseInt(e.target.value) }
                })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Send immediate alerts when bins reach this level</p>
            </div>

            <div>
              <label className="label">Warning Level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={configs.waste_thresholds?.bin_warning_threshold || 70}
                onChange={(e) => setConfigs({
                  ...configs,
                  waste_thresholds: { ...configs.waste_thresholds, bin_warning_threshold: parseInt(e.target.value) }
                })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Send warning notifications at this level</p>
            </div>

            <div>
              <label className="label">Optimal Collection Level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={configs.waste_thresholds?.optimal_collection_level || 75}
                onChange={(e) => setConfigs({
                  ...configs,
                  waste_thresholds: { ...configs.waste_thresholds, optimal_collection_level: parseInt(e.target.value) }
                })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended level for scheduling collection</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiTrendingUp className="text-2xl text-green-600" />
            <h3 className="text-lg font-semibold">Predictive Analytics</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enablePredictive"
                checked={configs.waste_thresholds?.enable_predictive_forecasting || false}
                onChange={(e) => handleSaveConfig('waste_thresholds', 'enable_predictive_forecasting', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="enablePredictive" className="text-sm font-medium">Enable Fill-level Forecasting</label>
            </div>

            <div>
              <label className="label">Forecast Window (days)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={configs.waste_thresholds?.forecast_days || 7}
                onChange={(e) => setConfigs({
                  ...configs,
                  waste_thresholds: { ...configs.waste_thresholds, forecast_days: parseInt(e.target.value) }
                })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Historical Data Period (days)</label>
              <input
                type="number"
                min="7"
                max="90"
                value={configs.waste_thresholds?.historical_data_days || 30}
                onChange={(e) => setConfigs({
                  ...configs,
                  waste_thresholds: { ...configs.waste_thresholds, historical_data_days: parseInt(e.target.value) }
                })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Amount of historical data to use for predictions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const updates = Object.entries(configs.waste_thresholds || {}).map(([key, value]) => ({
              category: 'waste_thresholds',
              key,
              value,
              dataType: typeof value
            }));
            handleBulkSave('waste_thresholds', updates);
          }}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <FiSave />
          <span>{saving ? 'Saving...' : 'Save All'}</span>
        </button>
      </div>
    </div>
  );

  const renderRewardsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rewards System</h2>
          <p className="text-gray-600">Configure points and rewards for residents</p>
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Points per KG of Waste</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={configs.rewards?.points_per_kg || 10}
                onChange={(e) => setConfigs({
                  ...configs,
                  rewards: { ...configs.rewards, points_per_kg: parseFloat(e.target.value) }
                })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Points for Recycling (per KG)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={configs.rewards?.recycling_bonus || 15}
                onChange={(e) => setConfigs({
                  ...configs,
                  rewards: { ...configs.rewards, recycling_bonus: parseFloat(e.target.value) }
                })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Bonus for Plastic Reduction (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={configs.rewards?.plastic_reduction_bonus || 20}
                onChange={(e) => setConfigs({
                  ...configs,
                  rewards: { ...configs.rewards, plastic_reduction_bonus: parseInt(e.target.value) }
                })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Monthly Target (KG)</label>
              <input
                type="number"
                min="0"
                value={configs.rewards?.monthly_target_kg || 50}
                onChange={(e) => setConfigs({
                  ...configs,
                  rewards: { ...configs.rewards, monthly_target_kg: parseInt(e.target.value) }
                })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <input
              type="checkbox"
              id="enableRewards"
              checked={configs.rewards?.enable_rewards_system || false}
              onChange={(e) => handleSaveConfig('rewards', 'enable_rewards_system', e.target.checked, 'boolean')}
              className="rounded"
            />
            <label htmlFor="enableRewards" className="text-sm font-medium">Enable Rewards System</label>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => {
              const updates = Object.entries(configs.rewards || {}).map(([key, value]) => ({
                category: 'rewards',
                key,
                value,
                dataType: typeof value
              }));
              handleBulkSave('rewards', updates);
            }}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save All'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderRealtimeTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Real-time Features</h2>
          <p className="text-gray-600">Configure live updates and tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiZap className="text-2xl text-yellow-600" />
            <h3 className="text-lg font-semibold">Live Updates</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="liveBinUpdates"
                checked={configs.realtime?.live_bin_updates || false}
                onChange={(e) => handleSaveConfig('realtime', 'live_bin_updates', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="liveBinUpdates" className="text-sm font-medium">Live Bin Fill Level Updates</label>
            </div>

            <div>
              <label className="label">Update Interval (seconds)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={configs.realtime?.update_interval || 30}
                onChange={(e) => setConfigs({
                  ...configs,
                  realtime: { ...configs.realtime, update_interval: parseInt(e.target.value) }
                })}
                className="input-field"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="liveScheduleUpdates"
                checked={configs.realtime?.live_schedule_updates || false}
                onChange={(e) => handleSaveConfig('realtime', 'live_schedule_updates', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="liveScheduleUpdates" className="text-sm font-medium">Real-time Schedule Updates</label>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiMap className="text-2xl text-blue-600" />
            <h3 className="text-lg font-semibold">Live Tracking</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="liveCollectorTracking"
                checked={configs.realtime?.live_collector_tracking || false}
                onChange={(e) => handleSaveConfig('realtime', 'live_collector_tracking', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="liveCollectorTracking" className="text-sm font-medium">Live Collector Tracking</label>
            </div>

            <div>
              <label className="label">Tracking Update Interval (seconds)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={configs.realtime?.tracking_interval || 10}
                onChange={(e) => setConfigs({
                  ...configs,
                  realtime: { ...configs.realtime, tracking_interval: parseInt(e.target.value) }
                })}
                className="input-field"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="routeOptimization"
                checked={configs.realtime?.auto_route_optimization || false}
                onChange={(e) => handleSaveConfig('realtime', 'auto_route_optimization', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="routeOptimization" className="text-sm font-medium">Auto Route Optimization</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const updates = Object.entries(configs.realtime || {}).map(([key, value]) => ({
              category: 'realtime',
              key,
              value,
              dataType: typeof value
            }));
            handleBulkSave('realtime', updates);
          }}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <FiSave />
          <span>{saving ? 'Saving...' : 'Save All'}</span>
        </button>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics & Reporting</h2>
          <p className="text-gray-600">Configure data analysis and environmental impact tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiTrendingUp className="text-2xl text-green-600" />
            <h3 className="text-lg font-semibold">Waste Trend Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trendAnalysis"
                checked={configs.analytics?.enable_trend_analysis || false}
                onChange={(e) => handleSaveConfig('analytics', 'enable_trend_analysis', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="trendAnalysis" className="text-sm font-medium">Enable Waste Trend Analysis</label>
            </div>

            <div>
              <label className="label">Analysis Period (days)</label>
              <input
                type="number"
                min="7"
                max="365"
                value={configs.analytics?.analysis_period_days || 30}
                onChange={(e) => setConfigs({
                  ...configs,
                  analytics: { ...configs.analytics, analysis_period_days: parseInt(e.target.value) }
                })}
                className="input-field"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="performanceDashboard"
                checked={configs.analytics?.performance_dashboard || false}
                onChange={(e) => handleSaveConfig('analytics', 'performance_dashboard', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="performanceDashboard" className="text-sm font-medium">Performance Dashboards</label>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiActivity className="text-2xl text-blue-600" />
            <h3 className="text-lg font-semibold">Environmental Impact</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="impactCalc"
                checked={configs.analytics?.environmental_impact_calc || false}
                onChange={(e) => handleSaveConfig('analytics', 'environmental_impact_calc', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="impactCalc" className="text-sm font-medium">Calculate Environmental Impact</label>
            </div>

            <div>
              <label className="label">CO2 Reduction per KG (kg)</label>
              <input
                type="number"
                step="0.01"
                value={configs.analytics?.co2_reduction_per_kg || 0.5}
                onChange={(e) => setConfigs({
                  ...configs,
                  analytics: { ...configs.analytics, co2_reduction_per_kg: parseFloat(e.target.value) }
                })}
                className="input-field"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoReports"
                checked={configs.analytics?.automated_reports || false}
                onChange={(e) => handleSaveConfig('analytics', 'automated_reports', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="autoReports" className="text-sm font-medium">Automated Monthly Reports</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const updates = Object.entries(configs.analytics || {}).map(([key, value]) => ({
              category: 'analytics',
              key,
              value,
              dataType: typeof value
            }));
            handleBulkSave('analytics', updates);
          }}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <FiSave />
          <span>{saving ? 'Saving...' : 'Save All'}</span>
        </button>
      </div>
    </div>
  );

  const renderMobileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mobile Settings</h2>
          <p className="text-gray-600">Configure mobile capabilities and features</p>
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="responsiveDesign"
              checked={configs.mobile?.responsive_design || true}
              onChange={(e) => handleSaveConfig('mobile', 'responsive_design', e.target.checked, 'boolean')}
              className="rounded"
            />
            <label htmlFor="responsiveDesign" className="text-sm font-medium">Responsive Web Design</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="qrScanning"
              checked={configs.mobile?.qr_code_scanning || false}
              onChange={(e) => handleSaveConfig('mobile', 'qr_code_scanning', e.target.checked, 'boolean')}
              className="rounded"
            />
            <label htmlFor="qrScanning" className="text-sm font-medium">QR Code Scanning for Bins</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="mobilePush"
              checked={configs.mobile?.mobile_push_notifications || false}
              onChange={(e) => handleSaveConfig('mobile', 'mobile_push_notifications', e.target.checked, 'boolean')}
              className="rounded"
            />
            <label htmlFor="mobilePush" className="text-sm font-medium">Mobile Push Notifications</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="offlineMode"
              checked={configs.mobile?.offline_capability || false}
              onChange={(e) => handleSaveConfig('mobile', 'offline_capability', e.target.checked, 'boolean')}
              className="rounded"
            />
            <label htmlFor="offlineMode" className="text-sm font-medium">Offline Mode for Basic Functions</label>
          </div>

          <div>
            <label className="label">Mobile Cache Duration (hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              value={configs.mobile?.cache_duration_hours || 24}
              onChange={(e) => setConfigs({
                ...configs,
                mobile: { ...configs.mobile, cache_duration_hours: parseInt(e.target.value) }
              })}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => {
              const updates = Object.entries(configs.mobile || {}).map(([key, value]) => ({
                category: 'mobile',
                key,
                value,
                dataType: typeof value
              }));
              handleBulkSave('mobile', updates);
            }}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save All'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Integration Settings</h2>
          <p className="text-gray-600">Configure external service integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiMap className="text-2xl text-red-600" />
            <h3 className="text-lg font-semibold">Map Integration</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">Map Provider</label>
              <select
                value={configs.integrations?.map_provider || 'google'}
                onChange={(e) => handleSaveConfig('integrations', 'map_provider', e.target.value)}
                className="input-field"
              >
                <option value="google">Google Maps</option>
                <option value="mapbox">Mapbox</option>
                <option value="osm">OpenStreetMap</option>
              </select>
            </div>

            <div>
              <label className="label">API Key</label>
              <input
                type="password"
                value={configs.integrations?.map_api_key || ''}
                onChange={(e) => setConfigs({
                  ...configs,
                  integrations: { ...configs.integrations, map_api_key: e.target.value }
                })}
                className="input-field"
                placeholder="Enter API key"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableRouteOpt"
                checked={configs.integrations?.enable_route_optimization || false}
                onChange={(e) => handleSaveConfig('integrations', 'enable_route_optimization', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="enableRouteOpt" className="text-sm font-medium">Enable Route Optimization</label>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiDollarSign className="text-2xl text-green-600" />
            <h3 className="text-lg font-semibold">Payment Gateway</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">Payment Provider</label>
              <select
                value={configs.integrations?.payment_provider || 'stripe'}
                onChange={(e) => handleSaveConfig('integrations', 'payment_provider', e.target.value)}
                className="input-field"
              >
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="square">Square</option>
              </select>
            </div>

            <div>
              <label className="label">API Key</label>
              <input
                type="password"
                value={configs.integrations?.payment_api_key || ''}
                onChange={(e) => setConfigs({
                  ...configs,
                  integrations: { ...configs.integrations, payment_api_key: e.target.value }
                })}
                className="input-field"
                placeholder="Enter API key"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enablePayments"
                checked={configs.integrations?.enable_premium_features || false}
                onChange={(e) => handleSaveConfig('integrations', 'enable_premium_features', e.target.checked, 'boolean')}
                className="rounded"
              />
              <label htmlFor="enablePayments" className="text-sm font-medium">Enable Premium Features</label>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiMail className="text-2xl text-blue-600" />
            <h3 className="text-lg font-semibold">Email Service</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">Email Provider</label>
              <select
                value={configs.integrations?.email_provider || 'sendgrid'}
                onChange={(e) => handleSaveConfig('integrations', 'email_provider', e.target.value)}
                className="input-field"
              >
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="ses">AWS SES</option>
              </select>
            </div>

            <div>
              <label className="label">API Key</label>
              <input
                type="password"
                value={configs.integrations?.email_api_key || ''}
                onChange={(e) => setConfigs({
                  ...configs,
                  integrations: { ...configs.integrations, email_api_key: e.target.value }
                })}
                className="input-field"
                placeholder="Enter API key"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiMessageSquare className="text-2xl text-purple-600" />
            <h3 className="text-lg font-semibold">SMS Service</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">SMS Provider</label>
              <select
                value={configs.integrations?.sms_provider || 'twilio'}
                onChange={(e) => handleSaveConfig('integrations', 'sms_provider', e.target.value)}
                className="input-field"
              >
                <option value="twilio">Twilio</option>
                <option value="nexmo">Vonage (Nexmo)</option>
                <option value="sns">AWS SNS</option>
              </select>
            </div>

            <div>
              <label className="label">API Key</label>
              <input
                type="password"
                value={configs.integrations?.sms_api_key || ''}
                onChange={(e) => setConfigs({
                  ...configs,
                  integrations: { ...configs.integrations, sms_api_key: e.target.value }
                })}
                className="input-field"
                placeholder="Enter API key"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const updates = Object.entries(configs.integrations || {}).map(([key, value]) => ({
              category: 'integrations',
              key,
              value,
              dataType: typeof value
            }));
            handleBulkSave('integrations', updates);
          }}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <FiSave />
          <span>{saving ? 'Saving...' : 'Save All'}</span>
        </button>
      </div>
    </div>
  );

  const renderAPITab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">API Settings</h2>
          <p className="text-gray-600">Configure API rate limits and security</p>
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Rate Limit (requests/minute)</label>
              <input
                type="number"
                min="10"
                max="1000"
                value={configs.api?.rate_limit || 100}
                onChange={(e) => setConfigs({
                  ...configs,
                  api: { ...configs.api, rate_limit: parseInt(e.target.value) }
                })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Request Timeout (seconds)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={configs.api?.request_timeout || 30}
                onChange={(e) => setConfigs({
                  ...configs,
                  api: { ...configs.api, request_timeout: parseInt(e.target.value) }
                })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableApiDocs"
              checked={configs.api?.enable_api_documentation || false}
              onChange={(e) => handleSaveConfig('api', 'enable_api_documentation', e.target.checked, 'boolean')}
              className="rounded"
            />
            <label htmlFor="enableApiDocs" className="text-sm font-medium">Enable API Documentation</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableCors"
              checked={configs.api?.enable_cors || true}
              onChange={(e) => handleSaveConfig('api', 'enable_cors', e.target.checked, 'boolean')}
              className="rounded"
            />
            <label htmlFor="enableCors" className="text-sm font-medium">Enable CORS</label>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => {
              const updates = Object.entries(configs.api || {}).map(([key, value]) => ({
                category: 'api',
                key,
                value,
                dataType: typeof value
              }));
              handleBulkSave('api', updates);
            }}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save All'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
          <p className="text-gray-600">Configure general system settings</p>
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="label">System Name</label>
            <input
              type="text"
              value={configs.general?.system_name || 'WasteHub'}
              onChange={(e) => setConfigs({
                ...configs,
                general: { ...configs.general, system_name: e.target.value }
              })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">System Timezone</label>
            <select
              value={configs.general?.timezone || 'UTC'}
              onChange={(e) => handleSaveConfig('general', 'timezone', e.target.value)}
              className="input-field"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Asia/Colombo">Sri Lanka Time</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={configs.general?.maintenance_mode || false}
              onChange={(e) => handleSaveConfig('general', 'maintenance_mode', e.target.checked, 'boolean')}
              className="rounded"
            />
            <label htmlFor="maintenanceMode" className="text-sm font-medium text-red-600">
              Enable Maintenance Mode
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={handleInitializeDefaults}
            disabled={saving}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiRefreshCw />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={() => {
              const updates = Object.entries(configs.general || {}).map(([key, value]) => ({
                category: 'general',
                key,
                value,
                dataType: typeof value
              }));
              handleBulkSave('general', updates);
            }}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save All'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotificationsTab();
      case 'waste_thresholds':
        return renderWasteThresholdsTab();
      case 'rewards':
        return renderRewardsTab();
      case 'realtime':
        return renderRealtimeTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'mobile':
        return renderMobileTab();
      case 'integrations':
        return renderIntegrationsTab();
      case 'api':
        return renderAPITab();
      case 'general':
        return renderGeneralTab();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure all system settings and integrations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="text-lg" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default SystemSettings;
