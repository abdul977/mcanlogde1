import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUsers, FaImage, FaPlus, FaMinus, FaSave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const CreateCommunity = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "initiative",
    category: "general",
    status: "draft",
    featured: false,
    priority: "medium"
  });
  
  const [content, setContent] = useState({
    fullText: "",
    excerpt: "",
    highlights: [""],
    achievements: []
  });
  
  const [participants, setParticipants] = useState({
    featured: [],
    totalCount: 0,
    demographics: {
      ageGroups: { youth: 0, adults: 0, seniors: 0 },
      gender: { male: 0, female: 0 }
    }
  });
  
  const [timeline, setTimeline] = useState({
    startDate: "",
    endDate: "",
    milestones: []
  });
  
  const [location, setLocation] = useState({
    venue: "",
    address: "",
    city: "Enugu",
    state: "Enugu State"
  });
  
  const [impact, setImpact] = useState({
    beneficiaries: 0,
    metrics: [],
    outcomes: [""],
    feedback: {
      positive: 0,
      neutral: 0,
      negative: 0,
      averageRating: 0
    }
  });
  
  const [tags, setTags] = useState([""]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Types
  const types = [
    { value: "initiative", label: "Initiative" },
    { value: "testimonial", label: "Testimonial" },
    { value: "story", label: "Story" },
    { value: "achievement", label: "Achievement" },
    { value: "event", label: "Event" },
    { value: "project", label: "Project" },
    { value: "announcement", label: "Announcement" }
  ];

  // Categories
  const categories = [
    { value: "general", label: "General" },
    { value: "education", label: "Education" },
    { value: "welfare", label: "Welfare" },
    { value: "spiritual", label: "Spiritual" },
    { value: "social", label: "Social" },
    { value: "charity", label: "Charity" },
    { value: "youth", label: "Youth" },
    { value: "women", label: "Women" }
  ];

  // Priority levels
  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
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

  // Handle array inputs
  const handleArrayChange = (index, value, setter, array, field) => {
    if (field) {
      const newArray = [...array];
      newArray[index] = value;
      setter(prev => ({
        ...prev,
        [field]: newArray
      }));
    } else {
      // For simple arrays like tags
      const newArray = [...array];
      newArray[index] = value;
      setter(newArray);
    }
  };

  const addArrayItem = (setter, field, defaultValue = "") => {
    if (field) {
      setter(prev => ({
        ...prev,
        [field]: [...prev[field], defaultValue]
      }));
    } else {
      // For simple arrays like tags
      setter(prev => [...prev, defaultValue]);
    }
  };

  const removeArrayItem = (index, setter, field) => {
    if (field) {
      setter(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      // For simple arrays like tags
      setter(prev => prev.filter((_, i) => i !== index));
    }
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

  // Add featured participant
  const addFeaturedParticipant = () => {
    setParticipants(prev => ({
      ...prev,
      featured: [...prev.featured, {
        name: "",
        role: "",
        bio: "",
        testimonial: "",
        rating: 5
      }]
    }));
  };

  // Remove featured participant
  const removeFeaturedParticipant = (index) => {
    setParticipants(prev => ({
      ...prev,
      featured: prev.featured.filter((_, i) => i !== index)
    }));
  };

  // Handle participant change
  const handleParticipantChange = (index, field, value) => {
    setParticipants(prev => ({
      ...prev,
      featured: prev.featured.map((participant, i) => 
        i === index ? { ...participant, [field]: value } : participant
      )
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
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
      
      // Add content data
      submitData.append('content', JSON.stringify({
        ...content,
        highlights: content.highlights.filter(h => h.trim() !== "")
      }));
      
      // Add participants data
      submitData.append('participants', JSON.stringify(participants));
      
      // Add timeline data
      submitData.append('timeline', JSON.stringify(timeline));
      
      // Add location data
      submitData.append('location', JSON.stringify(location));
      
      // Add impact data
      submitData.append('impact', JSON.stringify({
        ...impact,
        outcomes: impact.outcomes.filter(o => o.trim() !== "")
      }));
      
      // Add tags
      submitData.append('tags', JSON.stringify(tags.filter(t => t.trim() !== "")));
      
      // Add images
      images.forEach((image, index) => {
        submitData.append(`image${index}`, image);
        submitData.append(`image${index}_caption`, ""); // You can add caption input if needed
      });

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/community/admin/create-community`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Community item created successfully!");
        navigate("/admin/community");
      } else {
        toast.error(data?.message || "Error creating community item");
      }
    } catch (error) {
      console.error("Error creating community item:", error);
      toast.error("Failed to create community item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      title="Create Community"
      subtitle="Setup new community"
      icon={FaUsers}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <ResponsiveForm
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Create Community"
        >
          <FormSection
            title="Basic Information"
            icon={FaUsers}
          >
            <FormField label="Community Title *" required>
              <MobileInput
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Community title"
                required
              />
            </FormField>
          </FormSection>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateCommunity;
