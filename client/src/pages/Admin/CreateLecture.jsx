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

            <FormField label="Description *" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Lecture description"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent resize-none"
              />
            </FormField>

            <FormField label="Type">
              <ResponsiveSelect
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={types}
                placeholder="Select lecture type"
              />
            </FormField>

            <FormField label="Category">
              <ResponsiveSelect
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categories}
                placeholder="Select category"
              />
            </FormField>

            <FormField label="Status">
              <ResponsiveSelect
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "cancelled", label: "Cancelled" }
                ]}
                placeholder="Select status"
              />
            </FormField>

            <FormField label="Language">
              <ResponsiveSelect
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                options={[
                  { value: "english", label: "English" },
                  { value: "arabic", label: "Arabic" },
                  { value: "hausa", label: "Hausa" },
                  { value: "yoruba", label: "Yoruba" },
                  { value: "igbo", label: "Igbo" }
                ]}
                placeholder="Select language"
              />
            </FormField>
          </FormSection>

          {/* Speaker Information */}
          <FormSection
            title="Speaker Information"
            icon={FaChalkboardTeacher}
          >
            <FormField label="Speaker Name *" required>
              <MobileInput
                name="name"
                value={speaker.name}
                onChange={handleSpeakerChange}
                placeholder="Speaker full name"
                required
              />
            </FormField>

            <FormField label="Speaker Title">
              <MobileInput
                name="title"
                value={speaker.title}
                onChange={handleSpeakerChange}
                placeholder="e.g., Islamic Scholar, Professor"
              />
            </FormField>

            <FormField label="Speaker Bio">
              <textarea
                name="bio"
                value={speaker.bio}
                onChange={handleSpeakerChange}
                placeholder="Brief biography of the speaker"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent resize-none"
              />
            </FormField>

            <FormField label="Speaker Credentials">
              {speaker.credentials.map((credential, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <MobileInput
                    value={credential}
                    onChange={(e) => handleArrayChange(index, e.target.value, setSpeaker, speaker.credentials)}
                    placeholder="e.g., PhD in Islamic Studies"
                  />
                  <MobileButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(index, (newArray) => setSpeaker(prev => ({...prev, credentials: newArray})), speaker.credentials)}
                    disabled={speaker.credentials.length === 1}
                  >
                    <FaMinus />
                  </MobileButton>
                </div>
              ))}
              <MobileButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem((newArray) => setSpeaker(prev => ({...prev, credentials: newArray})), speaker.credentials)}
              >
                <FaPlus /> Add Credential
              </MobileButton>
            </FormField>

            <FormField label="Speaker Image">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'speaker')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              />
              {speakerImagePreview && (
                <div className="mt-2">
                  <img
                    src={speakerImagePreview}
                    alt="Speaker preview"
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </div>
              )}
            </FormField>
          </FormSection>

          {/* Schedule Information */}
          <FormSection
            title="Schedule Information"
            icon={FaChalkboardTeacher}
          >
            <FormField label="Date *" required>
              <MobileInput
                type="date"
                name="date"
                value={schedule.date}
                onChange={handleScheduleChange}
                required
              />
            </FormField>

            <FormField label="Start Time *" required>
              <MobileInput
                type="time"
                name="time"
                value={schedule.time}
                onChange={handleScheduleChange}
                required
              />
            </FormField>

            <FormField label="End Time">
              <MobileInput
                type="time"
                name="endTime"
                value={schedule.endTime}
                onChange={handleScheduleChange}
              />
            </FormField>

            <FormField label="Duration (minutes)">
              <MobileInput
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="60"
                min="15"
                max="480"
              />
            </FormField>

            <FormField label="Timezone">
              <ResponsiveSelect
                name="timezone"
                value={schedule.timezone}
                onChange={handleScheduleChange}
                options={[
                  { value: "WAT", label: "West Africa Time (WAT)" },
                  { value: "GMT", label: "Greenwich Mean Time (GMT)" },
                  { value: "UTC", label: "Coordinated Universal Time (UTC)" }
                ]}
                placeholder="Select timezone"
              />
            </FormField>
          </FormSection>

          {/* Venue Information */}
          <FormSection
            title="Venue Information"
            icon={FaChalkboardTeacher}
          >
            <FormField label="Venue Name *" required>
              <MobileInput
                name="name"
                value={venue.name}
                onChange={handleVenueChange}
                placeholder="e.g., MCAN Main Hall"
                required
              />
            </FormField>

            <FormField label="Address">
              <MobileInput
                name="address"
                value={venue.address}
                onChange={handleVenueChange}
                placeholder="Full address"
              />
            </FormField>

            <FormField label="City">
              <MobileInput
                name="city"
                value={venue.city}
                onChange={handleVenueChange}
                placeholder="City"
              />
            </FormField>

            <FormField label="Capacity">
              <MobileInput
                type="number"
                name="capacity"
                value={venue.capacity}
                onChange={handleVenueChange}
                placeholder="100"
                min="1"
              />
            </FormField>

            <FormField label="Facilities">
              {venue.facilities.map((facility, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <MobileInput
                    value={facility}
                    onChange={(e) => handleArrayChange(index, e.target.value, setVenue, venue.facilities)}
                    placeholder="e.g., Projector, Sound System"
                  />
                  <MobileButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(index, (newArray) => setVenue(prev => ({...prev, facilities: newArray})), venue.facilities)}
                    disabled={venue.facilities.length === 1}
                  >
                    <FaMinus />
                  </MobileButton>
                </div>
              ))}
              <MobileButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem((newArray) => setVenue(prev => ({...prev, facilities: newArray})), venue.facilities)}
              >
                <FaPlus /> Add Facility
              </MobileButton>
            </FormField>

            <FormField label="Online Event">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isOnline"
                  checked={formData.isOnline}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                This is an online event
              </label>
            </FormField>
          </FormSection>

          {/* Additional Information */}
          <FormSection
            title="Additional Information"
            icon={FaChalkboardTeacher}
          >
            <FormField label="Topics">
              {topics.map((topic, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <MobileInput
                    value={topic}
                    onChange={(e) => handleArrayChange(index, e.target.value, setTopics, topics)}
                    placeholder="e.g., Prayer, Fasting, Charity"
                  />
                  <MobileButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(index, setTopics, topics)}
                    disabled={topics.length === 1}
                  >
                    <FaMinus />
                  </MobileButton>
                </div>
              ))}
              <MobileButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem(setTopics, topics)}
              >
                <FaPlus /> Add Topic
              </MobileButton>
            </FormField>

            <FormField label="Tags">
              {tags.map((tag, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <MobileInput
                    value={tag}
                    onChange={(e) => handleArrayChange(index, e.target.value, setTags, tags)}
                    placeholder="e.g., beginner, advanced, youth"
                  />
                  <MobileButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(index, setTags, tags)}
                    disabled={tags.length === 1}
                  >
                    <FaMinus />
                  </MobileButton>
                </div>
              ))}
              <MobileButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem(setTags, tags)}
              >
                <FaPlus /> Add Tag
              </MobileButton>
            </FormField>

            <FormField label="Max Attendees">
              <MobileInput
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                placeholder="100"
                min="1"
              />
            </FormField>

            <FormField label="Registration Required">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="registrationRequired"
                  checked={formData.registrationRequired}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Require registration to attend
              </label>
            </FormField>

            <FormField label="Lecture Image">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'lecture')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Lecture preview"
                    className="w-32 h-24 object-cover rounded-md"
                  />
                </div>
              )}
            </FormField>
          </FormSection>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateLecture;
