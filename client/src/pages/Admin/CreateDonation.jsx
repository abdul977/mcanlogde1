import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaDonate, FaImage, FaPlus, FaMinus, FaSave, FaMoneyBillWave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm } from "../../components/Mobile/ResponsiveForm";
import { MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";

const CreateDonation = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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
  
  const [paymentInfo, setPaymentInfo] = useState({
    bankDetails: {
      accountName: "Muslim Corps Members Association of Nigeria",
      accountNumber: "",
      bankName: "",
      sortCode: ""
    },
    mobilePayment: {
      number: "",
      provider: "mtn"
    }
  });
  
  const [tags, setTags] = useState([""]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Types
  const types = [
    { value: "lodge_sponsorship", label: "Lodge Sponsorship" },
    { value: "general_donation", label: "General Donation" },
    { value: "scholarship_fund", label: "Scholarship Fund" },
    { value: "event_sponsorship", label: "Event Sponsorship" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "welfare", label: "Welfare" },
    { value: "emergency_fund", label: "Emergency Fund" }
  ];

  // Categories
  const categories = [
    { value: "accommodation", label: "Accommodation" },
    { value: "education", label: "Education" },
    { value: "welfare", label: "Welfare" },
    { value: "spiritual", label: "Spiritual" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "emergency", label: "Emergency" },
    { value: "general", label: "General" }
  ];

  // Sponsorship levels
  const sponsorshipLevels = [
    { value: "bronze", label: "Bronze" },
    { value: "silver", label: "Silver" },
    { value: "gold", label: "Gold" },
    { value: "platinum", label: "Platinum" },
    { value: "diamond", label: "Diamond" },
    { value: "custom", label: "Custom" }
  ];

  // Mobile providers
  const mobileProviders = [
    { value: "mtn", label: "MTN" },
    { value: "airtel", label: "Airtel" },
    { value: "glo", label: "Glo" },
    { value: "9mobile", label: "9Mobile" }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle nested object changes
  const handleNestedChange = (setter, field, value) => {
    setter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle deep nested changes
  const handleDeepNestedChange = (setter, path, value) => {
    setter(prev => {
      const newState = { ...prev };
      const keys = path.split('.');
      let current = newState;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  // Handle array inputs
  const handleArrayChange = (index, value, setter, array) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const addArrayItem = (setter, array, defaultValue = "") => {
    setter([...array, defaultValue]);
  };

  const removeArrayItem = (index, setter, array) => {
    if (array.length > 1) {
      const newArray = array.filter((_, i) => i !== index);
      setter(newArray);
    }
  };

  // Add sponsorship tier
  const addSponsorshipTier = () => {
    setSponsorshipTiers(prev => [...prev, {
      name: "",
      amount: 0,
      benefits: [""],
      maxSponsors: 0,
      currentSponsors: 0,
      color: "#3B82F6"
    }]);
  };

  // Remove sponsorship tier
  const removeSponsorshipTier = (index) => {
    setSponsorshipTiers(prev => prev.filter((_, i) => i !== index));
  };

  // Handle sponsorship tier change
  const handleSponsorshipTierChange = (index, field, value) => {
    setSponsorshipTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    ));
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

  // Handle breakdown change
  const handleBreakdownChange = (index, field, value) => {
    setAmount(prev => ({
      ...prev,
      breakdown: prev.breakdown.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
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

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !amount.target) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add amount data
      submitData.append('amount', JSON.stringify(amount));
      
      // Add sponsorship tiers
      submitData.append('sponsorshipTiers', JSON.stringify(sponsorshipTiers));
      
      // Add timeline data
      submitData.append('timeline', JSON.stringify(timeline));
      
      // Add beneficiaries data
      submitData.append('beneficiaries', JSON.stringify(beneficiaries));
      
      // Add payment info
      submitData.append('paymentInfo', JSON.stringify(paymentInfo));
      
      // Add tags
      submitData.append('tags', JSON.stringify(tags.filter(t => t.trim() !== "")));
      
      // Add images
      images.forEach((image, index) => {
        submitData.append(`image${index}`, image);
        submitData.append(`image${index}_caption`, "");
      });

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/donations/admin/create-donation`,
        submitData,
        {
          headers: {
            Authorization: auth?.token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Donation campaign created successfully!");
        navigate("/admin/donations");
      } else {
        toast.error(data?.message || "Error creating donation campaign");
      }
    } catch (error) {
      console.error("Error creating donation campaign:", error);
      toast.error("Failed to create donation campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      title="Create Donation Campaign"
      subtitle="Add a new donation or sponsorship campaign"
      icon={FaDonate}
      navbar={Navbar}
      backgroundColor="bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5"
    >
      <div className="p-4 lg:p-8">

        {/* Form */}
        <ResponsiveForm
          onSubmit={handleSubmit}
          loading={loading}
          submitText={loading ? "Creating..." : "Create Campaign"}
          showCancel={true}
          onCancel={() => navigate("/admin/donations")}
          cancelText="Cancel"
          className="bg-white rounded-lg shadow-lg"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <MobileInput
              label="Campaign Title *"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter campaign title"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent text-sm lg:text-base"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              placeholder="Enter campaign description"
            />
          </div>

          {/* Amount & Target */}
          <div className="border-t pt-4 lg:pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <MobileInput
                label="Target Amount (NGN) *"
                type="number"
                value={amount.target}
                onChange={(e) => handleNestedChange(setAmount, 'target', parseInt(e.target.value) || 0)}
                required
                min="1000"
                placeholder="Enter target amount"
              />

              <MobileInput
                label="Amount Raised (NGN)"
                type="number"
                value={amount.raised}
                onChange={(e) => handleNestedChange(setAmount, 'raised', parseInt(e.target.value) || 0)}
                min="0"
                placeholder="Current amount raised"
              />

              <MobileInput
                label="Target Beneficiaries"
                type="number"
                value={beneficiaries.target}
                onChange={(e) => handleNestedChange(setBeneficiaries, 'target', parseInt(e.target.value) || 0)}
                min="0"
                placeholder="Number of people to help"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t pt-4 lg:pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Campaign Timeline</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <MobileInput
                label="Start Date"
                type="date"
                value={timeline.startDate}
                onChange={(e) => handleNestedChange(setTimeline, 'startDate', e.target.value)}
              />

              <MobileInput
                label="End Date"
                type="date"
                value={timeline.endDate}
                onChange={(e) => handleNestedChange(setTimeline, 'endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-t pt-4 lg:pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Bank Details</h4>
                <div className="space-y-3">
                  <MobileInput
                    label="Account Name"
                    value={paymentInfo.bankDetails.accountName}
                    onChange={(e) => handleDeepNestedChange(setPaymentInfo, 'bankDetails.accountName', e.target.value)}
                    placeholder="Account Name"
                  />
                  <MobileInput
                    label="Account Number"
                    value={paymentInfo.bankDetails.accountNumber}
                    onChange={(e) => handleDeepNestedChange(setPaymentInfo, 'bankDetails.accountNumber', e.target.value)}
                    placeholder="Account Number"
                  />
                  <MobileInput
                    label="Bank Name"
                    value={paymentInfo.bankDetails.bankName}
                    onChange={(e) => handleDeepNestedChange(setPaymentInfo, 'bankDetails.bankName', e.target.value)}
                    placeholder="Bank Name"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Mobile Payment</h4>
                <div className="space-y-3">
                  <MobileInput
                    label="Mobile Number"
                    value={paymentInfo.mobilePayment.number}
                    onChange={(e) => handleDeepNestedChange(setPaymentInfo, 'mobilePayment.number', e.target.value)}
                    placeholder="Mobile Number"
                  />
                  <div>
                    <select
                      value={paymentInfo.mobilePayment.provider}
                      onChange={(e) => handleDeepNestedChange(setPaymentInfo, 'mobilePayment.provider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent text-sm lg:text-base"
                    >
                      {mobileProviders.map(provider => (
                        <option key={provider.value} value={provider.value}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="border-t pt-4 lg:pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Campaign Settings</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent text-sm lg:text-base"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 pt-0 lg:pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured Campaign</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="urgent"
                    checked={formData.urgent}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Urgent</span>
                </label>
              </div>
            </div>
          </div>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateDonation;
