import React, { useState, useContext } from "react";
import ReactModal from "react-modal";
import { toast } from "react-toastify";
import axios from "axios";

import { UserContext } from "../store/user-context";
import { destinationRoute } from "./APIRoutes";
import { getHeaders } from "./auth";
import { toastOptions } from "./toast";
import classes from "./Modal.module.css";

const Modal = ({ modalIsOpen, setModalIsOpen }) => {
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "50%",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.85)",
    },
  };

  const { destinations, setDestinations } = useContext(UserContext);

  const [apiKey, setApiKey] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);

  const closeModal = () => {
    setApiKey("");
    setSelectedDestination("");
    setModalIsOpen(false);
  };

  const selectDestinationHandler = (destination) => {
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
        destinationRoute,
        newDestination,
        getHeaders()
      );
      if (response.status === 201) {
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
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Add Destination Modal"
      ariaHideApp={false}
    >
      <h2 className={classes.addDestination}>Add a Destination</h2>
      <div className={classes.destinationOptions}>
        {destinations &&
          !destinations.some(
            (destination) => destination.channel === "YouTube"
          ) && (
            <button
              className={
                selectedDestination === "YouTube" ? classes.selected : ""
              }
              onClick={() => selectDestinationHandler("YouTube")}
            >
              YouTube
            </button>
          )}
        {destinations &&
          !destinations.some(
            (destination) => destination.channel === "Facebook"
          ) && (
            <button
              className={
                selectedDestination === "Facebook" ? classes.selected : ""
              }
              onClick={() => selectDestinationHandler("Facebook")}
            >
              Facebook
            </button>
          )}
      </div>
      <form onSubmit={destinationSubmitHandler} className={classes.apiKeyForm}>
        <div className={classes.formGroup}>
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
          className={classes.addDestinationBtn}
          disabled={!selectedDestination || apiKey.trim().length === 0}
        >
          Add
        </button>
        <button type="button" onClick={closeModal} className={classes.closeBtn}>
          Close
        </button>
      </form>
    </ReactModal>
  );
};

export default Modal;
