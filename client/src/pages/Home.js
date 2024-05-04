import React from "react";
import "./Home.css";
import Header from "../components/Header";

const Home = () => {
  return (
    <div className="homepage">
      <Header />
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
