import React from "react";

import logo from "../assets/streamLogo.png";
import "./Header.css";

function Header() {
  return (
    <div className="header">
      <div className="logo-container">
        <img src={logo} alt="StreamHub Logo" className="logo" />
        <h1 className="site-name">StreamHub</h1>
      </div>
    </div>
  );
}

export default Header;
