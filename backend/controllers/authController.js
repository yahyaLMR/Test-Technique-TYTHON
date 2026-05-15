/*
  Authentication controller
  - register/login endpoints produce JWT tokens and return minimal user info
  - `register` restricts creating admin users to existing admin requesters (by JWT)
  - `me` returns the authenticated user's profile
*/
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
const normalizeString = (value) => (typeof value === 'string' ? value.trim() : value);

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

exports.register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = normalizeString(req.body?.password);
    const role = normalizeString(req.body?.role);

    if (!email || !password) return res.status(400).json({ message: 'Missing required fields' });

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    // Determine requester role from JWT if provided so admins can create admins
    let requesterRole = null;
    const authHeader = req.headers.authorization || '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        requesterRole = decoded.role;
      } catch (e) {
        // ignore invalid token; treat as unauthenticated
      }
    }

    // Only an authenticated admin may create a user with role 'admin'.
    // If the requester is not admin (or not authenticated), force role to 'staff'.
    let finalRole = 'staff';
    if (role && role === 'admin') {
      if (requesterRole === 'admin') finalRole = 'admin';
      else finalRole = 'staff';
    } else if (role === 'staff') {
      finalRole = 'staff';
    }

    const user = new User({ email, password, role: finalRole });
    await user.save();

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {}).join(', ');
      return res.status(400).json({ message: `Duplicate value for field(s): ${field}` });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        details: Object.values(err.errors || {}).map((item) => item.message),
      });
    }
    const payload = { message: 'Server error' };
    if (process.env.NODE_ENV !== 'production') {
      payload.details = err.message;
    }
    res.status(500).json(payload);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const id = req.user?.id || req.userId;
    if (!id) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const id = req.user?.id;
    const { oldPassword, newPassword } = req.body;
    if (!id) return res.status(401).json({ message: 'Not authenticated' });
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Provide old and new passwords' });

    const user = await User.findById(id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Old password incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.body.token || req.query.token;
    if (!token) return res.status(400).json({ valid: false, message: 'No token provided' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ valid: false, message: 'Invalid token' });
      res.json({ valid: true, decoded });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: 'Server error' });
  }
};
