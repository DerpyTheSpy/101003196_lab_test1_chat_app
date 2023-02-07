const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: true,
    trim: true,
    errorMessage: "from_user is required"
  },
  room: {
    type: String,
    required: true,
    errorMessage: "room is required"
  },
  message: {
    type: String,
    required: true,
    errorMessage: "message is required"
  },
  date_sent: {
    type: Date,
    default: Date.now
  }
});

const GroupMessage = mongoose.model('groupMessage', GroupMessageSchema);
module.exports = GroupMessage;