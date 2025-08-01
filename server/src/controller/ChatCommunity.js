import ChatCommunity from "../models/ChatCommunity.js";
import CommunityMember from "../models/CommunityMember.js";
import ModerationLog from "../models/ModerationLog.js";
import supabaseStorage from "../services/supabaseStorage.js";

// Create new community (authenticated users)
export const createCommunityController = async (req, res) => {
  try {
    const {
      name,
      description,
      category = "general",
      tags = [],
      isPrivate = false,
      requireApproval = false,
      maxMembers = 1000,
      messageRateLimit = { enabled: true, seconds: 5 },
      allowMediaSharing = true,
      allowFileSharing = true
    } = req.body;

    const userId = req.user._id;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Community name and description are required"
      });
    }

    // Check if user already has pending communities (limit to prevent spam)
    const pendingCount = await ChatCommunity.countDocuments({
      creator: userId,
      status: "pending"
    });

    if (pendingCount >= 3) {
      return res.status(400).json({
        success: false,
        message: "You have too many pending communities. Please wait for approval before creating more."
      });
    }

    // Handle avatar upload
    let avatarUrl = null;
    if (req.files?.avatar) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.avatar,
          'mcan-communities',
          'avatars'
        );

        if (result.success) {
          avatarUrl = result.data.secure_url;
        } else {
          console.error("Error uploading avatar:", result.error);
        }
      } catch (uploadError) {
        console.error("Error uploading avatar:", uploadError);
      }
    }

    // Handle banner upload
    let bannerUrl = null;
    if (req.files?.banner) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.banner,
          'mcan-communities',
          'banners'
        );

        if (result.success) {
          bannerUrl = result.data.secure_url;
        } else {
          console.error("Error uploading banner:", result.error);
        }
      } catch (uploadError) {
        console.error("Error uploading banner:", uploadError);
      }
    }

    // Parse tags if string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim().toLowerCase());
      }
    }

    // Create new community
    const newCommunity = new ChatCommunity({
      name: name.trim(),
      description: description.trim(),
      category,
      creator: userId,
      settings: {
        isPrivate: isPrivate === 'true' || isPrivate === true,
        requireApproval: requireApproval === 'true' || requireApproval === true,
        maxMembers: parseInt(maxMembers) || 1000,
        messageRateLimit: typeof messageRateLimit === 'string' ? JSON.parse(messageRateLimit) : messageRateLimit,
        allowMediaSharing: allowMediaSharing === 'true' || allowMediaSharing === true,
        allowFileSharing: allowFileSharing === 'true' || allowFileSharing === true
      },
      avatar: avatarUrl,
      banner: bannerUrl,
      tags: parsedTags,
      status: "pending", // All user-created communities start as pending
      memberCount: 1 // Creator is automatically a member
    });

    await newCommunity.save();

    // Add creator as a member with creator role
    const creatorMember = new CommunityMember({
      community: newCommunity._id,
      user: userId,
      role: "creator",
      status: "active",
      permissions: {
        canKickMembers: true,
        canBanMembers: true,
        canDeleteMessages: true,
        canManageRules: true,
        canInviteMembers: true,
        canPinMessages: true
      }
    });

    await creatorMember.save();

    // Log the community creation
    await ModerationLog.logAction({
      community: newCommunity._id,
      moderator: userId,
      action: "update_settings",
      reason: "Community created",
      details: {
        newValue: {
          name: newCommunity.name,
          category: newCommunity.category,
          isPrivate: newCommunity.settings.isPrivate
        }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "low"
      }
    });

    res.status(201).json({
      success: true,
      message: "Community created successfully and is pending approval",
      community: {
        _id: newCommunity._id,
        name: newCommunity.name,
        description: newCommunity.description,
        category: newCommunity.category,
        avatar: newCommunity.avatar,
        banner: newCommunity.banner,
        status: newCommunity.status,
        slug: newCommunity.slug,
        memberCount: newCommunity.memberCount,
        createdAt: newCommunity.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({
      success: false,
      message: "Error creating community",
      error: error.message
    });
  }
};

// Get all communities (public - approved only)
export const getAllCommunitiesController = async (req, res) => {
  try {
    const {
      category,
      search,
      featured,
      sort = "memberCount",
      order = "desc",
      page = 1,
      limit = 12
    } = req.query;

    let query = { status: "approved" };

    // Build query filters
    if (category && category !== "all") {
      query.category = category;
    }
    if (featured === "true") {
      query.featured = true;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    if (search) {
      sortObj.score = { $meta: "textScore" };
    }
    sortObj[sort] = order === "desc" ? -1 : 1;

    const communities = await ChatCommunity.find(query)
      .populate('creator', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-approvalInfo -moderators');

    const total = await ChatCommunity.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Communities retrieved successfully",
      communities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching communities",
      error: error.message
    });
  }
};

// Get single community by ID (public) - for mobile app
export const getCommunityByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    console.log('🔍 [DEBUG] getCommunityByIdController called with ID:', id);
    console.log('🔍 [DEBUG] User ID:', userId);

    const community = await ChatCommunity.findOne({
      _id: id,
      status: "approved"
    })
    .populate('creator', 'name email role')
    .populate('moderators.user', 'name email role')
    .select('-approvalInfo');

    if (!community) {
      console.log('❌ [DEBUG] Community not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    console.log('✅ [DEBUG] Community found:', community.name);

    // Check if user is a member
    let memberInfo = null;
    if (userId) {
      memberInfo = await CommunityMember.findOne({
        community: community._id,
        user: userId,
        status: 'active'
      });
      console.log('🔍 [DEBUG] User membership:', !!memberInfo);
    }

    res.status(200).json({
      success: true,
      message: "Community retrieved successfully",
      community: {
        ...community.toObject(),
        isMember: !!memberInfo,
        memberRole: memberInfo?.role || null
      }
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error in getCommunityByIdController:', error);
    res.status(500).json({
      success: false,
      message: "Error retrieving community",
      error: error.message
    });
  }
};

// Get single community by slug (public)
export const getCommunityController = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?._id;

    const community = await ChatCommunity.findOne({
      slug,
      status: "approved"
    })
    .populate('creator', 'name email role')
    .populate('moderators.user', 'name email role')
    .select('-approvalInfo');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check if user is a member
    let memberInfo = null;
    if (userId) {
      memberInfo = await CommunityMember.findOne({
        community: community._id,
        user: userId,
        status: 'active'
      });
    }

    res.status(200).json({
      success: true,
      message: "Community retrieved successfully",
      community: {
        ...community.toObject(),
        isMember: !!memberInfo,
        userRole: memberInfo?.role || null,
        userPermissions: memberInfo?.permissions || null
      }
    });
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching community",
      error: error.message
    });
  }
};

