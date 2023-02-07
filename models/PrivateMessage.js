const mongoose = require('mongoose');

const PrivateMessageSchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: [true, "Provide from_user"]
  },
  to_user: {
    type: String,
    required: [true, "Provide to_user"]
  },
  message: {
    type: String,
    required: [true, "Provide message"]
  },
  date_sent: {
    type: Date,
    default: Date.now
  }
})