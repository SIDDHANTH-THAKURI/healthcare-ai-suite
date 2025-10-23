const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DrugNexusAI API is running' });
});

// Import your routes
try {
  const authRoutes = require('./src/routes/authRouter');
  const chatRoutes = require('./src/routes/chatRouter');
  const medicineRoutes = require('./src/routes/medicineRouter');
  const prescriptionRoutes = require('./src/routes/prescriptionRouter');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/medicines', medicineRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
} catch (error) {
  console.log('Some routes not found, continuing...');
}

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DrugNexusAI API', 
    version: '1.0.0',
    endpoints: ['/health', '/api/auth', '/api/chat', '/api/medicines', '/api/prescriptions']
  });
});

// Export for Lambda
module.exports.handler = serverless(app);