// Get user's communities
export const getUserCommunitiesController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = 'active' } = req.query;

    const userCommunities = await CommunityMember.getUserCommunities(userId, status);

    res.status(200).json({
      success: true,
      message: "User communities retrieved successfully",
      communities: userCommunities
    });
  } catch (error) {
    console.error("Error fetching user communities:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user communities",
      error: error.message
    });
  }
};

// Update community (creator/moderator only)
export const updateCommunityController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = { ...req.body };

    // Find community
    const community = await ChatCommunity.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check permissions
    const isCreator = community.isCreator(userId);
    const isModerator = community.isModerator(userId);
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isModerator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this community"
      });
    }

    // Handle image uploads
    if (req.files?.avatar) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.avatar,
          'mcan-communities',
          'avatars'
        );
        if (result.success) {
          updateData.avatar = result.data.secure_url;
        }
      } catch (uploadError) {
        console.error("Error uploading avatar:", uploadError);
      }
    }

    if (req.files?.banner) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.banner,
          'mcan-communities',
          'banners'
        );
        if (result.success) {
          updateData.banner = result.data.secure_url;
        }
      } catch (uploadError) {
        console.error("Error uploading banner:", uploadError);
      }
    }

    // Parse JSON fields
    ['settings', 'tags', 'rules'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (error) {
          // Keep original value if parsing fails
        }
      }
    });

    // Update community
    const updatedCommunity = await ChatCommunity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('creator', 'name email');

    // Log the update
    await ModerationLog.logAction({
      community: id,
      moderator: userId,
      action: "update_settings",
      reason: "Community updated",
      details: {
        previousValue: community.toObject(),
        newValue: updatedCommunity.toObject()
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "low"
      }
    });

    res.status(200).json({
      success: true,
      message: "Community updated successfully",
      community: updatedCommunity
    });
  } catch (error) {
    console.error("Error updating community:", error);
    res.status(500).json({
      success: false,
      message: "Error updating community",
      error: error.message
    });
  }
};

