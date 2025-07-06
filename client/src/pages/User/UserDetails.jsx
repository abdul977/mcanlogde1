import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/UserContext";
import { FaPrayingHands, FaMosque, FaUserCircle, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaIdCard, FaStream } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import mcanLogo from "../../assets/mcan-logo.png";
import MobileLayout, { MobilePageHeader } from "../../components/Mobile/MobileLayout";
import { FormSection, FormField } from "../../components/Mobile/ResponsiveForm";

// Fallback logo URL
const FALLBACK_LOGO = "https://www.mcanenugu.org.ng/img/core-img/logo.png";

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
    <MobileLayout
      title="Profile"
      subtitle="User details"
      icon={FaUser}
      logoSrc={mcanLogo}
      logoAlt="MCAN Logo"
      fallbackLogoSrc={FALLBACK_LOGO}
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="User Profile"
          subtitle={`Welcome back, ${user.name}`}
          icon={FaUserCircle}
          showOnMobile={false}
        />

        {/* User Information Section */}
        <FormSection
          title="Personal Information"
          icon={FaUserCircle}
          columns={2}
          className="mb-6"
        >
          <FormField label="Full Name">
            <div className="p-3 bg-gray-50 rounded-md border">
              {user.name}
            </div>
          </FormField>

          <FormField label="Email Address">
            <div className="p-3 bg-gray-50 rounded-md border">
              {user.email}
            </div>
          </FormField>

          <FormField label="Gender">
            <div className="p-3 bg-gray-50 rounded-md border">
              {user.gender}
            </div>
          </FormField>

          <FormField label="State Code">
            <div className="p-3 bg-gray-50 rounded-md border flex items-center">
              <FaMapMarkerAlt className="mr-2 text-mcan-primary" />
              {user.stateCode}
            </div>
          </FormField>

          <FormField label="Batch">
            <div className="p-3 bg-gray-50 rounded-md border flex items-center">
              <FaCalendarAlt className="mr-2 text-mcan-secondary" />
              {user.batch}
            </div>
          </FormField>

          <FormField label="Stream">
            <div className="p-3 bg-gray-50 rounded-md border flex items-center">
              <FaStream className="mr-2 text-gray-500" />
              {user.stream}
            </div>
          </FormField>

          <FormField label="Call-Up Number" fullWidth>
            <div className="p-3 bg-gray-50 rounded-md border flex items-center">
              <FaIdCard className="mr-2 text-mcan-primary" />
              {user.callUpNumber}
            </div>
          </FormField>
        </FormSection>

        {/* Prayer Times Section */}
        <FormSection
          title="Prayer Times"
          icon={FaPrayingHands}
          subtitle="Today's prayer schedule"
          columns={1}
          className="mb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(prayerTimes).map(([prayer, time]) => (
              <div key={prayer} className="bg-white p-4 rounded-lg shadow border text-center">
                <FaMosque className="text-mcan-primary text-xl mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800 capitalize mb-1">{prayer}</h4>
                <p className="text-mcan-secondary font-medium">{time}</p>
              </div>
            ))}
          </div>
        </FormSection>

        {/* Upcoming Activities Section */}
        <FormSection
          title="Upcoming Activities"
          icon={FaCalendarAlt}
          subtitle="MCAN events and programs"
          columns={1}
        >
          <div className="space-y-4">
            {upcomingActivities.map((activity, index) => (
              <div key={index} className="bg-white p-4 lg:p-6 rounded-lg shadow border hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-mcan-primary rounded-full flex items-center justify-center">
                      <FaCalendarAlt className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-mcan-primary">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      </div>
    </MobileLayout>
  );
};

export default UserDetails;
