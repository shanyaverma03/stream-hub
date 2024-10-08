import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import classes from "./Home.module.css";
import Header from "../components/Header";
import { UserContext } from "../store/user-context";

const Home = () => {
  const { isLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  const getStartedHandler = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className={classes.homepage}>
      <Header />
      <div className={classes.content}>
        <h1>StreamHub - The Easiest Way to Live Stream</h1>
        <h2>
          StreamHub is an easy to use live streaming platform in your browser.
          Stream live to YouTube in seconds!
        </h2>
        <button className={classes.getStartedBtn} onClick={getStartedHandler}>
          Get started!
        </button>
      </div>
    </div>
  );
};

export default Home;
