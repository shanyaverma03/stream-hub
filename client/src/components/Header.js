import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { RxHamburgerMenu } from "react-icons/rx";
import { IconContext } from "react-icons";

import logo from "../assets/streamLogo.png";
import classes from "./Header.module.css";
import { UserContext } from "../store/user-context";
import { logoutRoute } from "../utils/APIRoutes";
import { getHeaders, removeAuthToken } from "../utils/auth";
import { toastOptions } from "../utils/toast";

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, setDestinations } =
    useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const response = await axios.post(logoutRoute, {}, getHeaders());
      if (response.status === 200) {
        removeAuthToken();
        setIsLoggedIn(false);
        setDestinations([]);
        navigate("/");
      } else {
        toast.error("Something went wrong!", toastOptions);
      }
    } catch (err) {
      toast.error("Something went wrong!", toastOptions);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  return (
    <div className={classes.header}>
      <div
        className={
          isLoggedIn ? classes.logoContainerLoggedIn : classes.logoContainer
        }
      >
        <div className={classes.brand}>
          <img src={logo} alt="StreamHub Logo" className={classes.logo} />
          <Link to="/dashboard" className={classes.siteName}>
            StreamHub
          </Link>
        </div>
        {isLoggedIn && (
          <IconContext.Provider
            value={{ color: "white", className: classes.hamburger }}
          >
            <div className={classes.hamburgerIcon} onClick={toggleMenu}>
              <RxHamburgerMenu />
            </div>
          </IconContext.Provider>
        )}

        <div className={isMenuOpen ? classes.show : classes.options}>
          {isLoggedIn && (
            <NavLink
              to="/destinations"
              className={({ isActive }) =>
                isActive ? classes.navLinkActive : classes.navLink
              }
            >
              Destinations
            </NavLink>
          )}

          {isLoggedIn && (
            <button onClick={logoutHandler} className={classes.logoutBtn}>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
