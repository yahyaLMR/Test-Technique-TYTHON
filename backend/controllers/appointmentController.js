/*
  Appointment controller
  - createAppointment enforces required fields and a business rule: when an appointment
    is created or confirmed as `confirmed`, there must not be another confirmed appointment
    for the same patient within the previous 30 minutes.
  - listAppointments supports filtering by date/status/patientId
  - updateAppointment enforces role-based field restrictions for `staff` users
*/
const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, appointmentDate, reason, notes, followUpRequired, followUpDate } = req.body;
    if (!patientId || !appointmentDate || !reason) return res.status(400).json({ message: 'Missing required fields' });

    const targetDate = new Date(appointmentDate);
    if (Number.isNaN(targetDate.getTime())) return res.status(400).json({ message: 'Invalid appointmentDate' });

    // Only enforce the 30-minute confirmed-conflict rule if this appointment
    // is being created as `confirmed`.
    if (req.body && req.body.status === 'confirmed') {
      const thirtyMinutesBefore = new Date(targetDate.getTime() - 30 * 60 * 1000);
      const existing = await Appointment.findOne({
        patientId,
        status: 'confirmed',
        appointmentDate: { $gte: thirtyMinutesBefore, $lt: targetDate }
      });
      if (existing) {
        return res.status(400).json({ message: 'Conflict: a confirmed appointment exists within the previous 30 minutes' });
      }
    }

    const appt = new Appointment({
      patientId,
      appointmentDate: targetDate,
      reason,
      notes,
      followUpRequired,
      followUpDate,
      createdBy: req.user && req.user._id
    });
    await appt.save();
    res.status(201).json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    const appt = await Appointment.findById(id).populate('patientId');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listAppointments = async (req, res) => {
  try {
    const filters = {};
    if (req.query.patientId) filters.patientId = req.query.patientId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.date) {
      const selectedDate = new Date(req.query.date);
      if (!Number.isNaN(selectedDate.getTime())) {
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);
        filters.appointmentDate = { $gte: start, $lte: end };
      }
    }

    const appts = await Appointment.find(filters).populate('patientId').sort({ appointmentDate: 1 });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Missing status' });
    }

    // Fetch appointment to access patientId and appointmentDate
    const apptDoc = await Appointment.findById(id);
    if (!apptDoc) return res.status(404).json({ message: 'Appointment not found' });

    // If confirming, check for existing confirmed appointment within previous 30 minutes
    if (status === 'confirmed') {
      const targetDate = new Date(apptDoc.appointmentDate);
      if (Number.isNaN(targetDate.getTime())) return res.status(400).json({ message: 'Invalid stored appointmentDate' });
      const thirtyMinutesBefore = new Date(targetDate.getTime() - 30 * 60 * 1000);
      const conflict = await Appointment.findOne({
        _id: { $ne: apptDoc._id },
        patientId: apptDoc.patientId,
        status: 'confirmed',
        appointmentDate: { $gte: thirtyMinutesBefore, $lt: targetDate }
      });
      if (conflict) {
        return res.status(400).json({ message: 'Conflict: another confirmed appointment exists within the previous 30 minutes' });
      }
    }

    apptDoc.status = status;
    await apptDoc.save();
    const appt = await Appointment.findById(id).populate('patientId');
    res.json(appt);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        details: Object.values(err.errors || {}).map((item) => item.message),
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    let updates = req.body;
    // If requester is staff, restrict updatable fields to status and notes
    if (req.user && req.user.role === 'staff') {
      const allowed = ['status', 'notes'];
      const filtered = {};
      Object.keys(updates).forEach((k) => {
        if (allowed.includes(k)) filtered[k] = updates[k];
      });
      // If nothing allowed provided, forbid
      if (Object.keys(filtered).length === 0) {
        return res.status(403).json({ message: 'Forbidden: staff can only update status or notes' });
      }
      updates = filtered;
    }

    // Prevent changing the creator reference
    if (updates && updates.createdBy) delete updates.createdBy;

    // If status is being set to 'confirmed', ensure no conflicting confirmed appointment
    if (updates.status === 'confirmed') {
      const apptDoc = await Appointment.findById(id);
      if (!apptDoc) return res.status(404).json({ message: 'Appointment not found' });
      const targetDate = new Date(apptDoc.appointmentDate);
      if (Number.isNaN(targetDate.getTime())) return res.status(400).json({ message: 'Invalid stored appointmentDate' });
      const thirtyMinutesBefore = new Date(targetDate.getTime() - 30 * 60 * 1000);
      const conflict = await Appointment.findOne({
        _id: { $ne: apptDoc._id },
        patientId: apptDoc.patientId,
        status: 'confirmed',
        appointmentDate: { $gte: thirtyMinutesBefore, $lt: targetDate }
      });
      if (conflict) {
        return res.status(400).json({ message: 'Conflict: another confirmed appointment exists within the previous 30 minutes' });
      }

      apptDoc.set(updates);
      await apptDoc.save();
      const updated = await Appointment.findById(id).populate('patientId');
      return res.json(updated);
    }

    const appt = await Appointment.findByIdAndUpdate(id, updates, { new: true });
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    const appt = await Appointment.findByIdAndDelete(id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
