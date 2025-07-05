import React from "react";
import { FaUser, FaPlus, FaList, FaFolder, FaCalendarPlus, FaCalendarAlt, FaPen, FaBlog } from "react-icons/fa";
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
  { id: 9, name: "Create Service", link: "/admin/create-service", icon: <FaPlus /> },
  { id: 10, name: "All Services", link: "/admin/services", icon: <FaList /> },
];

const Navbar = () => {
  return (
    <div className="bg-gray-800 text-white w-[15rem] h-full min-h-[28rem] border-r border-gray-700">
      <nav className="flex flex-col p-5 space-y-4">
        {navbarMenu.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            <span className="text-md">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Navbar;
