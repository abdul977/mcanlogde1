import React from "react";
import { FaMosque, FaQuran, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import mcanLogo from "../assets/mcan-logo.png";
import { Link } from "react-router-dom";

// Fallback logo URL
const FALLBACK_LOGO = "https://www.mcanenugu.org.ng/img/core-img/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5 pt-6 sm:pt-8 lg:pt-12 pb-4 sm:pb-6 lg:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          {/* MCAN Information */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start items-center mb-3 sm:mb-4 md:mb-6">
              <img
                src={mcanLogo}
                alt="MCAN Logo"
                className="h-10 sm:h-12 md:h-16 w-auto"
                onError={(e) => {
                  e.target.src = FALLBACK_LOGO;
                }}
              />
            </div>
            <h2 className="text-mcan-primary font-bold text-sm sm:text-base md:text-lg mb-2 leading-tight">
              MUSLIM CORPERS' ASSOCIATION OF NIGERIA
            </h2>
            <p className="text-gray-600 mb-2 sm:mb-3 md:mb-4 font-medium text-sm sm:text-base">
              NIGERIA
            </p>
            <p className="text-gray-600 italic text-xs sm:text-sm leading-relaxed max-w-xs mx-auto sm:mx-0">
              "Say verily, my prayer, my sacrifice, my living, and my dying are for Allah, the lord of the worlds" (Q16:162)
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-6 sm:mt-8 lg:mt-0 text-center sm:text-left">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-mcan-primary mb-3 sm:mb-4 md:mb-6">
              Quick Links
            </h3>
            <ul className="space-y-1 sm:space-y-2 md:space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  About MCAN
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Our Programs
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Join MCAN
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/lodge-sponsorship" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Sponsor Lodge
                </Link>
              </li>
            </ul>
          </div>

          {/* Islamic Resources */}
          <div className="mt-6 sm:mt-8 lg:mt-0 text-center sm:text-left">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-mcan-primary mb-3 sm:mb-4 md:mb-6">
              Islamic Resources
            </h3>
            <ul className="space-y-1 sm:space-y-2 md:space-y-3">
              <li>
                <Link to="/lectures" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Lectures
                </Link>
              </li>
              <li>
                <Link to="/quran" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Quran Classes
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base block py-1">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="mt-6 sm:mt-8 lg:mt-0 text-center sm:text-left">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-mcan-primary mb-3 sm:mb-4 md:mb-6">
              Contact Us
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center justify-center sm:justify-start">
                <FaPhone className="mr-2 text-mcan-secondary flex-shrink-0 text-xs sm:text-sm" />
                <span className="text-gray-600 text-xs sm:text-sm md:text-base">+234 706 555 1234</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <FaEnvelope className="mr-2 text-mcan-secondary flex-shrink-0 text-xs sm:text-sm" />
                <a href="mailto:info@mcan.ng" className="text-gray-600 hover:text-mcan-primary transition text-xs sm:text-sm md:text-base">
                  info@mcan.ng
                </a>
              </li>
              <li className="flex items-start justify-center sm:justify-start">
                <FaMapMarkerAlt className="mr-2 mt-1 text-mcan-secondary flex-shrink-0 text-xs sm:text-sm" />
                <span className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed text-center sm:text-left">
                  MCAN Secretariat,
                  <br />
                  Nigeria
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-600 text-xs sm:text-sm">
                © {new Date().getFullYear()} MCAN. All rights reserved.
              </p>
            </div>
            <div className="text-center sm:text-right">
              <ul className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 lg:gap-4">
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-mcan-primary text-xs sm:text-sm transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-mcan-primary text-xs sm:text-sm transition">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-mcan-primary text-xs sm:text-sm transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
