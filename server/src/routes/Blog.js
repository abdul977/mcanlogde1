import express from "express";
import {
  getAllBlogsController,
  getAllBlogsAdminController,
  getBlogController,
  getBlogByIdController,
  getFeaturedBlogsController,
  createBlogController,
  updateBlogController,
  deleteBlogController
} from "../controller/Blog.js";
import {
  getBlogCommentsController,
  createCommentController,
  updateCommentController,
  deleteCommentController,
  toggleCommentLikeController,
  reportCommentController,
  getCommentThreadController
} from "../controller/Comment.js";
import {
  toggleBlogLikeController,
  getBlogLikesController,
  checkBlogLikeStatusController,
  getUserLikedBlogsController,
  getTopLikedBlogsController,
  getBlogLikesAnalyticsController,
  getMultipleBlogsLikeStatusController
} from "../controller/Like.js";
import {
  toggleBlogBookmarkController,
  checkBlogBookmarkStatusController,
  getUserBookmarksController,
  getUserBookmarkCollectionsController,
  getUserBookmarkStatsController,
  updateBookmarkController,
  updateReadingProgressController,
  addBookmarkTagsController,
  removeBookmarkTagsController
} from "../controller/Bookmark.js";
import {
  recordBlogShareController,
  getBlogShareCountController,
  getBlogShareAnalyticsController,
  getTopSharedBlogsController,
  getUserShareHistoryController,
  getPlatformStatsController,
  getSharingTrendsController,
  getMultipleBlogsShareSummaryController
} from "../controller/Share.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes
// Get all published blogs
router.get("/get-all-blogs", getAllBlogsController);

// Get featured blogs
router.get("/featured-blogs", getFeaturedBlogsController);

// Get single blog by slug
router.get("/get-blog/:slug", getBlogController);

// Admin routes (protected)
// Get all blogs for admin (includes drafts)
router.get("/admin/get-all-blogs", requireSignIn, isAdmin, getAllBlogsAdminController);

// Get single blog by ID (admin)
router.get("/admin/get-blog-by-id/:id", requireSignIn, isAdmin, getBlogByIdController);

// Create blog
router.post("/create-blog", requireSignIn, isAdmin, createBlogController);

// Update blog
router.put("/update-blog/:id", requireSignIn, isAdmin, updateBlogController);

// Delete blog
router.delete("/delete-blog/:id", requireSignIn, isAdmin, deleteBlogController);

// ============ BLOG INTERACTION ROUTES ============

// Comments routes
// Get comments for a blog
router.get("/:blogId/comments", getBlogCommentsController);

// Create comment (requires authentication)
router.post("/:blogId/comments", requireSignIn, createCommentController);

// Update comment (requires authentication)
router.put("/comments/:commentId", requireSignIn, updateCommentController);

// Delete comment (requires authentication)
router.delete("/comments/:commentId", requireSignIn, deleteCommentController);

// Like/Unlike comment (requires authentication)
router.post("/comments/:commentId/like", requireSignIn, toggleCommentLikeController);

// Report comment (requires authentication)
router.post("/comments/:commentId/report", requireSignIn, reportCommentController);

// Get comment thread
router.get("/comments/:commentId/thread", getCommentThreadController);

// Likes routes
// Toggle like for a blog (requires authentication)
router.post("/:blogId/like", requireSignIn, toggleBlogLikeController);

// Get likes for a blog
router.get("/:blogId/likes", getBlogLikesController);

// Check if user liked a blog (requires authentication)
router.get("/:blogId/like/status", requireSignIn, checkBlogLikeStatusController);

// Get user's liked blogs (requires authentication)
router.get("/user/liked-blogs", requireSignIn, getUserLikedBlogsController);

// Get top liked blogs
router.get("/analytics/top-liked", getTopLikedBlogsController);

// Get likes analytics for a blog (admin only)
router.get("/:blogId/likes/analytics", requireSignIn, isAdmin, getBlogLikesAnalyticsController);

// Get multiple blogs like status (requires authentication)
router.post("/multiple/like-status", requireSignIn, getMultipleBlogsLikeStatusController);

// Bookmarks routes
// Toggle bookmark for a blog (requires authentication)
router.post("/:blogId/bookmark", requireSignIn, toggleBlogBookmarkController);

// Check if user bookmarked a blog (requires authentication)
router.get("/:blogId/bookmark/status", requireSignIn, checkBlogBookmarkStatusController);

// Get user's bookmarks (requires authentication)
router.get("/user/bookmarks", requireSignIn, getUserBookmarksController);

// Get user's bookmark collections (requires authentication)
router.get("/user/bookmark-collections", requireSignIn, getUserBookmarkCollectionsController);

// Get user's bookmark statistics (requires authentication)
router.get("/user/bookmark-stats", requireSignIn, getUserBookmarkStatsController);

// Update bookmark details (requires authentication)
router.put("/bookmarks/:bookmarkId", requireSignIn, updateBookmarkController);

// Update reading progress (requires authentication)
router.put("/bookmarks/:bookmarkId/progress", requireSignIn, updateReadingProgressController);

// Add tags to bookmark (requires authentication)
router.post("/bookmarks/:bookmarkId/tags", requireSignIn, addBookmarkTagsController);

// Remove tags from bookmark (requires authentication)
router.delete("/bookmarks/:bookmarkId/tags", requireSignIn, removeBookmarkTagsController);

// Shares routes
// Record a blog share (requires authentication)
router.post("/:blogId/share", requireSignIn, recordBlogShareController);

// Get share count for a blog
router.get("/:blogId/shares/count", getBlogShareCountController);

// Get share analytics for a blog (admin only)
router.get("/:blogId/shares/analytics", requireSignIn, isAdmin, getBlogShareAnalyticsController);

// Get top shared blogs
router.get("/analytics/top-shared", getTopSharedBlogsController);

// Get user's share history (requires authentication)
router.get("/user/share-history", requireSignIn, getUserShareHistoryController);

// Get platform statistics (admin only)
router.get("/analytics/platform-stats", requireSignIn, isAdmin, getPlatformStatsController);

// Get sharing trends (admin only)
router.get("/analytics/sharing-trends", requireSignIn, isAdmin, getSharingTrendsController);

// Get multiple blogs share summary
router.post("/multiple/share-summary", getMultipleBlogsShareSummaryController);

export default router;
