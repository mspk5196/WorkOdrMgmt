const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoices/invoiceController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Create invoice (Contractor)
router.post('/', invoiceController.createInvoice);

// Get my invoices (Agent or Contractor)
router.get('/my-invoices', invoiceController.getMyInvoices);

// Get invoices by assignment
router.get('/assignment/:assignmentId', invoiceController.getInvoicesByAssignment);

// Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// Update invoice status (Agent)
router.put('/:id/status', invoiceController.updateInvoiceStatus);

module.exports = router;
