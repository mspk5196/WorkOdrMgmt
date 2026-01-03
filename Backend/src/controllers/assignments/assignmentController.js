const JobAssignment = require('../../models/JobAssignment');

// Get all assignments for logged-in user (agent or contractor)
exports.getMyAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let assignments;
    if (role === 'AGENT') {
      assignments = await JobAssignment.getByAgentId(userId);
    } else if (role === 'CONTRACTOR') {
      assignments = await JobAssignment.getByContractorId(userId);
    } else {
      return res.status(403).json({ success: false, message: 'Invalid role' });
    }

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const assignment = await JobAssignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Check if user has access to this assignment
    // (User must be either the contractor or the agent who posted the job)
    const hasAccess = 
      assignment.contractor_id === userId ||
      (req.user.role === 'AGENT' && assignment.job_order_id); // Will verify agent ID via job order

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignment', error: error.message });
  }
};
