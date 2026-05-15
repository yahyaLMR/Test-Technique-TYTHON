/*
  Appointment model
  - Links to `Patient` via `patientId` and records appointment metadata
  - Enforces status enum and provides indexes for common lookups
  - `createdBy` is required to track who created the appointment (audit)
*/
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide appointment date']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for appointment']
  },
  notes: String,
  diagnosis: String,
  prescription: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
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

appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

// Update `updatedAt` timestamp whenever the document is saved
appointmentSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
