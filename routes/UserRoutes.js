const express = require('express');
const UserModel = require('../models/User.js');
const routes = express.Router();

// Signup route
routes.post('/signup', async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      message: "Cannot pass an empty object"
    })
  }

  try {
    const newUser = new UserModel(req.body)
    const user = await newUser.save()
    res.status(201).send(user)
    console.log('User created successfully')
  }
  catch (error) {
    res.status(500).send(error)
  }
})

// Login route
routes.post('/login', async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      message: "Cannot pass an empty object"
    })
  }

  try {
    const usernameCheck = await UserModel.findOne({ username: req.body.username, password: req.body.password }).exec()

    if (usernameCheck != null) {
      res.status(200).send({
        status: true,
        username: req.body.username,
        message: "Login successful"
      })
    }
    else {
      res.status(500).send({
        status: false,
        message: "Such username does not exist"
      })
    }
  }
  catch (error) {
    res.status(400).send(error)
  }
})

module.exports = routes;