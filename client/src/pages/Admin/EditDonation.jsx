import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaDonate, FaImage, FaPlus, FaMinus, FaSave, FaArrowLeft, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const EditDonation = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general_donation",
    category: "general",
    sponsorshipLevel: "",
    status: "draft",
    featured: false,
    urgent: false
  });
  
  const [amount, setAmount] = useState({
    target: 0,
    raised: 0,
    currency: "NGN",
    breakdown: []
  });
  
  const [sponsorshipTiers, setSponsorshipTiers] = useState([]);
  
  const [timeline, setTimeline] = useState({
    startDate: "",
    endDate: "",
    milestones: []
  });
  
  const [beneficiaries, setBeneficiaries] = useState({
    target: 0,
    current: 0,
    demographics: {
      corpsMembers: 0,
      families: 0,
      students: 0,
      general: 0
    }
  });
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);

  // Fetch donation data
  useEffect(() => {
    fetchDonation();
  }, [id]);

  const fetchDonation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/donations/admin/get-donation-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (response.data.success) {
        const donation = response.data.donation;
        
        // Set form data
        setFormData({
          title: donation.title || "",
          description: donation.description || "",
          type: donation.type || "general_donation",
          category: donation.category || "general",
          sponsorshipLevel: donation.sponsorshipLevel || "",
          status: donation.status || "draft",
          featured: donation.featured || false,
          urgent: donation.urgent || false
        });

        // Set amount data
        setAmount({
          target: donation.amount?.target || 0,
          raised: donation.amount?.raised || 0,
          currency: donation.amount?.currency || "NGN",
          breakdown: donation.amount?.breakdown || []
        });

        // Set sponsorship tiers
        setSponsorshipTiers(donation.sponsorshipTiers || []);

        // Set timeline
        setTimeline({
          startDate: donation.timeline?.startDate ? new Date(donation.timeline.startDate).toISOString().slice(0, 16) : "",
          endDate: donation.timeline?.endDate ? new Date(donation.timeline.endDate).toISOString().slice(0, 16) : "",
          milestones: donation.timeline?.milestones || []
        });

        // Set beneficiaries
        setBeneficiaries({
          target: donation.beneficiaries?.target || 0,
          current: donation.beneficiaries?.current || 0,
          demographics: {
            corpsMembers: donation.beneficiaries?.demographics?.corpsMembers || 0,
            families: donation.beneficiaries?.demographics?.families || 0,
            students: donation.beneficiaries?.demographics?.students || 0,
            general: donation.beneficiaries?.demographics?.general || 0
          }
        });

        // Set current images
        setCurrentImages(donation.images || []);
      } else {
        toast.error("Failed to fetch donation data");
        navigate("/admin/donations");
      }
    } catch (error) {
      console.error("Error fetching donation:", error);
      toast.error("Failed to fetch donation data");
      navigate("/admin/donations");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle amount changes
  const handleAmountChange = (field, value) => {
    setAmount(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle timeline changes
  const handleTimelineChange = (field, value) => {
    setTimeline(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle beneficiaries changes
  const handleBeneficiariesChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBeneficiaries(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: parseInt(value) || 0
        }
      }));
    } else {
      setBeneficiaries(prev => ({
        ...prev,
        [field]: parseInt(value) || 0
      }));
    }
  };

  // Add breakdown item
  const addBreakdownItem = () => {
    setAmount(prev => ({
      ...prev,
      breakdown: [...prev.breakdown, { item: "", cost: 0, description: "" }]
    }));
  };

  // Remove breakdown item
  const removeBreakdownItem = (index) => {
    setAmount(prev => ({
      ...prev,
      breakdown: prev.breakdown.filter((_, i) => i !== index)
    }));
  };

  // Handle breakdown changes
  const handleBreakdownChange = (index, field, value) => {
    setAmount(prev => ({
      ...prev,
      breakdown: prev.breakdown.map((item, i) => 
        i === index ? { ...item, [field]: field === 'cost' ? parseFloat(value) || 0 : value } : item
      )
    }));
  };

  // Add sponsorship tier
  const addSponsorshipTier = () => {
    setSponsorshipTiers(prev => [...prev, { name: "", minAmount: 0, maxAmount: 0, benefits: [] }]);
  };

  // Remove sponsorship tier
  const removeSponsorshipTier = (index) => {
    setSponsorshipTiers(prev => prev.filter((_, i) => i !== index));
  };

  // Handle sponsorship tier changes
  const handleSponsorshipTierChange = (index, field, value) => {
    setSponsorshipTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: field.includes('Amount') ? parseFloat(value) || 0 : value } : tier
    ));
  };

  // Add milestone
  const addMilestone = () => {
    setTimeline(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: "", description: "", targetDate: "", completed: false }]
    }));
  };

  // Remove milestone
  const removeMilestone = (index) => {
    setTimeline(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  // Handle milestone changes
  const handleMilestoneChange = (index, field, value) => {
    setTimeline(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: field === 'completed' ? value : value } : milestone
      )
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove new image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove current image
  const removeCurrentImage = (index) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !amount.target) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add amount data
      submitData.append('amount', JSON.stringify(amount));

      // Add timeline data
      submitData.append('timeline', JSON.stringify(timeline));

      // Add beneficiaries data
      submitData.append('beneficiaries', JSON.stringify(beneficiaries));

      // Add sponsorship tiers
      submitData.append('sponsorshipTiers', JSON.stringify(sponsorshipTiers));

      // Add current images (to keep them)
      submitData.append('currentImages', JSON.stringify(currentImages));

      // Add new images
      images.forEach((image, index) => {
        submitData.append(`images`, image);
      });

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/donations/admin/update-donation/${id}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Donation updated successfully!");
        navigate("/admin/donations");
      } else {
        toast.error(response.data.message || "Failed to update donation");
      }
    } catch (error) {
      console.error("Error updating donation:", error);
      toast.error("Failed to update donation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mcan-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/admin/donations")}
                  className="flex items-center text-gray-600 hover:text-mcan-primary transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Donations
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaDonate className="mr-3 text-mcan-primary" />
                    Edit Donation
                  </h1>
                  <p className="text-gray-600 mt-1">Update donation campaign details</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                    required
                  >
                    <option value="general_donation">General Donation</option>
                    <option value="lodge_sponsorship">Lodge Sponsorship</option>
                    <option value="scholarship_fund">Scholarship Fund</option>
                    <option value="event_sponsorship">Event Sponsorship</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="welfare">Welfare</option>
                    <option value="emergency_fund">Emergency Fund</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                  required
                />
              </div>
            </div>

            {/* Amount Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Amount Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    value={amount.target}
                    onChange={(e) => handleAmountChange('target', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Raised
                  </label>
                  <input
                    type="number"
                    value={amount.raised}
                    onChange={(e) => handleAmountChange('raised', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={amount.currency}
                    onChange={(e) => handleAmountChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                  >
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status and Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Status & Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                  >
                    <option value="general">General</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="education">Education</option>
                    <option value="welfare">Welfare</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Featured Donation
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="urgent"
                      checked={formData.urgent}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Urgent Donation
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Images */}
            {currentImages.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Current ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeCurrentImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/donations")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition-colors disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Update Donation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDonation;
