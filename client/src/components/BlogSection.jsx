import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendar, FaUser, FaClock, FaArrowRight, FaPen, FaStar } from "react-icons/fa";
import axios from "axios";

const BlogSection = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured blogs
  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/featured-blogs?limit=3`
      );

      if (response.data.success) {
        setFeaturedBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error("Error fetching featured blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading featured articles...</p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredBlogs.length === 0) {
    return null; // Don't render section if no featured blogs
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FaPen className="text-mcan-primary text-2xl mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Latest from MCAN Blog
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with our latest insights, Islamic guidance, and community updates
          </p>
        </div>

        {/* Featured Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredBlogs.map((blog, index) => (
            <article 
              key={blog._id} 
              className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300 ${
                index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className={`w-full object-cover ${
                    index === 0 ? 'h-64' : 'h-48'
                  }`}
                />
                <div className="absolute top-4 left-4 flex space-x-2">
                  <span className="bg-mcan-primary text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {blog.category}
                  </span>
                  {blog.featured && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <FaStar className="mr-1" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {/* Meta Information */}
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <FaCalendar className="mr-2" />
                  <span>{formatDate(blog.publishDate)}</span>
                  <span className="mx-2">•</span>
                  <FaClock className="mr-2" />
                  <span>{blog.readTime} min read</span>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-gray-800 mb-3 line-clamp-2 ${
                  index === 0 ? 'text-xl' : 'text-lg'
                }`}>
                  {blog.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUser className="mr-2" />
                    <span>{blog.author}</span>
                  </div>
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="text-mcan-primary hover:text-mcan-secondary font-medium transition duration-300 flex items-center"
                  >
                    Read More
                    <FaArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Explore More Islamic Insights
            </h3>
            <p className="text-gray-600 mb-6">
              Discover a wealth of knowledge, guidance, and community stories in our comprehensive blog collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/blog"
                className="bg-mcan-primary text-white px-8 py-3 rounded-md hover:bg-mcan-secondary transition duration-300 flex items-center justify-center"
              >
                <FaPen className="mr-2" />
                View All Articles
              </Link>
              <Link
                to="/blog?category=islamic"
                className="border-2 border-mcan-primary text-mcan-primary px-8 py-3 rounded-md hover:bg-mcan-primary hover:text-white transition duration-300 flex items-center justify-center"
              >
                Islamic Guidance
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 bg-gradient-to-r from-mcan-primary to-mcan-secondary rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-lg mb-6 opacity-90">
            Get notified when we publish new articles and insights
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-mcan-primary rounded-r-md hover:bg-gray-100 transition duration-300 font-medium">
              Subscribe
            </button>
          </div>
          <p className="text-sm mt-3 opacity-75">
            Join our community of Muslim corps members staying connected through knowledge
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
