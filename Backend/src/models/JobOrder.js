const db = require('../config/db');

class JobOrder {
  // Create a new job order (by Agent)
  static async create({ agentId, title, description, category }) {
    const query = `
      INSERT INTO job_orders (agent_id, title, description, category)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [agentId, title, description, category]);
    return result.insertId;
  }

  // Find job order by ID
  static async findById(id) {
    const query = `
      SELECT jo.*, u.name as agent_name, u.email as agent_email
      FROM job_orders jo
      JOIN users u ON jo.agent_id = u.id
      WHERE jo.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Get all open job orders (for contractors to browse)
  static async getAllOpen() {
    const query = `
      SELECT jo.*, u.name as agent_name, u.email as agent_email
      FROM job_orders jo
      JOIN users u ON jo.agent_id = u.id
      WHERE jo.status = 'OPEN'
      ORDER BY jo.created_at DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  // Get all job orders by agent
  static async getByAgentId(agentId) {
    const query = `
      SELECT jo.*, 
        (SELECT COUNT(*) FROM work_orders WHERE job_order_id = jo.id AND status = 'PENDING') as pending_applications
      FROM job_orders jo
      WHERE jo.agent_id = ?
      ORDER BY jo.created_at DESC
    `;
    const [rows] = await db.query(query, [agentId]);
    return rows;
  }

  // Update job order status
  static async updateStatus(id, status) {
    const query = 'UPDATE job_orders SET status = ? WHERE id = ?';
    await db.query(query, [status, id]);
  }

  // Update job order
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    });

    values.push(id);
    const query = `UPDATE job_orders SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(query, values);
  }

  // Delete job order
  static async delete(id) {
    const query = 'DELETE FROM job_orders WHERE id = ?';
    await db.query(query, [id]);
  }

  // Search job orders by category or title
  static async search(searchTerm) {
    const query = `
      SELECT jo.*, u.name as agent_name
      FROM job_orders jo
      JOIN users u ON jo.agent_id = u.id
      WHERE jo.status = 'OPEN' AND (jo.title LIKE ? OR jo.category LIKE ? OR jo.description LIKE ?)
      ORDER BY jo.created_at DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.query(query, [searchPattern, searchPattern, searchPattern]);
    return rows;
  }
}

module.exports = JobOrder;
