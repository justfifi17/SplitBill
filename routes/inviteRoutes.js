// routes/inviteRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Example Gmail-based transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,       // your Gmail address
    pass: process.env.MAIL_PASS        // Gmail App Password (not normal login)
  }
});

router.post('/send-email', async (req, res) => {
  const { to, fromName } = req.body;

  if (!to || !fromName) {
    return res.status(400).json({ error: 'Missing email or name' });
  }

  try {
    await transporter.sendMail({
      from: `"${fromName} from SplitBill" <${process.env.MAIL_USER}>`,
      to,
      subject: 'You’ve been invited to SplitBill!',
      html: `
        <p>Hi there,</p>
        <p><strong>${fromName}</strong> invited you to join a group on <strong>SplitBill</strong>.</p>
        <p><a href="https://splitbill.app/join">Click here to join</a> or open the app.</p>
      `
    });

    res.status(200).json({ message: 'Invite sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
