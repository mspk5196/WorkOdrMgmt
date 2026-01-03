const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignments/assignmentController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get all assignments for logged-in user
router.get('/my-assignments', assignmentController.getMyAssignments);

// Get assignment by ID
router.get('/:id', assignmentController.getAssignmentById);

module.exports = router;
