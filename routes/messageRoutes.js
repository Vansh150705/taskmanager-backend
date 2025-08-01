const express = require('express');
const router = express.Router();

const controller = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Optional debug logs
// console.log('createMessage:', typeof controller.createMessage);
// console.log('getMessages:', typeof controller.getMessages);

router.post('/', protect, controller.createMessage);
router.get('/:taskId', protect, controller.getMessages);

module.exports = router;
