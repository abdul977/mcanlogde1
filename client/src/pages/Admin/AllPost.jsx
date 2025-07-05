import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaHome, FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaSearch, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from "../../context/UserContext";

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
            Authorization: auth?.token,
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

  // Delete post
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this accommodation?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/post/delete-post/${id}`,
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
                  <FaHome className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Accommodations</h1>
                  <p className="text-gray-600">View and manage all accommodation listings</p>
                </div>
              </div>
              <Link
                to="/admin/add-accommodation"
                className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-300 flex items-center space-x-2"
              >
                <FaPlus className="text-sm" />
                <span>Add New Accommodation</span>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <FaFilter className="text-mcan-primary" />
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accommodations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                />
              </div>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
              >
                <option value="">All Genders</option>
                <option value="brothers">Brothers Only</option>
                <option value="sisters">Sisters Only</option>
                <option value="family">Family</option>
              </select>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
              >
                <option value="">All Status</option>
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterGender("");
                  setFilterAvailability("");
                }}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading accommodations...</span>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <FaHome className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {posts.length === 0 ? "No accommodations found" : "No accommodations match your filters"}
              </h3>
              <p className="text-gray-600 mb-4">
                {posts.length === 0
                  ? "Get started by creating your first accommodation listing."
                  : "Try adjusting your search criteria or clear the filters."
                }
              </p>
              {posts.length === 0 && (
                <Link
                  to="/admin/add-accommodation"
                  className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-300 inline-flex items-center space-x-2"
                >
                  <FaPlus className="text-sm" />
                  <span>Add Accommodation</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48">
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Accommodation';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        post.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {post.isAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-mcan-primary text-white">
                        {post.genderRestriction === 'brothers' ? 'Brothers' :
                         post.genderRestriction === 'sisters' ? 'Sisters' :
                         post.genderRestriction === 'family' ? 'Family' : 'Any'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaMapMarkerAlt className="mr-2 text-mcan-primary" />
                      <span className="text-sm">{post.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <FaUsers className="mr-2 text-mcan-secondary" />
                      <span className="text-sm">Up to {post.guest} guests</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-mcan-primary">
                        ₦{post.price?.toLocaleString()}
                        <span className="text-sm font-normal text-gray-600">/month</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => window.open(`/accommodation/${post.slug}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View Accommodation"
                      >
                        <FaEye className="text-lg" />
                      </button>
                      <Link
                        to={`/admin/edit/${post.slug}`}
                        className="text-mcan-primary hover:text-mcan-secondary transition-colors duration-200"
                        title="Edit Accommodation"
                      >
                        <FaEdit className="text-lg" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Delete Accommodation"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPost;
