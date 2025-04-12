const express = require('express');
const multer = require('multer');
const { getStorage } = require('firebase-admin/storage');
// const verifyFirebaseToken = require('../middleware/authMiddleware'); // Uncomment when needed

const router = express.Router();

// Use memory storage for small uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /receipts/upload:
 *   post:
 *     summary: Upload a receipt image
 *     tags: [Receipts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               receipt:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Receipt uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */
router.post(
  '/upload',
  // verifyFirebaseToken,
  upload.single('receipt'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const bucket = getStorage().bucket(); // Uses default from firebaseAdmin.js
      const fileName = `receipts/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);

      const blobStream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobStream.on('error', (err) => {
        console.error('Upload error:', err);
        res.status(500).json({
          message: 'Upload failed',
          error: err.message,
        });
      });

      blobStream.on('finish', async () => {
        await file.makePublic();
        const publicUrl = file.publicUrl();

        res.status(200).json({
          message: 'Receipt uploaded successfully',
          receiptUrl: publicUrl,
        });
      });

      blobStream.end(req.file.buffer);
    } catch (err) {
      console.error('Server error during upload:', err);
      res.status(500).json({
        message: 'Server error during upload',
        error: err.message,
      });
    }
  }
);

/**
 * @swagger
 * /receipts:
 *   get:
 *     summary: Get user's uploaded receipts
 *     tags: [Receipts]
 *     responses:
 *       200:
 *         description: List of receipts
 */
router.get('/', (req, res) => {
  // Placeholder — you can implement this later
  res.json({ message: 'Get receipts route is live!' });
});

module.exports = router;




