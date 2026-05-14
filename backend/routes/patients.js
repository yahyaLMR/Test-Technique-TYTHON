const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// Create and update patients allowed for staff and admin
router.post('/', protect, authorize('admin', 'staff'), patientController.createPatient);
router.get('/', protect, authorize('admin', 'staff'), patientController.listPatients);
router.get('/:id', protect, authorize('admin', 'staff'), patientController.getPatient);
// Only staff/admin can update
router.put('/:id', protect, authorize('admin', 'staff'), patientController.updatePatient);
// Only admin may delete patients
router.delete('/:id', protect, authorize('admin'), patientController.deletePatient);

module.exports = router;
