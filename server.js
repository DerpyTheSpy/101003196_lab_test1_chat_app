const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const GroupMessage = require('./public/models/GroupMessage.js');
const userRouter = require('./routes/UserRoutes.js');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.json());
mongoose.connect('mongodb+srv://DerpyTheSpy:jk2231663@cluster0.7yumk.mongodb.net/101003196_lab_test1_chat_app?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successful MongoDB Connection');
})
.catch(err => {
  console.log('Error MongoDB Connection');
});

function formatTime() {
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

function getUpdatedMessage(username, text) {
  return {
    username,
    text,
    createdAt: formatTime()
  };
}

const users = [];

function addUser(id, username, room) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

function currentUser(id) {
  return users.find(user => user.id === id);
}

function exitUser(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    const removedUser = users.splice(index, 1);
    return removedUser[0];
  }
}

function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

app.use(express.static(path.join(__dirname, 'public')));

// Execute if client connects 
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
      GroupMessage.find({ room })
        .then(success => socket.emit('populateChatRoom', success))
  
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);
  
      socket.emit('message', returnUpdatedMessage('Minkyu the creator', 'Welcome to my chat app'));
      socket.broadcast.to(user.room).emit('message', returnUpdatedMessage('Minkyu the creator', `${user.username} joined the chat`));
      io.to(user.room).emit('roomUsers', { room: user.room, users: getUsersFromRoom(user.room) });
    });
  
    socket.on('userChatMessage', msg => {
      const user = getCurrUser(socket.id);
      const message = new GroupMessage({ from_user: user.username, room: user.room, message: msg });
      message.save()
        .then(success => {
          console.log('Success - Message saved');
          io.to(success.room).emit('message', returnUpdatedMessage(success.from_user, success.message));
        });
    });
  
    socket.on('disconnect', () => {
      const user = userExit(socket.id);
      if (user) {
        io.to(user.room).emit('message', returnUpdatedMessage('Minkyu the creator', `${user.username} has left`));
        io.to(user.room).emit('roomUsers', { room: user.room, users: getUsersFromRoom(user.room) });
      }
    });
  });
  
  app.use(userRouter);
  
  server.listen(3000, () => console.log("The server is running on port 3000"));