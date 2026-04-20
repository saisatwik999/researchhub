const { validationResult } = require('express-validator');
const Project = require('../models/Project');

/**
 * @route   POST /api/projects
 * @desc    Create a new project / idea
 * @access  Private
 */
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tags, category, maxTeamSize } = req.body;

    const project = new Project({
      title,
      description,
      tags: tags || [],
      category: category || 'General',
      maxTeamSize: maxTeamSize || 5,
      createdBy: req.user._id,
      teamMembers: [req.user._id] // Creator is automatically a team member
    });

    await project.save();

    // Populate creator info before sending response
    await project.populate('createdBy', 'name email role');
    await project.populate('teamMembers', 'name email role');

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects with optional filters
 * @access  Private
 */
const getProjects = async (req, res) => {
  try {
    const { status, search, tags, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Project.countDocuments(filter);

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email role')
      .populate('teamMembers', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      projects,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/projects/my
 * @desc    Get projects created by current user
 * @access  Private
 */
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email role')
      .populate('teamMembers', 'name email role')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/projects/joined
 * @desc    Get projects the user is a member of
 * @access  Private
 */
const getJoinedProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      teamMembers: req.user._id,
      createdBy: { $ne: req.user._id }
    })
      .populate('createdBy', 'name email role')
      .populate('teamMembers', 'name email role')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get joined projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID
 * @access  Private
 */
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role skills')
      .populate('teamMembers', 'name email role skills');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project (only creator)
 * @access  Private
 */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only creator or admin can update
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const { title, description, tags, status, category, maxTeamSize } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (tags) project.tags = tags;
    if (status) project.status = status;
    if (category) project.category = category;
    if (maxTeamSize) project.maxTeamSize = maxTeamSize;

    await project.save();
    await project.populate('createdBy', 'name email role');
    await project.populate('teamMembers', 'name email role');

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project (only creator or admin)
 * @access  Private
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/projects/stats/overview
 * @desc    Get project statistics (Admin)
 * @access  Private/Admin
 */
const getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const openProjects = await Project.countDocuments({ status: 'open' });
    const inProgress = await Project.countDocuments({ status: 'in-progress' });
    const completed = await Project.countDocuments({ status: 'completed' });

    res.json({ totalProjects, openProjects, inProgress, completed });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getMyProjects,
  getJoinedProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats
};
