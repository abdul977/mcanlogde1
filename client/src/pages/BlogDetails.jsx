import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaCalendar, FaClock, FaUser, FaArrowLeft, FaShare, FaTags, FaEye, FaStar } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blog details
  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/get-blog/${slug}`
      );

      if (data?.success) {
        setBlog(data.blog);
        // Fetch related blogs after getting the main blog
        fetchRelatedBlogs(data.blog.category, data.blog._id);
      } else {
        setError("Blog post not found");
      }
    } catch (error) {
      console.error("Error fetching blog details:", error);
      setError("Failed to load blog post");
      toast.error("Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  // Fetch related blogs
  const fetchRelatedBlogs = async (category, currentBlogId) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/get-all-blogs?category=${category}&limit=3`
      );

      if (data?.success) {
        // Filter out current blog and limit to 3
        const related = data.blogs
          .filter(b => b._id !== currentBlogId)
          .slice(0, 3);
        setRelatedBlogs(related);
      }
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Blog link copied to clipboard!");
    }
  };

  useEffect(() => {
    if (slug) {
      fetchBlogDetails();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog Post Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
          <Link
            to="/blog"
            className="bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
          >
            Back to Blog
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
          src={blog.featuredImage}
          alt={blog.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center mb-4">
              <span className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-medium capitalize">
                {blog.category}
              </span>
              {blog.featured && (
                <span className="ml-3 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                  <FaStar className="mr-1" />
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{blog.title}</h1>
            <div className="flex flex-wrap justify-center items-center space-x-6 text-lg">
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center">
                <FaCalendar className="mr-2" />
                <span>{formatDate(blog.publishDate)}</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2" />
                <span>{blog.readTime} min read</span>
              </div>
              <div className="flex items-center">
                <FaEye className="mr-2" />
                <span>{blog.views.toLocaleString()} views</span>
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
            Share Article
          </button>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Excerpt */}
          <div className="bg-gray-50 border-l-4 border-mcan-primary p-6 mb-8">
            <p className="text-lg text-gray-700 italic leading-relaxed">
              {blog.excerpt}
            </p>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex items-center mb-8">
              <FaTags className="mr-3 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-mcan-primary bg-opacity-10 text-mcan-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
            style={{
              lineHeight: '1.8',
              fontSize: '1.1rem'
            }}
          />

          {/* Author Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-mcan-primary to-mcan-secondary rounded-full flex items-center justify-center text-white text-xl font-bold">
                {blog.author.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">{blog.author}</h3>
                <p className="text-gray-600">MCAN Content Team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <div key={relatedBlog._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                  <img
                    src={relatedBlog.featuredImage}
                    alt={relatedBlog.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <FaCalendar className="mr-1" />
                      <span>{formatDate(relatedBlog.publishDate)}</span>
                      <span className="mx-2">•</span>
                      <FaClock className="mr-1" />
                      <span>{relatedBlog.readTime} min</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {relatedBlog.excerpt}
                    </p>
                    <Link
                      to={`/blog/${relatedBlog.slug}`}
                      className="text-mcan-primary hover:text-mcan-secondary text-sm font-medium transition duration-300"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated with MCAN</h2>
          <p className="text-lg mb-6 opacity-90">
            Get the latest insights, Islamic guidance, and community updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/blog"
              className="bg-white text-mcan-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition duration-300"
            >
              Explore More Articles
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-mcan-primary transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
