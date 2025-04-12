// KEEP these
const express = require('express');
const multer = require('multer');
const { getStorage } = require('firebase-admin/storage');
const verifyFirebaseToken = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /receipts/upload:
 *   post:
 *     summary: Upload a receipt image
 *     tags: [Receipts]
 *     requestBody:
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
 *         description: Receipt uploaded
 */
// Already defined correctly below — no need to redeclare `uploadReceipt`

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

// ✅ Working Firebase Storage Upload Handler
router.post('/upload', /*verifyFirebaseToken,*/ upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const bucket = getStorage().bucket();
    const fileName = `receipts/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    const blobStream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.end(req.file.buffer);

    blobStream.on('error', (err) => {
      console.error(err);
      res.status(500).json({ message: 'Upload failed', error: err.message });
    });

    blobStream.on('finish', async () => {
      await file.makePublic(); // Optional, depending on privacy
      const publicUrl = file.publicUrl();

      res.status(200).json({
        message: 'Receipt uploaded successfully',
        url: publicUrl,
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during upload', error: err.message });
  }
});

module.exports = router;
