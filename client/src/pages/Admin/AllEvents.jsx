import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaCalendar, FaPlus, FaMapMarkerAlt, FaEye } from "react-icons/fa";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const AllEvents = () => {
  const [auth] = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    location: "",
    dateRange: null
  });

  // Fetch all events
  const getAllEvents = async (filterParams = {}) => {
    try {
      let queryParams = new URLSearchParams();
      if (filterParams.status) queryParams.append("status", filterParams.status);
      if (filterParams.location) queryParams.append("location", filterParams.location);
      if (filterParams.dateRange) {
        queryParams.append("startDate", filterParams.dateRange.start);
        queryParams.append("endDate", filterParams.dateRange.end);
      }

      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/get-all-events?${queryParams}`, {
        headers: {
          Authorization: auth?.token
        }
      });
      if (data?.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching events", { position: "bottom-left" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllEvents(filters);
  }, [filters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Delete event
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const { data } = await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/events/delete-event/${id}`, {
        headers: {
          Authorization: auth?.token
        }
      });
      if (data?.success) {
        toast.success("Event deleted successfully");
        getAllEvents(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error deleting event");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-3 rounded-lg">
                  <FaCalendar className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Events</h1>
                  <p className="text-gray-600">View and manage all MCAN events</p>
                </div>
              </div>
              <Link
                to="/admin/create-event"
                className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-300 flex items-center space-x-2"
              >
                <FaPlus className="text-sm" />
                <span>Create New Event</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading events...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {events.length === 0 ? (
                <div className="p-8 text-center">
                  <FaCalendar className="mx-auto text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first event.</p>
                  <Link
                    to="/admin/create-event"
                    className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-300 inline-flex items-center space-x-2"
                  >
                    <FaPlus className="text-sm" />
                    <span>Create Event</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-mcan-primary/10 to-mcan-secondary/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Date & Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
              <tr key={event._id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-md object-cover"
                        src={event.image}
                        alt={event.title}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.description.substring(0, 100)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {formatDate(event.date)}
                  </div>
                  <div className="text-sm text-gray-500">{event.location}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                      title="View Event"
                    >
                      <FaEye className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/admin/edit-event/${event._id}`}
                      className="text-mcan-primary hover:text-mcan-secondary transition-colors duration-200"
                      title="Edit Event"
                    >
                      <FaEdit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Delete Event"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllEvents;
