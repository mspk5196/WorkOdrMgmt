const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrders/workOrderController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Create work order (Contractor applies to job)
router.post('/', workOrderController.createWorkOrder);

// Get my work orders (Contractor)
router.get('/my-applications', workOrderController.getMyWorkOrders);

// Get all applications for a specific job (Agent)
router.get('/job/:jobOrderId', workOrderController.getApplicationsForJob);

// Approve work order and assign job (Agent)
router.post('/:id/approve', workOrderController.approveWorkOrder);

// Reject work order (Agent)
router.post('/:id/reject', workOrderController.rejectWorkOrder);

module.exports = router;
