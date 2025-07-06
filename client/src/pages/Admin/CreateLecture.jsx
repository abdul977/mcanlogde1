import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaChalkboardTeacher, FaImage, FaPlus, FaMinus, FaSave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

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
    <MobileLayout
      title="Create Lecture"
      subtitle="Schedule new lecture"
      icon={FaChalkboardTeacher}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <ResponsiveForm
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Create Lecture"
        >
          <FormSection
            title="Basic Information"
            icon={FaChalkboardTeacher}
          >
            <FormField label="Title *" required>
              <MobileInput
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Lecture title"
                required
              />
            </FormField>
          </FormSection>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateLecture;
