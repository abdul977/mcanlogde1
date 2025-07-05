import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaQuran, FaImage, FaPlus, FaMinus, FaSave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const CreateQuranClass = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    program: "memorization",
    level: "beginner",
    status: "draft",
    language: "english",
    maxStudents: 20,
    duration: 60,
    isOnline: false
  });
  
  const [instructor, setInstructor] = useState({
    name: "",
    title: "",
    bio: "",
    qualifications: [""],
    experience: ""
  });
  
  const [schedule, setSchedule] = useState({
    days: [""],
    time: "",
    duration: 60,
    timezone: "WAT"
  });
  
  const [venue, setVenue] = useState({
    name: "",
    address: "",
    city: "Enugu",
    isOnline: false,
    onlineLink: ""
  });
  
  const [curriculum, setCurriculum] = useState({
    objectives: [""],
    topics: [""],
    materials: [""]
  });
  
  const [fees, setFees] = useState({
    amount: 0,
    currency: "NGN",
    paymentSchedule: "monthly",
    scholarshipAvailable: false
  });
  
  const [classImage, setClassImage] = useState(null);
  const [instructorImage, setInstructorImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [instructorImagePreview, setInstructorImagePreview] = useState(null);

  // Program types
  const programs = [
    { value: "memorization", label: "Quran Memorization (Hifz)" },
    { value: "tajweed", label: "Tajweed & Recitation" },
    { value: "tafseer", label: "Tafseer & Understanding" },
    { value: "arabic", label: "Arabic Language" },
    { value: "general", label: "General Quran Studies" }
  ];

  // Levels
  const levels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "all", label: "All Levels" }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  // Handle nested object changes
  const handleNestedChange = (setter, field, value) => {
    setter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array inputs
  const handleArrayChange = (index, value, setter, array) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(prev => ({
      ...prev,
      [Object.keys(prev).find(key => prev[key] === array)]: newArray
    }));
  };

  const addArrayItem = (setter, field) => {
    setter(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayItem = (index, setter, field) => {
    setter(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Handle image upload
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'class') {
        setClassImage(file);
        setImagePreview(URL.createObjectURL(file));
      } else if (type === 'instructor') {
        setInstructorImage(file);
        setInstructorImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !instructor.name) {
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
      
      // Add instructor data
      submitData.append('instructor', JSON.stringify({
        ...instructor,
        qualifications: instructor.qualifications.filter(q => q.trim() !== "")
      }));
      
      // Add schedule data
      submitData.append('schedule', JSON.stringify({
        ...schedule,
        days: schedule.days.filter(d => d.trim() !== "")
      }));
      
      // Add venue data
      submitData.append('venue', JSON.stringify(venue));
      
      // Add curriculum data
      submitData.append('curriculum', JSON.stringify({
        objectives: curriculum.objectives.filter(o => o.trim() !== ""),
        topics: curriculum.topics.filter(t => t.trim() !== ""),
        materials: curriculum.materials.filter(m => m.trim() !== "")
      }));
      
      // Add fees data
      submitData.append('fees', JSON.stringify(fees));
      
      // Add images
      if (classImage) {
        submitData.append('image', classImage);
      }
      if (instructorImage) {
        submitData.append('instructorImage', instructorImage);
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/quran-classes/admin/create-class`,
        submitData,
        {
          headers: {
            Authorization: auth?.token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Quran class created successfully!");
        navigate("/admin/quran-classes");
      } else {
        toast.error(data?.message || "Error creating Quran class");
      }
    } catch (error) {
      console.error("Error creating Quran class:", error);
      toast.error("Failed to create Quran class. Please try again.");
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
                <FaQuran className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create New Quran Class</h1>
                <p className="text-gray-600">Add a new Quran class to the MCAN system</p>
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
                    Class Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    placeholder="Enter class title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program
                  </label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  >
                    {programs.map(program => (
                      <option key={program.value} value={program.value}>
                        {program.label}
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
                  placeholder="Enter class description"
                />
              </div>

              {/* Instructor Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Instructor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor Name *
                    </label>
                    <input
                      type="text"
                      value={instructor.name}
                      onChange={(e) => handleNestedChange(setInstructor, 'name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="Enter instructor name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor Title
                    </label>
                    <input
                      type="text"
                      value={instructor.title}
                      onChange={(e) => handleNestedChange(setInstructor, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="e.g., Ustadh, Qari, Sheikh"
                    />
                  </div>
                </div>
              </div>

              {/* Class Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    >
                      {levels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Students
                    </label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={formData.maxStudents}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/admin/quran-classes")}
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
                  {loading ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuranClass;
