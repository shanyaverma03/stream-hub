import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import logo from "../assets/streamLogo.png";
import "./Header.css";
import { UserContext } from "../store/user-context";
import { logoutRoute } from "../utils/APIRoutes";
import { getHeaders, removeAuthToken } from "../utils/auth";
import { toastOptions } from "../utils/toast";

function Header() {
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
          <Link to="/dashboard" className="site-name">
            StreamHub
          </Link>
        </div>
        <div className="options">
          {isLoggedIn && (
            <NavLink
              to="/destinations"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              Destinations
            </NavLink>
          )}

          {isLoggedIn && <button onClick={logoutHandler}>Logout</button>}
        </div>
      </div>
    </div>
  );
}

export default Header;
