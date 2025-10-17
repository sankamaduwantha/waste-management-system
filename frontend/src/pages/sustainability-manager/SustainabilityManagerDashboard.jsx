/**
 * @fileoverview Sustainability Manager Dashboard
 * @description Main dashboard for sustainability managers to manage plastic reduction suggestions
 * @author Waste Management System
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FaPlus, FaList, FaChartLine, FaLeaf } from 'react-icons/fa';
import usePlasticSuggestionsStore from '../../store/plasticSuggestionsStore';
import PlasticSuggestionList from '../../components/plastic-suggestions/PlasticSuggestionList';
import PlasticSuggestionForm from '../../components/plastic-suggestions/PlasticSuggestionForm';
import PlasticSuggestionDetail from './PlasticSuggestionDetail';
import './SustainabilityManagerDashboard.css';

const SustainabilityManagerDashboard = () => {
  const navigate = useNavigate();
  const { statistics, fetchStatistics } = usePlasticSuggestionsStore();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
        <Icon />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="sustainability-manager-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <FaLeaf className="title-icon" />
            Plastic Reduction Management
          </h1>
          <p className="dashboard-subtitle">
            Create and manage suggestions to help residents reduce plastic waste
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/sustainability-manager/plastic-suggestions/create')}
          >
            <FaPlus /> Create New Suggestion
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="stats-grid">
          <StatCard
            icon={FaList}
            title="Total Suggestions"
            value={statistics.totalSuggestions || 0}
            subtitle="Active suggestions"
            color="#2196F3"
          />
          <StatCard
            icon={FaLeaf}
            title="Plastic Saved"
            value={statistics.totalPlasticSaved || '0g'}
            subtitle="Total potential savings"
            color="#4CAF50"
          />
          <StatCard
            icon={FaChartLine}
            title="Total Implementations"
            value={statistics.totalImplementations || 0}
            subtitle="By all residents"
            color="#FF9800"
          />
          <StatCard
            icon={FaChartLine}
            title="Money Saved"
            value={`$${statistics.totalMoneySaved || 0}`}
            subtitle="Total potential savings"
            color="#9C27B0"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="quick-action-btn"
          onClick={() => navigate('/sustainability-manager/plastic-suggestions')}
        >
          <FaList />
          <span>View All Suggestions</span>
        </button>
        <button
          className="quick-action-btn"
          onClick={() => navigate('/sustainability-manager/plastic-suggestions/create')}
        >
          <FaPlus />
          <span>Create New</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        <Routes>
          <Route index element={<Navigate to="plastic-suggestions" replace />} />
          <Route path="plastic-suggestions" element={<PlasticSuggestionList isAdmin={true} />} />
          <Route path="plastic-suggestions/create" element={<PlasticSuggestionForm />} />
          <Route path="plastic-suggestions/:id" element={<PlasticSuggestionDetail />} />
          <Route path="plastic-suggestions/edit/:id" element={<PlasticSuggestionForm />} />
        </Routes>
      </div>
    </div>
  );
};

export default SustainabilityManagerDashboard;
