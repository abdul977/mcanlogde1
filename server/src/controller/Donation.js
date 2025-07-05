import Donation from "../models/Donation.js";
import supabaseStorage from "../services/supabaseStorage.js";

// Get all donations (public)
export const getAllDonationsController = async (req, res) => {
  try {
    const { 
      type, 
      category, 
      featured, 
      urgent,
      status = "active",
      search,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 12
    } = req.query;
    
    let query = { status };
    
    // Build query filters
    if (type && type !== "all") {
      query.type = type;
    }
    if (category && category !== "all") {
      query.category = category;
    }
    if (featured === "true") {
      query.featured = true;
    }
    if (urgent === "true") {
      query.urgent = true;
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

    const donations = await Donation.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Donation.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Donations retrieved successfully",
      donations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching donations",
      error: error.message
    });
  }
};

// Get all donations for admin (includes all statuses)
export const getAllDonationsAdminController = async (req, res) => {
  try {
    const donations = await Donation.find({})
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Donations retrieved successfully",
      donations,
      count: donations.length
    });
  } catch (error) {
    console.error("Error fetching donations for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching donations",
      error: error.message
    });
  }
};

// Get featured donations (public)
export const getFeaturedDonationsController = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const featuredDonations = await Donation.find({
      status: "active",
      featured: true
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('-__v');

    res.status(200).json({
      success: true,
      message: "Featured donations retrieved successfully",
      donations: featuredDonations,
      count: featuredDonations.length
    });
  } catch (error) {
    console.error("Error fetching featured donations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured donations",
      error: error.message
    });
  }
};

// Get urgent donations (public)
export const getUrgentDonationsController = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const urgentDonations = await Donation.find({
      status: "active",
      urgent: true
    })
    .sort({ 'timeline.endDate': 1 })
    .limit(parseInt(limit))
    .select('-__v');

    res.status(200).json({
      success: true,
      message: "Urgent donations retrieved successfully",
      donations: urgentDonations,
      count: urgentDonations.length
    });
  } catch (error) {
    console.error("Error fetching urgent donations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching urgent donations",
      error: error.message
    });
  }
};

// Get single donation by slug (public)
export const getDonationController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const donation = await Donation.findOne({ 
      slug, 
      status: { $in: ["active", "completed"] }
    }).select('-__v');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation retrieved successfully",
      donation
    });
  } catch (error) {
    console.error("Error fetching donation:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching donation",
      error: error.message
    });
  }
};

// Get single donation by ID (admin)
export const getDonationByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const donation = await Donation.findById(id).select('-__v');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation retrieved successfully",
      donation
    });
  } catch (error) {
    console.error("Error fetching donation:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching donation",
      error: error.message
    });
  }
};

// Create donation (admin only)
export const createDonationController = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category = "general",
      sponsorshipLevel,
      amount,
      sponsorshipTiers,
      timeline,
      beneficiaries,
      paymentInfo,
      tags,
      featured = false,
      urgent = false,
      status = "draft",
      visibility = "public"
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !amount || !timeline) {
      return res.status(400).json({
        success: false,
        message: "Title, description, type, amount, and timeline are required"
      });
    }

    // Parse JSON fields if they're strings
    let parsedAmount, parsedSponsorshipTiers, parsedTimeline, parsedBeneficiaries, parsedPaymentInfo, parsedTags;
    
    try {
      parsedAmount = amount ? (typeof amount === 'string' ? JSON.parse(amount) : amount) : {};
      parsedSponsorshipTiers = sponsorshipTiers ? (typeof sponsorshipTiers === 'string' ? JSON.parse(sponsorshipTiers) : sponsorshipTiers) : [];
      parsedTimeline = timeline ? (typeof timeline === 'string' ? JSON.parse(timeline) : timeline) : {};
      parsedBeneficiaries = beneficiaries ? (typeof beneficiaries === 'string' ? JSON.parse(beneficiaries) : beneficiaries) : {};
      parsedPaymentInfo = paymentInfo ? (typeof paymentInfo === 'string' ? JSON.parse(paymentInfo) : paymentInfo) : {};
      parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in request data"
      });
    }

    // Handle multiple image uploads
    let mediaImages = [];
    if (req.files) {
      const imageFields = Object.keys(req.files).filter(key => key.startsWith('image'));

      for (const field of imageFields) {
        try {
          const result = await supabaseStorage.uploadFromTempFile(
            req.files[field],
            'mcan-donations',
            'donations'
          );

          if (result.success) {
            mediaImages.push({
              url: result.data.secure_url,
              caption: req.body[`${field}_caption`] || "",
              isPrimary: field === 'image0' // First image is primary
            });
          } else {
            console.error(`Error uploading ${field}:`, result.error);
          }
        } catch (uploadError) {
          console.error(`Error uploading ${field}:`, uploadError);
        }
      }
    }

    // Create new donation
    const newDonation = new Donation({
      title,
      description,
      type,
      category,
      sponsorshipLevel,
      amount: parsedAmount,
      sponsorshipTiers: parsedSponsorshipTiers,
      timeline: {
        ...parsedTimeline,
        startDate: new Date(parsedTimeline.startDate),
        endDate: new Date(parsedTimeline.endDate)
      },
      beneficiaries: parsedBeneficiaries,
      sponsors: [],
      media: {
        images: mediaImages,
        videos: [],
        documents: []
      },
      progress: {
        percentage: 0,
        updates: []
      },
      paymentInfo: parsedPaymentInfo,
      tags: parsedTags,
      featured: featured === 'true' || featured === true,
      urgent: urgent === 'true' || urgent === true,
      status,
      visibility
    });

    await newDonation.save();

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      donation: newDonation
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({
      success: false,
      message: "Error creating donation",
      error: error.message
    });
  }
};

