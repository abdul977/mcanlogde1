import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import { FaPlus, FaBars, FaTimes } from "react-icons/fa";

const ContributePost = () => {
  const [auth] = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("image", formData.image);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/contribute/contribute-post`,
        data,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
      setFormData({ title: "", description: "", category: "", image: null });
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting contribution:", error);
      setMessage("Error submitting contribution. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/category/get-category`
      );
      setCategory(response.data.category);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-mcan-primary">Contribute Post</h2>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="text-mcan-primary hover:text-mcan-secondary transition-colors"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Mobile Sidebar */}
        <div className={`fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Navbar onItemClick={closeMobileMenu} />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block ml-[4rem]">
          <Navbar />
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={closeMobileMenu}
          ></div>
        )}

        <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl mx-auto p-4 lg:p-8 rounded-lg bg-white shadow-lg"
          >
        <h2 className="text-2xl lg:text-3xl font-semibold text-blue-600 mb-6 text-center">
          Create a Contribution
        </h2>
        {message && (
          <div
            className={`text-center p-3 mb-4 rounded ${
              message.includes("Error")
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {message}
          </div>
        )}
        <div className="mb-6">
          <label className="block font-medium mb-2" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Enter title"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Enter description"
            rows="4"
            required
          ></textarea>
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-2" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {category.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="image"
          >
            Upload Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleFileChange}
            className="w-full text-gray-700"
            required
          />
          {imagePreview && (
            <div className="mt-4">
              <p className="text-gray-600 mb-2">Image Preview:</p>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-lg shadow"
              />
            </div>
          )}
        </div>
            <button
              type="submit"
              className={`w-full flex items-center justify-center py-3 px-4 text-white font-bold rounded-lg shadow-lg bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                loading && "opacity-70 cursor-not-allowed"
              }`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
              {!loading && <FaPlus className="ml-2" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContributePost;
