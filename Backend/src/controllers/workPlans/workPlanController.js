const WorkPlan = require('../../models/WorkPlan');
const JobAssignment = require('../../models/JobAssignment');
const AuditLog = require('../../models/AuditLog');

// Create work plan (Contractor only, for their assigned job)
exports.createWorkPlan = async (req, res) => {
  try {
    const { jobAssignmentId, planDetails, startDate, expectedEndDate } = req.body;
    const contractorId = req.user.id;

    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ success: false, message: 'Only contractors can create work plans' });
    }

    if (!jobAssignmentId || !planDetails) {
      return res.status(400).json({ success: false, message: 'Job assignment ID and plan details are required' });
    }

    // Verify assignment belongs to contractor
    const assignment = await JobAssignment.findById(jobAssignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Job assignment not found' });
    }

    if (assignment.contractor_id !== contractorId) {
      return res.status(403).json({ success: false, message: 'You can only create work plans for your own assignments' });
    }

    // Check if work plan already exists
    const existingPlan = await WorkPlan.findByJobAssignmentId(jobAssignmentId);
    if (existingPlan) {
      return res.status(400).json({ success: false, message: 'Work plan already exists for this assignment' });
    }

    const workPlanId = await WorkPlan.create({
      jobAssignmentId,
      planDetails,
      startDate: startDate || null,
      expectedEndDate: expectedEndDate || null
    });

    // Audit log
    await AuditLog.create({
      tableName: 'work_plans',
      recordId: workPlanId,
      action: 'INSERT',
      newData: { jobAssignmentId, planDetails, startDate, expectedEndDate },
      performedBy: contractorId,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Work plan created successfully',
      data: { id: workPlanId }
    });
  } catch (error) {
    console.error('Create work plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to create work plan', error: error.message });
  }
};

// Get work plan by assignment ID
exports.getWorkPlanByAssignment = async (req, res) => {
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

    const workPlan = await WorkPlan.findByJobAssignmentId(assignmentId);

    if (!workPlan) {
      return res.status(404).json({ success: false, message: 'Work plan not found' });
    }

    res.json({
      success: true,
      data: workPlan
    });
  } catch (error) {
    console.error('Get work plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch work plan', error: error.message });
  }
};

// Get all work plans for logged-in contractor
exports.getMyWorkPlans = async (req, res) => {
  try {
    const contractorId = req.user.id;

    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ success: false, message: 'Only contractors can access this' });
    }

    const workPlans = await WorkPlan.getByContractorId(contractorId);

    res.json({
      success: true,
      data: workPlans
    });
  } catch (error) {
    console.error('Get my work plans error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch work plans', error: error.message });
  }
};

// Update work plan
exports.updateWorkPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planDetails, startDate, expectedEndDate } = req.body;
    const contractorId = req.user.id;

    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ success: false, message: 'Only contractors can update work plans' });
    }

    const workPlan = await WorkPlan.findById(id);
    if (!workPlan) {
      return res.status(404).json({ success: false, message: 'Work plan not found' });
    }

    // Verify contractor owns this work plan
    if (workPlan.contractor_id !== contractorId) {
      return res.status(403).json({ success: false, message: 'You can only update your own work plans' });
    }

    const updateData = {};
    if (planDetails) updateData.plan_details = planDetails;
    if (startDate) updateData.start_date = startDate;
    if (expectedEndDate) updateData.expected_end_date = expectedEndDate;

    await WorkPlan.update(id, updateData);

    // Audit log
    await AuditLog.create({
      tableName: 'work_plans',
      recordId: id,
      action: 'UPDATE',
      oldData: workPlan,
      newData: updateData,
      performedBy: contractorId,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Work plan updated successfully'
    });
  } catch (error) {
    console.error('Update work plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to update work plan', error: error.message });
  }
};
