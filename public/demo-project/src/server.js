const express = require('express');
const apiRoutes = require('./routes/api');
const db = require('./db');

const app = express();
app.use(express.json());

// BUG: API key hardcoded in source ÔÇö should come from process.env.API_KEY
const API_KEY = 'sk-hardcoded-secret-a3f9b2c1d4e5';

// BUG: DATABASE_URL is referenced but never validated or checked for undefined
const dbUrl = process.env.DATABASE_URL;
db.connect(dbUrl);

app.use('/api', apiRoutes);

// TODO: validate user input before processing

// BUG: no error handling middleware ÔÇö unhandled errors will crash the process
app.get('/health', (req, res) => {
  const status = db.ping();
  res.json({ status, version: '1.0.0' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

module.exports = app;
