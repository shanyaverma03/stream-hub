const express = require("express");
const cors = require("cors");
const http = require("http");
const socket = require("socket.io");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  socket.on("binarystream", (stream) => {
    console.log("Binary stream incoming");
  });
});

server.listen(process.env.PORT || 8000, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
