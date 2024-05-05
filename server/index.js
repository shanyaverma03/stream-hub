const express = require("express");
const cors = require("cors");
const http = require("http");
const socket = require("socket.io");
const { spawn } = require("child_process");

require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const options = [
  "-i",
  "-",
  "-c:v",
  "libx264",
  "-preset",
  "ultrafast",
  "-tune",
  "zerolatency",
  "-r",
  `${25}`,
  "-g",
  `${25 * 2}`,
  "-keyint_min",
  25,
  "-crf",
  "25",
  "-pix_fmt",
  "yuv420p",
  "-sc_threshold",
  "0",
  "-profile:v",
  "main",
  "-level",
  "3.1",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-ar",
  128000 / 4,
  "-f",
  "flv",
  `rtmp://a.rtmp.youtube.com/live2/${process.env.API_KEY}`,
];

const ffmpegProcess = spawn("ffmpeg", options);

ffmpegProcess.stdout.on("data", (data) => {
  console.log(`ffmpeg stdout: ${data}`);
});

ffmpegProcess.stderr.on("data", (data) => {
  console.error(`ffmpeg stderr: ${data}`);
});

ffmpegProcess.on("close", (code) => {
  console.log(`ffmpeg process exited with code ${code}`);
});

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  socket.on("binarystream", (stream) => {
    console.log("Binary stream incoming");
    ffmpegProcess.stdin.write(stream, (err) => {
      console.log("Error", err);
    });
  });
});

server.listen(process.env.PORT || 8000, "0.0.0.0", () =>
  console.log(`Server started on ${process.env.PORT || 8000}`)
);
