const express = require("express");
const { collection } = require("../public/models/user");
const User = require("../public/models/user");

const router = express.Router();


// module.exports = router;
router.post("/", async (req, res) => {
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


router.get("/login", async (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

router.get("/signup", async (req, res) => {
    res.sendFile(__dirname + "/public/signup.html");
});

router.post("/signup", async (req, res) => {
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




router.post("/login", async (req, res) => {
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
  module.exports = router;