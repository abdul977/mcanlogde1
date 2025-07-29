import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaCalendar, FaClock, FaUser, FaArrowLeft, FaShare, FaTags, FaEye, FaStar, FaBook, FaHeart, FaBookmark, FaComment, FaThumbsUp } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import MobileLayout, { MobilePageHeader, MobileButton } from "../components/Mobile/MobileLayout";
import { FormSection, FormField } from "../components/Mobile/ResponsiveForm";
import { useAuth } from "../context/UserContext";

const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction states
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

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

        // Record the share
        if (auth?.token) {
          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/blog/${blog._id}/share`,
            {
              platform: 'native_share',
              shareMethod: 'web_share_api',
              shareContext: {
                location: 'blog_detail'
              }
            },
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
        }
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Blog link copied to clipboard!");

      // Record the share
      if (auth?.token) {
        try {
          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/blog/${blog._id}/share`,
            {
              platform: 'copy_link',
              shareMethod: 'copy_link',
              shareContext: {
                location: 'blog_detail'
              }
            },
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
        } catch (error) {
          console.error('Error recording share:', error);
        }
      }
    }
  };

  // Fetch interaction status
  const fetchInteractionStatus = async () => {
    if (!blog || !auth?.token) return;

    try {
      const [likeStatus, bookmarkStatus] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/blog/${blog._id}/like/status`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        ),
        axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/blog/${blog._id}/bookmark/status`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        )
      ]);

      if (likeStatus.data.success) {
        setLiked(likeStatus.data.liked);
        setLikesCount(likeStatus.data.likesCount);
      }

      if (bookmarkStatus.data.success) {
        setBookmarked(bookmarkStatus.data.bookmarked);
      }
    } catch (error) {
      console.error('Error fetching interaction status:', error);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    if (!blog) return;

    try {
      setCommentsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/${blog._id}/comments?page=1&limit=10&includeReplies=true`
      );

      if (response.data.success) {
        setComments(response.data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Handle like toggle
  const handleLike = async () => {
    if (!blog || !auth?.token) {
      toast.error("Please login to like this post");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blog/${blog._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.data.success) {
        setLiked(response.data.liked);
        setLikesCount(response.data.likesCount);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async () => {
    if (!blog || !auth?.token) {
      toast.error("Please login to bookmark this post");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blog/${blog._id}/bookmark`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.data.success) {
        setBookmarked(response.data.bookmarked);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark status');
    }
  };

  // Handle comment submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!blog || !auth?.token || !newComment.trim()) return;

    try {
      setCommentSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blog/${blog._id}/comments`,
        { content: newComment.trim() },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.data.success) {
        setComments(prev => [response.data.comment, ...prev]);
        setNewComment('');
        toast.success('Comment added successfully!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchBlogDetails();
    }
  }, [slug]);

  useEffect(() => {
    if (blog && auth?.token) {
      fetchInteractionStatus();
      fetchComments();
    }
  }, [blog, auth?.token]);

  if (loading) {
    return (
      <MobileLayout
        title="Loading..."
        subtitle="Blog post"
        icon={FaBook}
      >
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      </MobileLayout>
    );
  }

  if (error || !blog) {
    return (
      <MobileLayout
        title="Not Found"
        subtitle="Blog post"
        icon={FaBook}
      >
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
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title={blog.title}
      subtitle="Blog post"
      icon={FaBook}
      headerActions={
        <div className="flex items-center space-x-2">
          <MobileButton
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            icon={FaArrowLeft}
            title="Go back"
          />
          <MobileButton
            onClick={handleLike}
            variant="ghost"
            size="sm"
            icon={FaHeart}
            title={liked ? "Unlike" : "Like"}
            className={liked ? "text-red-500" : ""}
          />
          <MobileButton
            onClick={handleBookmark}
            variant="ghost"
            size="sm"
            icon={FaBookmark}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}
            className={bookmarked ? "text-blue-500" : ""}
          />
          <MobileButton
            onClick={handleShare}
            variant="ghost"
            size="sm"
            icon={FaShare}
            title="Share"
          />
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-64 lg:h-96 bg-gradient-to-r from-mcan-primary to-mcan-secondary">
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
              <div className="flex flex-wrap items-center justify-center mb-4 gap-2">
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium capitalize">
                  {blog.category}
                </span>
                {blog.featured && (
                  <span className="bg-yellow-500 text-white px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium flex items-center">
                    <FaStar className="mr-1" />
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-xl lg:text-3xl xl:text-5xl font-bold mb-4 lg:mb-6">{blog.title}</h1>
              <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6 text-sm lg:text-lg">
                <div className="flex items-center">
                  <FaUser className="mr-2" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center">
                  <FaCalendar className="mr-2" />
                  <span className="hidden sm:inline">{formatDate(blog.publishDate)}</span>
                  <span className="sm:hidden">{new Date(blog.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-2" />
                  <span>{blog.readTime} min</span>
                </div>
                <div className="flex items-center">
                  <FaEye className="mr-2" />
                  <span>{blog.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 lg:p-8">
          {/* Page Header for Desktop */}
          <MobilePageHeader
            title={blog.title}
            subtitle={`By ${blog.author} • ${formatDate(blog.publishDate)}`}
            icon={FaBook}
            showOnMobile={false}
            actions={
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 flex items-center">
                  <FaEye className="mr-1" />
                  {blog.views.toLocaleString()} views
                </span>
                <span className="text-sm text-gray-600 flex items-center">
                  <FaClock className="mr-1" />
                  {blog.readTime} min read
                </span>
              </div>
            }
          />

          {/* Blog Content */}
          <FormSection title="Article" icon={FaBook} columns={1}>
            <div className="prose prose-lg max-w-none">
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </FormSection>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <FormSection title="Tags" icon={FaTags} columns={1} className="mt-8">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-mcan-primary/10 text-mcan-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </FormSection>
          )}

          {/* Author Info */}
          <FormSection title="About the Author" icon={FaUser} columns={1} className="mt-8">
            <div className="flex items-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-mcan-primary to-mcan-secondary rounded-full flex items-center justify-center text-white text-lg lg:text-xl font-bold">
                {blog.author.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">{blog.author}</h3>
                <p className="text-gray-600">MCAN Content Team</p>
              </div>
            </div>
          </FormSection>

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <FormSection title="Related Articles" icon={FaBook} columns={1} className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
            </FormSection>
          )}

          {/* Interaction Buttons */}
          <FormSection title="Engage with this Post" icon={FaThumbsUp} columns={1} className="mt-8">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition duration-300 ${
                  liked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaHeart className={liked ? 'text-white' : 'text-red-500'} />
                <span>{liked ? 'Liked' : 'Like'}</span>
                {likesCount > 0 && <span className="text-sm">({likesCount})</span>}
              </button>

              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition duration-300 ${
                  bookmarked
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaBookmark className={bookmarked ? 'text-white' : 'text-blue-500'} />
                <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-300"
              >
                <FaShare className="text-green-500" />
                <span>Share</span>
              </button>
            </div>
          </FormSection>

          {/* Comments Section */}
          <FormSection title={`Comments (${comments.length})`} icon={FaComment} columns={1} className="mt-8">
            {/* Add Comment Form */}
            {auth?.token ? (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent resize-none"
                    rows="4"
                    maxLength="1000"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {newComment.length}/1000 characters
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentSubmitting}
                    className="bg-mcan-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-mcan-secondary transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {commentSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-gray-600 mb-2">Please login to leave a comment</p>
                <Link
                  to="/login"
                  className="text-mcan-primary hover:text-mcan-secondary font-medium"
                >
                  Login here
                </Link>
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
                <p className="mt-2 text-gray-600">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-mcan-primary">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-mcan-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {comment.user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{comment.user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">{comment.formattedCreatedAt}</p>
                        </div>
                      </div>
                      {comment.isEdited && (
                        <span className="text-xs text-gray-500 italic">Edited</span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaComment className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No comments yet</p>
                <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
              </div>
            )}
          </FormSection>

          {/* Call to Action */}
          <FormSection title="Stay Connected" icon={FaHeart} columns={1} className="mt-8">
            <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary rounded-lg p-6 lg:p-8 text-white text-center">
              <h2 className="text-xl lg:text-2xl font-bold mb-4">Stay Updated with MCAN</h2>
              <p className="text-base lg:text-lg mb-6 opacity-90">
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
          </FormSection>
        </div>
      </div>
    </MobileLayout>
  );
};

export default BlogDetails;
