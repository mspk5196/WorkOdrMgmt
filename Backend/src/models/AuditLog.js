const db = require('../config/db');

class AuditLog {
  // Create audit log
  static async create({ tableName, recordId, action, oldData, newData, performedBy, ipAddress }) {
    const query = `
      INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const oldDataJson = oldData ? JSON.stringify(oldData) : null;
    const newDataJson = newData ? JSON.stringify(newData) : null;
    
    await db.query(query, [tableName, recordId, action, oldDataJson, newDataJson, performedBy, ipAddress]);
  }

  // Get logs by table and record
  static async getByRecord(tableName, recordId) {
    const query = `
      SELECT al.*, u.name as performed_by_name
      FROM audit_logs al
      LEFT JOIN users u ON al.performed_by = u.id
      WHERE al.table_name = ? AND al.record_id = ?
      ORDER BY al.created_at DESC
    `;
    const [rows] = await db.query(query, [tableName, recordId]);
    return rows;
  }

  // Get recent logs
  static async getRecent(limit = 100) {
    const query = `
      SELECT al.*, u.name as performed_by_name
      FROM audit_logs al
      LEFT JOIN users u ON al.performed_by = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `;
    const [rows] = await db.query(query, [limit]);
    return rows;
  }
}

module.exports = AuditLog;
