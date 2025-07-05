import React, { useEffect, useState } from "react";
import { FaImage, FaMosque, FaHome, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "./Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";

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
    <div className="min-h-screen bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5">
      <div className="flex">
        <div className="ml-[4rem]">
          <Navbar />
        </div>
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-3 rounded-lg">
                <FaHome className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create New Accommodation</h1>
                <p className="text-gray-600">Add a new accommodation listing for MCAN members</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaHome className="mr-2 text-mcan-primary" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accommodation Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., MCAN Kubwa Lodge - Brothers Room 1"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mcan-primary" />
                      <input
                        type="text"
                        placeholder="e.g., Kubwa, Abuja"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accommodation Type *
                    </label>
                    <select
                      value={accommodationType}
                      onChange={(e) => setAccommodationType(e.target.value)}
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    >
                      <option value="">Select accommodation type</option>
                      <option value="Single Room">Single Room</option>
                      <option value="Shared Apartment">Shared Apartment</option>
                      <option value="Family Unit">Family Unit</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender Restriction *
                    </label>
                    <select
                      value={genderRestriction}
                      onChange={(e) => setGenderRestriction(e.target.value)}
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    >
                      <option value="">Select gender restriction</option>
                      <option value="brothers">Brothers Only</option>
                      <option value="sisters">Sisters Only</option>
                      <option value="family">Family</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    placeholder="Describe the accommodation, its features, and what makes it suitable for Muslim corps members..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                    required
                  />
                </div>
              </div>

              {/* Pricing and Capacity Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUsers className="mr-2 text-mcan-primary" />
                  Pricing and Capacity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Month (₦) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 15000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="10000"
                      max="500000"
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Guests *
                    </label>
                    <select
                      value={guest}
                      onChange={(e) => setGuest(e.target.value)}
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    >
                      {[...Array(6)].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1} {i === 0 ? 'person' : 'people'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    >
                      <option value="">Select a category</option>
                      {category?.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Status
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="availability"
                        checked={isAvailable === true}
                        onChange={() => setIsAvailable(true)}
                        className="mr-2 text-mcan-primary focus:ring-mcan-primary"
                      />
                      <span className="text-green-600 font-medium">Available</span>
                    </label>
                    <label className="flex items-center">
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
                </div>
              </div>

              {/* Islamic Features Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaMosque className="mr-2 text-mcan-primary" />
                  Islamic Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distance to Nearest Mosque (meters) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 500"
                      value={mosqueProximity}
                      onChange={(e) => setMosqueProximity(e.target.value)}
                      min="0"
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prayer Facilities Available
                    </label>
                    <div className="flex items-center space-x-4 mt-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="prayerFacilities"
                          checked={prayerFacilities === true}
                          onChange={() => setPrayerFacilities(true)}
                          className="mr-2 text-mcan-primary focus:ring-mcan-primary"
                        />
                        <span className="text-green-600 font-medium">Yes</span>
                      </label>
                      <label className="flex items-center">
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
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaImage className="mr-2 text-mcan-primary" />
                  Accommodation Images
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <FaImage className="text-4xl text-gray-400 mb-2" />
                      <span className="text-gray-600 font-medium">Upload Images (exactly 3 required)</span>
                      <span className="text-sm text-gray-500 mt-1">Click to select files</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {images.length > 0 && (
                    <div className="flex justify-center space-x-4 mt-4">
                      {images.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-mcan-primary"
                          />
                          <span className="absolute -top-2 -right-2 bg-mcan-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white rounded-md hover:opacity-90 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Accommodation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
