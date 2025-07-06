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
      <div className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
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

        {/* Mobile Header - Only visible on mobile */}
        <div className="lg:hidden p-4 border-b">
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
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 220px)', scrollbarWidth: 'thin' }}>
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

          {/* Quick Actions Section */}
          <div className="px-4 py-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <FaCalendarAlt className="w-4 h-4 mr-2 text-mcan-primary" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/user/bookings"
                className="block bg-blue-50 hover:bg-blue-100 rounded-lg p-3 transition-colors"
              >
                <p className="text-sm font-medium text-blue-800">Book Accommodation</p>
                <p className="text-xs text-blue-600">Reserve your stay</p>
              </Link>
              <Link
                to="/user/messages"
                className="block bg-green-50 hover:bg-green-100 rounded-lg p-3 transition-colors"
              >
                <p className="text-sm font-medium text-green-800">Contact Admin</p>
                <p className="text-xs text-green-600">Get support</p>
              </Link>
              <Link
                to="/user/prayer-times"
                className="block bg-purple-50 hover:bg-purple-100 rounded-lg p-3 transition-colors"
              >
                <p className="text-sm font-medium text-purple-800">Prayer Times</p>
                <p className="text-xs text-purple-600">Today's schedule</p>
              </Link>
            </div>
          </div>

          {/* Community Updates Section */}
          <div className="px-4 py-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <FaComments className="w-4 h-4 mr-2 text-mcan-primary" />
              Community Updates
            </h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-600 mb-1">Announcement</p>
                <p className="text-sm text-gray-800">
                  New prayer hall opening next month
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">Event</p>
                <p className="text-sm text-gray-800">
                  Weekly Islamic study circle every Friday
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 mb-1">Notice</p>
                <p className="text-sm text-gray-800">
                  Ramadan schedule will be updated soon
                </p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="px-4 py-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <FaPrayingHands className="w-4 h-4 mr-2 text-mcan-primary" />
              Support & Help
            </h3>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800">Need Help?</p>
                <p className="text-xs text-gray-600 mb-2">Contact our support team</p>
                <Link
                  to="/user/messages"
                  className="text-xs text-mcan-primary hover:text-mcan-secondary"
                >
                  Send Message →
                </Link>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800">Emergency Contact</p>
                <p className="text-xs text-gray-600">+234 123 456 7890</p>
              </div>
            </div>
          </div>

          {/* Additional Content to Force Scrolling */}
          <div className="px-4 py-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <FaBookOpen className="w-4 h-4 mr-2 text-mcan-primary" />
              Recent Activities
            </h3>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 mb-1">Booking</p>
                <p className="text-sm text-gray-800">Room 101 reserved for Dec 15-17</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">Message</p>
                <p className="text-sm text-gray-800">Welcome message from admin</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 mb-1">Prayer</p>
                <p className="text-sm text-gray-800">Maghrib prayer reminder set</p>
              </div>
            </div>
          </div>

          {/* More Content */}
          <div className="px-4 py-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <FaMosque className="w-4 h-4 mr-2 text-mcan-primary" />
              Nearby Services
            </h3>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800">Main Prayer Hall</p>
                <p className="text-xs text-gray-600">Ground floor - Always open</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800">Library</p>
                <p className="text-xs text-gray-600">2nd floor - 9 AM to 9 PM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800">Cafeteria</p>
                <p className="text-xs text-gray-600">1st floor - 6 AM to 10 PM</p>
              </div>
            </div>
          </div>

          {/* Bottom indicator */}
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-gray-400">End of navigation</p>
            <div className="w-8 h-1 bg-gray-200 rounded mx-auto mt-2"></div>
          </div>
        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
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
