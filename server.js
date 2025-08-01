const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ✅ Add a root route for Vercel to quickly respond
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

// ✅ Your API routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

// ✅ MongoDB connection (safe to keep outside handler)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Export serverless function for Vercel
module.exports = serverless(app);
