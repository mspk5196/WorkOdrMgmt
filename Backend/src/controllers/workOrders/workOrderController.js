const WorkOrder = require('../../models/WorkOrder');
const JobOrder = require('../../models/JobOrder');
const JobAssignment = require('../../models/JobAssignment');
const AuditLog = require('../../models/AuditLog');

// Create work order (Contractor applies to job)
exports.createWorkOrder = async (req, res) => {
  try {
    const { jobOrderId, proposal, proposedCost, estimatedDays } = req.body;
    const contractorId = req.user.id;

    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ success: false, message: 'Only contractors can create work orders' });
    }

    if (!jobOrderId || !proposal || !proposedCost || !estimatedDays) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if job order exists and is open
    const jobOrder = await JobOrder.findById(jobOrderId);
    if (!jobOrder) {
      return res.status(404).json({ success: false, message: 'Job order not found' });
    }

    if (jobOrder.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'This job is no longer open for applications' });
    }

    // Check if contractor already applied
    const existingApplication = await WorkOrder.checkExistingApplication(jobOrderId, contractorId);
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }

    const workOrderId = await WorkOrder.create({
      jobOrderId,
      contractorId,
      proposal,
      proposedCost,
      estimatedDays
    });

    // Update job order status to ASSIGNED if it's the first application
    await JobOrder.updateStatus(jobOrderId, 'ASSIGNED');

    // Audit log
    await AuditLog.create({
      tableName: 'work_orders',
      recordId: workOrderId,
      action: 'INSERT',
      newData: { jobOrderId, contractorId, proposal, proposedCost, estimatedDays },
      performedBy: contractorId,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { id: workOrderId }
    });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create work order', error: error.message });
  }
};

// Get all work orders for the logged-in contractor
exports.getMyWorkOrders = async (req, res) => {
  try {
    const contractorId = req.user.id;

    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ success: false, message: 'Only contractors can access this' });
    }

    const workOrders = await WorkOrder.getByContractorId(contractorId);

    res.json({
      success: true,
      data: workOrders
    });
  } catch (error) {
    console.error('Get my work orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch work orders', error: error.message });
  }
};

// Get all applications for a specific job order (Agent only)
exports.getApplicationsForJob = async (req, res) => {
  try {
    const { jobOrderId } = req.params;
    const agentId = req.user.id;

    if (req.user.role !== 'AGENT') {
      return res.status(403).json({ success: false, message: 'Only agents can view applications' });
    }

    // Verify job order belongs to agent
    const jobOrder = await JobOrder.findById(jobOrderId);
    if (!jobOrder) {
      return res.status(404).json({ success: false, message: 'Job order not found' });
    }

    if (jobOrder.agent_id !== agentId) {
      return res.status(403).json({ success: false, message: 'You can only view applications for your own job orders' });
    }

    const applications = await WorkOrder.getByJobOrderId(jobOrderId);

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
};

// Approve work order and assign job (Agent only)
exports.approveWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.user.id;

    if (req.user.role !== 'AGENT') {
      return res.status(403).json({ success: false, message: 'Only agents can approve work orders' });
    }

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    // Verify job order belongs to agent
    const jobOrder = await JobOrder.findById(workOrder.job_order_id);
    if (jobOrder.agent_id !== agentId) {
      return res.status(403).json({ success: false, message: 'You can only approve applications for your own job orders' });
    }

    // Check if job is already assigned
    const existingAssignment = await JobAssignment.findByJobOrderId(workOrder.job_order_id);
    if (existingAssignment) {
      return res.status(400).json({ success: false, message: 'This job has already been assigned' });
    }

    // Approve this work order
    await WorkOrder.updateStatus(id, 'APPROVED');

    // Create job assignment
    const assignmentId = await JobAssignment.create({
      jobOrderId: workOrder.job_order_id,
      workOrderId: id,
      contractorId: workOrder.contractor_id
    });

    // Update job order status to IN_PROGRESS
    await JobOrder.updateStatus(workOrder.job_order_id, 'IN_PROGRESS');

    // Reject all other pending applications for this job
    const allApplications = await WorkOrder.getByJobOrderId(workOrder.job_order_id);
    for (const app of allApplications) {
      if (app.id !== parseInt(id) && app.status === 'PENDING') {
        await WorkOrder.updateStatus(app.id, 'REJECTED');
      }
    }

    // Audit logs
    await AuditLog.create({
      tableName: 'work_orders',
      recordId: id,
      action: 'UPDATE',
      oldData: { status: 'PENDING' },
      newData: { status: 'APPROVED' },
      performedBy: agentId,
      ipAddress: req.ip
    });

    await AuditLog.create({
      tableName: 'job_assignments',
      recordId: assignmentId,
      action: 'INSERT',
      newData: { jobOrderId: workOrder.job_order_id, workOrderId: id, contractorId: workOrder.contractor_id },
      performedBy: agentId,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Work order approved and job assigned successfully',
      data: { assignmentId }
    });
  } catch (error) {
    console.error('Approve work order error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve work order', error: error.message });
  }
};

// Reject work order (Agent only)
exports.rejectWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.user.id;

    if (req.user.role !== 'AGENT') {
      return res.status(403).json({ success: false, message: 'Only agents can reject work orders' });
    }

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    // Verify job order belongs to agent
    const jobOrder = await JobOrder.findById(workOrder.job_order_id);
    if (jobOrder.agent_id !== agentId) {
      return res.status(403).json({ success: false, message: 'You can only reject applications for your own job orders' });
    }

    await WorkOrder.updateStatus(id, 'REJECTED');

    // Audit log
    await AuditLog.create({
      tableName: 'work_orders',
      recordId: id,
      action: 'UPDATE',
      oldData: { status: workOrder.status },
      newData: { status: 'REJECTED' },
      performedBy: agentId,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Work order rejected successfully'
    });
  } catch (error) {
    console.error('Reject work order error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject work order', error: error.message });
  }
};
