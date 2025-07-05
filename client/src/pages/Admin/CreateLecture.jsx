import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaChalkboardTeacher, FaImage, FaPlus, FaMinus, FaSave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const CreateLecture = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "regular",
    category: "spiritual",
    status: "draft",
    language: "english",
    duration: 60,
    maxAttendees: 100,
    registrationRequired: false,
    isOnline: false
  });
  
  const [speaker, setSpeaker] = useState({
    name: "",
    title: "",
    bio: "",
    credentials: [""]
  });
  
  const [schedule, setSchedule] = useState({
    date: "",
    time: "",
    endTime: "",
    timezone: "WAT"
  });
  
  const [venue, setVenue] = useState({
    name: "",
    address: "",
    city: "Enugu",
    capacity: 100,
    facilities: [""]
  });
  
  const [topics, setTopics] = useState([""]);
  const [tags, setTags] = useState([""]);
  const [lectureImage, setLectureImage] = useState(null);
  const [speakerImage, setSpeakerImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [speakerImagePreview, setSpeakerImagePreview] = useState(null);

  // Lecture types
  const types = [
    { value: "regular", label: "Regular Lecture" },
    { value: "special", label: "Special Event" },
    { value: "workshop", label: "Workshop" },
    { value: "seminar", label: "Seminar" },
    { value: "conference", label: "Conference" }
  ];

  // Categories
  const categories = [
    { value: "spiritual", label: "Spiritual" },
    { value: "educational", label: "Educational" },
    { value: "social", label: "Social" },
    { value: "career", label: "Career Development" },
    { value: "health", label: "Health & Wellness" }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle speaker input changes
  const handleSpeakerChange = (e) => {
    const { name, value } = e.target;
    setSpeaker(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle schedule input changes
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle venue input changes
  const handleVenueChange = (e) => {
    const { name, value } = e.target;
    setVenue(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle array inputs
  const handleArrayChange = (index, value, setter, array) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const addArrayItem = (setter, array) => {
    setter([...array, ""]);
  };

  const removeArrayItem = (index, setter, array) => {
    if (array.length > 1) {
      const newArray = array.filter((_, i) => i !== index);
      setter(newArray);
    }
  };

  // Handle image upload
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'lecture') {
        setLectureImage(file);
        setImagePreview(URL.createObjectURL(file));
      } else if (type === 'speaker') {
        setSpeakerImage(file);
        setSpeakerImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !speaker.name) {
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
      
      // Add speaker data
      submitData.append('speaker', JSON.stringify({
        ...speaker,
        credentials: speaker.credentials.filter(c => c.trim() !== "")
      }));
      
      // Add schedule data
      submitData.append('schedule', JSON.stringify(schedule));
      
      // Add venue data
      submitData.append('venue', JSON.stringify({
        ...venue,
        facilities: venue.facilities.filter(f => f.trim() !== "")
      }));
      
      // Add topics and tags
      submitData.append('topics', JSON.stringify(topics.filter(t => t.trim() !== "")));
      submitData.append('tags', JSON.stringify(tags.filter(t => t.trim() !== "")));
      
      // Add images
      if (lectureImage) {
        submitData.append('image', lectureImage);
      }
      if (speakerImage) {
        submitData.append('speakerImage', speakerImage);
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/lectures/admin/create-lecture`,
        submitData,
        {
          headers: {
            Authorization: auth?.token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Lecture created successfully!");
        navigate("/admin/lectures");
      } else {
        toast.error(data?.message || "Error creating lecture");
      }
    } catch (error) {
      console.error("Error creating lecture:", error);
      toast.error("Failed to create lecture. Please try again.");
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
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-3 rounded-lg">
                <FaChalkboardTeacher className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create New Lecture</h1>
                <p className="text-gray-600">Add a new lecture to the MCAN system</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lecture Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    placeholder="Enter lecture title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  placeholder="Enter lecture description"
                />
              </div>

              {/* Speaker Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Speaker Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Speaker Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={speaker.name}
                      onChange={handleSpeakerChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="Enter speaker name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Speaker Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={speaker.title}
                      onChange={handleSpeakerChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="e.g., Dr., Ustadh, Professor"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaker Bio
                  </label>
                  <textarea
                    name="bio"
                    value={speaker.bio}
                    onChange={handleSpeakerChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    placeholder="Enter speaker biography"
                  />
                </div>

                {/* Speaker Image */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaker Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'speaker')}
                      className="hidden"
                      id="speaker-image"
                    />
                    <label
                      htmlFor="speaker-image"
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition duration-300"
                    >
                      <FaImage className="mr-2" />
                      Choose Image
                    </label>
                    {speakerImagePreview && (
                      <img
                        src={speakerImagePreview}
                        alt="Speaker preview"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/admin/lectures")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300 disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {loading ? "Creating..." : "Create Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
