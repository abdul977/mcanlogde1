import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
    isLoading: true, // Add loading state
  });

  useEffect(() => {
    const initializeAuth = () => {
      const data = localStorage.getItem("auth");
      if (data) {
        try {
          const parseData = JSON.parse(data);
          // Validate that we have both user and token
          if (parseData?.user && parseData?.token) {
            setAuth({
              user: parseData.user,
              token: parseData.token,
              isLoading: false,
            });
            console.log("Auth data loaded from localStorage:", {
              user: parseData.user?.name,
              role: parseData.user?.role,
              hasToken: !!parseData.token
            });
          } else {
            console.warn("Invalid auth data structure in localStorage");
            localStorage.removeItem("auth");
            setAuth({
              user: null,
              token: "",
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Error parsing auth data from localStorage:", error);
          // Clear corrupted data
          localStorage.removeItem("auth");
          setAuth({
            user: null,
            token: "",
            isLoading: false,
          });
        }
      } else {
        console.log("No auth data found in localStorage");
        setAuth({
          user: null,
          token: "",
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
