const mongoose = require('mongoose');

const DirectMessageSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  unreadCounts: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  lastMessage: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('DirectMessage', DirectMessageSchema);
