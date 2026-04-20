const { validationResult } = require('express-validator');
const CollaborationRequest = require('../models/CollaborationRequest');
const Project = require('../models/Project');

/**
 * @route   POST /api/collaborations
 * @desc    Send a collaboration/join request for a project
 * @access  Private
 */
const sendRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ideaId, message } = req.body;

    // Check if project exists
    const project = await Project.findById(ideaId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Can't request to join own project
    if (project.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request to join your own project' });
    }

    // Check if already a team member
    if (project.teamMembers.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a team member' });
    }

    // Check team size limit
    if (project.teamMembers.length >= project.maxTeamSize) {
      return res.status(400).json({ message: 'Team is already full' });
    }

    // Check for existing pending request
    const existingRequest = await CollaborationRequest.findOne({
      ideaId,
      userId: req.user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this project' });
    }

    const request = new CollaborationRequest({
      ideaId,
      userId: req.user._id,
      message: message || ''
    });

    await request.save();
    await request.populate('userId', 'name email role skills');
    await request.populate('ideaId', 'title');

    res.status(201).json(request);
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Request already exists' });
    }
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/collaborations/project/:projectId
 * @desc    Get all collaboration requests for a project (only creator)
 * @access  Private
 */
const getProjectRequests = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only creator or admin can view requests
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const requests = await CollaborationRequest.find({ ideaId: req.params.projectId })
      .populate('userId', 'name email role skills interests')
      .populate('ideaId', 'title')
      .sort({ requestedAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get project requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/collaborations/my
 * @desc    Get all requests sent by current user
 * @access  Private
 */
const getMyRequests = async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({ userId: req.user._id })
      .populate('ideaId', 'title status createdBy')
      .sort({ requestedAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/collaborations/received
 * @desc    Get all requests received for user's projects
 * @access  Private
 */
const getReceivedRequests = async (req, res) => {
  try {
    // Find all projects created by user
    const projects = await Project.find({ createdBy: req.user._id });
    const projectIds = projects.map(p => p._id);

    const requests = await CollaborationRequest.find({ ideaId: { $in: projectIds } })
      .populate('userId', 'name email role skills interests')
      .populate('ideaId', 'title status')
      .sort({ requestedAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/collaborations/:id/approve
 * @desc    Approve a collaboration request (only project creator)
 * @access  Private
 */
const approveRequest = async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const project = await Project.findById(request.ideaId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project creator can approve
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can approve requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    // Check team size
    if (project.teamMembers.length >= project.maxTeamSize) {
      return res.status(400).json({ message: 'Team is already full' });
    }

    // Approve request and add user to team
    request.status = 'approved';
    await request.save();

    project.teamMembers.push(request.userId);
    await project.save();

    await request.populate('userId', 'name email role');
    await request.populate('ideaId', 'title');

    res.json({ message: 'Request approved', request });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/collaborations/:id/reject
 * @desc    Reject a collaboration request (only project creator)
 * @access  Private
 */
const rejectRequest = async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const project = await Project.findById(request.ideaId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can reject requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    request.status = 'rejected';
    await request.save();

    await request.populate('userId', 'name email role');
    await request.populate('ideaId', 'title');

    res.json({ message: 'Request rejected', request });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendRequest,
  getProjectRequests,
  getMyRequests,
  getReceivedRequests,
  approveRequest,
  rejectRequest
};
