const express = require('express');
const verifyFirebaseToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /auth-test:
 *   get:
 *     summary: Test Firebase authentication
 *     tags: [AuthTest]
 *   
 *     responses:
 *       200:
 *         description: Authenticated user data
 *       401:
 *         description: Unauthorized
 */
router.get('/', authTest);

// Test if Firebase token is working
router.get('/protected', verifyFirebaseToken, (req, res) => {
  res.json({
    message: 'You are authenticated via Firebase!',
    user: req.user, // Contains uid, email, etc.
  });
});

module.exports = router;


