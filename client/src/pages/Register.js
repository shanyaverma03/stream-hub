import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

import classes from "./Auth.module.css";
import { registerRoute } from "../utils/APIRoutes";
import { UserContext } from "../store/user-context";
import { setAuthToken } from "../utils/auth";
import { toastOptions } from "../utils/toast";

const Register = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(UserContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleValidation = () => {
    const { username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      toast.error(
        "Password and confirm password should be same.",
        toastOptions
      );
      return false;
    } else if (username.length < 3) {
      toast.error(
        "Username should be greater than 3 characters.",
        toastOptions
      );
      return false;
    } else if (password.length < 8) {
      toast.error(
        "Password should be equal or greater than 8 characters.",
        toastOptions
      );
      return false;
    } else if (email === "") {
      toast.error("Email is required.", toastOptions);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (handleValidation()) {
      try {
        const { data } = await axios.post(registerRoute, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        if (data.token) {
          setAuthToken(data.token);
          setIsLoggedIn(true);
          navigate("/dashboard");
        } else {
          toast.error("Something is wrong!", toastOptions);
        }
      } catch (err) {
        console.log(err);
        toast.error(err.response.data, toastOptions);
      }
    }
  };

  return (
    <div className={classes.authPage}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className={classes.authForm}>
        <div className={classes.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className={classes.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className={classes.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className={classes.formGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirm password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className={classes.authBtn}>
          Register
        </button>
        <span className={classes.redirect}>
          Already have an account ? <Link to="/login">Login.</Link>
        </span>
      </form>
    </div>
  );
};

export default Register;
