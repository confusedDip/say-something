const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require('dotenv').config();

usernameDB = process.env.CLOUD_USERNAME;
pwdDB = process.env.CLOUD_PASSWORD;
mongoose.set('bufferCommands', false);
mongoose.connect(
        "mongodb+srv://admin-souradip:AhDFgagOAgPUxxVw@cluster0.kfy9c.mongodb.net/secretsDB?retryWrites=true&w=majority",
        {
                useNewUrlParser: true,
                useUnifiedTopology: true,
        }
);

const secrets_userSchema = new mongoose.Schema({
        fname: String,
        username: String,
        messages: [String]
});

const User = new mongoose.model("User", secrets_userSchema);

const app = express();
app.use(bodyParser.urlencoded({
        extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function (req, res) {
        res.render("index", {
                text1: "",
                text2: "",
                url1: "",
                url2: ""
        });
});

app.get("/write_message/:username", function (req, res) {
        
       const username = req.params.username;
 

        User.findOne({username: username}, function(err, userFound){
                if(err) console.log(err);
                else{
                        if(userFound){
                                res.render("write_message", {
                                        user: userFound.fname,
                                        username: username,
                                        status: ""
                                });
                        }else{
                                res.send("<h1>Error: No User</h1>");
                        }
                }
        });

});

app.get("/read_message/:id", function(req, res){
        const id = req.params.id;

        User.findById(id, function(err, userFound){
                if(err) console.log(err);
                else{
                        const fname = userFound.fname;
                        const username = userFound.username;
                        const messages = userFound.messages;
                        res.render("read_message", {
                                Name: fname,
                                username: username,
                                messages: messages
                        });
                }
        });
});

app.post("/", function(req ,res){
        Name = req.body.user;
        
        // find if user with the same fname exists or not
        User.find({fname: Name}, function(err, users){
                if(err){
                        console.log(err);
                }else{
                        // update the username with name + count of users with the same name
                        username = Name + (users.length + 1);
                        
                        const newUser = new User({
                                fname: Name,
                                username: username,
                                messages: []
                        });
                        newUser.save();

                        
                        // retireve the ID of the last user
                        const id = newUser._id;

                        // console.log(req.originalUrl);
                        
                        // generate the read_urls and the write_urls
                        const read_urls = req.originalUrl + "read_message/"  + id;
                        const write_urls = req.originalUrl + "write_message/" + username;

                        res.render("index", {
                                text1: "Just copy <a href = '"+write_urls+"'>this link</a> and share with your friends..Have fun..",
                                text2: "Want to see the secret messages posted by your friends? Copy and save <a href = '"+read_urls+"'>this link</a><br>( This is an one time generated link. Make sure to keep a note of this link,otherwise you will not be able to see the secret messages)",
                        });
                }
        });


});

app.post("/write_message/:user", function(req, res){
        message = req.body.secret;
        username = req.params.user;
        // console.log(message + username);
        User.findOne({username: username}, function(err, newUser){
                if(err) console.log(err);
                else{
                        newUser.messages.push(message);
                        newUser.save();
                        res.render("write_message", {
                                user: newUser.fname,
                                username: username,
                                status: 'Succesfully sent your message! Want to create URL for yourself? Click <a href="/">Here</a>'
                        });
                }
        });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server Started at Port " + port);
}); 