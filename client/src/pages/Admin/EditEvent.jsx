import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    getEvent();
  }, [id]);

  // Get event details
  const getEvent = async () => {
    try {
      const { data } = await axios.get(`/api/events/get-event-by-id/${id}`);
      if (data?.success) {
        const event = data.event;
        setTitle(event.title);
        setDescription(event.description);
        setDate(new Date(event.date).toISOString().slice(0, 16)); // Format for datetime-local input
        setLocation(event.location);
        setStatus(event.status);
        setCurrentImage(event.image);
        toast.success("Event details loaded", { position: "bottom-left" });
      }
    } catch (error) {
      toast.error("Error fetching event details", { position: "bottom-left" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("status", status);
      if (image) {
        formData.append("image", image);
      }

      const { data } = await axios.put(`/api/events/update-event/${id}`, formData);
      
      if (data?.success) {
        toast.success("Event updated successfully", { position: "bottom-left" });
        navigate("/admin/events");
      } else {
        toast.error(data?.message || "Something went wrong", { position: "bottom-left" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error in updating event", { position: "bottom-left" });
    }
  };

  if (loading) {
    return (
      <div className="flex-grow p-8">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-8">
      <h2 className="text-2xl font-bold mb-6">Edit Event</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Image
          </label>
          <img
            src={currentImage}
            alt="Current event"
            className="w-32 h-32 object-cover rounded-md mb-2"
          />
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Change Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-mcan-primary text-white px-6 py-2 rounded-md hover:bg-mcan-secondary transition-colors duration-300"
        >
          Update Event
        </button>
      </form>
    </div>
  );
};

export default EditEvent;