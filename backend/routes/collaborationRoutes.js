const express = require('express');
const { body } = require('express-validator');
const {
  sendRequest,
  getProjectRequests,
  getMyRequests,
  getReceivedRequests,
  approveRequest,
  rejectRequest
} = require('../controllers/collaborationController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/collaborations
router.post(
  '/',
  auth,
  [
    body('ideaId', 'Project ID is required').notEmpty().isMongoId(),
    body('message').optional().isLength({ max: 1000 })
  ],
  sendRequest
);

// @route   GET /api/collaborations/my
router.get('/my', auth, getMyRequests);

// @route   GET /api/collaborations/received
router.get('/received', auth, getReceivedRequests);

// @route   GET /api/collaborations/project/:projectId
router.get('/project/:projectId', auth, getProjectRequests);

// @route   PUT /api/collaborations/:id/approve
router.put('/:id/approve', auth, approveRequest);

// @route   PUT /api/collaborations/:id/reject
router.put('/:id/reject', auth, rejectRequest);

module.exports = router;
