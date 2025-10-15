import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaArrowRight, FaLightbulb } from 'react-icons/fa';
import usePlasticSuggestionsStore from '../../store/plasticSuggestionsStore';

const PlasticSuggestionsWidget = () => {
  const { topSuggestions, loading, fetchTopSuggestions } = usePlasticSuggestionsStore();

  useEffect(() => {
    fetchTopSuggestions(3); // Fetch top 3 suggestions
  }, [fetchTopSuggestions]);

  const getCategoryColor = (category) => {
    const colors = {
      shopping: 'bg-purple-100 text-purple-700',
      kitchen: 'bg-orange-100 text-orange-700',
      bathroom: 'bg-blue-100 text-blue-700',
      transportation: 'bg-green-100 text-green-700',
      packaging: 'bg-yellow-100 text-yellow-700',
      food_storage: 'bg-pink-100 text-pink-700',
      clothing: 'bg-indigo-100 text-indigo-700',
      office: 'bg-gray-100 text-gray-700',
      travel: 'bg-teal-100 text-teal-700',
      general: 'bg-red-100 text-red-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-600',
      medium: 'text-yellow-600',
      hard: 'text-red-600',
    };
    return colors[difficulty] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaLeaf className="h-6 w-6 text-green-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Reduce Plastic Usage</h2>
        </div>
        <Link 
          to="/resident/plastic-suggestions" 
          className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium"
        >
          View All <FaArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>

      {topSuggestions.length === 0 ? (
        <div className="text-center py-8">
          <FaLightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No suggestions available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topSuggestions.map((suggestion) => (
            <div
              key={suggestion._id}
              className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        suggestion.category
                      )}`}
                    >
                      {suggestion.category.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getDifficultyColor(suggestion.difficulty)}`}>
                      {suggestion.difficulty}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium text-green-600">
                        {suggestion.plasticSavedGrams >= 1000
                          ? `${(suggestion.plasticSavedGrams / 1000).toFixed(1)} kg`
                          : `${suggestion.plasticSavedGrams}g`}
                      </span>
                      <span className="ml-1">plastic saved</span>
                    </div>
                    {suggestion.moneySaved > 0 && (
                      <div className="flex items-center">
                        <span className="font-medium text-blue-600">${suggestion.moneySaved}</span>
                        <span className="ml-1">saved</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="font-medium text-purple-600">
                        {suggestion.impactScore?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="ml-1">impact score</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Link
                  to={`/resident/plastic-suggestions/${suggestion._id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  Learn More <FaArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          to="/resident/plastic-suggestions"
          className="btn-primary w-full flex items-center justify-center"
        >
          <FaLeaf className="mr-2" />
          Explore All Tips
        </Link>
      </div>
    </div>
  );
};

export default PlasticSuggestionsWidget;
