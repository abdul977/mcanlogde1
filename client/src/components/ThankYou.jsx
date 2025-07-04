import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMosque, FaHome, FaPrayingHands, FaQuran } from "react-icons/fa";
import mcanLogo from "../assets/mcan-logo.png";

const ThankYou = () => {
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setShowMessage(true), 500);
  }, []);

  const islamicMessages = [
    "May Allah make this accommodation a source of peace and blessings for you",
    "We pray that you find comfort and spiritual growth in your new home",
    "May this place be a means of strengthening your faith and brotherhood/sisterhood",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-mcan-primary to-mcan-secondary flex items-center justify-center">
      <div className={`max-w-2xl w-full mx-4 transform transition-all duration-1000 ${
        showMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}>
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="text-center p-8 border-b">
            <img
              src={mcanLogo}
              alt="MCAN Logo"
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-mcan-primary">
              Alhamdulillah!
            </h1>
            <p className="text-gray-600 mt-2">
              Your accommodation has been booked successfully
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Islamic Message */}
            <div className="text-center mb-8">
              <FaQuran className="text-mcan-primary w-12 h-12 mx-auto mb-4" />
              <p className="text-xl text-gray-700 italic">
                {islamicMessages[Math.floor(Math.random() * islamicMessages.length)]}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-4 rounded-lg bg-mcan-primary/5">
                <FaMosque className="w-8 h-8 mx-auto text-mcan-primary mb-2" />
                <p className="text-gray-700">Nearby Mosques</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-mcan-primary/5">
                <FaPrayingHands className="w-8 h-8 mx-auto text-mcan-primary mb-2" />
                <p className="text-gray-700">Prayer Facilities</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/user/bookings")}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <FaHome className="mr-2" />
                View Booking Details
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center px-6 py-3 border-2 border-mcan-primary text-mcan-primary rounded-lg hover:bg-mcan-primary hover:text-white transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-white text-sm">
          <p>For any assistance, please contact MCAN Lodge support</p>
          <p className="mt-1">May Allah make your service year blessed and beneficial</p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
