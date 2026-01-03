const db = require('../config/db');

class Invoice {
  // Create invoice
  static async create({ jobAssignmentId, contractorId, amount, invoiceDate }) {
    const query = `
      INSERT INTO invoices (job_assignment_id, contractor_id, amount, invoice_date)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [jobAssignmentId, contractorId, amount, invoiceDate]);
    return result.insertId;
  }

  // Find by ID
  static async findById(id) {
    const query = `
      SELECT inv.*, 
        ja.job_order_id,
        jo.title as job_title,
        contractor.name as contractor_name, contractor.email as contractor_email, contractor.phone as contractor_phone,
        agent.name as agent_name, agent.email as agent_email, agent.phone as agent_phone
      FROM invoices inv
      JOIN job_assignments ja ON inv.job_assignment_id = ja.id
      JOIN job_orders jo ON ja.job_order_id = jo.id
      JOIN users contractor ON inv.contractor_id = contractor.id
      JOIN users agent ON jo.agent_id = agent.id
      WHERE inv.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Get all invoices by contractor
  static async getByContractorId(contractorId) {
    const query = `
      SELECT inv.*, 
        jo.title as job_title,
        agent.name as agent_name
      FROM invoices inv
      JOIN job_assignments ja ON inv.job_assignment_id = ja.id
      JOIN job_orders jo ON ja.job_order_id = jo.id
      JOIN users agent ON jo.agent_id = agent.id
      WHERE inv.contractor_id = ?
      ORDER BY inv.created_at DESC
    `;
    const [rows] = await db.query(query, [contractorId]);
    return rows;
  }

  // Get all invoices by agent
  static async getByAgentId(agentId) {
    const query = `
      SELECT inv.*, 
        jo.title as job_title,
        contractor.name as contractor_name, contractor.email as contractor_email
      FROM invoices inv
      JOIN job_assignments ja ON inv.job_assignment_id = ja.id
      JOIN job_orders jo ON ja.job_order_id = jo.id
      JOIN users contractor ON inv.contractor_id = contractor.id
      WHERE jo.agent_id = ?
      ORDER BY inv.created_at DESC
    `;
    const [rows] = await db.query(query, [agentId]);
    return rows;
  }

  // Update invoice status
  static async updateStatus(id, status) {
    const query = 'UPDATE invoices SET status = ? WHERE id = ?';
    await db.query(query, [status, id]);
  }

  // Get invoices by job assignment
  static async getByJobAssignmentId(jobAssignmentId) {
    const query = `
      SELECT inv.*
      FROM invoices inv
      WHERE inv.job_assignment_id = ?
      ORDER BY inv.created_at DESC
    `;
    const [rows] = await db.query(query, [jobAssignmentId]);
    return rows;
  }
}

module.exports = Invoice;
