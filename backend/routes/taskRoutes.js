const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/tasks
router.post(
  '/',
  auth,
  [
    body('projectId', 'Project ID is required').notEmpty().isMongoId(),
    body('title', 'Task title is required').trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isLength({ max: 2000 }),
    body('assignedTo').optional().isMongoId(),
    body('deadline').optional().isISO8601(),
    body('priority').optional().isIn(['low', 'medium', 'high'])
  ],
  createTask
);

// @route   GET /api/tasks/my
router.get('/my', auth, getMyTasks);

// @route   GET /api/tasks/project/:projectId
router.get('/project/:projectId', auth, getProjectTasks);

// @route   PUT /api/tasks/:id
router.put('/:id', auth, updateTask);

// @route   DELETE /api/tasks/:id
router.delete('/:id', auth, deleteTask);

module.exports = router;
