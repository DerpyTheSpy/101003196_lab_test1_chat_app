const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter the username: "],
    trim: true,
    lowercase: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please enter the email: "],
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter the password for authentication:"],
    minlength: 5,
  },
  createon: {
    type: Date,
    default: Date.now,
  },
});

userSchema.post("init", (doc) => {
  console.log("%s has been initialized from the db", doc._id);
});

userSchema.post("validate", (doc) => {
  console.log("%s has been validated (but not saved yet)", doc._id);
});

userSchema.post("save", (doc) => {
  console.log("%s has been saved", doc._id);
});

userSchema.post("remove", (doc) => {
  console.log("%s has been removed", doc._id);
});

const user = mongoose.model("user", userSchema);
module.exports = user;