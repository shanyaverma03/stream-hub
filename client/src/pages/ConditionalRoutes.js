import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";

import { UserContext } from "../store/user-context";

export const PrivateRoutes = () => {
  const { isLoggedIn } = useContext(UserContext);

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export const AuthRoutes = () => {
  const { isLoggedIn } = useContext(UserContext);

  return !isLoggedIn ? <Outlet /> : <Navigate to="/dashboard" />;
};
