const Invoice = require('../../models/Invoice');
const JobAssignment = require('../../models/JobAssignment');
const JobOrder = require('../../models/JobOrder');
const AuditLog = require('../../models/AuditLog');

// Create invoice (Contractor only, for their completed work)
exports.createInvoice = async (req, res) => {
  try {
    const { jobAssignmentId, amount, invoiceDate } = req.body;
    const contractorId = req.user.id;

    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ success: false, message: 'Only contractors can create invoices' });
    }

    if (!jobAssignmentId || !amount || !invoiceDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Verify assignment belongs to contractor
    const assignment = await JobAssignment.findById(jobAssignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Job assignment not found' });
    }

    if (assignment.contractor_id !== contractorId) {
      return res.status(403).json({ success: false, message: 'You can only create invoices for your own assignments' });
    }

    const invoiceId = await Invoice.create({
      jobAssignmentId,
      contractorId,
      amount,
      invoiceDate
    });

    // Update job order status to COMPLETED
    await JobOrder.updateStatus(assignment.job_order_id, 'COMPLETED');

    // Audit log
    await AuditLog.create({
      tableName: 'invoices',
      recordId: invoiceId,
      action: 'INSERT',
      newData: { jobAssignmentId, contractorId, amount, invoiceDate },
      performedBy: contractorId,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { id: invoiceId }
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice', error: error.message });
  }
};

// Get all invoices for logged-in user (agent or contractor)
exports.getMyInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let invoices;
    if (role === 'AGENT') {
      invoices = await Invoice.getByAgentId(userId);
    } else if (role === 'CONTRACTOR') {
      invoices = await Invoice.getByContractorId(userId);
    } else {
      return res.status(403).json({ success: false, message: 'Invalid role' });
    }

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get my invoices error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: error.message });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Check access
    const hasAccess = 
      invoice.contractor_id === userId ||
      (req.user.role === 'AGENT'); // Agents can view invoices for their jobs

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice', error: error.message });
  }
};

// Update invoice status (Agent only - approve/reject)
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const agentId = req.user.id;

    if (req.user.role !== 'AGENT') {
      return res.status(403).json({ success: false, message: 'Only agents can update invoice status' });
    }

    if (!['APPROVED', 'REJECTED', 'PAID'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await Invoice.updateStatus(id, status);

    // Audit log
    await AuditLog.create({
      tableName: 'invoices',
      recordId: id,
      action: 'UPDATE',
      oldData: { status: invoice.status },
      newData: { status },
      performedBy: agentId,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Invoice status updated successfully'
    });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update invoice status', error: error.message });
  }
};

// Get invoices for a specific job assignment
exports.getInvoicesByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;

    const assignment = await JobAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Check access
    if (req.user.role === 'CONTRACTOR' && assignment.contractor_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const invoices = await Invoice.getByJobAssignmentId(assignmentId);

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get invoices by assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: error.message });
  }
};
