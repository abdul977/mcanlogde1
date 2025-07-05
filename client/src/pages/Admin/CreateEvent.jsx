import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import { FaCalendarAlt, FaMapMarkerAlt, FaImage, FaUsers } from "react-icons/fa";
import Navbar from "./Navbar";

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
                <FaCalendarAlt className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
                <p className="text-gray-600">Add a new event for MCAN community</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUsers className="mr-2 text-mcan-primary" />
                  Event Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 40th Annual Convention of MCAN"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date & Time *
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mcan-primary" />
                      <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mcan-primary" />
                      <input
                        type="text"
                        placeholder="e.g., NYSC Orientation Camp, Kubwa"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Description *
                    </label>
                    <textarea
                      placeholder="Describe the event, its purpose, schedule, and what participants can expect..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                    >
                      <option value="draft">Draft (Not visible to public)</option>
                      <option value="published">Published (Visible to public)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaImage className="mr-2 text-mcan-primary" />
                  Event Image
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <FaImage className="text-4xl text-gray-400 mb-2" />
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
                      <p className="text-sm text-green-600">✓ {image.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/admin/events")}
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
                    'Create Event'
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

export default CreateEvent;
