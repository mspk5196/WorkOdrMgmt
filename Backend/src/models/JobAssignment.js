const db = require('../config/db');

class JobAssignment {
  // Create job assignment (agent assigns job to contractor)
  static async create({ jobOrderId, workOrderId, contractorId }) {
    const query = `
      INSERT INTO job_assignments (job_order_id, work_order_id, contractor_id)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [jobOrderId, workOrderId, contractorId]);
    return result.insertId;
  }

  // Find by ID
  static async findById(id) {
    const query = `
      SELECT ja.*, 
        jo.title as job_title, jo.description as job_description, jo.category,
        u.name as contractor_name, u.email as contractor_email, u.phone as contractor_phone,
        wo.proposed_cost, wo.estimated_days, wo.proposal,
        agent.name as agent_name
      FROM job_assignments ja
      JOIN job_orders jo ON ja.job_order_id = jo.id
      JOIN users u ON ja.contractor_id = u.id
      JOIN work_orders wo ON ja.work_order_id = wo.id
      JOIN users agent ON jo.agent_id = agent.id
      WHERE ja.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Find by job order ID
  static async findByJobOrderId(jobOrderId) {
    const query = `
      SELECT ja.*, 
        u.name as contractor_name, u.email as contractor_email, u.phone as contractor_phone,
        wo.proposed_cost, wo.estimated_days
      FROM job_assignments ja
      JOIN users u ON ja.contractor_id = u.id
      JOIN work_orders wo ON ja.work_order_id = wo.id
      WHERE ja.job_order_id = ?
    `;
    const [rows] = await db.query(query, [jobOrderId]);
    return rows[0];
  }

  // Get all assignments by contractor
  static async getByContractorId(contractorId) {
    const query = `
      SELECT ja.*, 
        jo.title as job_title, jo.description as job_description, jo.status as job_status,
        agent.name as agent_name, agent.email as agent_email, agent.phone as agent_phone,
        wo.proposed_cost, wo.estimated_days
      FROM job_assignments ja
      JOIN job_orders jo ON ja.job_order_id = jo.id
      JOIN users agent ON jo.agent_id = agent.id
      JOIN work_orders wo ON ja.work_order_id = wo.id
      WHERE ja.contractor_id = ?
      ORDER BY ja.assigned_at DESC
    `;
    const [rows] = await db.query(query, [contractorId]);
    return rows;
  }

  // Get all assignments by agent
  static async getByAgentId(agentId) {
    const query = `
      SELECT ja.*, 
        jo.title as job_title, jo.description as job_description, jo.status as job_status,
        u.name as contractor_name, u.email as contractor_email, u.phone as contractor_phone,
        wo.proposed_cost, wo.estimated_days
      FROM job_assignments ja
      JOIN job_orders jo ON ja.job_order_id = jo.id
      JOIN users u ON ja.contractor_id = u.id
      JOIN work_orders wo ON ja.work_order_id = wo.id
      WHERE jo.agent_id = ?
      ORDER BY ja.assigned_at DESC
    `;
    const [rows] = await db.query(query, [agentId]);
    return rows;
  }
}

module.exports = JobAssignment;
