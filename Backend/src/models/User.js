const db = require('../config/db');

class User {
  // Create a new user
  static async create({ name, email, phone, role }) {
    const query = `
      INSERT INTO users (name, email, phone, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [name, email, phone, role]);
    return result.insertId;
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.query(query, [email]);
    return rows[0];
  }

  // Find user by phone
  static async findByPhone(phone) {
    const query = 'SELECT * FROM users WHERE phone = ?';
    const [rows] = await db.query(query, [phone]);
    return rows[0];
  }

  // Update user
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    });

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(query, values);
  }

  // Get all agents
  static async getAllAgents() {
    const query = 'SELECT * FROM users WHERE role = "AGENT" AND is_active = TRUE';
    const [rows] = await db.query(query);
    return rows;
  }

  // Get all contractors
  static async getAllContractors() {
    const query = 'SELECT * FROM users WHERE role = "CONTRACTOR" AND is_active = TRUE';
    const [rows] = await db.query(query);
    return rows;
  }
}

module.exports = User;
