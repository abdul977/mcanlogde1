import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/UserContext";
import { FaPrayingHands, FaMosque, FaUserCircle, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import mcanLogo from "../../assets/mcan-logo.png";

const UserDetails = () => {
  const [auth] = useAuth();
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: "05:30",
    dhuhr: "13:00",
    asr: "16:15",
    maghrib: "18:45",
    isha: "20:00"
  });

  const user = {
    name: auth?.user?.name || "N/A",
    email: auth?.user?.email || "N/A",
    gender: auth?.user?.gender || "N/A",
    stateCode: auth?.user?.stateCode || "N/A",
    batch: auth?.user?.batch || "N/A",
    stream: auth?.user?.stream || "N/A",
    callUpNumber: auth?.user?.callUpNumber || "N/A",
  };

  // Mock data - In real app, these would come from API
  const upcomingActivities = [
    { title: "Weekly Tafsir", date: "Every Saturday", time: "8:00 PM" },
    { title: "Islamic Study Circle", date: "Every Sunday", time: "4:00 PM" },
    { title: "Community Iftar", date: "Next Friday", time: "6:30 PM" },
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img src={mcanLogo} alt="MCAN Logo" className="h-16 w-auto" />
          <div>
            <h1 className="text-2xl font-bold text-mcan-primary">MCAN Lodge Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Prayer Times Widget */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-4">
            <h2 className="text-white text-lg font-semibold flex items-center">
              <FaPrayingHands className="mr-2" /> Prayer Times
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Object.entries(prayerTimes).map(([prayer, time]) => (
                <div key={prayer} className="flex justify-between items-center">
                  <span className="capitalize text-gray-700">{prayer}</span>
                  <span className="text-mcan-primary font-semibold">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NYSC Information */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-4">
            <h2 className="text-white text-lg font-semibold flex items-center">
              <FaUserCircle className="mr-2" /> Corps Member Details
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">State Code</label>
                <p className="font-semibold text-gray-700">{user.stateCode}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Batch</label>
                <p className="font-semibold text-gray-700">{user.batch} Stream {user.stream}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Call-up Number</label>
                <p className="font-semibold text-gray-700">{user.callUpNumber}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <p className="font-semibold text-gray-700">{user.gender}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-4">
            <h2 className="text-white text-lg font-semibold flex items-center">
              <FaCalendarAlt className="mr-2" /> Islamic Activities
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {upcomingActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <FaMosque className="text-mcan-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.date} at {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accommodation Status */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-4">
            <h2 className="text-white text-lg font-semibold flex items-center">
              <FaMapMarkerAlt className="mr-2" /> Accommodation
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-800">Single Room</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-800">Zone 6, Abuja</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Nearest Mosque:</span>
                <span className="font-medium text-gray-800">500m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FaPrayingHands, text: "Prayer Settings" },
          { icon: FaMosque, text: "Find Nearby Mosques" },
          { icon: GiPathDistance, text: "Get Directions" },
          { icon: FaCalendarAlt, text: "Activity Calendar" },
        ].map((action, index) => (
          <button
            key={index}
            className="flex items-center justify-center space-x-2 p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <action.icon className="text-mcan-primary" />
            <span className="text-gray-700">{action.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserDetails;
