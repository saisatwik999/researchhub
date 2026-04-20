const { validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Project = require('../models/Project');

/**
 * @route   POST /api/feedback
 * @desc    Add feedback/update to a project
 * @access  Private (mentors, team members, admin)
 */
const addFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, message, type } = req.body;

    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const feedback = new Feedback({
      projectId,
      userId: req.user._id,
      message,
      type: type || 'feedback'
    });

    await feedback.save();
    await feedback.populate('userId', 'name email role');

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/feedback/project/:projectId
 * @desc    Get all feedback for a project
 * @access  Private
 */
const getProjectFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ projectId: req.params.projectId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/feedback/my
 * @desc    Get all feedback given by current user (useful for mentors)
 * @access  Private
 */
const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user._id })
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/feedback/:id
 * @desc    Delete a feedback entry (only author or admin)
 * @access  Private
 */
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addFeedback,
  getProjectFeedback,
  getMyFeedback,
  deleteFeedback
};
