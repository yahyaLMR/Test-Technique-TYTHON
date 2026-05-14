require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.text({ type: 'application/json' }));
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return next();
  }

  const rawBody = req.body;
  if (rawBody === undefined || rawBody === null || rawBody === '') {
    req.body = {};
    return next();
  }

  if (typeof rawBody !== 'string') {
    return next();
  }

  const parseJsonValue = (value) => {
    let parsed = JSON.parse(value);

    while (typeof parsed === 'string') {
      const trimmed = parsed.trim();
      if (!trimmed) break;

      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        parsed = JSON.parse(trimmed);
        continue;
      }

      const unquoted = trimmed.replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (unquoted !== trimmed) {
        try {
          parsed = JSON.parse(unquoted);
          continue;
        } catch (err) {
          parsed = unquoted;
        }
      }
      break;
    }

    return parsed;
  };

  try {
    req.body = parseJsonValue(rawBody);
    if (typeof req.body === 'string') {
      req.body = { value: req.body };
    }
    next();
  } catch (err) {
    res.status(400).json({
      error: {
        message: 'Invalid JSON payload',
        status: 400,
        details: err.message,
      },
    });
  }
});
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-technique-tython')
  .then(() => {
    console.log('✓ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running' });
});

// API routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const patientsRoutes = require('./routes/patients');
const appointmentsRoutes = require('./routes/appointments');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const response = {
    error: {
      message: err.message,
      status: err.status || 500
    }
  };
  if (process.env.NODE_ENV !== 'production') {
    response.error.stack = err.stack;
  }
  res.status(err.status || 500).json(response);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
