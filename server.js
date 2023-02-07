const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const userRouter = require('./routes/UserRoutes.js');
const GroupMessage = require('./public/models/GroupMessage.js');
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Connection to mongoDB database
mongoose.connect('mongodb+srv://derpythespy:2231663@cluster0.4dp6azc.mongodb.net/101003196_lab_test1_chat_app?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(success => {
  console.log('Success Mongodb connection')
}).catch(err => {
  console.log('Error Mongodb connection')
});

// MESSAGE FUNCTIONALITY
function getFormattedTime() {
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  let am_pm = 'AM';
  if (hours >= 12) {
    am_pm = 'PM';
    hours = hours % 12 || 12;
  }

  return `  ${hours}:${minutes}:${seconds} ${am_pm}`;
}

function returnUpdatedMessage(username, text) {
  return {
    username,
    text,
    createdAt: getFormattedTime()
  }
}


const users = [];

function userJoin(id, username, room) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

// Get current user
function getCurrUser(id) {
  return users.find(user => user.id === id);
}

// User exit the chat 
function userExit(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    const removedUser = users.splice(index, 1);
    return removedUser[0];
  }
}

// Get room users
function getUsersFromRoom(room) {
  return users.filter(user => user.room === room);
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Execute if client connects 
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    // Populate selected chat room with messages from mongoDB database
    GroupMessage.find({ room }).then(success => {
      socket.emit('populateChatRoom', success)
    })

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', returnUpdatedMessage('Minkyu the creator', 'Welcome to my chat app'))
    // Broadcast when a user connects to a specific room
    socket.broadcast.to(user.room).emit('message', returnUpdatedMessage('Minkyu the creator', `${user.username} joined the chat`))

    // Add room users and room name to the side panel in the DOM
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getUsersFromRoom(user.room)
    })
  })

  // Check userChatMessage from server
  socket.on('userChatMessage', (msg) => {
    // Get current user 
    const user = getCurrUser(socket.id);
    const message = new GroupMessage({ from_user: user.username, room: user.room, message: msg })
    message.save().then(success => {
      console.log('Success - Message saved')
      io.to(success.room).emit('message', returnUpdatedMessage(success.from_user, success.message));
    })


  })

  // Execute if client disconnected
  socket.on('disconnect', () => {
    const user = userExit(socket.id);

    if (user) {
      io.to(user.room).emit('message', returnUpdatedMessage('Minkyu the creator', `${user.username} has left`))

      // room users and room name to the side panel in the DOM
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getUsersFromRoom(user.room)
      })
    }
  })
});


app.use(userRouter)
  
  server.listen(3000, () => console.log("The server is running on port 3000"));