import React, { useState } from "react";
import { useAuth } from "../../context/UserContext";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaMosque,
  FaBookOpen,
  FaCalendarAlt,
  FaBed,
  FaCog,
  FaSignOutAlt,
  FaPrayingHands,
  FaComments,
  FaBars,
  FaTimes
} from "react-icons/fa";
import UserDetails from "./UserDetails";
import mcanLogo from "../../assets/mcan-logo.png";

// Fallback logo URL
const FALLBACK_LOGO = "https://www.mcanenugu.org.ng/img/core-img/logo.png";

const UserDashboard = () => {
  const [auth, setAuth] = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    // Redirect will be handled by protected route
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { icon: FaHome, label: "Dashboard", path: "/user" },
    { icon: FaBed, label: "My Accommodation", path: "/user/accommodation" },
    { icon: FaCalendarAlt, label: "Bookings", path: "/user/bookings" },
    { icon: FaComments, label: "Messages", path: "/user/messages" },
    { icon: FaMosque, label: "Nearby Mosques", path: "/user/mosques" },
    { icon: FaBookOpen, label: "Islamic Resources", path: "/user/resources" },
    { icon: FaPrayingHands, label: "Prayer Times", path: "/user/prayer-times" },
    { icon: FaCog, label: "Settings", path: "/user/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <img
            src={mcanLogo}
            alt="MCAN Logo"
            className="h-8 w-auto"
            onError={(e) => {
              e.target.src = FALLBACK_LOGO;
            }}
          />
          <h2 className="text-lg font-semibold text-mcan-primary">MCAN Lodge</h2>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="text-mcan-primary hover:text-mcan-secondary transition-colors"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Side Navigation - Desktop */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:block flex flex-col`}>
        {/* Logo - Desktop */}
        <div className="p-6 border-b hidden lg:block flex-shrink-0">
          <img
            src={mcanLogo}
            alt="MCAN Logo"
            className="h-12 w-auto mx-auto"
            onError={(e) => {
              e.target.src = FALLBACK_LOGO;
            }}
          />
          <h2 className="text-center text-sm font-medium text-mcan-primary mt-2">
            MCAN Lodge
          </h2>
        </div>

        {/* Mobile Header - Only visible on mobile */}
        <div className="lg:hidden p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={mcanLogo}
                alt="MCAN Logo"
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.src = FALLBACK_LOGO;
                }}
              />
              <h2 className="text-lg font-semibold text-mcan-primary">MCAN Lodge</h2>
            </div>
            <button
              onClick={closeMobileMenu}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Items */}
          <nav className="p-4">
            <div className="mb-6 hidden lg:block">
              <div className="bg-gradient-to-r from-mcan-primary/10 to-mcan-secondary/10 rounded-lg p-4">
                <p className="text-sm text-gray-600">Next Prayer:</p>
                <p className="text-lg font-semibold text-mcan-primary">Asr 16:15</p>
              </div>
            </div>

            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={closeMobileMenu}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-mcan-primary/10 hover:text-mcan-primary transition-colors rounded-lg"
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Islamic Resources Section */}
          <div className="px-4 py-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <FaBookOpen className="w-4 h-4 mr-2 text-mcan-primary" />
              Islamic Resources
            </h3>
            <div className="space-y-3">
              <div className="bg-mcan-primary/5 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Daily Hadith</p>
                <p className="text-sm text-gray-800 italic">
                  "The best of people are those who benefit others"
                </p>
              </div>
              <div className="bg-mcan-secondary/5 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Quranic Verse</p>
                <p className="text-sm text-gray-800 italic">
                  "And whoever relies upon Allah - then He is sufficient for him" (65:3)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
          >
            <FaSignOutAlt className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          <UserDetails />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
