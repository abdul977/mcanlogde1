import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/UserContext";
import { FaPrayingHands, FaMosque, FaUserCircle, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaIdCard, FaStream, FaEdit, FaSpinner, FaBed, FaShoppingBag, FaEnvelope, FaChartBar } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import mcanLogo from "../../assets/mcan-logo.png";
import MobileLayout, { MobilePageHeader } from "../../components/Mobile/MobileLayout";
import { FormSection, FormField } from "../../components/Mobile/ResponsiveForm";
import DualCalendar from "../../components/DualCalendar";
import DynamicPrayerTimes from "../../components/DynamicPrayerTimes";
import Navbar from "./Navbar";
import { getUserProfile, formatNyscDetails, validateProfileCompletion } from "../../services/userService";
import { toast } from "react-toastify";
import axios from "axios";
import ProfileEditModal from "../../components/ProfileEditModal";

// Fallback logo URL
const FALLBACK_LOGO = "https://www.mcanenugu.org.ng/img/core-img/logo.png";

const UserDetails = () => {
  const [auth] = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileValidation, setProfileValidation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    bookings: 0,
    orders: 0,
    messages: 0,
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        if (response.success) {
          setUserProfile(response.user);
          setProfileValidation(validateProfileCompletion(response.user));
        } else {
          toast.error('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile data');
        // Fallback to auth context data
        if (auth?.user) {
          setUserProfile(auth.user);
          setProfileValidation(validateProfileCompletion(auth.user));
        }
      } finally {
        setLoading(false);
      }
    };

    if (auth?.user && auth?.token) {
      fetchUserProfile();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [auth]);

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      if (!auth?.token) return;

      const token = auth.token;

      // Fetch bookings count
      const bookingsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/my-bookings`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (bookingsResponse.data.success) {
        const bookingsCount = bookingsResponse.data.bookings ? bookingsResponse.data.bookings.length : 0;
        setStats(prevStats => ({
          ...prevStats,
          bookings: bookingsCount,
        }));
      }

      // Fetch orders count
      const ordersResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/orders/my-orders`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (ordersResponse.data.success) {
        const ordersCount = ordersResponse.data.orders ? ordersResponse.data.orders.length : 0;
        setStats(prevStats => ({
          ...prevStats,
          orders: ordersCount,
        }));
      }

    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show error to user for stats, just keep default values
    }
  };

  // Format user data for display
  const user = userProfile ? formatNyscDetails(userProfile) : {
    name: "Loading...",
    email: "Loading...",
    gender: "Loading...",
    stateCode: "Loading...",
    batch: "Loading...",
    stream: "Loading...",
    callUpNumber: "Loading...",
    phone: "Loading...",
    institution: "Loading...",
    course: "Loading..."
  };

  // Handle profile update
  const handleProfileUpdate = (updatedUser) => {
    setUserProfile(updatedUser);
    setProfileValidation(validateProfileCompletion(updatedUser));
    // Update auth context if needed
    if (auth?.user) {
      const updatedAuth = {
        ...auth,
        user: { ...auth.user, ...updatedUser }
      };
      localStorage.setItem('auth', JSON.stringify(updatedAuth));
    }
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
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="User Profile"
          subtitle={loading ? "Loading..." : `Welcome back, ${userProfile?.name || 'User'}`}
          icon={FaUserCircle}
          showOnMobile={false}
        />

        {/* Profile Completion Status */}
        {!loading && profileValidation && !profileValidation.isComplete && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Complete Your Profile</h3>
                <p className="text-xs text-yellow-600 mt-1">
                  {profileValidation.completionPercentage}% complete - Please fill in the missing information
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-yellow-600 hover:text-yellow-800 transition-colors"
              >
                <FaEdit className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 bg-yellow-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileValidation.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-mcan-primary text-2xl mr-3" />
            <span className="text-gray-600">Loading profile data...</span>
          </div>
        )}

        {/* Quick Stats Section */}
        {!loading && (
          <FormSection
            title="Quick Stats"
            icon={FaChartBar}
            columns={1}
            className="mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Bookings</p>
                    <p className="text-2xl font-bold">{stats.bookings}</p>
                  </div>
                  <FaBed className="text-2xl text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Orders</p>
                    <p className="text-2xl font-bold">{stats.orders}</p>
                  </div>
                  <FaShoppingBag className="text-2xl text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Messages</p>
                    <p className="text-2xl font-bold">{stats.messages}</p>
                  </div>
                  <FaEnvelope className="text-2xl text-purple-200" />
                </div>
              </div>
            </div>
          </FormSection>
        )}

        {/* User Information Section */}
        {!loading && (
          <FormSection
            title="Personal Information"
            icon={FaUserCircle}
            columns={2}
            className="mb-6"
          >
            <FormField label="Full Name">
              <div className="p-3 bg-gray-50 rounded-md border">
                {userProfile?.name || 'Not provided'}
              </div>
            </FormField>

            <FormField label="Email Address">
              <div className="p-3 bg-gray-50 rounded-md border">
                {userProfile?.email || 'Not provided'}
              </div>
            </FormField>

            <FormField label="Gender">
              <div className="p-3 bg-gray-50 rounded-md border flex items-center">
                <FaUser className="mr-2 text-mcan-primary" />
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
                <FaCalendarAlt className="mr-2 text-mcan-primary" />
                {user.batch}
              </div>
            </FormField>

            <FormField label="Stream">
              <div className="p-3 bg-gray-50 rounded-md border flex items-center">
                <FaStream className="mr-2 text-mcan-primary" />
                {user.stream}
              </div>
            </FormField>

            <FormField label="Call-Up Number" fullWidth>
              <div className="p-3 bg-gray-50 rounded-md border flex items-center">
                <FaIdCard className="mr-2 text-mcan-primary" />
                {user.callUpNumber}
              </div>
            </FormField>

            {/* Additional Fields */}
            {userProfile?.phone && (
              <FormField label="Phone Number">
                <div className="p-3 bg-gray-50 rounded-md border">
                  {userProfile.phone}
                </div>
              </FormField>
            )}

            {userProfile?.institution && (
              <FormField label="Institution">
                <div className="p-3 bg-gray-50 rounded-md border">
                  {userProfile.institution}
                </div>
              </FormField>
            )}

            {userProfile?.course && (
              <FormField label="Course of Study">
                <div className="p-3 bg-gray-50 rounded-md border">
                  {userProfile.course}
                </div>
              </FormField>
            )}
          </FormSection>
        )}

        {/* Prayer Times Section */}
        <FormSection
          title="Prayer Times"
          icon={FaPrayingHands}
          subtitle="Live prayer schedule with current prayer highlighted"
          columns={1}
          className="mb-6"
        >
          <DynamicPrayerTimes />
        </FormSection>

        {/* Calendar Section */}
        <FormSection
          title="Calendar"
          icon={FaCalendarAlt}
          subtitle="Georgian and Islamic dates"
          columns={1}
          className="mb-6"
        >
          <DualCalendar />
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

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userProfile={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </MobileLayout>
  );
};

export default UserDetails;
