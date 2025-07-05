import React from "react";
import { FaUser, FaPlus, FaList, FaFolder, FaMap, FaClipboardList, FaComments } from "react-icons/fa";
import { Link } from "react-router-dom";

const navbarMenu = [
  { id: 1, name: "User Details", link: "/user", icon: <FaUser /> },
  { id: 2, name: "My Bookings", link: "/user/bookings", icon: <FaClipboardList /> },
  { id: 3, name: "Messages", link: "/user/messages", icon: <FaComments /> },
  // { id: 4, name: "Contribute", link: "/user/create-post", icon: <FaList /> },
];

const Navbar = ({ onItemClick }) => {
  return (
    <div className="bg-gray-800 text-white w-[15rem] h-full min-h-screen border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-center">User Panel</h2>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navbarMenu.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              onClick={onItemClick}
              className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <span className="mr-3 text-lg flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          MCAN User Portal
        </div>
      </div>
    </div>
  );
};

export default Navbar;
