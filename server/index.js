require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socket = require("socket.io");
const { spawn } = require("child_process");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const destinationsRoutes = require("./routes/destinationsRoutes");
const User = require("./models/userModel");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationsRoutes);
app.use("/api/destination", destinationRoutes);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on("start-stream", ({ apiKeys }) => {
    console.log(apiKeys);
    const optionsYoutube = [
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
      `rtmp://a.rtmp.youtube.com/live2/${apiKeys.youtube}`,
    ];

    const optionsFacebook = [
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
      `rtmps://live-api-s.facebook.com:443/rtmp/${apiKeys.facebook}`,
    ];

    const ffmpegYouTube = spawn("ffmpeg", optionsYoutube);
    const ffmpegFacebook = spawn("ffmpeg", optionsFacebook);

    ffmpegYouTube.stderr.on("data", (data) => {
      console.error(`YouTube ffmpeg stderr: ${data}`);
    });

    ffmpegFacebook.stderr.on("data", (data) => {
      console.error(`Facebook ffmpeg stderr: ${data}`);
    });

    ffmpegYouTube.stdout.on("data", (data) => {
      console.log(`ffmpeg youtube stdout: ${data}`);
    });

    ffmpegFacebook.stdout.on("data", (data) => {
      console.log(`ffmpeg facebook stdout: ${data}`);
    });

    ffmpegYouTube.on("close", (code) => {
      console.log(`ffmpeg youtube process exited with code ${code}`);
    });

    ffmpegFacebook.on("close", (code) => {
      console.log(`ffmpeg facebook process exited with code ${code}`);
    });

    socket.on("binarystream", (stream) => {
      console.log("Binary stream incoming");
      ffmpegYouTube.stdin.write(stream, (err) => {
        console.log("Error", err);
      });
      ffmpegFacebook.stdin.write(stream, (err) => {
        console.log("Error", err);
      });
    });

    socket.on("stop-stream", () => {
      if (ffmpegYouTube) {
        ffmpegYouTube.stdin.end();
        ffmpegYouTube.kill("SIGINT");
        console.log("Stream stopped and ffmpeg process killed");
      }
      if (ffmpegFacebook) {
        ffmpegFacebook.stdin.end();
        ffmpegFacebook.kill("SIGINT");
        console.log("Stream stopped and ffmpeg process killed");
      }
    });

    socket.on("disconnect", () => {
      if (ffmpegYouTube) {
        ffmpegYouTube.kill("SIGINT");
      }
      if (ffmpegFacebook) {
        ffmpegFacebook.kill("SIGINT");
      }
      console.log("Socket disconnected", socket.id);
    });
  });
});

server.listen(process.env.PORT || 8000, "0.0.0.0", () =>
  console.log(`Server started on ${process.env.PORT || 8000}`)
);
