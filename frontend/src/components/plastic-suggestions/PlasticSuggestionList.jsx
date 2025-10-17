/**
 * @fileoverview Plastic Reduction Suggestions List Component
 * @description Main component for displaying and filtering plastic reduction suggestions
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Container/Presentational Pattern: Manages state and data fetching
 * - Observer Pattern: Subscribes to Zustand store
 * - Strategy Pattern: Different filter strategies
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { FaFilter, FaSearch, FaTimes, FaSort } from 'react-icons/fa';
import usePlasticSuggestionsStore from '../../store/plasticSuggestionsStore';
import PlasticSuggestionCard from './PlasticSuggestionCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './PlasticSuggestionList.css';

/**
 * Filter categories
 */
const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'food_storage', label: 'Food Storage' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'office', label: 'Office' },
  { value: 'travel', label: 'Travel' },
  { value: 'general', label: 'General' }
];

/**
 * Difficulty levels
 */
const DIFFICULTIES = [
  { value: '', label: 'All Difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
];

/**
 * Sort options
 */
const SORT_OPTIONS = [
  { value: '-impactScore', label: 'Highest Impact' },
  { value: 'impactScore', label: 'Lowest Impact' },
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-plasticSavedGrams', label: 'Most Plastic Saved' },
  { value: '-moneySaved', label: 'Most Money Saved' }
];

const PlasticSuggestionList = ({ isAdmin = false }) => {
  // Zustand store
  const {
    suggestions,
    loading,
    error,
    pagination,
    filters,
    fetchSuggestions,
    setFilters,
    clearFilters,
    setPage,
    markAsImplemented,
    clearError,
    openModal
  } = usePlasticSuggestionsStore();

  // Navigation
  const navigate = useNavigate();

  // Local state for search input
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('-impactScore');

  /**
   * Fetch suggestions on mount and filter changes
   */
  useEffect(() => {
    fetchSuggestions({ sortBy });
  }, []);

  /**
   * Handle filter change
   */
  const handleFilterChange = (filterName, value) => {
    setFilters({ [filterName]: value || null });
    setPage(1); // Reset to first page
    fetchSuggestions({ [filterName]: value || null, page: 1, sortBy });
  };

  /**
   * Handle search
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      setFilters({ search: searchInput.trim() });
      fetchSuggestions({ search: searchInput.trim(), page: 1, sortBy });
    } else {
      toast.warning('Please enter at least 2 characters to search');
    }
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (value) => {
    setSortBy(value);
    fetchSuggestions({ sortBy: value, page: 1 });
  };

  /**
   * Handle clear all filters
   */
  const handleClearFilters = () => {
    clearFilters();
    setSearchInput('');
    setSortBy('-impactScore');
    fetchSuggestions({ sortBy: '-impactScore', page: 1 });
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchSuggestions({ page: newPage, sortBy });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle implement suggestion
   */
  const handleImplement = async (id) => {
    try {
      await markAsImplemented(id);
      toast.success('🎉 Great job! Suggestion marked as implemented!');
    } catch (err) {
      toast.error('Failed to mark as implemented');
    }
  };

  /**
   * Handle view details
   */
  const handleViewDetails = (suggestion) => {
    if (isAdmin) {
      // Navigate to detail page for sustainability manager
      const suggestionId = suggestion._id || suggestion.id;
      navigate(`/sustainability-manager/plastic-suggestions/${suggestionId}`);
    } else {
      // Open modal for residents
      openModal('view', suggestion);
    }
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = () => {
    return filters.category || filters.difficulty || filters.minImpactScore || 
           filters.search || (filters.tags && filters.tags.length > 0);
  };

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <div className="plastic-suggestions-list">
      {/* Header */}
      <div className="list-header">
        <div className="header-content">
          <h1 className="list-title">Plastic Reduction Suggestions</h1>
          <p className="list-subtitle">
            Discover practical ways to reduce plastic waste and save money
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-bar">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search suggestions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  if (filters.search) {
                    handleFilterChange('search', '');
                  }
                }}
                className="clear-search-btn"
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="filter-toggle-btn"
          aria-expanded={showFilters}
        >
          <FaFilter className="mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters() && (
            <span className="active-filters-badge">{Object.keys(filters).filter(k => filters[k]).length}</span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Category Filter */}
            <div className="filter-group">
              <label htmlFor="category-filter">Category</label>
              <select
                id="category-filter"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="filter-group">
              <label htmlFor="difficulty-filter">Difficulty</label>
              <select
                id="difficulty-filter"
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="filter-select"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
            </div>

            {/* Impact Score Filter */}
            <div className="filter-group">
              <label htmlFor="impact-filter">
                Minimum Impact Score: {filters.minImpactScore || 0}
              </label>
              <input
                type="range"
                id="impact-filter"
                min="0"
                max="100"
                step="10"
                value={filters.minImpactScore || 0}
                onChange={(e) => handleFilterChange('minImpactScore', parseInt(e.target.value))}
                className="filter-range"
              />
            </div>

            {/* Sort By */}
            <div className="filter-group">
              <label htmlFor="sort-filter">
                <FaSort className="mr-2" />
                Sort By
              </label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="filter-select"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters() && (
            <button
              onClick={handleClearFilters}
              className="clear-filters-btn"
            >
              <FaTimes className="mr-2" />
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Results Info */}
      <div className="results-info">
        <p>
          Showing {suggestions.length} of {pagination.total} suggestions
          {filters.category && ` in ${filters.category}`}
          {filters.difficulty && ` (${filters.difficulty})`}
        </p>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Empty State */}
      {!loading && suggestions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No suggestions found</h3>
          <p>Try adjusting your filters or search terms</p>
          {hasActiveFilters() && (
            <button onClick={handleClearFilters} className="btn-primary">
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Suggestions Grid */}
      {!loading && suggestions.length > 0 && (
        <div className="suggestions-grid">
          {suggestions.map((suggestion) => {
            const key = suggestion._id || suggestion.id || Math.random().toString();
            return (
              <PlasticSuggestionCard
                key={key}
                suggestion={suggestion}
                onImplement={handleImplement}
                onViewDetails={handleViewDetails}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          <div className="pagination-pages">
            {[...Array(pagination.pages)].map((_, index) => {
              const page = index + 1;
              // Show first 2, last 2, current, and adjacent pages
              if (
                page === 1 ||
                page === pagination.pages ||
                page === pagination.page ||
                Math.abs(page - pagination.page) === 1
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-number ${page === pagination.page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.page - 2 ||
                page === pagination.page + 2
              ) {
                return <span key={page} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasMore}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

PlasticSuggestionList.propTypes = {
  isAdmin: PropTypes.bool
};

export default PlasticSuggestionList;
