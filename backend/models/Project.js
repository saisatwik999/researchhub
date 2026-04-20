const mongoose = require('mongoose');

/**
 * Project (Idea) Schema
 * Represents a research idea/project with team members and status tracking
 */
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: 10,
    maxlength: 5000
  },
  tags: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed'],
    default: 'open'
  },
  category: {
    type: String,
    default: 'General'
  },
  maxTeamSize: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
});

// Text index for search functionality
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Project', projectSchema);
