const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('../routes/userRoutes');
const taskRoutes = require('../routes/taskRoutes');
const messageRoutes = require('../routes/messageRoutes');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://vansh150705:Napv3955@taskmanager.dsqgvkh.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Stop server if DB fails
  }
};

connectDB();

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
