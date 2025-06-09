const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  action: {
    type: String,
    enum: ['like', 'pass'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate swipes
swipeSchema.index({ user: 1, event: 1 }, { unique: true });

const Swipe = mongoose.model('Swipe', swipeSchema);

module.exports = Swipe; 