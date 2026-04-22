// ProtectedWrapper.tsx
import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import ThreeDotsLoader from "./ThreeDotssLoader";


interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedWrapper = ({ children }: ProtectedRouteProps) => {
  const { getToken, isLoaded } = useAuth();

  const [checking, setChecking] = useState(true);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      const token = await getToken();

      if (!token) {
        alert("Please login first");
        setRedirect(true);
      }

      setChecking(false);
    };

    checkAuth();
  }, [getToken, isLoaded]);

  if (checking) {
    return <ThreeDotsLoader text="loading"/>
  }

  if (redirect) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedWrapper;