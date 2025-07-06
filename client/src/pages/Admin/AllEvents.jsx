import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaCalendar, FaPlus, FaMapMarkerAlt, FaEye, FaClock, FaUsers } from "react-icons/fa";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

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
          Authorization: `Bearer ${auth?.token}`
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

  // Handle actions
  const handleView = (event) => {
    window.open(`/events/${event.slug}`, '_blank');
  };

  const handleEdit = (event) => {
    window.open(`/admin/edit-event/${event._id}`, '_self');
  };

  // Delete event
  const handleDelete = async (event) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const { data } = await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/events/delete-event/${event._id}`, {
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

  // Define columns for table view
  const columns = [
    {
      key: 'title',
      header: 'Event Title',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'eventDate',
      header: 'Date & Time',
      render: (value) => (
        <div className="flex items-center">
          <FaClock className="mr-1 text-mcan-primary" />
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (value) => (
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-1 text-mcan-secondary" />
          {value}
        </div>
      )
    },
    {
      key: 'maxAttendees',
      header: 'Capacity',
      render: (value) => (
        <div className="flex items-center">
          <FaUsers className="mr-1 text-gray-500" />
          {value || 'Unlimited'}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  // Custom card component for events
  const EventCard = ({ item, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={item.image || 'https://via.placeholder.com/400x200?text=Event'}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=Event';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center text-gray-600 mb-2">
          <FaClock className="mr-2 text-mcan-primary" />
          <span className="text-sm">{formatDate(item.eventDate)}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-4">
          <FaMapMarkerAlt className="mr-2 text-mcan-secondary" />
          <span className="text-sm">{item.location}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {item.description}
        </p>
        {item.maxAttendees && (
          <div className="flex items-center text-gray-600 mb-4">
            <FaUsers className="mr-2 text-gray-500" />
            <span className="text-sm">Max {item.maxAttendees} attendees</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
        <div className="flex space-x-3">
          <MobileButton
            onClick={() => onView(item)}
            variant="ghost"
            size="sm"
            icon={FaEye}
            className="text-blue-600 hover:text-blue-900"
            title="View Event"
          />
          <MobileButton
            onClick={() => onEdit(item)}
            variant="ghost"
            size="sm"
            icon={FaEdit}
            className="text-mcan-primary hover:text-mcan-secondary"
            title="Edit Event"
          />
          <MobileButton
            onClick={() => onDelete(item)}
            variant="ghost"
            size="sm"
            icon={FaTrash}
            className="text-red-600 hover:text-red-900"
            title="Delete Event"
          />
        </div>
      </div>
    </div>
  );

  return (
    <MobileLayout
      title="Events"
      subtitle="Manage events"
      icon={FaCalendar}
      navbar={Navbar}
      headerActions={
        <Link to="/admin/create-event">
          <MobileButton
            variant="primary"
            size="sm"
            icon={FaPlus}
          >
            Add
          </MobileButton>
        </Link>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Manage Events"
          subtitle="View and manage all MCAN events"
          icon={FaCalendar}
          showOnMobile={false}
          actions={
            <Link to="/admin/create-event">
              <MobileButton
                variant="primary"
                icon={FaPlus}
              >
                Create New Event
              </MobileButton>
            </Link>
          }
        />

        {/* Data Display */}
        <ResponsiveDataDisplay
          data={events}
          columns={columns}
          loading={loading}
          emptyMessage="Get started by creating your first event."
          emptyIcon={FaCalendar}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cardComponent={EventCard}
          showViewToggle={true}
        />
      </div>
    </MobileLayout>
  );
};

export default AllEvents;
