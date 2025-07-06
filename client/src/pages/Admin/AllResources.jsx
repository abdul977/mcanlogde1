import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBook, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch, FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const AllResources = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "books", label: "Books" },
    { value: "articles", label: "Articles" },
    { value: "videos", label: "Videos" },
    { value: "audio", label: "Audio" },
    { value: "documents", label: "Documents" },
    { value: "links", label: "Links" },
    { value: "apps", label: "Apps" },
    { value: "courses", label: "Courses" }
  ];

  const types = [
    { value: "all", label: "All Types" },
    { value: "file", label: "File" },
    { value: "link", label: "Link" },
    { value: "embedded", label: "Embedded" }
  ];

  // Fetch resources from server
  const fetchResources = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/resources/admin/get-all-resources`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        setResources(data.resources || []);
        setFilteredResources(data.resources || []);
        if (showRefreshLoader) {
          toast.success("Resources refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching resources", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to fetch resources. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter resources based on search and filters
  useEffect(() => {
    let filtered = resources;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedCategory, selectedType]);

  // Load resources on component mount
  useEffect(() => {
    fetchResources();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchResources(true);
  };

  // Handle view resource
  const handleView = async (id) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/resources/admin/get-resource-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        navigate(`/admin/view-resource/${id}`);
      } else {
        toast.error(data?.message || "Error fetching resource details");
      }
    } catch (error) {
      console.error("Error fetching resource:", error);
      toast.error("Failed to fetch resource details. Please try again.");
    }
  };

  // Handle edit resource
  const handleEdit = (id) => {
    navigate(`/admin/edit-resource/${id}`);
  };

  // Handle delete resource
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const { data } = await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/api/resources/admin/delete-resource/${id}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        if (data?.success) {
          toast.success("Resource deleted successfully!");
          fetchResources();
        } else {
          toast.error(data?.message || "Error deleting resource");
        }
      } catch (error) {
        console.error("Error deleting resource:", error);
        toast.error("Failed to delete resource. Please try again.");
      }
    }
  };

  // Get category badge color
  const getCategoryBadge = (category) => {
    const colors = {
      books: "bg-blue-100 text-blue-800",
      articles: "bg-green-100 text-green-800",
      videos: "bg-red-100 text-red-800",
      audio: "bg-purple-100 text-purple-800",
      documents: "bg-yellow-100 text-yellow-800",
      links: "bg-indigo-100 text-indigo-800",
      apps: "bg-pink-100 text-pink-800",
      courses: "bg-orange-100 text-orange-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const colors = {
      file: "bg-blue-100 text-blue-800",
      link: "bg-green-100 text-green-800",
      embedded: "bg-purple-100 text-purple-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <MobileLayout
      title="Resources"
      subtitle="Manage resources"
      icon={FaBook}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <ResponsiveDataDisplay
          data={filteredResources}
          columns={[]}
          loading={loading}
          emptyMessage="Get started by creating your first resource."
          emptyIcon={FaBook}
          showViewToggle={true}
        />
      </div>
    </MobileLayout>
  );
};

export default AllResources;
               