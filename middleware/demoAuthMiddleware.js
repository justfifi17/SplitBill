// middleware/demoAuthMiddleware.js
const admin = require('../config/firebaseAdmin');

const DEMO_USER = {
  uid: 'demo-user-123',
  email: 'demo@splitbill.com',
};

const demoAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = decoded;
    } catch (err) {
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }
  } else {
    // 🚨 Demo fallback user
    req.user = DEMO_USER;
  }

  next();
};

module.exports = demoAuth;
