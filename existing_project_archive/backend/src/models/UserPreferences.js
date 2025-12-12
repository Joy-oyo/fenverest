const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  interests: [{
    type: String
  }],
  preferredDifficulties: [{
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  maxDistance: {
    type: Number,
    default: 50 // in kilometers
  },
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    eventReminders: {
      type: Boolean,
      default: true
    },
    newMatches: {
      type: Boolean,
      default: true
    }
  },
  privacySettings: {
    showProfile: {
      type: Boolean,
      default: true
    },
    showInterests: {
      type: Boolean,
      default: true
    },
    showJoinedEvents: {
      type: Boolean,
      default: true
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
userPreferencesSchema.index({ location: '2dsphere' });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

module.exports = UserPreferences; 