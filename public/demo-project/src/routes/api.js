const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/process
// BUG: no input validation ÔÇö req.body.userId and req.body.task are used
// directly without checking if they exist, are the right type, or are safe
router.post('/process', (req, res) => {
  const { userId, task } = req.body;

  // TODO: validate user input before processing
  // e.g. check userId is a number, task is a non-empty string

  // BUG: no try-catch ÔÇö if getUser throws, the server crashes
  const user = db.getUser(userId);

  const result = {
    user: user.name,
    task: task.toUpperCase(),
    processed: true,
    timestamp: new Date().toISOString(),
  };

  res.json(result);
});

// GET /api/tasks
// BUG: unhandled promise ÔÇö if the async operation rejects, it is silently swallowed
router.get('/tasks', async (req, res) => {
  const tasks = await db.getAllTasks();
  res.json(tasks);
});

module.exports = router;
