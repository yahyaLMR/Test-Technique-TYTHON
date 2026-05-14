const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// Only staff and admin can manage appointments
router.post('/', protect, authorize('admin', 'staff'), appointmentController.createAppointment);
router.get('/', protect, authorize('admin', 'staff'), appointmentController.listAppointments);
router.get('/:id', protect, authorize('admin', 'staff'), appointmentController.getAppointment);
router.patch('/:id/status', protect, authorize('admin', 'staff'), appointmentController.updateAppointmentStatus);
// Staff can update appointment status/notes; admin can update any field
router.put('/:id', protect, authorize('admin', 'staff'), appointmentController.updateAppointment);
// Only admin may delete appointments
router.delete('/:id', protect, authorize('admin'), appointmentController.deleteAppointment);

module.exports = router;
