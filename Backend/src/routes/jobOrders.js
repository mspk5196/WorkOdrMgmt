const express = require('express');
const router = express.Router();
const jobOrderController = require('../controllers/jobOrders/jobOrderController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Create job order (Agent only)
router.post('/', jobOrderController.createJobOrder);

// Get my job orders (Agent)
router.get('/my-jobs', jobOrderController.getMyJobOrders);

// Get all open job orders (Contractor)
router.get('/open', jobOrderController.getAllOpenJobOrders);

// Search job orders (Contractor)
router.get('/search', jobOrderController.searchJobOrders);

// Get single job order by ID
router.get('/:id', jobOrderController.getJobOrderById);

// Update job order (Agent)
router.put('/:id', jobOrderController.updateJobOrder);

// Delete job order (Agent)
router.delete('/:id', jobOrderController.deleteJobOrder);

module.exports = router;
