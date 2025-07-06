import React, { useEffect, useState } from "react";
import { FaImage, FaMosque, FaHome, FaUsers, FaMapMarkerAlt, FaPlus, FaTimes, FaDollarSign, FaPhone } from "react-icons/fa";
import Navbar from "./Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import MobileLayout, { MobilePageHeader, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect, ResponsiveTextarea, ResponsiveCheckboxGroup, ResponsiveFileUpload } from "../../components/Mobile/ResponsiveForm";

const CreatePost = () => {
  const [auth] = useAuth();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [accommodationType, setAccommodationType] = useState("");
  const [description, setDescription] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [nearArea, setNearArea] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState([]);
  const [guest, setGuest] = useState("1");
  const [isAvailable, setIsAvailable] = useState(true);
  const [price, setPrice] = useState("");
  const [mosqueProximity, setMosqueProximity] = useState("");
  const [prayerFacilities, setPrayerFacilities] = useState(false);
  const [genderRestriction, setGenderRestriction] = useState("");
  const [rules, setRules] = useState([]);
  const [landlordContact, setLandlordContact] = useState({
    name: "",
    phone: "",
    preferredContactTime: ""
  });
  const [nearbyFacilities, setNearbyFacilities] = useState({
    mosques: [],
    halalRestaurants: [],
    islamicCenters: []
  });
  const [loading, setLoading] = useState(false);

  // Helper functions for managing arrays
  const addToArray = (array, setArray, value) => {
    if (value.trim() && !array.includes(value.trim())) {
      setArray([...array, value.trim()]);
    }
  };

  const removeFromArray = (array, setArray, index) => {
    setArray(array.filter((_, i) => i !== index));
  };

  const handleLandlordContactChange = (field, value) => {
    setLandlordContact(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/category/get-category`
      );
      setCategory(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error("You can only upload a maximum of 3 images.");
      return;
    }
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form fields
    if (
      !title ||
      !location ||
      !accommodationType ||
      !description ||
      !selectedCategory ||
      !guest ||
      !price ||
      !mosqueProximity ||
      !genderRestriction
    ) {
      setLoading(false);
      return toast.error("All required fields must be filled.");
    }

    if (images.length !== 3) {
      setLoading(false);
      return toast.error("Please upload exactly 3 images.");
    }

    if (facilities.length === 0) {
      setLoading(false);
      return toast.error("Please add at least one facility.");
    }

    if (nearArea.length === 0) {
      setLoading(false);
      return toast.error("Please add at least one nearby area.");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("location", location);
    formData.append("accommodationType", accommodationType);
    formData.append("description", description);
    formData.append("facilities", JSON.stringify(facilities));
    formData.append("nearArea", JSON.stringify(nearArea));
    formData.append("category", selectedCategory);
    formData.append("guest", guest);
    formData.append("isAvailable", isAvailable);
    formData.append("price", price);
    formData.append("mosqueProximity", mosqueProximity);
    formData.append("prayerFacilities", prayerFacilities);
    formData.append("genderRestriction", genderRestriction);
    formData.append("rules", JSON.stringify(rules));
    formData.append("landlordContact", JSON.stringify(landlordContact));
    formData.append("nearbyFacilities", JSON.stringify(nearbyFacilities));

    images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/post/create-post`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: auth?.token,
          },
        }
      );
      toast.success("Accommodation created successfully!");

      // Reset form
      setTitle("");
      setLocation("");
      setAccommodationType("");
      setDescription("");
      setFacilities([]);
      setNearArea([]);
      setSelectedCategory("");
      setImages([]);
      setGuest("1");
      setIsAvailable(true);
      setPrice("");
      setMosqueProximity("");
      setPrayerFacilities(false);
      setGenderRestriction("");
      setRules([]);
      setLandlordContact({ name: "", phone: "", preferredContactTime: "" });
      setNearbyFacilities({ mosques: [], halalRestaurants: [], islamicCenters: [] });
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create accommodation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      title="Create Accommodation"
      subtitle="Add new listing"
      icon={FaHome}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Create New Accommodation"
          subtitle="Add a new accommodation listing for MCAN members"
          icon={FaHome}
          showOnMobile={false}
        />

        {/* Form */}
        <ResponsiveForm
          title="Create New Accommodation"
          subtitle="Fill in the details below to create a new accommodation listing"
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Create Accommodation"
          showCancel={false}
        >
          {/* Basic Information Section */}
          <FormSection
            title="Basic Information"
            icon={FaHome}
            columns={2}
          >
            <FormField label="Accommodation Title" required>
              <MobileInput
                type="text"
                placeholder="e.g., MCAN Kubwa Lodge - Brothers Room 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Location" required>
              <MobileInput
                type="text"
                placeholder="e.g., Kubwa, Abuja"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                icon={FaMapMarkerAlt}
                required
              />
            </FormField>

            <FormField label="Accommodation Type" required>
              <ResponsiveSelect
                value={accommodationType}
                onChange={(e) => setAccommodationType(e.target.value)}
                options={[
                  { value: 'Single Room', label: 'Single Room' },
                  { value: 'Shared Apartment', label: 'Shared Apartment' },
                  { value: 'Family Unit', label: 'Family Unit' },
                  { value: 'Studio', label: 'Studio' }
                ]}
                placeholder="Select accommodation type"
                required
              />
            </FormField>

            <FormField label="Gender Restriction" required>
              <ResponsiveSelect
                value={genderRestriction}
                onChange={(e) => setGenderRestriction(e.target.value)}
                options={[
                  { value: 'brothers', label: 'Brothers Only' },
                  { value: 'sisters', label: 'Sisters Only' },
                  { value: 'family', label: 'Family' }
                ]}
                placeholder="Select gender restriction"
                required
              />
            </FormField>

            <FormField label="Description" required fullWidth>
              <ResponsiveTextarea
                placeholder="Describe the accommodation, its features, and what makes it suitable for Muslim corps members..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </FormField>
          </FormSection>

          {/* Pricing and Capacity Section */}
          <FormSection
            title="Pricing and Capacity"
            icon={FaUsers}
            columns={3}
          >
            <FormField label="Price per Month (₦)" required>
              <MobileInput
                type="number"
                placeholder="e.g., 15000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="10000"
                max="500000"
                icon={FaDollarSign}
                required
              />
            </FormField>

            <FormField label="Maximum Guests" required>
              <ResponsiveSelect
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                options={[...Array(6)].map((_, i) => ({
                  value: i + 1,
                  label: `${i + 1} ${i === 0 ? 'person' : 'people'}`
                }))}
                placeholder="Select capacity"
                required
              />
            </FormField>

            <FormField label="Category" required>
              <ResponsiveSelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={category?.map((item) => ({
                  value: item._id,
                  label: item.name
                })) || []}
                placeholder="Select a category"
                required
              />
            </FormField>

            <FormField label="Availability Status" fullWidth>
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={isAvailable === true}
                    onChange={() => setIsAvailable(true)}
                    className="mr-2 text-mcan-primary focus:ring-mcan-primary"
                  />
                  <span className="text-green-600 font-medium">Available</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={isAvailable === false}
                    onChange={() => setIsAvailable(false)}
                    className="mr-2 text-mcan-primary focus:ring-mcan-primary"
                  />
                  <span className="text-red-600 font-medium">Not Available</span>
                </label>
              </div>
            </FormField>
          </FormSection>

          {/* Islamic Features Section */}
          <FormSection
            title="Islamic Features"
            icon={FaMosque}
            columns={2}
          >
            <FormField label="Distance to Nearest Mosque (meters)" required>
              <MobileInput
                type="number"
                placeholder="e.g., 500"
                value={mosqueProximity}
                onChange={(e) => setMosqueProximity(e.target.value)}
                min="0"
                icon={FaMosque}
                required
              />
            </FormField>

            <FormField label="Prayer Facilities Available">
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="prayerFacilities"
                    checked={prayerFacilities === true}
                    onChange={() => setPrayerFacilities(true)}
                    className="mr-2 text-mcan-primary focus:ring-mcan-primary"
                  />
                  <span className="text-green-600 font-medium">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="prayerFacilities"
                    checked={prayerFacilities === false}
                    onChange={() => setPrayerFacilities(false)}
                    className="mr-2 text-mcan-primary focus:ring-mcan-primary"
                  />
                  <span className="text-gray-600 font-medium">No</span>
                </label>
              </div>
            </FormField>
          </FormSection>

          {/* Note: Additional sections like Facilities, Images, etc. can be added here */}
          <FormSection title="Additional Information" columns={1}>
            <FormField label="Note" fullWidth>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  This form has been optimized for mobile devices. Additional sections for facilities,
                  images, landlord contact, and other features will be added in the next update.
                </p>
              </div>
            </FormField>
          </FormSection>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreatePost;
