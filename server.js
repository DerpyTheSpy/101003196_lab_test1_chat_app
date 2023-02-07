const app = require("express")();
const http = require("http").createServer(app);
const { Console } = require("console");
const cors = require("cors");
const PORT = 3000;
const express = require("express");
const mongoose = require("mongoose");

const userModel = require(__dirname + "/public/models/User");
const gmModel = require(__dirname + "/public/models/GroupMessage");
const pmModel = require(__dirname + "/public/models/PrivateMessage");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




const io = require("socket.io")(http);

app.use(cors());
users = [];

io.on("connection", (socket) => {
  console.log(`${socket.id} Connected`);

  socket.emit("welcome", "Welcome to Socket Programming : " + socket.id);

  socket.on("message", (data) => {
    if (data.room == "" || data.room == undefined) {
      io.emit("newMessage", socket.id + " : " + data.message);
    } else {
      io.to(data.room).emit("newMessage", socket.id + " : " + data.message);
      if (
        data.room == "news" ||
        data.room == "covid" ||
        data.room == "nodeJs"
      ) {
        const gm = new gmModel({
          from_user: socket.id,
          room: data.room,
          message: data.message,
        });
        try {
          gm.save();
        } catch (err) {
          console.log(err);
        }
      } else {
        const pm = new pmModel({
          from_user: socket.id,
          to_user: room,
          message: data.message,
        });
        try {
          pm.save();
        } catch (err) {
          console.log(err);
        }
      }
    }
  });

  socket.on("newUser", (name) => {
    if (!users.includes(name)) {
      users.push(name);
    }
    socket.id = name;
  });

  socket.on("userTyping", (data) => {
    socket.broadcast.to(data.room).emit("showChatUI", data.username);
  });

  socket.on("joinroom", (room) => {
    socket.join(room);
    roomName = room;
    socket.currentRoom = room;
    const msg = gmModel
      .find({ room: room })
      .sort({ date_sent: "desc" })
      .limit(10);
    socket.msg = msg;
  });

  socket.on("leaveRoom", () => {
    socket.leave(socket.currentRoom);
    socket.currentRoom = null;
    console.log(socket.rooms);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
});

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

mongoose
  .connect(
    'mongodb+srv://derpythespy:2231663@cluster0.4dp6azc.mongodb.net/101003196_lab_test1_chat_app?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((success) => {
    console.log("Successful Mongodb connection !");
  })
  .catch((err) => {
    console.log("Error in Mongodb connection !");
  });

//the server http://localhost:3000/signup
app.get("/signup", async (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app.post("/login", async (req, res) => {
  try{
      const check= await collection.findOne({username:req.body.username});
      if(check.password === req.body.password){
          res.redirect('/chat');
      }
      else{
          res.send("Invalid credentials")
          res.render('/login');
   
      }
  }catch{
      res.send("Invalid credentials")
      res.render('/login');
  }

});
//the server http://localhost:3000/login
app.get("/login", async (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.post("/signup", async (req, res) => {
  const user = new User(req.body);
  try{
   const newuser = await user.save();
   if(newuser!=null){
       res.redirect('/login');
   }
  }catch{
      res.send("Invalid credentials")
      res.render('/signup');
  }
  user.save()
  .then(data => {
      res.send(data);
  }).catch(err => {
      res.status(500).send({
          message: err.message || "Some error occurred while creating the account."
      });
  });
});

//the server http://localhost:3000/
app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.post("/", async (req, res) => {
  const user = new User(req.body);
  // try{
      const newuser = await user.save();
      if(newuser!=null){
          res.redirect('/login');
      }        
  user.save()
  .then(data => {
      res.send(data);
  }).catch(err => {
      res.status(500).send({
          message: err.message || "Some error occurred while creating the account."
      });
  });
});

// the covid option http://localhost:3000/chat/covid
app.get("/chat/:room", async (req, res) => {
  const room = req.params.room;
  const msg = await gmModel
    .find({ room: room })
    .sort({ date_sent: "desc" })
    .limit(10)
    .select("from_user message date_sent");
  console.log(msg);
  res.sendFile(__dirname + "/public/chatRoom.html");
});

app.post("/chat", async (req, res) => {
  const username = req.body.username;
  const user = await userModel.find({ username: username });

  if (user[0].username == username) {
    return res.redirect("/chat/" + username);
  } else {
    return res.redirect("/?err=noUser");
  }
});

http.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
