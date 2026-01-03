const db = require('../config/db');

class UserAuthMethod {
  // Create auth method (password or google)
  static async create({ userId, provider, passwordHash, providerUserId }) {
    const query = `
      INSERT INTO user_auth_methods (user_id, provider, password_hash, provider_user_id)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [userId, provider, passwordHash, providerUserId]);
    return result.insertId;
  }

  // Find by user ID and provider
  static async findByUserAndProvider(userId, provider) {
    const query = 'SELECT * FROM user_auth_methods WHERE user_id = ? AND provider = ?';
    const [rows] = await db.query(query, [userId, provider]);
    return rows[0];
  }

  // Find by provider user ID (for Google login)
  static async findByProviderUserId(provider, providerUserId) {
    const query = 'SELECT * FROM user_auth_methods WHERE provider = ? AND provider_user_id = ?';
    const [rows] = await db.query(query, [provider, providerUserId]);
    return rows[0];
  }

  // Update password hash
  static async updatePassword(userId, passwordHash) {
    const query = 'UPDATE user_auth_methods SET password_hash = ? WHERE user_id = ? AND provider = "PASSWORD"';
    await db.query(query, [passwordHash, userId]);
  }

  // Get all auth methods for a user
  static async findAllByUserId(userId) {
    const query = 'SELECT * FROM user_auth_methods WHERE user_id = ?';
    const [rows] = await db.query(query, [userId]);
    return rows;
  }
}

module.exports = UserAuthMethod;
