const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
});

module.exports = mongoose.model('Invitation', invitationSchema);
