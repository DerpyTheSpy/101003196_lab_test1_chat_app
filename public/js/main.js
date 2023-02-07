const chatForm = document.getElementById('chat-form');

const socket = io();

// Get Query Params from URL
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const room = urlParams.get('room');

// User joins the room
socket.emit('joinRoom', { username, room });

// Access room users and room name from socket server
socket.on('roomUsers', ({ room, users }) => {
  returnRoomAndUsers(room, users);
})


// Submit message
socket.on('message', message => {
  console.log(message);
  addMessageToDOM(message);
})

socket.on('populateChatRoom', messageDB => {
  console.log(messageDB);
  addMessageFromDB(messageDB);
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