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
      <div className="lg:hidden bg-white shadow-lg p-4 flex items-center justify-between">
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
      } lg:block`}>
        {/* Logo - Desktop */}
        <div className="p-6 border-b hidden lg:block">
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

        {/* Navigation Items */}
        <nav className="mt-6 lg:mt-6 mt-4">
          <div className="px-4 mb-6 hidden lg:block">
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
                  className="flex items-center px-6 py-3 text-gray-700 hover:bg-mcan-primary/10 hover:text-mcan-primary transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
