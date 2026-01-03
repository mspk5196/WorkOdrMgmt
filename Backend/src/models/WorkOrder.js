const db = require('../config/db');

class WorkOrder {
  // Create work order (contractor application)
  static async create({ jobOrderId, contractorId, proposal, proposedCost, estimatedDays }) {
    const query = `
      INSERT INTO work_orders (job_order_id, contractor_id, proposal, proposed_cost, estimated_days)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [jobOrderId, contractorId, proposal, proposedCost, estimatedDays]);
    return result.insertId;
  }

  // Find by ID
  static async findById(id) {
    const query = `
      SELECT wo.*, 
        u.name as contractor_name, u.email as contractor_email, u.phone as contractor_phone,
        jo.title as job_title, jo.description as job_description
      FROM work_orders wo
      JOIN users u ON wo.contractor_id = u.id
      JOIN job_orders jo ON wo.job_order_id = jo.id
      WHERE wo.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Get all applications for a job order
  static async getByJobOrderId(jobOrderId) {
    const query = `
      SELECT wo.*, 
        u.name as contractor_name, u.email as contractor_email, u.phone as contractor_phone
      FROM work_orders wo
      JOIN users u ON wo.contractor_id = u.id
      WHERE wo.job_order_id = ?
      ORDER BY wo.created_at DESC
    `;
    const [rows] = await db.query(query, [jobOrderId]);
    return rows;
  }

  // Get all work orders by contractor
  static async getByContractorId(contractorId) {
    const query = `
      SELECT wo.*, 
        jo.title as job_title, jo.description as job_description, jo.status as job_status,
        u.name as agent_name
      FROM work_orders wo
      JOIN job_orders jo ON wo.job_order_id = jo.id
      JOIN users u ON jo.agent_id = u.id
      WHERE wo.contractor_id = ?
      ORDER BY wo.created_at DESC
    `;
    const [rows] = await db.query(query, [contractorId]);
    return rows;
  }

  // Update work order status
  static async updateStatus(id, status) {
    const query = 'UPDATE work_orders SET status = ? WHERE id = ?';
    await db.query(query, [status, id]);
  }

  // Check if contractor already applied
  static async checkExistingApplication(jobOrderId, contractorId) {
    const query = 'SELECT id FROM work_orders WHERE job_order_id = ? AND contractor_id = ?';
    const [rows] = await db.query(query, [jobOrderId, contractorId]);
    return rows[0];
  }

  // Get pending applications count for a job
  static async getPendingCount(jobOrderId) {
    const query = 'SELECT COUNT(*) as count FROM work_orders WHERE job_order_id = ? AND status = "PENDING"';
    const [rows] = await db.query(query, [jobOrderId]);
    return rows[0].count;
  }
}

module.exports = WorkOrder;
