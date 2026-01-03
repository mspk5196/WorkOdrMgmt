const db = require('../config/db');

class WorkPlan {
  // Create work plan
  static async create({ jobAssignmentId, planDetails, startDate, expectedEndDate }) {
    const query = `
      INSERT INTO work_plans (job_assignment_id, plan_details, start_date, expected_end_date)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [jobAssignmentId, planDetails, startDate, expectedEndDate]);
    return result.insertId;
  }

  // Find by ID
  static async findById(id) {
    const query = `
      SELECT wp.*, 
        ja.job_order_id, ja.contractor_id,
        jo.title as job_title
      FROM work_plans wp
      JOIN job_assignments ja ON wp.job_assignment_id = ja.id
      JOIN job_orders jo ON ja.job_order_id = jo.id
      WHERE wp.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Find by job assignment ID
  static async findByJobAssignmentId(jobAssignmentId) {
    const query = 'SELECT * FROM work_plans WHERE job_assignment_id = ?';
    const [rows] = await db.query(query, [jobAssignmentId]);
    return rows[0];
  }

  // Get all work plans by contractor
  static async getByContractorId(contractorId) {
    const query = `
      SELECT wp.*, 
        ja.job_order_id,
        jo.title as job_title, jo.description as job_description,
        agent.name as agent_name
      FROM work_plans wp
      JOIN job_assignments ja ON wp.job_assignment_id = ja.id
      JOIN job_orders jo ON ja.job_order_id = jo.id
      JOIN users agent ON jo.agent_id = agent.id
      WHERE ja.contractor_id = ?
      ORDER BY wp.created_at DESC
    `;
    const [rows] = await db.query(query, [contractorId]);
    return rows;
  }

  // Update work plan
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    });

    values.push(id);
    const query = `UPDATE work_plans SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(query, values);
  }
}

module.exports = WorkPlan;
