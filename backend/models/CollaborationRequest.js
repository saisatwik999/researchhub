const mongoose = require('mongoose');

/**
 * CollaborationRequest Schema
 * Tracks join requests from users to projects
 */
const collaborationRequestSchema = new mongoose.Schema({
  ideaId: {
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
    default: '',
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate requests from same user to same project
collaborationRequestSchema.index({ ideaId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CollaborationRequest', collaborationRequestSchema);
