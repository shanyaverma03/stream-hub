import React, { useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import logo from "../assets/streamLogo.png";
import "./Header.css";
import { logoutRoute } from "../utils/APIRoutes";
import { UserContext } from "../store/user-context";

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, setUser } = useContext(UserContext);

  const logoutHandler = async () => {
    try {
      const { data } = await axios.post(
        logoutRoute,
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      setUser({});
      navigate("/");
    } catch (err) {
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
    </div>
  );
}

export default Header;
