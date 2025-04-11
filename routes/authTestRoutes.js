const express = require('express');
const verifyFirebaseToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /auth-test:
 *   get:
 *     summary: Test Firebase authentication
 *     tags: [AuthTest]
 *     responses:
 *       200:
 *         description: Authenticated user data
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyFirebaseToken, (req, res) => {
  res.status(200).json({
    message: 'You are authenticated via Firebase!',
    user: req.user, // Firebase user data like uid, email, etc.
  });
});

module.exports = router;
