const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllEmployees
} = require('../controllers/userController');

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Get all employees
router.get('/employees', getAllEmployees);

module.exports = router;
