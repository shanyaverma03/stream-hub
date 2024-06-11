import React, { useContext, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../components/Header";
import { UserContext } from "../store/user-context";
import classes from "./Destinations.module.css";
import Modal from "../utils/Modal";
import { destinationRoute } from "../utils/APIRoutes";
import { getAuthToken, getHeaders, removeAuthToken } from "../utils/auth";
import { toastOptions } from "../utils/toast";

function Destinations() {
  const { destinations, setDestinations, setIsLoggedIn } =
    useContext(UserContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editApiKey, setEditApiKey] = useState(false);
  const [editedDestination, setEditedDestination] = useState(null);
  const [updatedApiKey, setUpdatedApiKey] = useState("");

  const addNewDestinationHandler = () => {
    setModalIsOpen(true);
  };

  const saveEditedDestinationHandler = async (channel) => {
    try {
      console.log("called save edit");
      const response = await axios.put(
        destinationRoute,
        {
          channel,
          apiKey: updatedApiKey,
        },
        getHeaders()
      );

      if (response.status === 200) {
        setDestinations(response.data.updatedDestinations);
        toast.success(`API key for ${channel} updated!`, toastOptions);
        cancelEditing();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status &&
        error.response.status === 401
      ) {
        removeAuthToken();
        setIsLoggedIn(false);
      }
      toast.error("Something went wrong!", toastOptions);
      console.error("Error updating destination:", error);
    }
  };

  const deleteDestinationHandler = async (channel) => {
    try {
      console.log(channel);
      console.log(getHeaders());
      const response = await axios.delete(destinationRoute, {
        headers: {
          Authorization: "Bearer " + getAuthToken(),
        },
        params: { channel },
      });

      if (response.status === 200) {
        console.log(response.data);
        setDestinations(response.data.updatedDestinations);
      }
    } catch (error) {
      if (error.status && error.response.status === 401) {
        removeAuthToken();
        setIsLoggedIn(false);
      }
      toast.error("Something went wrong!", toastOptions);
      console.error("Error updating destination:", error);
    }
  };

  const startEditing = (destination) => {
    setEditApiKey(true);
    setEditedDestination(destination.channel);
    setUpdatedApiKey(destination.apiKey);
  };

  const cancelEditing = () => {
    setEditApiKey(false);
    setEditedDestination(null);
    setUpdatedApiKey("");
  };

  return (
    <div>
      <header>
        <Header />
      </header>

      <div className={classes.destinationsHeader}>
        <h1>Destinations</h1>
        {destinations.length < 2 && (
          <button
            className={classes.addDestinationBtn}
            onClick={addNewDestinationHandler}
          >
            Add a New Destination
          </button>
        )}
      </div>

      <hr className={classes.separator} />

      {destinations && destinations.length > 0 ? (
        <div className={classes.card}>
          <div className={classes.cardHeader}>
            <div className={classes.cardColumn}>Platforms</div>
            <div className={classes.cardColumn}>API Key</div>
            <div className={classes.cardColumn}>Actions</div>
          </div>
          {destinations &&
            destinations.map((destination, index) => (
              <React.Fragment key={index}>
                <hr className={classes.separator} />
                <div className={classes.cardRow}>
                  <div className={classes.cardColumn}>
                    {destination.channel}
                  </div>
                  <div className={classes.cardColumn}>
                    <input
                      type={
                        editApiKey && editedDestination === destination.channel
                          ? "text"
                          : "password"
                      }
                      value={
                        editApiKey && editedDestination === destination.channel
                          ? updatedApiKey
                          : destination.apiKey
                      }
                      className={classes.apiKeyInput}
                      readOnly={
                        !editApiKey || editedDestination !== destination.channel
                      }
                      onChange={(e) => setUpdatedApiKey(e.target.value)}
                    />
                  </div>
                  <div className={classes.cardColumn}>
                    {editApiKey && editedDestination === destination.channel ? (
                      <>
                        <FaCheck
                          className={classes.actionIcon}
                          title="Save"
                          onClick={() =>
                            saveEditedDestinationHandler(destination.channel)
                          }
                        />
                        <FaTimes
                          className={classes.actionIcon}
                          title="Cancel"
                          onClick={cancelEditing}
                        />{" "}
                      </>
                    ) : (
                      <>
                        <FaEdit
                          className={classes.actionIcon}
                          title="Edit"
                          onClick={() => startEditing(destination)}
                        />
                        <FaTrash
                          className={classes.actionIcon}
                          title="Delete"
                          onClick={() =>
                            deleteDestinationHandler(destination.channel)
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}
        </div>
      ) : (
        <h2 className={classes.addDestination}>Please add a Destination!</h2>
      )}
      <Modal modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} />
    </div>
  );
}

export default Destinations;
