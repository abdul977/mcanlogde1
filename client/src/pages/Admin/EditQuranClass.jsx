import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaQuran, FaSave, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const EditQuranClass = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
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
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

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

  // Fetch class data
  useEffect(() => {
    fetchQuranClass();
  }, [id]);

  const fetchQuranClass = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/quran-classes/admin/get-class-by-id/${id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        const quranClass = data.class;
        setFormData({
          title: quranClass.title || "",
          description: quranClass.description || "",
          program: quranClass.program || "memorization",
          level: quranClass.level || "beginner",
          status: quranClass.status || "draft",
          language: quranClass.language || "english",
          maxStudents: quranClass.enrollment?.maxStudents || 20,
          duration: quranClass.schedule?.duration || 60,
          isOnline: quranClass.venue?.isOnline || false
        });
        
        setInstructor({
          name: quranClass.instructor?.name || "",
          title: quranClass.instructor?.title || "",
          bio: quranClass.instructor?.bio || "",
          qualifications: quranClass.instructor?.qualifications && quranClass.instructor.qualifications.length > 0 ? quranClass.instructor.qualifications : [""],
          experience: quranClass.instructor?.experience || ""
        });
        
        setSchedule({
          days: quranClass.schedule?.daysOfWeek && quranClass.schedule.daysOfWeek.length > 0 ? quranClass.schedule.daysOfWeek : [""],
          time: quranClass.schedule?.time || "",
          duration: quranClass.schedule?.duration || 60,
          timezone: quranClass.schedule?.timezone || "WAT"
        });
        
        setVenue({
          name: quranClass.venue?.name || "",
          address: quranClass.venue?.address || "",
          city: quranClass.venue?.city || "Enugu",
          isOnline: quranClass.venue?.isOnline || false,
          onlineLink: quranClass.venue?.onlineLink || ""
        });
        
        setCurriculum({
          objectives: quranClass.curriculum?.objectives && quranClass.curriculum.objectives.length > 0 ? quranClass.curriculum.objectives : [""],
          topics: quranClass.curriculum?.topics && quranClass.curriculum.topics.length > 0 ? quranClass.curriculum.topics.map(t => t.title || t) : [""],
          materials: quranClass.curriculum?.materials && quranClass.curriculum.materials.length > 0 ? quranClass.curriculum.materials.map(m => m.title || m) : [""]
        });
        
        setFees({
          amount: quranClass.fees?.amount || 0,
          currency: quranClass.fees?.currency || "NGN",
          paymentSchedule: quranClass.fees?.paymentSchedule || "monthly",
          scholarshipAvailable: quranClass.fees?.scholarshipAvailable || false
        });
        
        setCurrentImage(quranClass.image || "");
      } else {
        toast.error(data?.message || "Error fetching class");
        navigate("/admin/quran-classes");
      }
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error("Failed to fetch class details");
      navigate("/admin/quran-classes");
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
  const addArrayItem = (setter, field) => {
    setter(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const updateArrayItem = (index, value, setter, field) => {
    setter(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (index, setter, field) => {
    setter(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClassImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !instructor.name) {
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
      
      // Add instructor data
      submitData.append('instructor', JSON.stringify({
        ...instructor,
        qualifications: instructor.qualifications.filter(q => q.trim() !== "")
      }));
      
      // Add schedule data
      submitData.append('schedule', JSON.stringify({
        ...schedule,
        daysOfWeek: schedule.days.filter(d => d.trim() !== "")
      }));
      
      // Add venue data
      submitData.append('venue', JSON.stringify(venue));
      
      // Add curriculum data with proper structure
      const curriculumData = {
        objectives: curriculum.objectives.filter(o => o.trim() !== ""),
        topics: curriculum.topics.filter(t => t.trim() !== "").map((title, index) => ({
          week: index + 1,
          title: title,
          description: `Week ${index + 1} content for ${title}`,
          verses: []
        })),
        materials: curriculum.materials.filter(m => m.trim() !== "").map(title => ({
          title: title,
          type: "book",
          isRequired: false
        })),
        assessments: []
      };
      submitData.append('curriculum', JSON.stringify(curriculumData));
      
      // Add fees data
      submitData.append('fees', JSON.stringify(fees));
      
      // Add enrollment data
      submitData.append('enrollment', JSON.stringify({
        maxStudents: formData.maxStudents,
        isOpen: true
      }));
      
      // Add image if selected
      if (classImage) {
        submitData.append('image', classImage);
      }

      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/quran-classes/admin/update-class/${id}`,
        submitData,
        {
          headers: {
            Authorization: auth?.token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Quran class updated successfully!");
        navigate("/admin/quran-classes");
      } else {
        toast.error(data?.message || "Error updating class");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Failed to update class. Please try again.");
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
                <p className="mt-4 text-gray-600">Loading class details...</p>
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
                  <FaQuran className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Edit Quran Class</h1>
                  <p className="text-gray-600">Update class information</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/admin/quran-classes")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300"
              >
                <FaArrowLeft />
                Back to Classes
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
                  disabled={submitting}
                  className="flex items-center px-6 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300 disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {submitting ? "Updating..." : "Update Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuranClass;
