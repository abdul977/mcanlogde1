import React, { useState } from "react";
import { FaUser, FaPrayingHands, FaBars, FaTimes } from "react-icons/fa";
import mcanLogo from "../assets/mcan-logo.png";
import { useAuth } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { IoIosHeartEmpty } from "react-icons/io";

// Fallback logo URL
const FALLBACK_LOGO = "https://www.mcanenugu.org.ng/img/core-img/logo.png";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  // Redirect logic
  const redirectDashboard = (e) => {
    e.stopPropagation();
    if (auth?.user?.role === "admin") {
      navigate("/admin/details");
    } else {
      navigate("/user");
    }
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  // Close dropdown when mouse leaves
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking on a link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle logout logic
  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    toast.success("Logout Successfully");
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-mcan-primary to-mcan-secondary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo and Name */}
          <div className="flex items-center space-x-4">
            <img
              src={mcanLogo}
              alt="MCAN Logo"
              className="h-16 w-auto"
              onError={(e) => {
                e.target.src = FALLBACK_LOGO;
              }}
            />
            <div className="text-white">
              <h1 className="text-xl font-bold">MUSLIM CORPERS' ASSOCIATION OF NIGERIA</h1>
              <p className="text-sm">FCT CHAPTER</p>
            </div>
          </div>

          {/* Navbar Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-mcan-light transition duration-300">
              Home
            </Link>
            <Link to="/programs" className="text-white hover:text-mcan-light transition duration-300">
              Programs
            </Link>
            <Link to="/services" className="text-white hover:text-mcan-light transition duration-300">
              Services
            </Link>
            <Link to="/about" className="text-white hover:text-mcan-light transition duration-300">
              About Us
            </Link>
            <Link to="/contact" className="text-white hover:text-mcan-light transition duration-300">
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-mcan-light transition duration-300"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Notification and Profile - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <IoIosHeartEmpty
              size={24}
              className="text-white hover:text-mcan-light cursor-pointer transition duration-300"
              onClick={() => navigate("/cart")}
            />
            <FaUser
              className="text-white hover:text-mcan-light cursor-pointer transition duration-300"
              size={24}
              onClick={handleDropdownToggle}
            />
            {isDropdownOpen && (
              <div
                className="absolute right-4 top-16 w-48 bg-white rounded-md shadow-lg z-50 border border-mcan-light"
                onMouseLeave={closeDropdown}
              >
                <ul className="py-1">
                  <li
                    className="px-4 py-2 hover:bg-mcan-light hover:text-white cursor-pointer transition duration-300"
                    onClick={redirectDashboard}
                  >
                    Your Profile
                  </li>
                  {auth?.user ? (
                    <div
                      className="px-4 py-2 hover:bg-mcan-light hover:text-white cursor-pointer transition duration-300"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </div>
                  ) : (
                    <div
                      onClick={() => navigate("/login")}
                      className="px-4 py-2 hover:bg-mcan-light hover:text-white cursor-pointer transition duration-300"
                    >
                      Sign In
                    </div>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-mcan-primary border-t border-mcan-secondary">
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/programs"
              className="block px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300"
              onClick={closeMobileMenu}
            >
              Programs
            </Link>
            <Link
              to="/services"
              className="block px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300"
              onClick={closeMobileMenu}
            >
              Services
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300"
              onClick={closeMobileMenu}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300"
              onClick={closeMobileMenu}
            >
              Contact
            </Link>

            {/* Mobile Profile and Cart */}
            <div className="border-t border-mcan-secondary pt-2 mt-2">
              <div
                className="flex items-center px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300 cursor-pointer"
                onClick={() => {
                  navigate("/cart");
                  closeMobileMenu();
                }}
              >
                <IoIosHeartEmpty size={20} className="mr-3" />
                Cart
              </div>
              <div
                className="flex items-center px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300 cursor-pointer"
                onClick={() => {
                  redirectDashboard();
                  closeMobileMenu();
                }}
              >
                <FaUser size={20} className="mr-3" />
                Your Profile
              </div>
              {auth?.user ? (
                <div
                  className="flex items-center px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300 cursor-pointer"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                >
                  Sign Out
                </div>
              ) : (
                <div
                  className="flex items-center px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300 cursor-pointer"
                  onClick={() => {
                    navigate("/login");
                    closeMobileMenu();
                  }}
                >
                  Sign In
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Motto */}
      <div className="bg-mcan-accent text-white text-center py-2 text-sm italic">
        <FaPrayingHands className="inline mr-2" />
        "Say verily, my prayer, my sacrifice, my living, and my dying are for Allah, the lord of the worlds" (Q16:162)
      </div>
    </nav>
  );
};

export default Navbar;
