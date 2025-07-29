import React, { useState } from "react";
import { FaUser, FaPrayingHands, FaBars, FaTimes, FaUsers } from "react-icons/fa";
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
    if (e) {
      e.stopPropagation();
    }
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            <img
              src={mcanLogo}
              alt="MCAN Logo"
              className="h-12 sm:h-14 lg:h-16 w-auto flex-shrink-0"
              onError={(e) => {
                e.target.src = FALLBACK_LOGO;
              }}
            />
            <div className="text-white min-w-0">
              <h1 className="text-sm sm:text-base lg:text-xl font-bold leading-tight">
                <span className="hidden sm:inline">MUSLIM CORPERS' ASSOCIATION OF NIGERIA</span>
                <span className="sm:hidden">MCAN</span>
              </h1>
              <p className="text-xs sm:text-sm opacity-90">FCT CHAPTER</p>
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
            <Link to="/blog" className="text-white hover:text-mcan-light transition duration-300">
              Blog
            </Link>
            <Link to="/communities" className="text-white hover:text-mcan-light transition duration-300 flex items-center gap-1">
              <FaUsers size={16} />
              Communities
            </Link>
            <Link to="/resources" className="text-white hover:text-mcan-light transition duration-300">
              Resources
            </Link>
            <Link to="/shop" className="text-white hover:text-mcan-light transition duration-300">
              Shop
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
            <div className="relative">
              <IoIosHeartEmpty
                size={24}
                className="text-white hover:text-mcan-light cursor-pointer transition duration-300"
                onClick={() => navigate("/saved-accommodations")}
                title="Saved Accommodations"
              />
            </div>
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
              to="/blog"
              className="block px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300"
              onClick={closeMobileMenu}
            >
              Blog
            </Link>
            <Link
              to="/communities"
              className="flex items-center px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300"
              onClick={closeMobileMenu}
            >
              <FaUsers size={16} className="mr-2" />
              Communities
            </Link>
            <Link
              to="/resources"
              className="block px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300"
              onClick={closeMobileMenu}
            >
              Islamic Resources
            </Link>
            <Link
              to="/shop"
              className="block px-3 py-2 text-white hover:bg-mcan-secondary rounded-md transition duration-300"
              onClick={closeMobileMenu}
            >
              Shop
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
                  navigate("/saved-accommodations");
                  closeMobileMenu();
                }}
              >
                <IoIosHeartEmpty size={20} className="mr-3" />
                Saved Accommodations
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
