// login/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

const PrivateRoute = ({ children }) => {
  const { state } = useContext(UserContext);
  const { userInfo } = state;

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;