const express = require('express');
const cors = require('cors');
require('dotenv').config();

const jobRoutes  = require('./routes/jobs');
const authRoutes = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);   // public  — register & login
app.use('/api/jobs', jobRoutes);    // protected — JWT required inside jobs.js

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});