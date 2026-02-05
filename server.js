require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

server.listen(process.env.PORT, () =>
  console.log("Server running on", process.env.PORT),
);
