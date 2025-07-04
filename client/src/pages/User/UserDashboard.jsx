import React from "react";
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
  FaPrayingHands
} from "react-icons/fa";
import UserDetails from "./UserDetails";
import mcanLogo from "../../assets/mcan-logo.png";

const UserDashboard = () => {
  const [auth, setAuth] = useAuth();

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    // Redirect will be handled by protected route
  };

  const navItems = [
    { icon: FaHome, label: "Dashboard", path: "/user" },
    { icon: FaBed, label: "My Accommodation", path: "/user/accommodation" },
    { icon: FaCalendarAlt, label: "Bookings", path: "/user/bookings" },
    { icon: FaMosque, label: "Nearby Mosques", path: "/user/mosques" },
    { icon: FaBookOpen, label: "Islamic Resources", path: "/user/resources" },
    { icon: FaPrayingHands, label: "Prayer Times", path: "/user/prayer-times" },
    { icon: FaCog, label: "Settings", path: "/user/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Navigation */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-10">
        {/* Logo */}
        <div className="p-6 border-b">
          <img src={mcanLogo} alt="MCAN Logo" className="h-12 w-auto mx-auto" />
          <h2 className="text-center text-sm font-medium text-mcan-primary mt-2">
            MCAN Lodge
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6">
          <div className="px-4 mb-6">
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

      {/* Main Content */}
      <div className="ml-64">
        <div className="p-6">
          <UserDetails />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
