import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLeaf, FaArrowLeft, FaRecycle, FaDollarSign, FaLightbulb } from 'react-icons/fa';
import usePlasticSuggestionsStore from '../../store/plasticSuggestionsStore';
import PlasticSuggestionCard from '../../components/plastic-suggestions/PlasticSuggestionCard';

const ResidentPlasticSuggestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const {
    suggestions,
    currentSuggestion,
    statistics,
    loading,
    fetchSuggestions,
    fetchSuggestionById,
    fetchStatistics,
    markAsImplemented,
    setFilters,
  } = usePlasticSuggestionsStore();

  // Redirect if ID is invalid
  useEffect(() => {
    if (id && (id === 'undefined' || id === 'null' || id === '')) {
      console.warn('Invalid suggestion ID in URL, redirecting to list view');
      navigate('/resident/plastic-suggestions', { replace: true });
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id && id !== 'undefined' && id !== 'null') {
      // Only fetch single suggestion if id is provided and valid
      fetchSuggestionById(id).catch((error) => {
        console.error('Error fetching suggestion:', error);
        // Redirect to list view if suggestion not found
        navigate('/resident/plastic-suggestions', { replace: true });
      });
    } else if (!id) {
      // Fetch all suggestions and statistics for list view
      fetchSuggestions();
      fetchStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only re-run when id changes

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilters({});
    } else {
      setFilters({ category });
    }
    fetchSuggestions();
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
    if (difficulty === 'all') {
      setFilters({});
    } else {
      setFilters({ difficulty });
    }
    fetchSuggestions();
  };

  const handleImplement = async (suggestionId) => {
    await markAsImplemented(suggestionId);
    // Refresh statistics after marking as implemented
    fetchStatistics();
  };

  const handleViewDetails = (suggestion) => {
    const suggestionId = typeof suggestion === 'string' ? suggestion : suggestion._id;
    
    // Validate ID before navigation
    if (!suggestionId || suggestionId === 'undefined' || suggestionId === 'null') {
      console.error('Invalid suggestion ID:', suggestionId);
      return;
    }
    
    navigate(`/resident/plastic-suggestions/${suggestionId}`);
  };

  const handleBack = () => {
    navigate('/resident/plastic-suggestions');
  };

  // If viewing single suggestion
  if (id && currentSuggestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="btn-secondary flex items-center">
            <FaArrowLeft className="mr-2" /> Back to All Tips
          </button>
        </div>

        <div className="card">
          <PlasticSuggestionCard
            suggestion={currentSuggestion}
            onImplement={handleImplement}
            showActions={true}
            compact={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FaLeaf className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plastic Reduction Tips</h1>
            <p className="text-gray-600">Discover ways to reduce plastic waste in your daily life</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-600 text-white">
                <FaLeaf className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Tips</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalSuggestions || 0}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-600 text-white">
                <FaRecycle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Plastic Saved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalPlasticSaved
                    ? `${(statistics.totalPlasticSaved / 1000).toFixed(1)} kg`
                    : '0 kg'}
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-600 text-white">
                <FaDollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Money Saved</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${statistics.totalMoneySaved?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              <option value="shopping">Shopping</option>
              <option value="kitchen">Kitchen</option>
              <option value="bathroom">Bathroom</option>
              <option value="transportation">Transportation</option>
              <option value="packaging">Packaging</option>
              <option value="food_storage">Food Storage</option>
              <option value="clothing">Clothing</option>
              <option value="office">Office</option>
              <option value="travel">Travel</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="label">Filter by Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
              className="input-field"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggestions Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="card text-center py-12">
          <FaLightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No suggestions found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions
            .filter(suggestion => suggestion && suggestion._id) // Filter out invalid suggestions
            .map((suggestion, index) => (
              <PlasticSuggestionCard
                key={suggestion._id}
                suggestion={suggestion}
                onImplement={handleImplement}
                onViewDetails={handleViewDetails}
                showActions={true}
                compact={true}
              />
            ))
          }
        </div>
      )}
    </div>
  );
};

export default ResidentPlasticSuggestions;
