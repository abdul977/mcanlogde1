import axios from "axios";
import React, { useState } from "react";
import { FaPrayingHands, FaQuran, FaMosque } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/UserContext";
import mcanLogo from "../assets/mcan-logo.png";

// Fallback logo URL
const FALLBACK_LOGO = "https://www.mcanenugu.org.ng/img/core-img/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/api/login`,
        {
          email,
          password,
        }
      );
      toast.success("Login successful. Welcome to MCAN Lodge!");
      setAuth({
        ...auth,
        user: res.data?.user,
        token: res.data.token,
      });
      localStorage.setItem("auth", JSON.stringify(res.data));
      navigate(location.state || "/");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Login failed. Please try again.");
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-6 text-center">
          <img
            src={mcanLogo}
            alt="MCAN Logo"
            className="mx-auto h-20 w-auto mb-4"
            onError={(e) => {
              e.target.src = FALLBACK_LOGO;
            }}
          />
          <h2 className="text-2xl font-bold text-white">Welcome to MCAN Lodge</h2>
          <p className="mt-2 text-white/90 text-sm">
            Muslim Corpers' Association of Nigeria
          </p>
        </div>

        {/* Islamic Inspiration */}
        <div className="bg-white/50 text-center py-4 px-6">
          <p className="text-gray-600 italic text-sm">
            "Indeed, Allah is with those who fear Him and those who do good"
            <span className="block text-xs mt-1">- Quran 16:128</span>
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Remember me
                </span>
              </label>
              <a 
                href="/forgot-password" 
                className="text-sm text-mcan-primary hover:text-mcan-secondary"
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-mcan-primary to-mcan-secondary hover:from-mcan-secondary hover:to-mcan-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mcan-primary transition-all duration-300"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
            <div className="flex flex-col items-center space-y-1 text-mcan-primary">
              <FaPrayingHands className="h-6 w-6" />
              <span>Prayer Times</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-mcan-primary">
              <FaMosque className="h-6 w-6" />
              <span>Halal Housing</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-mcan-primary">
              <FaQuran className="h-6 w-6" />
              <span>Islamic Community</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Not a member yet?{" "}
            <a
              href="/register"
              className="font-medium text-mcan-primary hover:text-mcan-secondary"
            >
              Join MCAN Lodge
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
