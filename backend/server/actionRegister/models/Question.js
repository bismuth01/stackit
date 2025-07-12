const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  title: String,
  description: String, // rich text (HTML/Markdown)
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
