import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/streamLogo.png";
import "./Header.css";
import { UserContext } from "../store/user-context";

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(UserContext);

  const logoutHandler = async () => {
    // localStorage.removeItem("token");
    setIsLoggedIn(false);

    navigate("/");
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
