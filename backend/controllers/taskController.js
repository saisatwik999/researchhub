const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * @route   POST /api/tasks
 * @desc    Create a new task for a project
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, title, description, assignedTo, deadline, priority } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only creator or team members can add tasks
    const isTeamMember = project.teamMembers.some(
      member => member.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isTeamMember && !isCreator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add tasks to this project' });
    }

    const task = new Task({
      projectId,
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      deadline: deadline || null,
      priority: priority || 'medium'
    });

    await task.save();
    await task.populate('assignedTo', 'name email');

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/tasks/project/:projectId
 * @desc    Get all tasks for a project
 * @access  Private
 */
const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/tasks/my
 * @desc    Get all tasks assigned to current user
 * @access  Private
 */
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('projectId', 'title status')
      .sort({ deadline: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task (status, assignment, etc.)
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, assignedTo, status, deadline, priority } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status) task.status = status;
    if (deadline !== undefined) task.deadline = deadline;
    if (priority) task.priority = priority;

    await task.save();
    await task.populate('assignedTo', 'name email role');

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTask,
  deleteTask
};
