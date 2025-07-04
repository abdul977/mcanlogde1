import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaPrayingHands, FaQuran, FaMosque } from "react-icons/fa";
import mcanLogo from "../assets/mcan-logo.png";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    phoneNumber: "",
    callUpNumber: "",
    stateCode: "",
    batch: "",
    stream: "",
    accommodationType: "single", // single, shared, or family
    prayerReminders: true,
    agreementToRules: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All required fields must be filled");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!formData.agreementToRules) {
      setError("You must agree to the Islamic housing rules");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/api/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          callUpNumber: formData.callUpNumber,
          stateCode: formData.stateCode,
          batch: formData.batch,
          stream: formData.stream,
          accommodationType: formData.accommodationType,
          prayerReminders: formData.prayerReminders,
        }
      );
      toast.success("Registration successful! Welcome to MCAN Lodge.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-6 text-center">
          <img
            src={mcanLogo}
            alt="MCAN Logo"
            className="mx-auto h-20 w-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-white">Join MCAN Lodge</h2>
          <p className="mt-2 text-white/90 text-sm">
            Muslim Corpers' Association of Nigeria - FCT Chapter
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                  required
                />
              </div>
            </div>

            {/* NYSC Information */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-medium text-gray-900">NYSC Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Call-Up Number</label>
                  <input
                    type="text"
                    name="callUpNumber"
                    value={formData.callUpNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State Code</label>
                  <input
                    type="text"
                    name="stateCode"
                    value={formData.stateCode}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch</label>
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                  >
                    <option value="">Select Batch</option>
                    <option value="A">Batch A</option>
                    <option value="B">Batch B</option>
                    <option value="C">Batch C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stream</label>
                  <select
                    name="stream"
                    value={formData.stream}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                  >
                    <option value="">Select Stream</option>
                    <option value="1">Stream I</option>
                    <option value="2">Stream II</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Preferences */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="brother">Brother</option>
                  <option value="sister">Sister</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Accommodation</label>
                <select
                  name="accommodationType"
                  value={formData.accommodationType}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mcan-primary focus:border-mcan-primary"
                >
                  <option value="single">Single Room</option>
                  <option value="shared">Shared Apartment</option>
                  <option value="family">Family Unit</option>
                </select>
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="prayerReminders"
                  checked={formData.prayerReminders}
                  onChange={handleChange}
                  className="h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable prayer time reminders
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="agreementToRules"
                  checked={formData.agreementToRules}
                  onChange={handleChange}
                  className="h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                  required
                />
                <label className="ml-2 block text-sm text-gray-700">
                  I agree to follow Islamic housing rules and MCAN guidelines
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-mcan-primary to-mcan-secondary hover:from-mcan-secondary hover:to-mcan-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mcan-primary transition-all duration-300"
            >
              {loading ? "Creating Account..." : "Join MCAN Lodge"}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
            <div className="flex flex-col items-center space-y-1 text-mcan-primary">
              <FaPrayingHands className="h-6 w-6" />
              <span>Islamic Environment</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-mcan-primary">
              <FaMosque className="h-6 w-6" />
              <span>Prayer Facilities</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-mcan-primary">
              <FaQuran className="h-6 w-6" />
              <span>Community Support</span>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-mcan-primary hover:text-mcan-secondary"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
