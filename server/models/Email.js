const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    index: true
  },
  from: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: '(No Subject)'
  },
  text: {
    type: String,
    default: ''
  },
  html: {
    type: String,
    default: ''
  },
  attachments: [{
    filename: String,
    contentType: String,
    size: Number
  }],
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto-delete after 1 hour (TTL index)
  }
});

module.exports = mongoose.model('Email', emailSchema);
