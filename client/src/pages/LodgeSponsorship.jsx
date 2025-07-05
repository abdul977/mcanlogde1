import React, { useState, useEffect } from "react";
import { FaHome, FaUsers, FaHandshake, FaStar, FaChartLine, FaSync, FaHeart, FaDonate, FaCalendar, FaMapMarkerAlt, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const LodgeSponsorship = () => {
  const [donations, setDonations] = useState([]);
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [urgentDonations, setUrgentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [sponsorForm, setSponsorForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    amount: "",
    tier: "",
    isAnonymous: false,
    message: "",
    paymentMethod: "bank_transfer"
  });

  const types = [
    { id: "all", name: "All Types" },
    { id: "lodge_sponsorship", name: "Lodge Sponsorship" },
    { id: "general_donation", name: "General Donation" },
    { id: "scholarship_fund", name: "Scholarship Fund" },
    { id: "event_sponsorship", name: "Event Sponsorship" },
    { id: "emergency_fund", name: "Emergency Fund" },
    { id: "welfare", name: "Welfare" },
  ];

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "accommodation", name: "Accommodation" },
    { id: "education", name: "Education" },
    { id: "welfare", name: "Welfare" },
    { id: "spiritual", name: "Spiritual" },
    { id: "infrastructure", name: "Infrastructure" },
    { id: "emergency", name: "Emergency" },
  ];

  // Fetch donations from server
  const fetchDonations = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        ...(selectedType !== "all" && { type: selectedType }),
        ...(selectedCategory !== "all" && { category: selectedCategory }),
      });

      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/donations/get-all-donations?${params}`);

      if (data?.success) {
        setDonations(data.donations || []);
        if (showRefreshLoader) {
          toast.success("Donations refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching donations", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to fetch donations. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch featured donations
  const fetchFeaturedDonations = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/donations/featured`);

      if (data?.success) {
        setFeaturedDonations(data.donations || []);
      }
    } catch (error) {
      console.error("Error fetching featured donations:", error);
    }
  };

  // Fetch urgent donations
  const fetchUrgentDonations = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/donations/urgent`);

      if (data?.success) {
        setUrgentDonations(data.donations || []);
      }
    } catch (error) {
      console.error("Error fetching urgent donations:", error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchDonations();
  }, [selectedType, selectedCategory]);

  // Load featured and urgent donations on component mount
  useEffect(() => {
    fetchFeaturedDonations();
    fetchUrgentDonations();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchDonations(true);
    fetchFeaturedDonations();
    fetchUrgentDonations();
  };

  // Handle sponsor form submission
  const handleSponsorSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDonation) return;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/donations/sponsor/${selectedDonation._id}`,
        sponsorForm
      );

      if (data?.success) {
        toast.success(`Thank you for your sponsorship! Receipt: ${data.receiptNumber}`, {
          position: "bottom-left",
          autoClose: 8000
        });
        setShowSponsorForm(false);
        setSponsorForm({
          name: "",
          email: "",
          phone: "",
          organization: "",
          amount: "",
          tier: "",
          isAnonymous: false,
          message: "",
          paymentMethod: "bank_transfer"
        });
        fetchDonations(true);
      } else {
        toast.error(data?.message || "Error processing sponsorship", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error submitting sponsorship:", error);
      toast.error("Failed to process sponsorship. Please try again.", { position: "bottom-left" });
    }
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const colors = {
      lodge_sponsorship: "bg-blue-100 text-blue-800",
      general_donation: "bg-green-100 text-green-800",
      scholarship_fund: "bg-purple-100 text-purple-800",
      event_sponsorship: "bg-yellow-100 text-yellow-800",
      emergency_fund: "bg-red-100 text-red-800",
      welfare: "bg-pink-100 text-pink-800",
      infrastructure: "bg-indigo-100 text-indigo-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Format currency
  const formatCurrency = (amount, currency = "NGN") => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = (raised, target) => {
    return Math.min(100, Math.round((raised / target) * 100));
  };

  // Get days remaining
  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-mcan-primary">MCAN Donations & Sponsorship</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                refreshing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-mcan-primary text-white hover:bg-mcan-secondary'
              }`}
              title="Refresh Donations"
            >
              <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Support Muslim corps members through our various donation and sponsorship programs
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`px-4 py-2 rounded-full transition duration-300 ${
                        selectedType === type.id
                          ? "bg-mcan-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-mcan-primary/10"
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full transition duration-300 ${
                        selectedCategory === category.id
                          ? "bg-mcan-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-mcan-primary/10"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Donations */}
        {urgentDonations.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-red-600 mb-8 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Urgent Donations Needed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {urgentDonations.map((donation, index) => (
                <div key={donation._id || index} className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-red-500">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(donation.type)}`}>
                        {donation.type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center text-red-500">
                        <FaClock className="mr-1" />
                        <span className="text-sm">{getDaysRemaining(donation.timeline.endDate)} days left</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-mcan-primary mb-2">{donation.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{donation.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{getProgressPercentage(donation.amount.raised, donation.amount.target)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(donation.amount.raised, donation.amount.target)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{formatCurrency(donation.amount.raised, donation.amount.currency)} raised</span>
                        <span>{formatCurrency(donation.amount.target, donation.amount.currency)} goal</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDonation(donation);
                        setShowSponsorForm(true);
                      }}
                      className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition duration-300"
                    >
                      Donate Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Donations */}
        {featuredDonations.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-mcan-primary mb-8 flex items-center">
              <FaStar className="mr-2 text-yellow-500" />
              Featured Campaigns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDonations.map((donation, index) => (
                <div key={donation._id || index} className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-yellow-500">
                  {donation.primaryImage && (
                    <img
                      src={donation.primaryImage}
                      alt={donation.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(donation.type)}`}>
                        {donation.type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <FaStar className="mr-1" />
                        <span className="text-sm">Featured</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-mcan-primary mb-2">{donation.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{donation.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{getProgressPercentage(donation.amount.raised, donation.amount.target)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-mcan-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(donation.amount.raised, donation.amount.target)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{formatCurrency(donation.amount.raised, donation.amount.currency)}</span>
                        <span>{formatCurrency(donation.amount.target, donation.amount.currency)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <FaUsers className="mr-1" />
                        <span>{donation.beneficiaries?.current || 0}/{donation.beneficiaries?.target || 0} helped</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendar className="mr-1" />
                        <span>{getDaysRemaining(donation.timeline.endDate)} days left</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDonation(donation);
                        setShowSponsorForm(true);
                      }}
                      className="w-full bg-mcan-primary text-white py-2 rounded hover:bg-mcan-secondary transition duration-300"
                    >
                      Support This Campaign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Donations */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8">
            All Donation Campaigns
            {donations.length > 0 && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({donations.length} active)
              </span>
            )}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
              <span className="ml-3 text-gray-600">Loading donations...</span>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-16">
              <FaDonate className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Campaigns</h3>
              <p className="text-gray-500">
                No donation campaigns match your current filters. Try adjusting your selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation, index) => (
                <div
                  key={donation._id || index}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {donation.primaryImage && (
                    <img
                      src={donation.primaryImage}
                      alt={donation.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(donation.type)}`}>
                        {donation.type.replace('_', ' ')}
                      </span>
                      {donation.featured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                      {donation.urgent && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-mcan-primary mb-2 line-clamp-2">
                      {donation.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{donation.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{getProgressPercentage(donation.amount.raised, donation.amount.target)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            donation.urgent ? 'bg-red-500' : 'bg-mcan-primary'
                          }`}
                          style={{ width: `${getProgressPercentage(donation.amount.raised, donation.amount.target)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{formatCurrency(donation.amount.raised, donation.amount.currency)}</span>
                        <span>{formatCurrency(donation.amount.target, donation.amount.currency)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <FaUsers className="mr-1" />
                        <span>{donation.sponsors?.length || 0} sponsors</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendar className="mr-1" />
                        <span>{getDaysRemaining(donation.timeline.endDate)} days left</span>
                      </div>
                    </div>

                    {donation.sponsorshipTiers && donation.sponsorshipTiers.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">Sponsorship Tiers:</h4>
                        <div className="space-y-1">
                          {donation.sponsorshipTiers.slice(0, 2).map((tier, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span>{tier.name}</span>
                              <span>{formatCurrency(tier.amount, donation.amount.currency)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedDonation(donation);
                        setShowSponsorForm(true);
                      }}
                      className={`w-full text-white py-2 rounded transition duration-300 ${
                        donation.urgent
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-mcan-primary hover:bg-mcan-secondary'
                      }`}
                    >
                      {donation.urgent ? 'Donate Now' : 'Support Campaign'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-mcan-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-mcan-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose a Campaign</h3>
              <p className="text-gray-600">
                Select a donation campaign that matches your support goals
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-mcan-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-mcan-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Make Your Contribution</h3>
              <p className="text-gray-600">
                Complete your donation through our secure payment system
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-mcan-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-mcan-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Track Your Impact</h3>
              <p className="text-gray-600">
                Receive regular updates about the impact of your contribution
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Need More Information?</h2>
          <p className="text-gray-600 mb-8">
            Contact our team to discuss custom packages or learn more about our programs
          </p>
          <div className="space-x-4">
            <a
              href="/contact"
              className="inline-flex items-center bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              Contact Us
            </a>
            <a
              href="/about"
              className="inline-flex items-center border-2 border-mcan-primary text-mcan-primary px-6 py-3 rounded-md hover:bg-mcan-primary hover:text-white transition duration-300"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Summary Statistics */}
        {!loading && donations.length > 0 && (
          <div className="mt-16 bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-mcan-primary">{donations.length}</div>
                <div className="text-sm text-gray-600">Active Campaigns</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(donations.reduce((total, d) => total + d.amount.raised, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Raised</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {donations.reduce((total, d) => total + (d.sponsors?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Sponsors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {donations.reduce((total, d) => total + (d.beneficiaries?.current || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">People Helped</div>
              </div>
            </div>
          </div>
        )}

        {/* Sponsor Form Modal */}
        {showSponsorForm && selectedDonation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-mcan-primary">Support: {selectedDonation.title}</h3>
                  <button
                    onClick={() => setShowSponsorForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSponsorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={sponsorForm.name}
                      onChange={(e) => setSponsorForm({...sponsorForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={sponsorForm.email}
                      onChange={(e) => setSponsorForm({...sponsorForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={sponsorForm.phone}
                      onChange={(e) => setSponsorForm({...sponsorForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization (Optional)</label>
                    <input
                      type="text"
                      value={sponsorForm.organization}
                      onChange={(e) => setSponsorForm({...sponsorForm, organization: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NGN) *</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={sponsorForm.amount}
                      onChange={(e) => setSponsorForm({...sponsorForm, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                  </div>

                  {selectedDonation.sponsorshipTiers && selectedDonation.sponsorshipTiers.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sponsorship Tier (Optional)</label>
                      <select
                        value={sponsorForm.tier}
                        onChange={(e) => {
                          const tier = selectedDonation.sponsorshipTiers.find(t => t.name === e.target.value);
                          setSponsorForm({
                            ...sponsorForm,
                            tier: e.target.value,
                            amount: tier ? tier.amount.toString() : sponsorForm.amount
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      >
                        <option value="">Select a tier</option>
                        {selectedDonation.sponsorshipTiers.map((tier, idx) => (
                          <option key={idx} value={tier.name}>
                            {tier.name} - {formatCurrency(tier.amount, selectedDonation.amount.currency)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                    <select
                      required
                      value={sponsorForm.paymentMethod}
                      onChange={(e) => setSponsorForm({...sponsorForm, paymentMethod: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="card">Card Payment</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                    <textarea
                      value={sponsorForm.message}
                      onChange={(e) => setSponsorForm({...sponsorForm, message: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="Leave a message of support..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={sponsorForm.isAnonymous}
                      onChange={(e) => setSponsorForm({...sponsorForm, isAnonymous: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="anonymous" className="text-sm text-gray-700">
                      Make this donation anonymous
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowSponsorForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300"
                    >
                      Submit Donation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LodgeSponsorship;
