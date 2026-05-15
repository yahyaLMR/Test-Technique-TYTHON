/*
  User controller
  - Administrative endpoints to create/list/get/update/delete users
  - Protects against role escalation by non-admins and never returns passwords
*/
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : req.body?.email;
    const password = typeof req.body?.password === 'string' ? req.body.password.trim() : req.body?.password;
    const role = req.body?.role === 'admin' ? 'admin' : 'staff';

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, role });
    await user.save();

    res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
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
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Allow admins to fetch any user; non-admins can only fetch their own record
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    // Only admins can update other users. Non-admins can update their own
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Prevent role escalation by non-admins
    if (updates.role && req.user?.role !== 'admin') delete updates.role;
    if (updates.password) delete updates.password;
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
