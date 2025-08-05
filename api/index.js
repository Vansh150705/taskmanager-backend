const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const userRoutes = require('../routes/userRoutes');
const taskRoutes = require('../routes/taskRoutes');
const messageRoutes = require('../routes/messageRoutes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Task Manager API is running (Serverless)',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://vansh150705:Napv3955@taskmanager.dsqgvkh.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

connectDB();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = serverless(app);
