import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import "./Auth.css";
import { loginRoute } from "../utils/APIRoutes";
import { UserContext } from "../store/user-context";
import { setAuthToken } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(UserContext);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleValidation = () => {
    const { username, password } = formData;

    if (password === "") {
      toast.error("Password is required", toastOptions);
      return false;
    } else if (username.length === "") {
      toast.error("Username is required", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (handleValidation()) {
        const { data } = await axios.post(loginRoute, {
          username: formData.username,
          password: formData.password,
        });

        if (data.token) {
          setAuthToken(data.token);
          setIsLoggedIn(true);
          navigate("/dashboard");
        } else {
          toast.error("Something is wrong!", toastOptions);
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message, toastOptions);
      } else {
        toast.error(err.message, toastOptions);
      }
    }
  };

  return (
    <div className="auth-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
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

        <div className="form-group">
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
        <button type="submit" className="auth-btn">
          Login
        </button>
        <span>
          Don't have an account ? <Link to="/register">Register</Link>
        </span>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
