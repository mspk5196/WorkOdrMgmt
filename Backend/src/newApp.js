const express = require('express');
const cors = require('express');

const app = express();
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body);
  next();
});

// Auth routes
app.use('/api/auth', require('./routes/newAuth'));

// Job management routes
app.use('/api/job-orders', require('./routes/jobOrders'));
app.use('/api/work-orders', require('./routes/workOrders'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/work-plans', require('./routes/workPlans'));
app.use('/api/invoices', require('./routes/invoices'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

module.exports = app;
