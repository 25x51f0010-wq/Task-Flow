const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

router.post('/', async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
    const task = await Task.create({ user: req.userId, title, description, priority });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, completed } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (priority !== undefined) update.priority = priority;
    if (completed !== undefined) update.completed = completed;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      update,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
