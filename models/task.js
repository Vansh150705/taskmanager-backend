// models/task.js

const mongoose = require('mongoose');

// Sub-task schema
const subTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deadline: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in progress', 'completed'], default: 'pending' },
}, { _id: false }); // Disable automatic _id for sub-documents if not needed

// Main Task schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deadline: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in progress', 'completed'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ✅ Add subTasks field
  subTasks: [subTaskSchema],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
