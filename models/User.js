const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Firebase UID as the primary ID
  email: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
