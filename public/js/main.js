const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const socket = io();

// get username and room from URL
const{ username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})


// User joins the room
socket.emit('joinRoom', { username, room });

// Access room users and room name from socket server
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
})

// Output room name
function outputRoomName(room) {
  roomName.innerText = room;
}

// Output users
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}




// Submit message
socket.on('message', message => {
  console.log(message);
  addMessageToDOM(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
})

//populate chat rooms

socket.on('populateChatRoom', messageDB => {
  messageDB.forEach(message => {
    addMessageFromDB(message);
  })
})


chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  // Emit message to server
  socket.emit('userChatMessage', msg);
  e.target.elements.msg.value = '';
})

// Add sent message to DOM
function addMessageToDOM(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
  <p class="msgInfo">${message.username}<span>${message.createdAt}</span></p>
  <p class="chatText">
    ${message.text}
  </p>`;
  document.querySelector('.chat-msgs').appendChild(div);
}

// ADD message from DB to DOM
function addMessageFromDB(messageDB) {
  messageDB.forEach(message => {
    let date = new Date(message.date_sent);
    let options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    let formattedDate = date.toLocaleString('en-US', options);

    let formattedMessage = {
      username: message.from_user,
      text: message.message,
      createdAt: formattedDate
    }

    addMessageToDOM(formattedMessage);
  })
}

// Update DOM with room name and room users
function returnRoomAndUsers(room, users) {
  const roomUsers = document.getElementById('users');
  const roomName = document.getElementById('room-name');
  roomName.innerText = room;
  roomUsers.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
