const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables and connect to MongoDB
dotenv.config();
const connectDB = require('./config/db');
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); 
// Swagger setup
const setupSwagger = require('./config/swagger');
setupSwagger(app);

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome! SplitBill API is running...');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const authTestRoutes = require('./routes/authTestRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/test', authTestRoutes);

// Optional health check
app.get('/api/health', (req, res) => {
  res.send('✅ API is running fine');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
