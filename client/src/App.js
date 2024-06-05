import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { UserContext } from "./store/user-context";

import { getAuthToken, getHeaders, removeAuthToken } from "./utils/auth";
import { PrivateRoutes, AuthRoutes } from "./pages/ConditionalRoutes";
import {
  validateInitialRequestRoute,
  getDestinationsRoute,
} from "./utils/APIRoutes";
import Destinations from "./pages/Destinations";
import { toastOptions } from "./utils/toast";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (getAuthToken()) {
          const response = await axios.get(
            validateInitialRequestRoute,
            getHeaders()
          );
          if (response.status === 200) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        if (error.response.status === 401) {
          removeAuthToken();
          setIsLoggedIn(false);
        } else {
          toast.error("Something went wrong!", toastOptions);
        }
      }
    };

    checkUser();

    const getDestinations = async () => {
      try {
        if (getAuthToken()) {
          const { data } = await axios.get(getDestinationsRoute, getHeaders());

          if (data.destinations) {
            setDestinations(data.destinations);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    getDestinations();
  }, []);

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        destinations,
        setDestinations,
      }}
    >
      <Router>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/destinations" element={<Destinations />} />
          </Route>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
      <ToastContainer />
    </UserContext.Provider>
  );
}

export default App;
