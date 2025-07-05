import React from "react";
import { FaMosque, FaQuran, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import mcanLogo from "../assets/mcan-logo.png";
import { Link } from "react-router-dom";

// Fallback logo URL
const FALLBACK_LOGO = "https://www.mcanenugu.org.ng/img/core-img/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* MCAN Information */}
          <div className="col-span-1">
            <div className="flex items-center mb-6">
              <img
                src={mcanLogo}
                alt="MCAN Logo"
                className="h-16 w-auto"
                onError={(e) => {
                  e.target.src = FALLBACK_LOGO;
                }}
              />
            </div>
            <h2 className="text-mcan-primary font-bold text-lg mb-2">
              MUSLIM CORPERS' ASSOCIATION OF NIGERIA
            </h2>
            <p className="text-gray-600 mb-4">
              FCT CHAPTER
            </p>
            <p className="text-gray-600 italic text-sm">
              "Say verily, my prayer, my sacrifice, my living, and my dying are for Allah, the lord of the worlds" (Q16:162)
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-mcan-primary mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-mcan-primary transition">
                  About MCAN
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-gray-600 hover:text-mcan-primary transition">
                  Our Programs
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-600 hover:text-mcan-primary transition">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-mcan-primary transition">
                  Join MCAN
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-gray-600 hover:text-mcan-primary transition">
                  Donate to MCAN
                </Link>
                <Link to="/lodge-sponsorship" className="text-gray-600 hover:text-mcan-primary transition">
                  Sponsor a Lodge
                </Link>
              </li>
            </ul>
          </div>

          {/* Islamic Resources */}
          <div>
            <h3 className="text-lg font-semibold text-mcan-primary mb-6">
              Islamic Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/lectures" className="text-gray-600 hover:text-mcan-primary transition">
                  Islamic Lectures
                </Link>
              </li>
              <li>
                <Link to="/quran" className="text-gray-600 hover:text-mcan-primary transition">
                  Quran Classes
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-600 hover:text-mcan-primary transition">
                  Events Calendar
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-600 hover:text-mcan-primary transition">
                  Islamic Resources
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-600 hover:text-mcan-primary transition">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-mcan-primary mb-6">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <FaPhone className="mr-2 text-mcan-secondary" />
                <span className="text-gray-600">+234 706 555 1234</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-mcan-secondary" />
                <a href="mailto:fct@mcan.ng" className="text-gray-600 hover:text-mcan-primary transition">
                  fct@mcan.ng
                </a>
              </li>
              <li className="flex items-start">
                <FaMapMarkerAlt className="mr-2 mt-1 text-mcan-secondary" />
                <span className="text-gray-600">
                  MCAN FCT Secretariat,
                  <br />
                  Federal Capital Territory,
                  <br />
                  Abuja, Nigeria
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 lg:mt-16 pt-6 lg:pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} MCAN FCT Chapter. All rights reserved.
              </p>
            </div>
            <div className="text-center md:text-right">
              <ul className="flex justify-center md:justify-end space-x-4 lg:space-x-6">
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-mcan-primary text-sm transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-mcan-primary text-sm transition">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-mcan-primary text-sm transition">
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