// Admin: Get all communities (including pending)
export const getAllCommunitiesAdminController = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    // Build query filters
    if (status && status !== "all") {
      query.status = status;
    }
    if (category && category !== "all") {
      query.category = category;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    if (search) {
      sortObj.score = { $meta: "textScore" };
    }
    sortObj[sort] = order === "desc" ? -1 : 1;

    const communities = await ChatCommunity.find(query)
      .populate('creator', 'name email role')
      .populate('approvalInfo.reviewedBy', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatCommunity.countDocuments(query);

    // Get status counts for admin dashboard
    const statusCounts = await ChatCommunity.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Communities retrieved successfully",
      communities,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching communities for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching communities",
      error: error.message
    });
  }
};

// Admin: Approve community
export const approveCommunityController = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user._id;

    const community = await ChatCommunity.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    if (community.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Community is not pending approval"
      });
    }

    // Update community status
    community.status = "approved";
    community.approvalInfo = {
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminNotes: adminNotes || ""
    };

    await community.save();

    // Log the approval
    await ModerationLog.logAction({
      community: id,
      moderator: adminId,
      action: "update_settings",
      reason: "Community approved by admin",
      details: {
        previousValue: { status: "pending" },
        newValue: { status: "approved" },
        adminNotes
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "medium"
      }
    });

    // TODO: Send notification to community creator
    // This will be implemented in the notification system task

    res.status(200).json({
      success: true,
      message: "Community approved successfully",
      community
    });
  } catch (error) {
    console.error("Error approving community:", error);
    res.status(500).json({
      success: false,
      message: "Error approving community",
      error: error.message
    });
  }
};

// Admin: Reject community
export const rejectCommunityController = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    const adminId = req.user._id;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    const community = await ChatCommunity.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    if (community.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Community is not pending approval"
      });
    }

    // Update community status
    community.status = "rejected";
    community.approvalInfo = {
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason,
      adminNotes: adminNotes || ""
    };

    await community.save();

    // Log the rejection
    await ModerationLog.logAction({
      community: id,
      moderator: adminId,
      action: "update_settings",
      reason: "Community rejected by admin",
      details: {
        previousValue: { status: "pending" },
        newValue: { status: "rejected" },
        rejectionReason,
        adminNotes
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "medium"
      }
    });

    // TODO: Send notification to community creator
    // This will be implemented in the notification system task

    res.status(200).json({
      success: true,
      message: "Community rejected successfully",
      community
    });
  } catch (error) {
    console.error("Error rejecting community:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting community",
      error: error.message
    });
  }
};

// Admin: Suspend community
export const suspendCommunityController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminNotes } = req.body;
    const adminId = req.user._id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Suspension reason is required"
      });
    }

    const community = await ChatCommunity.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    const previousStatus = community.status;
    community.status = "suspended";
    community.approvalInfo = {
      ...community.approvalInfo,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: reason,
      adminNotes: adminNotes || ""
    };

    await community.save();

    // Log the suspension
    await ModerationLog.logAction({
      community: id,
      moderator: adminId,
      action: "update_settings",
      reason: "Community suspended by admin",
      details: {
        previousValue: { status: previousStatus },
        newValue: { status: "suspended" },
        suspensionReason: reason,
        adminNotes
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "high"
      }
    });

    res.status(200).json({
      success: true,
      message: "Community suspended successfully",
      community
    });
  } catch (error) {
    console.error("Error suspending community:", error);
    res.status(500).json({
      success: false,
      message: "Error suspending community",
      error: error.message
    });
  }
};

export default {
  createCommunityController,
  getAllCommunitiesController,
  getCommunityController,
  getUserCommunitiesController,
  updateCommunityController,
  getAllCommunitiesAdminController,
  approveCommunityController,
  rejectCommunityController,
  suspendCommunityController
};
