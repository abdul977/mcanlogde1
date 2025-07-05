import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Details from "./Details";
import Navbar from "./Navbar";

const DashBoard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-mcan-primary">MCAN Admin</h2>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="text-mcan-primary hover:text-mcan-secondary transition-colors"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <div className="flex justify-center items-start p-4 lg:p-10">
        <div className="flex shadow-lg rounded-lg overflow-hidden bg-white min-h-[28rem] w-full max-w-[82rem]">
          {/* Mobile Sidebar */}
          <div className={`fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <Navbar onItemClick={closeMobileMenu} />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Navbar />
          </div>

          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
              onClick={closeMobileMenu}
            ></div>
          )}

          <div className="flex-1 pt-16 lg:pt-0">
            <Details />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
