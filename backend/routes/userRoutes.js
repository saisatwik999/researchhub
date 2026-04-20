const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getPlatformStats
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// @route   GET /api/users/profile
router.get('/profile', auth, getProfile);

// @route   PUT /api/users/profile
router.put(
  '/profile',
  auth,
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('skills').optional().isArray(),
    body('interests').optional().isArray(),
    body('bio').optional().isLength({ max: 500 })
  ],
  updateProfile
);

// @route   GET /api/users/stats/overview (Admin)
router.get('/stats/overview', auth, roleAuth('admin'), getPlatformStats);

// @route   GET /api/users (Admin)
router.get('/', auth, roleAuth('admin'), getAllUsers);

// @route   GET /api/users/:id
router.get('/:id', auth, getUserById);

// @route   PUT /api/users/:id/role (Admin)
router.put('/:id/role', auth, roleAuth('admin'), updateUserRole);

// @route   DELETE /api/users/:id (Admin)
router.delete('/:id', auth, roleAuth('admin'), deleteUser);

module.exports = router;
