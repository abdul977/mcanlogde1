import React from "react";
import { FaUser, FaPlus, FaList, FaFolder, FaCalendarPlus, FaCalendarAlt, FaPen, FaBlog, FaHandsHelping, FaChalkboardTeacher, FaQuran, FaBook, FaUsers, FaDonate, FaClipboardList, FaComments, FaShoppingBag, FaShoppingCart, FaCreditCard, FaCog } from "react-icons/fa";
import { Link } from "react-router-dom";

const navbarMenu = [
  { id: 1, name: "Admin Details", link: "/admin/details", icon: <FaUser /> },
  { id: 2, name: "Add Accommodation", link: "/admin/add-accommodation", icon: <FaPlus /> },
  { id: 3, name: "All Accommodations", link: "/admin/accommodations", icon: <FaList /> },
  {
    id: 4,
    name: "Add Category",
    link: "/admin/add-category",
    icon: <FaFolder />,
  },
  { id: 5, name: "Create Event", link: "/admin/create-event", icon: <FaCalendarPlus /> },
  { id: 6, name: "All Events", link: "/admin/events", icon: <FaCalendarAlt /> },
  { id: 7, name: "Create Blog", link: "/admin/create-blog", icon: <FaPen /> },
  { id: 8, name: "All Blogs", link: "/admin/blogs", icon: <FaBlog /> },

  // Services
  { id: 9, name: "Create Service", link: "/admin/create-service", icon: <FaHandsHelping /> },
  { id: 10, name: "All Services", link: "/admin/services", icon: <FaHandsHelping /> },

  // Lectures
  { id: 11, name: "Create Lecture", link: "/admin/create-lecture", icon: <FaChalkboardTeacher /> },
  { id: 12, name: "All Lectures", link: "/admin/lectures", icon: <FaChalkboardTeacher /> },

  // Quran Classes
  { id: 13, name: "Create Quran Class", link: "/admin/create-quran-class", icon: <FaQuran /> },
  { id: 14, name: "All Quran Classes", link: "/admin/quran-classes", icon: <FaQuran /> },

  // Resources
  { id: 15, name: "Create Resource", link: "/admin/create-resource", icon: <FaBook /> },
  { id: 16, name: "All Resources", link: "/admin/resources", icon: <FaBook /> },

  // Community
  { id: 17, name: "Create Community", link: "/admin/create-community", icon: <FaUsers /> },
  { id: 18, name: "All Community", link: "/admin/community", icon: <FaUsers /> },

  // Chat Communities
  { id: 19, name: "Chat Communities", link: "/admin/chat-communities", icon: <FaComments /> },

  // Donations
  { id: 20, name: "Create Donation", link: "/admin/create-donation", icon: <FaDonate /> },
  { id: 21, name: "All Donations", link: "/admin/donations", icon: <FaDonate /> },

  // Bookings & Messages
  { id: 22, name: "All Bookings", link: "/admin/bookings", icon: <FaClipboardList /> },
  { id: 22, name: "Messages", link: "/admin/messages", icon: <FaComments /> },

  // Payment Management
  { id: 23, name: "Payment Settings", link: "/admin/payment-settings", icon: <FaCog /> },
  { id: 24, name: "Payment Verification", link: "/admin/payment-verification", icon: <FaCreditCard /> },
  { id: 25, name: "Payment Overview", link: "/admin/payment-overview", icon: <FaClipboardList /> },

  // E-commerce / Shop
  { id: 26, name: "Create Product", link: "/admin/create-product", icon: <FaShoppingBag /> },
  { id: 27, name: "All Products", link: "/admin/products", icon: <FaShoppingBag /> },
  { id: 28, name: "Create Product Category", link: "/admin/create-product-category", icon: <FaFolder /> },
  { id: 29, name: "Product Categories", link: "/admin/product-categories", icon: <FaFolder /> },
  { id: 30, name: "All Orders", link: "/admin/orders", icon: <FaShoppingCart /> },
];

const Navbar = ({ onItemClick }) => {
  return (
    <div className="bg-gray-800 text-white w-[15rem] h-full min-h-screen border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-center">MCAN Admin</h2>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navbarMenu.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              onClick={onItemClick}
              className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
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
          MCAN Admin Panel
        </div>
      </div>
    </div>
  );
};

export default Navbar;
