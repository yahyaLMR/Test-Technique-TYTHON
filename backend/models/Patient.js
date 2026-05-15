/*
  Patient model
  - Stores basic patient information and a required `createdBy` reference to the User who created the record
  - Includes indexes to optimize common queries (name, phone)
  - `pre('save')` updates `updatedAt` timestamp automatically
*/
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


// Keep `updatedAt` in sync on save
patientSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Patient', patientSchema);
