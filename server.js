//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const https = require("https");
const request = require("request");
const { LOADIPHLAPI} = require("dns");

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function (req, res) {
     
     res.render("home")     ;
 })

 app.get("/about",function (req, res) { 
    res.render("about");
  })
 app.get("/contact",function (req, res) { 
    res.render("contact");
  })


  app.get("/signup",function (req, res) {
    res.render("Signup")
    })   


  app.post("/",function (req, res) {

    const firstName = req.body.Name;
    const lastName = req.body.surName;
    const email = req.body.email;
  
     const data= {
      members:[{
        email_address:email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }]
     };
  
     const jsonData=JSON.stringify(data);
  
     const url = "https://us9.api.mailchimp.com/3.0/lists/e8d0b1881d"
  
     const options = {
      method:"POST",
      auth: "lovanshu:"+ process.env.API_KEY
    }
  
     const request = https.request(url, options, function (response) {
       
      if(response.statusCode === 200){
      res.redirect(`/${uuidV4()}`)
        // res.sendFile(__dirname + "/public/html/success.html")
      }
      else{
        res.sendFile(__dirname + "html/failure.html")
      }
       response.on("data",function (data) {
          console.log(JSON.parse(data));
         })
      })
  
      request.write(jsonData);
      request.end();
    }
  )
  
app.post("html/failure",function (req, res) {
      res.redirect("/signup")
     })

     app.get('/room', (req, res) => {
      res.redirect(`/${uuidV4()}`)
    })
    
app.get('/:room', (req, res) => {
      res.render('room', { roomId: req.params.room })
    })
    
    io.on('connection', socket => {
      socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId);
        // messages
        socket.on('message', (message) => {
          //send message to the same room
          io.to(roomId).emit('createMessage', message)
      }); 
    
        socket.on('disconnect', () => {
          socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
      })
    })

  server.listen(process.env.PORT||3000)
