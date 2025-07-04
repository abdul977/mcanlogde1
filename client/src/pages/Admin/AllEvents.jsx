import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaCalendar } from "react-icons/fa";
import { useAuth } from "../../context/UserContext";
import FilterSidebar from "../../components/Serach/FilterSidebar";

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

      const { data } = await axios.get(`/api/events/get-all-events?${queryParams}`, {
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
    try {
      const { data } = await axios.delete(`/api/events/delete-event/${id}`, {
        headers: {
          Authorization: auth?.token
        }
      });
      if (data?.success) {
        toast.success("Event deleted successfully", { position: "bottom-left" });
        getAllEvents(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting event", { position: "bottom-left" });
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

  if (loading) {
    return (
    <div className="flex flex-grow">
      <FilterSidebar applyFilters={handleApplyFilters} />
      <div className="flex-grow p-8">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
      </div>
    </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Events</h2>
        <Link
          to="/admin/create-event"
          className="bg-mcan-primary text-white px-4 py-2 rounded-md hover:bg-mcan-secondary transition-colors duration-300"
        >
          Create New Event
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <Link
                      to={`/admin/edit-event/${event._id}`}
                      className="text-mcan-primary hover:text-mcan-secondary"
                    >
                      <FaEdit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="text-red-600 hover:text-red-900"
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
    </div>
  );
};

export default AllEvents;
