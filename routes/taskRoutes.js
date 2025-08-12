const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getEmployeeTasks,
  updateTaskStatus,
  updateTaskById,
  deleteTaskById,
  updateSubTaskStatus // New controller to update sub-task status
} = require('../controllers/taskController');

const { protect } = require('../middleware/authMiddleware');

// Create new task (admin only)
router.post('/', protect, createTask);

// Get all tasks (admin)
router.get('/', protect, getTasks);

// Get tasks for logged-in employee
router.get('/my-tasks', protect, getEmployeeTasks);

// Update task status (employee)
router.put('/:id/status', protect, updateTaskStatus);

// Update sub-task status (employee)
router.put('/:taskId/subtasks/:subTaskIndex/status', protect, updateSubTaskStatus);

// Update task (admin only)
router.put('/:id', protect, updateTaskById);

// Delete task (admin only)
router.delete('/:id', protect, deleteTaskById);

module.exports = router;
