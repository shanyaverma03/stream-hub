import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css";
import Header from "../components/Header";
import { UserContext } from "../store/user-context";

const Home = () => {
  const { isLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  const getStartedHandler = () => {
    navigate("/register");
  };

  return (
    <div className="homepage">
      <Header />
      <div className="content">
        <h1>StreamHub - The Easiest Way to Live Stream</h1>
        <h2>
          StreamHub is an easy to use live streaming platform in your browser.
          Stream live to YouTube in seconds!
        </h2>
        <button className="get-started-btn" onClick={getStartedHandler}>
          Get started!
        </button>
      </div>
    </div>
  );
};

export default Home;
