const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Provide username"],
    trim: true
  },
  firstname: {
    type: String,
    required: [true, "Provide first name"],
    trim: true
  },
  lastname: {
    type: String,
    required: [true, "Provide last name"],
    trim: true
  },
  password: {
    type: String,
    required: [true, "Provide password"]
  },
  createon: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model('User', userSchema)
module.exports = User