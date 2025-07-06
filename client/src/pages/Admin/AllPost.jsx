import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaHome, FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaSearch, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from "../../context/UserContext";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const AllPost = () => {
  const [auth] = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const navigate = useNavigate();

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/post/get-all-post`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setPosts(response.data.posts);
      setFilteredPosts(response.data.posts);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch accommodations");
    } finally {
      setLoading(false);
    }
  };

  // Handle actions
  const handleView = (post) => {
    window.open(`/accommodation/${post.slug}`, '_blank');
  };

  const handleEdit = (post) => {
    navigate(`/admin/edit/${post.slug}`);
  };

  // Delete post
  const handleDelete = async (post) => {
    if (!window.confirm("Are you sure you want to delete this accommodation?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/post/delete-post/${post._id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (response.data.success) {
        toast.success("Accommodation deleted successfully");
        fetchPosts(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete accommodation");
    }
  };

  // Filter posts based on search and filters
  useEffect(() => {
    let filtered = posts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Gender filter
    if (filterGender) {
      filtered = filtered.filter(post => post.genderRestriction === filterGender);
    }

    // Availability filter
    if (filterAvailability !== "") {
      filtered = filtered.filter(post => post.isAvailable.toString() === filterAvailability);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, filterGender, filterAvailability]);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Define columns for table view
  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'location',
      header: 'Location',
      render: (value) => (
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-1 text-mcan-primary" />
          {value}
        </div>
      )
    },
    {
      key: 'guest',
      header: 'Guests',
      render: (value) => (
        <div className="flex items-center">
          <FaUsers className="mr-1 text-mcan-secondary" />
          {value}
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (value) => `₦${value?.toLocaleString()}/month`
    },
    {
      key: 'isAvailable',
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Available' : 'Not Available'}
        </span>
      )
    }
  ];

  // Custom card component for accommodations
  const AccommodationCard = ({ item, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=Accommodation';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {item.isAvailable ? 'Available' : 'Not Available'}
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-mcan-primary text-white">
            {item.genderRestriction === 'brothers' ? 'Brothers' :
             item.genderRestriction === 'sisters' ? 'Sisters' :
             item.genderRestriction === 'family' ? 'Family' : 'Any'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center text-gray-600 mb-2">
          <FaMapMarkerAlt className="mr-2 text-mcan-primary" />
          <span className="text-sm">{item.location}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-4">
          <FaUsers className="mr-2 text-mcan-secondary" />
          <span className="text-sm">Up to {item.guest} guests</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-mcan-primary">
            ₦{item.price?.toLocaleString()}
            <span className="text-sm font-normal text-gray-600">/month</span>
          </span>
        </div>
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
            title="View Accommodation"
          />
          <MobileButton
            onClick={() => onEdit(item)}
            variant="ghost"
            size="sm"
            icon={FaEdit}
            className="text-mcan-primary hover:text-mcan-secondary"
            title="Edit Accommodation"
          />
          <MobileButton
            onClick={() => onDelete(item)}
            variant="ghost"
            size="sm"
            icon={FaTrash}
            className="text-red-600 hover:text-red-900"
            title="Delete Accommodation"
          />
        </div>
      </div>
    </div>
  );

  return (
    <MobileLayout
      title="Accommodations"
      subtitle="Manage listings"
      icon={FaHome}
      navbar={Navbar}
      headerActions={
        <Link to="/admin/add-accommodation">
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
          title="Manage Accommodations"
          subtitle="View and manage all accommodation listings"
          icon={FaHome}
          showOnMobile={false}
          actions={
            <Link to="/admin/add-accommodation">
              <MobileButton
                variant="primary"
                icon={FaPlus}
              >
                Add New Accommodation
              </MobileButton>
            </Link>
          }
        />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Search">
              <MobileInput
                type="text"
                placeholder="Search accommodations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FaSearch}
              />
            </FormField>

            <FormField label="Gender">
              <ResponsiveSelect
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                options={[
                  { value: 'brothers', label: 'Brothers Only' },
                  { value: 'sisters', label: 'Sisters Only' },
                  { value: 'family', label: 'Family' }
                ]}
                placeholder="All Genders"
              />
            </FormField>

            <FormField label="Availability">
              <ResponsiveSelect
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                options={[
                  { value: 'true', label: 'Available' },
                  { value: 'false', label: 'Not Available' }
                ]}
                placeholder="All Status"
              />
            </FormField>

            <FormField label="Actions">
              <MobileButton
                onClick={() => {
                  setSearchTerm("");
                  setFilterGender("");
                  setFilterAvailability("");
                }}
                variant="secondary"
                fullWidth
              >
                Clear Filters
              </MobileButton>
            </FormField>
          </div>
        </div>

        {/* Data Display */}
        <ResponsiveDataDisplay
          data={filteredPosts}
          columns={columns}
          loading={loading}
          emptyMessage={posts.length === 0 ? "Get started by creating your first accommodation listing." : "Try adjusting your search criteria or clear the filters."}
          emptyIcon={FaHome}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cardComponent={AccommodationCard}
          showViewToggle={true}
        />
      </div>
    </MobileLayout>
  );
};

export default AllPost;
