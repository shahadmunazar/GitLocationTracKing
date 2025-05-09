const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files correctly
app.use(express.static(path.join(__dirname, "public")));

// Render the EJS page
app.get("/", function (req, res) {
  res.render("index"); // Make sure views/index.ejs exists
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);
    socket.on("send-location", function (data)  {
        io.emit("received-location",{id: socket.id, ...data})
      })
      
  socket.on("disconnect", function () { 
    io.emit("user-disconnected",socket.id)
    console.log("disconnected",socket.id)
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