// Update donation (admin only)
export const updateDonationController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find existing donation
    const existingDonation = await Donation.findById(id);
    if (!existingDonation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    // Handle image uploads if provided
    if (req.files) {
      const imageFields = Object.keys(req.files).filter(key => key.startsWith('image'));
      let newImages = [...(existingDonation.media?.images || [])];

      for (const field of imageFields) {
        try {
          const result = await supabaseStorage.uploadFromTempFile(
            req.files[field],
            'mcan-donations',
            'donations'
          );

          if (result.success) {
            newImages.push({
              url: result.data.secure_url,
              caption: req.body[`${field}_caption`] || "",
              isPrimary: newImages.length === 0 // First image is primary
            });
          } else {
            console.error(`Error uploading ${field}:`, result.error);
          }
        } catch (uploadError) {
          console.error(`Error uploading ${field}:`, uploadError);
        }
      }

      if (!updateData.media) updateData.media = {};
      updateData.media.images = newImages;
    }

    // Parse JSON fields if they're strings
    ['amount', 'sponsorshipTiers', 'timeline', 'beneficiaries', 'paymentInfo', 'tags'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (error) {
          // Keep original value if parsing fails
        }
      }
    });

    // Parse boolean fields
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    }
    if (updateData.urgent !== undefined) {
      updateData.urgent = updateData.urgent === 'true' || updateData.urgent === true;
    }

    // Parse date fields
    if (updateData.timeline?.startDate) {
      updateData.timeline.startDate = new Date(updateData.timeline.startDate);
    }
    if (updateData.timeline?.endDate) {
      updateData.timeline.endDate = new Date(updateData.timeline.endDate);
    }

    // Update donation
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: "Donation updated successfully",
      donation: updatedDonation
    });
  } catch (error) {
    console.error("Error updating donation:", error);
    res.status(500).json({
      success: false,
      message: "Error updating donation",
      error: error.message
    });
  }
};

// Delete donation (admin only)
export const deleteDonationController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDonation = await Donation.findByIdAndDelete(id);
    
    if (!deletedDonation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation deleted successfully",
      donation: deletedDonation
    });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting donation",
      error: error.message
    });
  }
};

// Add sponsor to donation (public)
export const addSponsorController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      organization,
      amount,
      tier,
      isAnonymous = false,
      message,
      paymentMethod,
      paymentReference
    } = req.body;

    // Validate required fields
    if (!name || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Name, amount, and payment method are required"
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    // Generate receipt number
    const receiptNumber = `MCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Add sponsor
    const newSponsor = {
      name,
      email,
      phone,
      organization,
      amount: parseFloat(amount),
      tier,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      message,
      paymentMethod,
      paymentReference,
      paymentStatus: "pending",
      donationDate: new Date(),
      receiptNumber
    };

    donation.sponsors.push(newSponsor);
    donation.amount.raised += parseFloat(amount);

    await donation.save();

    res.status(200).json({
      success: true,
      message: "Sponsor added successfully",
      receiptNumber,
      donation: {
        _id: donation._id,
        title: donation.title,
        amountRaised: donation.amount.raised,
        progressPercentage: donation.progress.percentage
      }
    });
  } catch (error) {
    console.error("Error adding sponsor:", error);
    res.status(500).json({
      success: false,
      message: "Error adding sponsor",
      error: error.message
    });
  }
};
