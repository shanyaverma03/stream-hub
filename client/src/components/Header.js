import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

import logo from "../assets/streamLogo.png";
import "./Header.css";
import { UserContext } from "../store/user-context";
import { logoutRoute } from "../utils/APIRoutes";
import { getHeaders, removeAuthToken } from "../utils/auth";

function Header() {
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(UserContext);

  const logoutHandler = async () => {
    try {
      console.log(getHeaders());
      const response = await axios.post(logoutRoute, {}, getHeaders());
      if (response.status === 200) {
        removeAuthToken();
        setIsLoggedIn(false);
        navigate("/");
      } else {
        toast.error("Something went wrong!", toastOptions);
      }
    } catch (err) {
      toast.error("Something went wrong!", toastOptions);
      console.log(err);
    }
  };

  return (
    <div className="header">
      <div
        className={isLoggedIn ? "logo-container-logged-in" : "logo-container"}
      >
        <div className="brand">
          <img src={logo} alt="StreamHub Logo" className="logo" />
          <h1 className="site-name">StreamHub</h1>
        </div>

        {isLoggedIn && <button onClick={logoutHandler}>Logout</button>}
      </div>
      <ToastContainer />
    </div>
  );
}

export default Header;
