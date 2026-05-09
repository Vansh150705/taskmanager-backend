const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// ── CORS — must be FIRST, before everything else ──
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://office-task-manager.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(null, true); // allow all for now
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Handle preflight requests for ALL routes
app.options('*', cors());

// ── Body Parser ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check route ──
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

// ── MongoDB Connection ──
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://vansh150705:NNapv3955@taskmanager.dsqgvkh.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// ── Error handling middleware ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// ── 404 handler ──
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});