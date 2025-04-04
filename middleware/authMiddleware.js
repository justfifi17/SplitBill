// const admin = require('../config/firebaseAdmin');

// const verifyFirebaseToken = async (req, res, next) => {
//   const token = req.headers.authorization?.split('Bearer ')[1];

//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     req.user = decodedToken;
//     next(); // Proceed to actual route handler
//   } catch (error) {
//     console.error('Token verification failed:', error.message);
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// module.exports = verifyFirebaseToken;
