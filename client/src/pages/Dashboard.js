import React, { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";

import Header from "../components/Header";
import "./Dashboard.css";
import YouTube from "../assets/youTubeLogo.png";
import Facebook from "../assets/facebookLogo.png";
import addDestinationLogo from "../assets/add-icon.svg";
import { UserContext } from "../store/user-context";
import Modal from "../utils/Modal";
import loader from "../assets/loader.gif";

const socket = io("http://localhost:8000");

const Dashboard = () => {
  const [isDestinationSelected, setIsDestinatonSelected] = useState(false);
  const [media, setMedia] = useState(null);
  const [isUserMediaLoading, setIsUserMediaLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false); // State to control modal visibility

  const videoRef = useRef(null);

  const { destinations } = useContext(UserContext);

  const getUserMedia = async () => {
    try {
      setIsUserMediaLoading(true);
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMedia(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
      setIsUserMediaLoading(false);
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
    const mediaRecorder = new MediaRecorder(media, {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      framerate: 25,
    });
    mediaRecorder.ondataavailable = (event) => {
      console.log("on data available");
      console.log("Binary stream available", event.data);
      socket.emit("binarystream", event.data);
    };
    mediaRecorder.start(25);
  };

  const destinationSelectHandler = () => {
    setIsDestinatonSelected((prevState) => !prevState);
  };

  const addNewDestinationHandler = () => {
    setModalIsOpen(true);
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="card">
        <h1>Create a Live Stream</h1>
        {isUserMediaLoading ? (
          <img src={loader} alt="loader" />
        ) : (
          <video ref={videoRef} className="video-stream" autoPlay muted>
            <source src="your-video-source.mp4" type="video/mp4" /> Your browser
            does not support the video tag.
          </video>
        )}
        <h2>Select Destination</h2>

        <div className="destinations">
          {destinations.length === 0 ? (
            <button
              className="add-destination-btn"
              onClick={addNewDestinationHandler}
            >
              + Add a destination
            </button>
          ) : (
            <>
              {destinations.map((destination, index) => (
                <img
                  key={index}
                  src={
                    destination.channel === "YouTube"
                      ? YouTube
                      : "" || destination.channel === "Facebook"
                      ? Facebook
                      : ""
                  }
                  alt="Channel Logo"
                  className={`destination-logo ${
                    isDestinationSelected ? "selected" : ""
                  }`}
                  onClick={destinationSelectHandler}
                />
              ))}
              {destinations.length < 2 && (
                <div className="destination-container">
                  <img
                    src={addDestinationLogo}
                    className="add-destination-logo"
                    alt="add destination logo"
                    onClick={addNewDestinationHandler}
                  />
                  <span className="tooltip-text">Add a new destination</span>
                </div>
              )}
            </>
          )}
        </div>

        {isDestinationSelected && (
          <button className="start-stream-btn" onClick={startLiveStreamHandler}>
            Start Stream
          </button>
        )}
      </div>
      <Modal modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} />
    </div>
  );
};

export default Dashboard;
