const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  members: [{ type: String}],
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
