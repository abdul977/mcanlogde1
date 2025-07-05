import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaArrowLeft, FaShare, FaUsers } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const EventDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch event details
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/events/get-event/${slug}`
      );

      if (data?.success) {
        setEvent(data.event);
      } else {
        setError("Event not found");
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError("Failed to load event details");
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchEventDetails();
    }
  }, [slug]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The event you're looking for doesn't exist."}</p>
          <Link
            to="/events"
            className="bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-mcan-primary to-mcan-secondary">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap justify-center items-center space-x-6 text-lg">
              <div className="flex items-center">
                <FaCalendar className="mr-2" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2" />
                <span>{formatTime(event.date)}</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-mcan-primary hover:text-mcan-secondary transition duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <button
            onClick={handleShare}
            className="flex items-center bg-mcan-primary text-white px-4 py-2 rounded-md hover:bg-mcan-secondary transition duration-300"
          >
            <FaShare className="mr-2" />
            Share Event
          </button>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">About This Event</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Event Info Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaCalendar className="mr-3 mt-1 text-mcan-primary" />
                    <div>
                      <p className="font-medium text-gray-800">Date</p>
                      <p className="text-gray-600">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaClock className="mr-3 mt-1 text-mcan-primary" />
                    <div>
                      <p className="font-medium text-gray-800">Time</p>
                      <p className="text-gray-600">{formatTime(event.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="mr-3 mt-1 text-mcan-primary" />
                    <div>
                      <p className="font-medium text-gray-800">Location</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaUsers className="mr-3 mt-1 text-mcan-primary" />
                    <div>
                      <p className="font-medium text-gray-800">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status === 'published' ? 'Open for Registration' : 'Coming Soon'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Button */}
              <div className="bg-mcan-primary rounded-lg p-6 text-white text-center">
                <h3 className="text-lg font-semibold mb-2">Interested in Attending?</h3>
                <p className="text-sm mb-4 opacity-90">
                  Contact MCAN organizers for registration details
                </p>
                <Link
                  to="/contact"
                  className="block w-full bg-white text-mcan-primary py-3 rounded-md font-medium hover:bg-gray-100 transition duration-300"
                >
                  Contact Organizers
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">More Events</h2>
          <div className="text-center">
            <Link
              to="/events"
              className="bg-mcan-primary text-white px-8 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              View All Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
