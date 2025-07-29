import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";
import mongoose from "mongoose";

// Get comments for a blog
export const getBlogCommentsController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = -1,
      includeReplies = true 
    } = req.query;

    // Validate blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    const skip = (page - 1) * limit;
    
    // Build query for top-level comments
    let query = {
      blog: blogId,
      status: 'approved'
    };
    
    if (!includeReplies || includeReplies === 'false') {
      query.parentComment = null;
    }

    // Get comments with user details and reply counts
    const comments = await Comment.find(query)
      .populate('user', 'name email')
      .populate('parentComment', 'content user')
      .populate({
        path: 'parentComment',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ [sortBy]: parseInt(sortOrder) })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Comment.countDocuments(query);

    // If including replies, get replies for each comment
    if (includeReplies && includeReplies !== 'false') {
      for (let comment of comments) {
        if (!comment.parentComment) {
          const replies = await Comment.find({
            parentComment: comment._id,
            status: 'approved'
          })
          .populate('user', 'name email')
          .sort({ createdAt: 1 })
          .limit(5); // Limit replies to prevent deep nesting
          
          comment.replies = replies;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message
    });
  }
};

// Create a new comment
export const createCommentController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user._id || req.user.id;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    // Validate blog exists
    const blog = await Blog.findById(blogId);
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: "Blog not found or not published"
      });
    }

    // Validate parent comment if provided
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found"
        });
      }
      if (parentComment.blog.toString() !== blogId) {
        return res.status(400).json({
          success: false,
          message: "Parent comment must belong to the same blog"
        });
      }
    }

    // Create comment
    const comment = new Comment({
      blog: blogId,
      user: userId,
      content: content.trim(),
      parentComment: parentCommentId || null
    });

    await comment.save();

    // Populate user details for response
    await comment.populate('user', 'name email');
    if (parentCommentId) {
      await comment.populate({
        path: 'parentComment',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message
    });
  }
};

// Update a comment
export const updateCommentController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id || req.user.id;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments"
      });
    }

    // Update comment using the instance method
    await comment.editContent(content.trim());

    // Populate user details for response
    await comment.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating comment",
      error: error.message
    });
  }
};

// Delete a comment
export const deleteCommentController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check permissions (user owns comment or is admin)
    if (comment.user.toString() !== userId.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments"
      });
    }

    // Delete comment and its replies
    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentComment: commentId }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message
    });
  }
};

// Like/Unlike a comment
export const toggleCommentLikeController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id || req.user.id;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Toggle like using instance method
    const result = comment.toggleLike(userId);
    await comment.save();

    res.status(200).json({
      success: true,
      message: result.liked ? "Comment liked" : "Comment unliked",
      liked: result.liked,
      likesCount: result.likesCount
    });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling comment like",
      error: error.message
    });
  }
};

// Report a comment
export const reportCommentController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user._id || req.user.id;

    // Validate required fields
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Report reason is required"
      });
    }

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Add report using instance method
    await comment.addReport(userId, reason, description);

    res.status(200).json({
      success: true,
      message: "Comment reported successfully"
    });
  } catch (error) {
    if (error.message === 'You have already reported this comment') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    console.error("Error reporting comment:", error);
    res.status(500).json({
      success: false,
      message: "Error reporting comment",
      error: error.message
    });
  }
};

// Get comment thread (comment + all replies)
export const getCommentThreadController = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Get comment thread using static method
    const comment = await Comment.getCommentThread(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Get all replies
    const replies = await Comment.find({
      parentComment: commentId,
      status: 'approved'
    })
    .populate('user', 'name email')
    .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Comment thread fetched successfully",
      comment,
      replies
    });
  } catch (error) {
    console.error("Error fetching comment thread:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching comment thread",
      error: error.message
    });
  }
};
