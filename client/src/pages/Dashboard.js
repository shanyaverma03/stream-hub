import React, { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../components/Header";
import "./Dashboard.css";
import YouTube from "../assets/youTubeLogo.png";
import Facebook from "../assets/facebookLogo.png";
import addDestinationLogo from "../assets/add-icon.svg";
import { UserContext } from "../store/user-context";
import Modal from "../utils/Modal";
import loader from "../assets/loader.gif";
import { toastOptions } from "../utils/toast";

const socket = io("http://localhost:8000");

const Dashboard = () => {
  const logoMapping = {
    YouTube,
    Facebook,
  };
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [media, setMedia] = useState(null);
  const [isUserMediaLoading, setIsUserMediaLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [startStream, setStartStream] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

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
    console.log(destinations);
    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
    });

    if (!media) {
      getUserMedia();
    }

    return () => {
      if (socket.readyState === 1) {
        socket.close();
      }
    };
  }, []);

  const startLiveStreamHandler = () => {
    setStartStream(true);

    const apiKeys = {};

    selectedDestinations.forEach((selectedDestination) => {
      const destination = destinations.find(
        (dest) => dest.channel === selectedDestination
      );
      if (destination) {
        if (selectedDestination === "YouTube") {
          apiKeys.youtube = destination.apiKey;
        } else if (selectedDestination === "Facebook") {
          apiKeys.facebook = destination.apiKey;
        }
      }
    });

    socket.emit("start-stream", { apiKeys });

    const mediaRecorder = new MediaRecorder(media, {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      framerate: 25,
    });

    mediaRecorder.ondataavailable = (event) => {
      console.log("Binary stream available", event.data);
      socket.emit("binarystream", event.data);
    };
    mediaRecorder.start(25);
    setMediaRecorder(mediaRecorder);

    toast.success(
      `Streaming has been started on ${Object.keys(apiKeys)}`,
      toastOptions
    );
  };

  const stopLiveStreamHandler = () => {
    setStartStream(false);

    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.ondataavailable = null;
      setMediaRecorder(null);
    }

    socket.emit("stop-stream");
    toast.success(`Streaming has been stopped`, toastOptions);
  };

  const destinationSelectHandler = (channel, event) => {
    event.stopPropagation();
    setSelectedDestinations((prevSelected) =>
      prevSelected.includes(channel)
        ? prevSelected.filter((c) => c !== channel)
        : [...prevSelected, channel]
    );
  };

  const addNewDestinationHandler = () => {
    setModalIsOpen(true);
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div
        className="dashboardCard"
        onClick={() => setSelectedDestinations([])}
      >
        <h1>Create a Live Stream</h1>
        {isUserMediaLoading ? (
          <img src={loader} alt="loader" />
        ) : (
          <video ref={videoRef} className="video-stream" autoPlay muted>
            <source src="your-video-source.mp4" type="video/mp4" /> Your browser
            does not support the video tag.
          </video>
        )}
        <h2>Select Destination(s)</h2>

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
                  src={logoMapping[destination.channel]}
                  alt="Channel Logo"
                  className={`destination-logo ${
                    selectedDestinations.includes(destination.channel)
                      ? "selected"
                      : ""
                  }`}
                  onClick={(event) =>
                    destinationSelectHandler(destination.channel, event)
                  }
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

        <>
          {!startStream && selectedDestinations.length > 0 && (
            <button className="stream-btn" onClick={startLiveStreamHandler}>
              Start Stream
            </button>
          )}
          {startStream && (
            <button className="stream-btn" onClick={stopLiveStreamHandler}>
              Stop Stream
            </button>
          )}
        </>
      </div>
      <Modal modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} />
    </div>
  );
};

export default Dashboard;
