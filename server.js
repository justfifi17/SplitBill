const express = require('express');
const app = express();
const setupSwagger = require('./config/swagger');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const express = require('express');


dotenv.config();       // Load .env file
connectDB();           // Connect to MongoDB

app.use(cors());
app.use(express.json());
setupSwagger(app);

// Base route
app.get('/', (req, res) => {
  res.send('Welcome! SplitBill API is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const authTestRoutes = require('./routes/authTestRoutes');
app.use('/api/test', authTestRoutes);

const groupRoutes = require('./routes/groupRoutes');
app.use('/api/groups', groupRoutes);

app.use('/api/transactions', transactionRoutes);

const receiptRoutes = require('./routes/receiptRoutes');

app.use('/api/receipts', receiptRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



