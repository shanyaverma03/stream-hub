import React, { useState, useEffect, useRef } from "react";

import Header from "../components/Header";
import "./Dashboard.css";
import youTubeLogo from "../assets/ytLogo.png";

function Dashboard() {
  const [isYouTubeSelected, setIsYouTubeSelected] = useState(false);
  const videoRef = useRef(null);

  const getUserMedia = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  useEffect(() => {
    getUserMedia();
  }, []);

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
            className="youtube-logo"
            onClick={handleYouTubeClick}
          />
        </div>
        {isYouTubeSelected && (
          <button className="start-stream-btn">Start Stream</button>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
