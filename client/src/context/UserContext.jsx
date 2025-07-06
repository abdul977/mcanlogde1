import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      try {
        const parseData = JSON.parse(data);
        // Validate that we have both user and token
        if (parseData?.user && parseData?.token) {
          setAuth({
            user: parseData.user,
            token: parseData.token,
          });
          console.log("Auth data loaded from localStorage:", {
            user: parseData.user?.name,
            role: parseData.user?.role,
            hasToken: !!parseData.token
          });
        } else {
          console.warn("Invalid auth data structure in localStorage");
          localStorage.removeItem("auth");
        }
      } catch (error) {
        console.error("Error parsing auth data from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("auth");
      }
    } else {
      console.log("No auth data found in localStorage");
    }
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
