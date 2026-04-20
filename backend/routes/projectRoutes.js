const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getProjects,
  getMyProjects,
  getJoinedProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats
} = require('../controllers/projectController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// @route   GET /api/projects/stats/overview (Admin)
router.get('/stats/overview', auth, roleAuth('admin'), getProjectStats);

// @route   GET /api/projects/my
router.get('/my', auth, getMyProjects);

// @route   GET /api/projects/joined
router.get('/joined', auth, getJoinedProjects);

// @route   GET /api/projects
router.get('/', auth, getProjects);

// @route   POST /api/projects
router.post(
  '/',
  auth,
  [
    body('title', 'Title is required (3-200 chars)').trim().isLength({ min: 3, max: 200 }),
    body('description', 'Description is required (min 10 chars)').trim().isLength({ min: 10 }),
    body('tags').optional().isArray(),
    body('category').optional().trim(),
    body('maxTeamSize').optional().isInt({ min: 1, max: 20 })
  ],
  createProject
);

// @route   GET /api/projects/:id
router.get('/:id', auth, getProjectById);

// @route   PUT /api/projects/:id
router.put('/:id', auth, updateProject);

// @route   DELETE /api/projects/:id
router.delete('/:id', auth, deleteProject);

module.exports = router;
