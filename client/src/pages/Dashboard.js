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
import Facebook from "../assets/facebookLogo.png";
import loader from "../assets/loader.gif";
import destinationLoader from "../assets/destinationLoader.gif";
import addDestinationLogo from "../assets/add-icon.svg";
import { UserContext } from "../store/user-context";
import { getDestinationsRoute, addDestinationRoute } from "../utils/APIRoutes";
import { getHeaders } from "../utils/auth";

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
  const [isUserMediaLoading, setIsUserMediaLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(false);

  const videoRef = useRef(null);

  const { isLoggedIn } = useContext(UserContext);

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
      setIsDestinationsLoading(true);
      try {
        const { data } = await axios.get(getDestinationsRoute, getHeaders());

        if (data.destinations) {
          setDestinations(data.destinations);
        }
        setIsDestinationsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    getDestinations();
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

  const destinationSelectHandler = () => {
    setIsDestinatonSelected((prevState) => !prevState);
  };

  const addNewDestinationHandler = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setApiKey("");
    setSelectedDestination("");
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
        channel: selectedDestination,
        apiKey,
      };

      const response = await axios.post(
        addDestinationRoute,
        newDestination,
        getHeaders()
      );
      if (response.status === 201) {
        console.log(response.data);
        const { updatedDestinations } = response.data;
        if (updatedDestinations) {
          setDestinations(updatedDestinations);
          setApiKey("");
          closeModal();
        } else {
          toast.error("Some error in adding destination!", toastOptions);
        }
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
        {isUserMediaLoading ? (
          <img src={loader} alt="loader" />
        ) : (
          <video ref={videoRef} className="video-stream" autoPlay muted>
            <source src="your-video-source.mp4" type="video/mp4" /> Your browser
            does not support the video tag.
          </video>
        )}
        <h2>Select Destinations</h2>
        {isDestinationsLoading ? (
          <img src={destinationLoader} alt="loader" />
        ) : (
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
        )}

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
