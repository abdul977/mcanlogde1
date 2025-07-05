import { useState, useEffect } from "react";
import { useAuth } from "../../context/UserContext";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../../components/Spinner";

export default function PrivateRoute() {
  const [auth, setauth] = useAuth();
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    error: null
  });

  useEffect(() => {
    const authCheck = async () => {
      // Reset state when starting auth check
      setAuthState({ loading: true, authenticated: false, error: null });

      try {
        // If no token, redirect to login
        if (!auth?.token) {
          setAuthState({ loading: false, authenticated: false, error: "No authentication token" });
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/auth/api/admin-auth`,
          {
            headers: {
              Authorization: auth?.token,
            },
            timeout: 10000, // 10 second timeout
          }
        );

        console.log("Admin auth response:", res);

        if (res.data.ok) {
          setAuthState({ loading: false, authenticated: true, error: null });
        } else {
          setAuthState({ loading: false, authenticated: false, error: "Authentication failed" });
        }
      } catch (error) {
        console.error("Admin auth error:", error);
        let errorMessage = "Authentication failed";

        if (error.code === 'ECONNABORTED') {
          errorMessage = "Request timeout - server may be down";
        } else if (error.response?.status === 401) {
          errorMessage = "Unauthorized - invalid or expired token";
        } else if (error.response?.status === 403) {
          errorMessage = "Access denied - admin privileges required";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setAuthState({ loading: false, authenticated: false, error: errorMessage });
      }
    };

    authCheck();
  }, [auth?.token]);

  // Show loading spinner while checking authentication
  if (authState.loading) {
    return <Spinner />;
  }

  // If authentication failed, redirect to login
  if (!authState.authenticated) {
    console.log("Admin authentication failed:", authState.error);
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render admin routes
  return <Outlet />;
}
