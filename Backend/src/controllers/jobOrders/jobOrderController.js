const JobOrder = require('../../models/JobOrder');
const WorkOrder = require('../../models/WorkOrder');
const AuditLog = require('../../models/AuditLog');

// Create a new job order (Agent only)
exports.createJobOrder = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const agentId = req.user.id;

    // Verify user is an agent
    if (req.user.role !== 'AGENT') {
      return res.status(403).json({ success: false, message: 'Only agents can create job orders' });
    }

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const jobOrderId = await JobOrder.create({
      agentId,
      title,
      description,
      category: category || null
    });

    // Audit log
    await AuditLog.create({
      tableName: 'job_orders',
      recordId: jobOrderId,
      action: 'INSERT',
      newData: { agentId, title, description, category },
      performedBy: agentId,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Job order created successfully',
      data: { id: jobOrderId }
    });
  } catch (error) {
    console.error('Create job order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create job order', error: error.message });
  }
};

// Get all job orders for the logged-in agent
exports.getMyJobOrders = async (req, res) => {
  try {
    const agentId = req.user.id;

    if (req.user.role !== 'AGENT') {
      return res.status(403).json({ success: false, message: 'Only agents can access this' });
    }

    const jobOrders = await JobOrder.getByAgentId(agentId);

    res.json({
      success: true,
      data: jobOrders
    });
  } catch (error) {
    console.error('Get my job orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job orders', error: error.message });
  }
};

// Get all open job orders (for contractors to browse)
exports.getAllOpenJobOrders = async (req, res) => {
  try {
    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ success: false, message: 'Only contractors can browse job orders' });
    }

    const jobOrders = await JobOrder.getAllOpen();

    res.json({
      success: true,
      data: jobOrders
    });
  } catch (error) {
    console.error('Get open job orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job orders', error: error.message });
  }
};

// Get single job order details
exports.getJobOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const jobOrder = await JobOrder.findById(id);

    if (!jobOrder) {
      return res.status(404).json({ success: false, message: 'Job order not found' });
    }

    // Check permissions
    if (req.user.role === 'AGENT' && jobOrder.agent_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get applications if agent
    let applications = [];
    if (req.user.role === 'AGENT') {
      applications = await WorkOrder.getByJobOrderId(id);
    }

    res.json({
      success: true,
      data: {
        ...jobOrder,
        applications
      }
    });
  } catch (error) {
    console.error('Get job order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job order', error: error.message });
  }
};

// Update job order
exports.updateJobOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, status } = req.body;
    const agentId = req.user.id;

    if (req.user.role !== 'AGENT') {
      return res.status(403).json({ success: false, message: 'Only agents can update job orders' });
    }

    const jobOrder = await JobOrder.findById(id);

    if (!jobOrder) {
      return res.status(404).json({ success: false, message: 'Job order not found' });
    }

    if (jobOrder.agent_id !== agentId) {
      return res.status(403).json({ success: false, message: 'You can only update your own job orders' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    await JobOrder.update(id, updateData);

    // Audit log
    await AuditLog.create({
      tableName: 'job_orders',
      recordId: id,
      action: 'UPDATE',
      oldData: jobOrder,
      newData: updateData,
      performedBy: agentId,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Job order updated successfully'
    });
  } catch (error) {
    console.error('Update job order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update job order', error: error.message });
  }
};

// Delete job order
exports.deleteJobOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.user.id;

    if (req.user.role !== 'AGENT') {
      return res.status(403).json({ success: false, message: 'Only agents can delete job orders' });
    }

    const jobOrder = await JobOrder.findById(id);

    if (!jobOrder) {
      return res.status(404).json({ success: false, message: 'Job order not found' });
    }

    if (jobOrder.agent_id !== agentId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own job orders' });
    }

    await JobOrder.delete(id);

    // Audit log
    await AuditLog.create({
      tableName: 'job_orders',
      recordId: id,
      action: 'DELETE',
      oldData: jobOrder,
      performedBy: agentId,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Job order deleted successfully'
    });
  } catch (error) {
    console.error('Delete job order error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job order', error: error.message });
  }
};

// Search job orders
exports.searchJobOrders = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ success: false, message: 'Only contractors can search job orders' });
    }

    const jobOrders = await JobOrder.search(q);

    res.json({
      success: true,
      data: jobOrders
    });
  } catch (error) {
    console.error('Search job orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to search job orders', error: error.message });
  }
};
