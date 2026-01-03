const express = require('express');
const router = express.Router();
const workPlanController = require('../controllers/workPlans/workPlanController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Create work plan (Contractor)
router.post('/', workPlanController.createWorkPlan);

// Get my work plans (Contractor)
router.get('/my-plans', workPlanController.getMyWorkPlans);

// Get work plan by assignment ID
router.get('/assignment/:assignmentId', workPlanController.getWorkPlanByAssignment);

// Update work plan (Contractor)
router.put('/:id', workPlanController.updateWorkPlan);

module.exports = router;
