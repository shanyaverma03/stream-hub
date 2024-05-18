import React, { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";

import Header from "../components/Header";
import "./Dashboard.css";
import YouTube from "../assets/youTubeLogo.png";
import loader from "../assets/loader.gif";
import addDestinationLogo from "../assets/add-icon.svg";
import { UserContext } from "../store/user-context";
import { getDestinationsRoute, addDestinationRoute } from "../utils/APIRoutes";
import { getAuthToken } from "../utils/auth";

const socket = io("http://localhost:8000");

const toastOptions = {
  position: "bottom-right",
  autoClose: 8000,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

//modal styles
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    height: "50%",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
};

Modal.setAppElement("#root");

function Dashboard() {
  const [isDestinationSelected, setIsDestinatonSelected] = useState(false);
  const [media, setMedia] = useState(null);
  const [isUserMediaLoading, setIsUserMediaLoading] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const videoRef = useRef(null);
  const { isLoggedIn, user } = useContext(UserContext);
  const navigate = useNavigate();

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
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

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

  useEffect(() => {
    const getDestinations = async () => {
      const token = getAuthToken();
      try {
        console.log(user.id);
        if (user.id) {
          const { data } = await axios.get(
            `${getDestinationsRoute}/${user.id}`,
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );

          if (data.destinations) {
            setDestinations(data.destinations);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    getDestinations();
  }, [user]);

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

  const destinationSelectHandler = () => {
    setIsDestinatonSelected((prevState) => !prevState);
  };

  const addNewDestinationHandler = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const addDestinationHandler = (destination) => {
    setSelectedDestination(destination);
  };

  const apiKeyChangeHandler = (e) => {
    setApiKey(e.target.value);
  };

  const destinationSubmitHandler = async (e) => {
    e.preventDefault();
    if (
      destinations.some(
        (destination) => destination.channel === selectedDestination
      )
    ) {
      toast.error("You have already added that!", toastOptions);
      return;
    }
    try {
      const newDestination = {
        userId: user.id,
        channel: selectedDestination,
        apiKey,
      };
      const token = getAuthToken();
      const { data } = await axios.post(
        `${addDestinationRoute}/${user.id}`,
        newDestination,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      if (data) {
        setDestinations([...destinations, newDestination]);
        closeModal();
      }
    } catch (err) {
      console.error("Error adding destination", err);
    }
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="card">
        <h1>Create a Live Stream</h1>
        {isUserMediaLoading && isUserMediaLoading ? (
          <img src={loader} alt="loader" />
        ) : (
          <video ref={videoRef} className="video-stream" autoPlay muted>
            <source src="your-video-source.mp4" type="video/mp4" /> Your browser
            does not support the video tag.
          </video>
        )}
        <h2>Select Destinations</h2>
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
                  src={destination.channel === "YouTube" ? YouTube : ""}
                  alt="Channel Logo"
                  className={`destination-logo ${
                    isDestinationSelected ? "selected" : ""
                  }`}
                  onClick={destinationSelectHandler}
                />
              ))}
              <div className="destination-container">
                <img
                  src={addDestinationLogo}
                  className="add-destination-logo"
                  alt="add destination logo"
                  onClick={addNewDestinationHandler}
                />
                <span className="tooltip-text">Add a new destination</span>
              </div>
            </>
          )}
        </div>
        {isDestinationSelected && (
          <button className="start-stream-btn" onClick={startLiveStreamHandler}>
            Start Stream
          </button>
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Add Destination Modal"
      >
        <h2>Add a Destination</h2>
        <div className="destination-options">
          <button
            className={selectedDestination === "YouTube" ? "selected" : ""}
            onClick={() => addDestinationHandler("YouTube")}
          >
            YouTube
          </button>
          <button
            className={selectedDestination === "Facebook" ? "selected" : ""}
            onClick={() => addDestinationHandler("Facebook")}
          >
            Facebook
          </button>
        </div>
        <form onSubmit={destinationSubmitHandler}>
          <div className="form-group">
            <label htmlFor="APIKey">API Key</label>
            <input
              type="text"
              id="apiKey"
              name="apiKey"
              value={apiKey}
              onChange={apiKeyChangeHandler}
              required
            />
          </div>
          <button
            type="submit"
            className="auth-btn"
            disabled={!selectedDestination || apiKey.trim().length === 0}
          >
            Add
          </button>
          <button type="button" onClick={closeModal}>
            Close
          </button>
        </form>
        <ToastContainer />
      </Modal>
    </div>
  );
}

export default Dashboard;
