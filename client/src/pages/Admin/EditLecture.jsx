import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaChalkboardTeacher, FaSave, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const EditLecture = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "regular",
    status: "draft",
    language: "english",
    registrationRequired: false,
    maxAttendees: 100
  });
  
  const [speaker, setSpeaker] = useState({
    name: "",
    title: "",
    bio: ""
  });
  
  const [schedule, setSchedule] = useState({
    frequency: "once",
    dayOfWeek: "",
    time: "",
    duration: 60
  });
  
  const [venue, setVenue] = useState({
    name: "",
    address: "",
    capacity: 100,
    isOnline: false
  });
  
  const [topics, setTopics] = useState([""]);
  const [prerequisites, setPrerequisites] = useState([""]);
  const [learningOutcomes, setLearningOutcomes] = useState([""]);
  const [tags, setTags] = useState([""]);
  const [lectureImage, setLectureImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  // Fetch lecture data
  useEffect(() => {
    fetchLecture();
  }, [id]);

  const fetchLecture = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/lectures/admin/get-lecture-by-id/${id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        const lecture = data.lecture;
        setFormData({
          title: lecture.title || "",
          description: lecture.description || "",
          type: lecture.type || "regular",
          status: lecture.status || "draft",
          language: lecture.language || "english",
          registrationRequired: lecture.registrationRequired || false,
          maxAttendees: lecture.maxAttendees || 100
        });
        
        setSpeaker({
          name: lecture.speaker?.name || "",
          title: lecture.speaker?.title || "",
          bio: lecture.speaker?.bio || ""
        });
        
        setSchedule({
          frequency: lecture.schedule?.frequency || "once",
          dayOfWeek: lecture.schedule?.dayOfWeek || "",
          time: lecture.schedule?.time || "",
          duration: lecture.schedule?.duration || 60
        });
        
        setVenue({
          name: lecture.venue?.name || "",
          address: lecture.venue?.address || "",
          capacity: lecture.venue?.capacity || 100,
          isOnline: lecture.venue?.isOnline || false
        });
        
        setTopics(lecture.topics && lecture.topics.length > 0 ? lecture.topics : [""]);
        setPrerequisites(lecture.prerequisites && lecture.prerequisites.length > 0 ? lecture.prerequisites : [""]);
        setLearningOutcomes(lecture.learningOutcomes && lecture.learningOutcomes.length > 0 ? lecture.learningOutcomes : [""]);
        setTags(lecture.tags && lecture.tags.length > 0 ? lecture.tags : [""]);
        setCurrentImage(lecture.image || "");
      } else {
        toast.error(data?.message || "Error fetching lecture");
        navigate("/admin/lectures");
      }
    } catch (error) {
      console.error("Error fetching lecture:", error);
      toast.error("Failed to fetch lecture details");
      navigate("/admin/lectures");
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

  const handleNestedChange = (setter, field, value) => {
    setter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array fields
  const addArrayItem = (setter) => {
    setter(prev => [...prev, ""]);
  };

  const updateArrayItem = (index, value, setter) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeArrayItem = (index, setter) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLectureImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !speaker.name) {
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
      
      // Add speaker data
      submitData.append('speaker', JSON.stringify(speaker));
      
      // Add schedule data
      submitData.append('schedule', JSON.stringify(schedule));
      
      // Add venue data
      submitData.append('venue', JSON.stringify(venue));
      
      // Add array data (filter out empty strings)
      submitData.append('topics', JSON.stringify(topics.filter(t => t.trim() !== "")));
      submitData.append('prerequisites', JSON.stringify(prerequisites.filter(p => p.trim() !== "")));
      submitData.append('learningOutcomes', JSON.stringify(learningOutcomes.filter(l => l.trim() !== "")));
      submitData.append('tags', JSON.stringify(tags.filter(t => t.trim() !== "")));
      
      // Add image if selected
      if (lectureImage) {
        submitData.append('image', lectureImage);
      }

      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/lectures/admin/update-lecture/${id}`,
        submitData,
        {
          headers: {
            Authorization: auth?.token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Lecture updated successfully!");
        navigate("/admin/lectures");
      } else {
        toast.error(data?.message || "Error updating lecture");
      }
    } catch (error) {
      console.error("Error updating lecture:", error);
      toast.error("Failed to update lecture. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5">
        <div className="flex">
          <div className="ml-[4rem]">
            <Navbar />
          </div>
          <div className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading lecture details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5">
      <div className="flex">
        <div className="ml-[4rem]">
          <Navbar />
        </div>
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-3 rounded-lg">
                  <FaChalkboardTeacher className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Edit Lecture</h1>
                  <p className="text-gray-600">Update lecture information</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/admin/lectures")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300"
              >
                <FaArrowLeft />
                Back to Lectures
              </button>
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
                    <option value="regular">Regular</option>
                    <option value="special">Special</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="conference">Conference</option>
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
                  disabled={submitting}
                  className="flex items-center px-6 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300 disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {submitting ? "Updating..." : "Update Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLecture;
