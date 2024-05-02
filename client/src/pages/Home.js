import React from "react";
import "./Home.css";
import logo from "../assets/streamLogo.png";

const Home = () => {
  return (
    <div className="homepage">
      <div className="header">
        <div className="logo-container">
          <img src={logo} alt="StreamHub Logo" className="logo" />
          <h1 className="site-name">StreamHub</h1>
        </div>
      </div>
      <div className="content">
        <h1>StreamHub - The Easiest Way to Live Stream</h1>
        <h2>
          StreamHub is an easy to use live streaming platform in your browser.
          Stream live to YouTube in seconds!
        </h2>
        <button className="get-started-btn">Get started!</button>
      </div>
    </div>
  );
};

export default Home;
