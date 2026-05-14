const Patient = require('../models/Patient');

const cleanString = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

exports.createPatient = async (req, res) => {
  try {
    const name = cleanString(req.body?.name);
    const cin = cleanString(req.body?.cin);
    const phone = cleanString(req.body?.phone);
    const address = cleanString(req.body?.address);
    const dateOfBirthInput = req.body?.dateOfBirth;

    if (!name || !dateOfBirthInput) {
      return res.status(400).json({ message: 'Missing required fields: name or dateOfBirth' });
    }

    const parsedDate = new Date(dateOfBirthInput);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid dateOfBirth value' });
    }

    const exists = cin ? await Patient.findOne({ cin }) : null;
    if (exists) return res.status(400).json({ message: 'Patient with this CIN already exists' });

    const patient = new Patient({
      name,
      dateOfBirth: parsedDate,
      phone,
      cin,
      address,
    });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error('createPatient error:', err);
    // Handle duplicate key (unique index) errors from MongoDB
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
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: `Invalid ${err.path}`,
        details: err.message,
      });
    }
    const payload = { message: 'Server error' };
    if (process.env.NODE_ENV !== 'production') {
      payload.details = err.message;
    }
    res.status(500).json(payload);
  }
};

exports.getPatient = async (req, res) => {
  try {
    const id = req.params.id;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const patient = await Patient.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        details: Object.values(err.errors || {}).map((item) => item.message),
      });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: `Invalid ${err.path}`,
        details: err.message,
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const id = req.params.id;
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listPatients = async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const hasQueryFilters = Boolean(search || req.query.page || req.query.limit);

    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cin: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const query = Patient.find(filters).sort({ createdAt: -1 });
    const total = await Patient.countDocuments(filters);
    const patients = await query.skip((page - 1) * limit).limit(limit);

    if (!hasQueryFilters) {
      return res.json(patients);
    }

    res.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
