const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  passes: {
    type: Number,
    default: 0
  },
  joins: {
    type: Number,
    default: 0
  },
  userDemographics: {
    beginner: {
      type: Number,
      default: 0
    },
    intermediate: {
      type: Number,
      default: 0
    },
    advanced: {
      type: Number,
      default: 0
    }
  },
  dailyStats: [{
    date: {
      type: Date,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    passes: {
      type: Number,
      default: 0
    },
    joins: {
      type: Number,
      default: 0
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
analyticsSchema.index({ event: 1, 'dailyStats.date': 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics; 