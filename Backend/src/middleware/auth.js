const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware to verify JWT tokens (with database check for revocation)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    
    // Check if token is revoked
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [tokens] = await db.query(
      'SELECT * FROM jwt_tokens WHERE token_hash = ? AND revoked = FALSE AND expires_at > NOW()',
      [tokenHash]
    );

    if (!tokens || tokens.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token has been revoked or expired' 
      });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to optionally verify JWT tokens (won't fail if no token provided)
const authenticateOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

// Generate JWT access token
const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Generate refresh token
const generateRefreshToken = (payload, expiresIn = JWT_REFRESH_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  authenticateOptional,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  JWT_SECRET
};