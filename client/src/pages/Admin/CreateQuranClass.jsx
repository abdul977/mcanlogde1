import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaQuran, FaImage, FaPlus, FaMinus, FaSave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

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
    days: ["monday"],
    time: "18:00",
    duration: 60,
    timezone: "WAT"
  });

  const [venue, setVenue] = useState({
    name: "MCAN Center",
    address: "MCAN Center, Enugu",
    city: "Enugu",
    isOnline: false,
    onlineLink: ""
  });
  
  const [curriculum, setCurriculum] = useState({
    objectives: ["Learn Quranic recitation"],
    topics: ["Introduction to Quran"],
    materials: ["Quran", "Notebook"]
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

    if (!formData.title || !formData.description || !instructor.name || !schedule.time || !venue.name) {
      toast.error("Please fill in all required fields (Title, Description, Instructor Name, Schedule Time, and Venue Name)");
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
      
      // Add schedule data with proper structure
      const scheduleData = {
        frequency: "weekly",
        daysOfWeek: schedule.days.filter(d => d.trim() !== ""),
        time: schedule.time || "18:00",
        duration: schedule.duration || 60,
        timezone: schedule.timezone || "WAT"
      };
      submitData.append('schedule', JSON.stringify(scheduleData));
      
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
      const enrollmentData = {
        isOpen: true,
        maxStudents: formData.maxStudents,
        currentStudents: 0,
        requirements: []
      };
      submitData.append('enrollment', JSON.stringify(enrollmentData));

      // Add target audience data
      const targetAudienceData = {
        ageGroup: "adults",
        gender: "mixed",
        experience: "none"
      };
      submitData.append('targetAudience', JSON.stringify(targetAudienceData));

      // Add prerequisites
      submitData.append('prerequisites', JSON.stringify([]));

      // Add tags
      submitData.append('tags', JSON.stringify([]));

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
    <MobileLayout
      title="Create Quran Class"
      subtitle="Setup new class"
      icon={FaQuran}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <ResponsiveForm
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Create Quran Class"
        >
          <FormSection
            title="Basic Information"
            icon={FaQuran}
          >
            <FormField label="Class Title *" required>
              <MobileInput
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Quran class title"
                required
              />
            </FormField>
          </FormSection>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateQuranClass;