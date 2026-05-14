const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../Middleware/authMiddleware');

router.post('/', protect, authorize('admin'), userController.createUser);
router.get('/', protect, authorize('admin'), userController.listUsers);
router.get('/:id', protect, userController.getUser);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
