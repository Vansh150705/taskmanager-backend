const Task = require('../models/task');
const User = require('../models/user');

//  Create Task with optional sub-tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, deadline, priority, subTasks } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: No user info' });
    }

    if (!title || !description || !Array.isArray(assignedTo) || assignedTo.length === 0 || !deadline || !priority) {
      return res.status(400).json({ message: 'All fields are required including at least one assigned employee' });
    }

    const users = await User.find({ _id: { $in: assignedTo } });
    if (users.length !== assignedTo.length) {
      return res.status(404).json({ message: 'One or more assigned users not found' });
    }

    const validatedSubTasks = Array.isArray(subTasks)
      ? await Promise.all(
          subTasks.map(async (sub) => {
            const subAssigned = sub.assignedTo || [];
            const subUsers = await User.find({ _id: { $in: subAssigned } });
            if (subUsers.length !== subAssigned.length) {
              throw new Error('One or more sub-task assigned users not found');
            }
            return {
              title: sub.title || '',
              description: sub.description || '',
              assignedTo: subAssigned,
              deadline: sub.deadline || null,
              priority: sub.priority || 'medium',
              status: sub.status || 'pending',
            };
          })
        )
      : [];

    const task = new Task({
      title,
      description,
      assignedTo,
      deadline,
      priority,
      createdBy: req.user._id,
      subTasks: validatedSubTasks,
    });

    await task.save();

    const fullTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('subTasks.assignedTo', 'name email');

    res.status(201).json({ message: 'Task created successfully', task: fullTask });
  } catch (err) {
    console.error('Error in createTask:', err);
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

//  Get Tasks (Admin)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', '_id name email')
      .populate('subTasks.assignedTo', 'name email');

    res.json(tasks);
  } catch (err) {
    console.error('Error in getTasks:', err);
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
};


exports.getEmployeeTasks = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const tasks = await Task.find({ assignedTo: employeeId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', '_id name email')
      .populate('subTasks.assignedTo', 'name email');

    res.json(tasks);
  } catch (err) {
    console.error('Error in getEmployeeTasks:', err);
    res.status(500).json({ message: 'Failed to fetch employee tasks', error: err.message });
  }
};


exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    await task.save();

    res.json({ message: 'Task status updated successfully' });
  } catch (err) {
    console.error('Error in updateTaskStatus:', err);
    res.status(500).json({ message: 'Failed to update task status', error: err.message });
  }
};

// Update Task (Admin Only)
exports.updateTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, deadline, priority, subTasks } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.deadline = deadline || task.deadline;
    task.priority = priority || task.priority;

    if (Array.isArray(assignedTo) && assignedTo.length > 0) {
      task.assignedTo = assignedTo;
    }

    if (Array.isArray(subTasks)) {
      const validatedSubTasks = await Promise.all(
        subTasks.map(async (sub) => {
          const subAssigned = sub.assignedTo || [];
          const subUsers = await User.find({ _id: { $in: subAssigned } });
          if (subUsers.length !== subAssigned.length) {
            throw new Error('One or more sub-task assigned users not found');
          }
          return {
            title: sub.title || '',
            description: sub.description || '',
            assignedTo: subAssigned,
            deadline: sub.deadline || null,
            priority: sub.priority || 'medium',
            status: sub.status || 'pending',
          };
        })
      );
      task.subTasks = validatedSubTasks;
    }

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('subTasks.assignedTo', 'name email');

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (err) {
    console.error('Error in updateTaskById:', err);
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};

// Delete Task (Admin Only)
exports.deleteTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error in deleteTaskById:', err);
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};

// Update Sub-task Status (Employee)
exports.updateSubTaskStatus = async (req, res) => {
  try {
    const { taskId, subTaskIndex } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const index = parseInt(subTaskIndex);
    if (isNaN(index) || index < 0 || index >= task.subTasks.length) {
      return res.status(400).json({ message: 'Invalid sub-task index' });
    }

    const subTask = task.subTasks[index];
    const isAssigned = subTask.assignedTo.some(
      (empId) => empId.toString() === req.user._id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({ message: 'Not authorized to update this sub-task' });
    }

    // Update sub-task status
    subTask.status = status;

    // Recalculate main task status based on sub-tasks
    const allCompleted = task.subTasks.every((sub) => sub.status === 'completed');
    const anyInProgress = task.subTasks.some((sub) => sub.status === 'in progress');

    if (task.subTasks.length > 0) {
      if (allCompleted) {
        task.status = 'completed';
      } else if (anyInProgress) {
        task.status = 'in progress';
      } else {
        task.status = 'pending';
      }
    }

    await task.save();

    res.json({ message: 'Sub-task status updated successfully', task });
  } catch (err) {
    console.error('Error in updateSubTaskStatus:', err);
    res.status(500).json({ message: 'Failed to update sub-task status', error: err.message });
  }
};
