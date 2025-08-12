const Message = require('../models/message');
const Task = require('../models/task');

const createMessage = async (req, res) => {
  const { taskId, content } = req.body;
  const sender = req.user._id;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Allow if sender is either the creator OR in the assignedTo array
    const isAllowed = task.createdBy.equals(sender) || task.assignedTo.includes(sender);

    if (!isAllowed) {
      return res.status(403).json({ message: "Not allowed to chat on this task" });
    }

    const message = await Message.create({ taskId, sender, content });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMessages = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAllowed = task.createdBy.equals(userId) || task.assignedTo.includes(userId);

    if (!isAllowed) {
      return res.status(403).json({ message: "Not allowed to view messages" });
    }

    const messages = await Message.find({ taskId }).populate('sender', 'name role');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Full export
module.exports = {
  createMessage,
  getMessages
};
