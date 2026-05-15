const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide date of birth']
  },
  phone: {
    type: String,
  },
  cin: {
    type: String,
    unique: true,
    sparse: true
  },
  address: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

patientSchema.index({ phone: 1 });
patientSchema.index({ name: 1 });

patientSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Patient', patientSchema);
