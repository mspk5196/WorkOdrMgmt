const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const UserAuthMethod = require('../../models/UserAuthMethod');
const AuditLog = require('../../models/AuditLog');
const db = require('../../config/db');
const crypto = require('crypto');

// JWT helper functions (keeping it simple without external libraries for refresh tokens)
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validation
    if (!name || !email || !role || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, role, and password are required' });
    }

    if (!['AGENT', 'CONTRACTOR'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be AGENT or CONTRACTOR' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = await User.create({ name, email, phone, role });

    // Create auth method (PASSWORD)
    await UserAuthMethod.create({
      userId,
      provider: 'PASSWORD',
      passwordHash,
      providerUserId: null
    });

    // Log the registration
    const insertLogSql = `INSERT INTO login_logs (user_id, provider, status, ip_address, user_agent) VALUES (?, 'PASSWORD', 'SUCCESS', ?, ?)`;
    await db.query(insertLogSql, [userId, req.ip, req.get('user-agent')]);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: userId, email, role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Failed to register user', error: error.message });
  }
};

// Login with email and password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      // Log failed attempt
      const insertLogSql = `INSERT INTO login_logs (user_id, provider, status, ip_address, user_agent, failure_reason) VALUES (NULL, 'PASSWORD', 'FAILURE', ?, ?, 'User not found')`;
      await db.query(insertLogSql, [req.ip, req.get('user-agent')]);

      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Get auth method
    const authMethod = await UserAuthMethod.findByUserAndProvider(user.id, 'PASSWORD');
    if (!authMethod) {
      return res.status(401).json({ success: false, message: 'Password login not available for this account' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, authMethod.password_hash);
    if (!passwordMatch) {
      // Log failed attempt
      const insertLogSql = `INSERT INTO login_logs (user_id, provider, status, ip_address, user_agent, failure_reason) VALUES (?, 'PASSWORD', 'FAILURE', ?, ?, 'Incorrect password')`;
      await db.query(insertLogSql, [user.id, req.ip, req.get('user-agent')]);

      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    const accessToken = generateToken(tokenPayload);

    // Store token in jwt_tokens table
    const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const insertTokenSql = 'INSERT INTO jwt_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)';
    await db.query(insertTokenSql, [user.id, tokenHash, expiresAt]);

    // Log successful login
    const insertLogSql = `INSERT INTO login_logs (user_id, provider, status, ip_address, user_agent) VALUES (?, 'PASSWORD', 'SUCCESS', ?, ?)`;
    await db.query(insertLogSql, [user.id, req.ip, req.get('user-agent')]);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        accessToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Google login (simplified - assumes Google token verification happens on frontend)
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, googleUserId } = req.body;

    if (!email || !googleUserId) {
      return res.status(400).json({ success: false, message: 'Email and Google user ID are required' });
    }

    // Check if user exists
    let user = await User.findByEmail(email);
    let isNewUser = false;

    if (!user) {
      // Create new user (default role: CONTRACTOR, can be changed later)
      const userId = await User.create({
        name: name || email.split('@')[0],
        email,
        phone: null,
        role: 'CONTRACTOR'
      });

      // Create Google auth method
      await UserAuthMethod.create({
        userId,
        provider: 'GOOGLE',
        passwordHash: null,
        providerUserId: googleUserId
      });

      user = await User.findById(userId);
      isNewUser = true;
    } else {
      // Check if Google auth method exists
      const authMethod = await UserAuthMethod.findByUserAndProvider(user.id, 'GOOGLE');
      if (!authMethod) {
        // Add Google auth method to existing user
        await UserAuthMethod.create({
          userId: user.id,
          provider: 'GOOGLE',
          passwordHash: null,
          providerUserId: googleUserId
        });
      }
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    const accessToken = generateToken(tokenPayload);

    // Store token
    const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const insertTokenSql = 'INSERT INTO jwt_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)';
    await db.query(insertTokenSql, [user.id, tokenHash, expiresAt]);

    // Log successful login
    const insertLogSql = `INSERT INTO login_logs (user_id, provider, status, ip_address, user_agent) VALUES (?, 'GOOGLE', 'SUCCESS', ?, ?)`;
    await db.query(insertLogSql, [user.id, req.ip, req.get('user-agent')]);

    res.json({
      success: true,
      message: isNewUser ? 'Account created and logged in successfully' : 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        accessToken,
        isNewUser
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Revoke token
      const updateSql = 'UPDATE jwt_tokens SET revoked = TRUE, revoked_at = NOW() WHERE token_hash = ?';
      await db.query(updateSql, [tokenHash]);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get current user info
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal that user doesn't exist
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const insertSql = 'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)';
    await db.query(insertSql, [user.id, tokenHash, expiresAt]);

    // TODO: Send email with reset token
    // For now, we'll just return it (in production, send via email)
    console.log('Password reset token:', resetToken);

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // Remove this in production:
      debugToken: resetToken
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const findTokenSql = 'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND expires_at > NOW() AND used = FALSE';
    const [tokens] = await db.query(findTokenSql, [tokenHash]);

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const resetToken = tokens[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await UserAuthMethod.updatePassword(resetToken.user_id, passwordHash);

    // Mark token as used
    const updateTokenSql = 'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?';
    await db.query(updateTokenSql, [resetToken.id]);

    // Log password change
    const insertLogSql = 'INSERT INTO password_change_logs (user_id, ip_address, user_agent) VALUES (?, ?, ?)';
    await db.query(insertLogSql, [resetToken.user_id, req.ip, req.get('user-agent')]);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Change password (for logged-in users)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    // Get auth method
    const authMethod = await UserAuthMethod.findByUserAndProvider(userId, 'PASSWORD');
    if (!authMethod) {
      return res.status(400).json({ success: false, message: 'Password authentication not set up' });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, authMethod.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await UserAuthMethod.updatePassword(userId, passwordHash);

    // Log password change
    const insertLogSql = 'INSERT INTO password_change_logs (user_id, ip_address, user_agent) VALUES (?, ?, ?)';
    await db.query(insertLogSql, [userId, req.ip, req.get('user-agent')]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports.generateToken = generateToken;
