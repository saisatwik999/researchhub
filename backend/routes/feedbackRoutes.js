const express = require('express');
const { body } = require('express-validator');
const {
  addFeedback,
  getProjectFeedback,
  getMyFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/feedback
router.post(
  '/',
  auth,
  [
    body('projectId', 'Project ID is required').notEmpty().isMongoId(),
    body('message', 'Feedback message is required').trim().isLength({ min: 1, max: 5000 }),
    body('type').optional().isIn(['feedback', 'update', 'review'])
  ],
  addFeedback
);

// @route   GET /api/feedback/my
router.get('/my', auth, getMyFeedback);

// @route   GET /api/feedback/project/:projectId
router.get('/project/:projectId', auth, getProjectFeedback);

// @route   DELETE /api/feedback/:id
router.delete('/:id', auth, deleteFeedback);

module.exports = router;
