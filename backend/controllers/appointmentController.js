const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, appointmentDate, reason, notes, followUpRequired, followUpDate } = req.body;
    if (!patientId || !appointmentDate || !reason) return res.status(400).json({ message: 'Missing required fields' });

    const appt = new Appointment({ patientId, appointmentDate, reason, notes, followUpRequired, followUpDate });
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

    const appt = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('patientId');

    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

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
