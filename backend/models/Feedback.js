const mongoose = require('mongoose');

/**
 * Feedback Schema
 * Stores updates and feedback messages for projects (from mentors or team members)
 */
const feedbackSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    minlength: 1,
    maxlength: 5000
  },
  type: {
    type: String,
    enum: ['feedback', 'update', 'review'],
    default: 'feedback'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
