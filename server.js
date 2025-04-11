const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');
const setupSwagger = require('./config/swagger');

const transactionRoutes = require('./routes/transactionRoutes');
const groupRoutes = require('./routes/groupRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const authTestRoutes = require('./routes/authTestRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

dotenv.config();       // Load .env variables
connectDB();           // Connect to MongoDB

app.use(cors());
app.use(express.json());

// ✅ Swagger UI
setupSwagger(app);

// ✅ Base welcome route
app.get('/', (req, res) => {
  res.send('Welcome! SplitBill API is running...');
});

// ✅ All API Routes
app.use('/api/groups', groupRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/test', authTestRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
