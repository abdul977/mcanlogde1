import React, { useState, useEffect } from "react";
import { FaUser, FaPlus, FaList, FaFolder, FaMap, FaClipboardList, FaComments, FaPrayingHands, FaSignOutAlt, FaCreditCard } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/UserContext";
import { getCurrentPrayer } from "../../utils/prayerTimes";

const navbarMenu = [
  { id: 1, name: "User Details", link: "/user", icon: <FaUser /> },
  { id: 2, name: "Accommodation", link: "/user/bookings", icon: <FaClipboardList /> },
  { id: 3, name: "Payments", link: "/user/payments", icon: <FaCreditCard /> },
  { id: 4, name: "Messages", link: "/user/messages", icon: <FaComments /> },
  // { id: 5, name: "Contribute", link: "/user/create-post", icon: <FaList /> },
];

const Navbar = ({ onItemClick }) => {
  const [auth, setAuth] = useAuth();
  const [prayerInfo, setPrayerInfo] = useState(null);

  // Update prayer times
  useEffect(() => {
    const updatePrayerTimes = () => {
      setPrayerInfo(getCurrentPrayer());
    };

    updatePrayerTimes();
    // Update every minute
    const interval = setInterval(updatePrayerTimes, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    if (onItemClick) onItemClick();
  };

  return (
    <div className="bg-white w-64 h-full min-h-screen border-r border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white">
        <h2 className="text-lg font-semibold text-center">MCAN FCT</h2>
        <p className="text-sm text-center opacity-90">User Portal</p>
      </div>

      {/* Prayer Times Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="bg-gradient-to-r from-mcan-primary/10 to-mcan-secondary/10 rounded-lg p-3">
          {prayerInfo ? (
            <>
              <div className="flex items-center mb-2">
                <FaPrayingHands className="text-mcan-primary mr-2 text-sm" />
                <span className="text-xs font-medium text-gray-700">Next Prayer</span>
              </div>
              <p className="text-sm font-semibold text-mcan-primary">
                {prayerInfo.next.name} {prayerInfo.next.time}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                in {prayerInfo.next.timeToNext}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center mb-2">
                <FaPrayingHands className="text-mcan-primary mr-2 text-sm" />
                <span className="text-xs font-medium text-gray-700">Next Prayer</span>
              </div>
              <p className="text-sm font-semibold text-mcan-primary">Loading...</p>
            </>
          )}
        </div>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navbarMenu.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              onClick={onItemClick}
              className="flex items-center p-3 rounded-lg hover:bg-mcan-primary/10 hover:text-mcan-primary transition-colors duration-300 text-gray-700"
            >
              <span className="mr-3 text-lg flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Islamic Quote */}
        <div className="mt-6 p-3 bg-mcan-secondary/5 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Daily Reminder</p>
          <p className="text-sm text-gray-800 italic leading-relaxed">
            "And whoever relies upon Allah - then He is sufficient for him" (65:3)
          </p>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
        >
          <FaSignOutAlt className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
