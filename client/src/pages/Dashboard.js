import React, { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";

import Header from "../components/Header";
import "./Dashboard.css";
import youTubeLogo from "../assets/youTubeLogo.png";
import { UserContext } from "../store/user-context";

const socket = io("http://localhost:8000");

function Dashboard() {
  const [isYouTubeSelected, setIsYouTubeSelected] = useState(false);
  const [media, setMedia] = useState(null);
  const videoRef = useRef(null);
  const { isLoggedIn } = useContext(UserContext);

  const getUserMedia = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMedia(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
    });

    getUserMedia();

    return () => {
      if (socket.readyState === 1) {
        socket.close();
      }
    };
  }, []);

  const startLiveStreamHandler = () => {
    //Record stream in real time and convert to binary
    const mediaRecorder = new MediaRecorder(media, {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      framerate: 25,
    });
    mediaRecorder.ondataavailable = (event) => {
      console.log("on data available");
      console.log("Binary stream available", event.data);
      //Send stream to backend
      socket.emit("binarystream", event.data);
    };
    mediaRecorder.start(25);
  };

  const handleYouTubeClick = () => {
    setIsYouTubeSelected((prevState) => !prevState);
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="card">
        <h1>Create a Live Stream</h1>
        <video ref={videoRef} className="video-stream" autoPlay muted>
          <source src="your-video-source.mp4" type="video/mp4" /> Your browser
          does not support the video tag.
        </video>
        <h2>Select Destinations</h2>
        <div className="destinations">
          <img
            src={youTubeLogo}
            alt="YouTube Logo"
            className={`youtube-logo ${isYouTubeSelected ? "selected" : ""}`}
            onClick={handleYouTubeClick}
          />
        </div>
        {isYouTubeSelected && (
          <button className="start-stream-btn" onClick={startLiveStreamHandler}>
            Start Stream
          </button>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
