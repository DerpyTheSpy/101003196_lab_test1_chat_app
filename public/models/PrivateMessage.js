const mongoose = require("mongoose");

const privateMessageSchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: true,
  },
  to_user: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date_sent: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
const privateMessage = mongoose.model("privateMessage", privateMessageSchema);
module.exports = privateMessage;
