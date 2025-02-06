import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useLogin } from "../context/UserContext";

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = "/",
}) => {
  const { isLoggedIn, isLoading } = useLogin();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
