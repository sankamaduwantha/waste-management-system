const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'first_collection',
      'perfect_day',
      'perfect_week',
      'speed_demon',
      'efficiency_master',
      'distance_warrior',
      'early_bird',
      'night_owl',
      'problem_solver',
      'quality_champion',
      'milestone_100',
      'milestone_500',
      'milestone_1000',
      'team_player',
      'rookie_of_month'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    value: Number, // Achievement specific value (e.g., collections count)
    metric: String  // What the value represents
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate achievements
achievementSchema.index({ collector: 1, type: 1 }, { unique: true });

// Static method to award achievement
achievementSchema.statics.awardAchievement = async function(collectorId, type, metadata = {}) {
  const achievementDefinitions = {
    first_collection: {
      title: 'First Collection',
      description: 'Completed your first waste collection',
      icon: '🎉'
    },
    perfect_day: {
      title: 'Perfect Day',
      description: '100% completion rate for the day',
      icon: '⭐'
    },
    perfect_week: {
      title: 'Perfect Week',
      description: '100% completion rate for entire week',
      icon: '🌟'
    },
    speed_demon: {
      title: 'Speed Demon',
      description: 'Completed route 30% faster than average',
      icon: '⚡'
    },
    efficiency_master: {
      title: 'Efficiency Master',
      description: 'Maintained 95%+ efficiency for a week',
      icon: '🎯'
    },
    distance_warrior: {
      title: 'Distance Warrior',
      description: 'Covered over 100km in a week',
      icon: '🚛'
    },
    early_bird: {
      title: 'Early Bird',
      description: 'Completed all morning routes on time for a week',
      icon: '🌅'
    },
    night_owl: {
      title: 'Night Owl',
      description: 'Completed evening routes perfectly',
      icon: '🌙'
    },
    problem_solver: {
      title: 'Problem Solver',
      description: 'Reported 10+ issues that were resolved',
      icon: '🔧'
    },
    quality_champion: {
      title: 'Quality Champion',
      description: 'Received 4.5+ rating for a month',
      icon: '👑'
    },
    milestone_100: {
      title: '100 Collections',
      description: 'Completed 100 waste collections',
      icon: '💯'
    },
    milestone_500: {
      title: '500 Collections',
      description: 'Completed 500 waste collections',
      icon: '🎖️'
    },
    milestone_1000: {
      title: '1000 Collections',
      description: 'Completed 1000 waste collections',
      icon: '🏅'
    },
    team_player: {
      title: 'Team Player',
      description: 'Helped other collectors complete their routes',
      icon: '🤝'
    },
    rookie_of_month: {
      title: 'Rookie of the Month',
      description: 'Best performing new collector',
      icon: '🌟'
    }
  };

  const definition = achievementDefinitions[type];
  if (!definition) {
    throw new Error('Invalid achievement type');
  }

  try {
    const achievement = await this.create({
      collector: collectorId,
      type,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      metadata
    });
    return achievement;
  } catch (error) {
    if (error.code === 11000) {
      // Achievement already exists
      return null;
    }
    throw error;
  }
};

module.exports = mongoose.model('Achievement', achievementSchema);
