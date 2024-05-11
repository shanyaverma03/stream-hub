import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import "./App.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { UserContext } from "./store/user-context";
import { checkSessionRoute } from "./utils/APIRoutes";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
]);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  const checkUser = async () => {
    try {
      const { data } = await axios.get(checkSessionRoute, {
        withCredentials: true,
      });
      setIsLoggedIn(data.isLoggedIn);
      setUser(data.user);
    } catch (error) {
      console.error("Error checking session", error);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <UserContext.Provider value={{ isLoggedIn, user }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

export default App;
