require("dotenv").config()
const express     = require("express");
const bodyParser  = require("body-parser");
const models      = require("./app/models");
const mongoose    = require("mongoose");
const app         = express();
const cors        = require("cors");
const PORT        = process.env.PORT;
let apiRoutes     = require("./app/routes")
const http        = require("http").Server(app);
const io          = require("socket.io")(http);




app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());


//Api routes
app.use("/api", apiRoutes);

//Socket.io
//Todo private messaging
//Basic configuration
io.on("connection", function(socket){
  console.log("Connected User");
  socket.on("disconnect", function(){
    console.log("Disconnected User")
  });
  socket.on("message", function(data){
    socket.broadcast.emit("message", {
      username: data.username,
      message: data.message
    })
  });
})
io.listen(8000)
  app.listen(PORT, () => {
    console.log("Listening on port " + PORT)
  });
