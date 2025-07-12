const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  isRead: { type: Boolean, default: false },
  targetLink: String,
  type: { type: String, enum: ['answer', 'comment', 'mention'] }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
