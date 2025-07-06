import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import { FaCalendarAlt, FaMapMarkerAlt, FaImage, FaUsers, FaClock, FaEdit, FaSave } from "react-icons/fa";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveTextarea, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("draft");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!title || !description || !date || !location || !image) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("status", status);
      formData.append("image", image);

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/events/create-event`,
        formData,
        {
          headers: {
            Authorization: auth?.token,
            "Content-Type": "multipart/form-data",
          }
        }
      );

      if (data?.success) {
        toast.success("Event created successfully!");
        navigate("/admin/events");
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error creating event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      title="Create Event"
      subtitle="Event management"
      icon={FaCalendarAlt}
      navbar={Navbar}
      headerActions={
        <MobileButton
          onClick={() => navigate('/admin/all-events')}
          variant="secondary"
          size="sm"
          icon={FaUsers}
        >
          View Events
        </MobileButton>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Create New Event"
          subtitle="Add a new event for MCAN community"
          icon={FaCalendarAlt}
          showOnMobile={false}
        />

        {/* Form */}
        <ResponsiveForm
          title="Create New Event"
          subtitle="Fill in the details below to create a new event"
          onSubmit={handleSubmit}
        >
          {/* Basic Information Section */}
          <FormSection
            title="Event Information"
            icon={FaEdit}
            columns={2}
          >
            <FormField label="Event Title" required fullWidth>
              <MobileInput
                type="text"
                placeholder="e.g., 40th Annual Convention of MCAN"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                icon={FaEdit}
                required
              />
            </FormField>

            <FormField label="Event Date & Time" required>
              <MobileInput
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                icon={FaCalendarAlt}
                required
              />
            </FormField>

            <FormField label="Location" required>
              <MobileInput
                type="text"
                placeholder="e.g., NYSC Orientation Camp, Kubwa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                icon={FaMapMarkerAlt}
                required
              />
            </FormField>

            <FormField label="Event Description" required fullWidth>
              <ResponsiveTextarea
                placeholder="Describe the event, its purpose, schedule, and what participants can expect..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </FormField>

            <FormField label="Publication Status">
              <ResponsiveSelect
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'draft', label: 'Draft (Not visible to public)' },
                  { value: 'published', label: 'Published (Visible to public)' }
                ]}
                placeholder="Select status"
              />
            </FormField>
          </FormSection>

          {/* Image Upload Section */}
          <FormSection
            title="Event Image"
            icon={FaImage}
            columns={1}
          >
            <FormField label="Upload Event Image" required fullWidth>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 lg:p-6 text-center hover:border-mcan-primary transition-colors">
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <FaImage className="text-3xl lg:text-4xl text-gray-400 mb-2" />
                    <span className="text-gray-600 font-medium">Upload Event Image</span>
                    <span className="text-sm text-gray-500 mt-1">Click to select file</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                    required
                  />
                </label>
                {image && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 flex items-center justify-center">
                      <span className="mr-2">✓</span>
                      {image.name}
                    </p>
                  </div>
                )}
              </div>
            </FormField>
          </FormSection>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <MobileButton
              type="button"
              onClick={() => navigate("/admin/all-events")}
              variant="secondary"
              size="lg"
            >
              Cancel
            </MobileButton>

            <MobileButton
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              icon={loading ? null : FaSave}
              className={loading ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </MobileButton>
          </div>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateEvent;
