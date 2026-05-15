/*
  Authentication & Authorization middleware
  - `protect`: verifies JWT from Authorization header and attaches `req.user` ({ id, role })
  - `authorize`: higher-order middleware to restrict access to specific roles
*/
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Verify token and attach minimal user info to `req.user` for downstream handlers
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Not authorized, user not found' });

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Usage: authorize('admin'), authorize('admin', 'staff')
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
