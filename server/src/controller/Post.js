import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";
import slug from "slugify";
import mongoose from "mongoose";

// Get accommodations by gender
export const getAccommodationsByGender = async (req, res) => {
  try {
    const { gender } = req.params;
    const genderRestriction = gender === 'brothers' ? 'brothers' : 
                            gender === 'sisters' ? 'sisters' : 'family';
    
    const posts = await Post.find({
      isAvailable: true,
      genderRestriction,
    });

    res.status(200).send({
      success: true,
      message: `Available accommodations for ${gender}`,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching accommodations",
      error: error.message,
    });
  }
};

export const getAllPostController = async (req, res) => {
  try {
    const { gender } = req.query;
    const query = {};
    
    // Add gender filter if provided
    if (gender) {
      query.genderRestriction = gender;
    }

    // Get all posts with populated category
    const posts = await Post.find(query)
      .populate('category')
      .sort({ createdAt: -1 }); // Sort by newest first

    // Set cache control headers
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    console.log('Fetched posts:', {
      total: posts.length,
      gender: gender || 'all',
      categories: [...new Set(posts.map(p => ({
        id: p.category?._id?.toString(),
        restriction: p.genderRestriction
      })))]
    });
    res.status(200).send({
      success: true,
      message: "All posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting posts",
      error,
    });
  }
};

export const getPostController = async (req, res) => {
  try {
    // Set cache control headers
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const post = await Post.findOne({ slug: req.params.slug })
      .populate('category');

    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post not found"
      });
    }

    console.log('Fetched post details:', {
      id: post._id,
      title: post.title,
      category: post.category?._id,
      genderRestriction: post.genderRestriction
    });

    res.status(200).send({
      success: true,
      message: "Post details fetched successfully",
      post,
    });
  } catch (error) {
    console.error("Error fetching post details:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting post details",
      error: error.message,
    });
  }
};

export const createPostController = async (req, res) => {
  try {
    const {
      title,
      accommodationType,
      location,
      description,
      facilities,
      nearArea,
      category,
      guest,
      isAvailable,
      price,
      mosqueProximity,
      prayerFacilities,
      genderRestriction,
      nearbyFacilities,
      rules,
      landlordContact,
    } = req.body;
    const files = req.files?.images;

    // Validate required fields
    const requiredFields = {
      title,
      accommodationType,
      location,
      description,
      facilities,
      nearArea,
      guest,
      price,
      mosqueProximity,
      genderRestriction,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!files || files.length !== 3) {
      return res
        .status(400)
        .json({ message: "Please upload exactly 3 images." });
    }

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      files.map((file) =>
        cloudinary.uploader
          .upload(file.tempFilePath)
          .then((result) => result.secure_url)
      )
    );

    // Create new post
    const newPost = new Post({
      title,
      accommodationType,
      location,
      description,
      facilities,
      nearArea,
      category,
      guest,
      isAvailable: isAvailable ?? true,
      price,
      mosqueProximity,
      prayerFacilities: prayerFacilities ?? false,
      genderRestriction,
      nearbyFacilities,
      rules,
      landlordContact,
      images: imageUrls,
      slug: slug(title, { lower: true }),
    });

    await newPost.save();
    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      post: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message
    });
  }
};

export const updatePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      accommodationType,
      location,
      description,
      facilities,
      nearArea,
      category,
      guest,
      isAvailable,
      price,
      mosqueProximity,
      prayerFacilities,
      genderRestriction,
      nearbyFacilities,
      rules,
      landlordContact,
    } = req.body;
    const files = req.files?.images;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Handle image update
    let updatedImages = post.images;
    if (files && files.length === 3) {
      // Delete old images from Cloudinary
      await Promise.all(
        post.images.map((url) => {
          const publicId = url.split("/").pop().split(".")[0];
          return cloudinary.uploader.destroy(publicId);
        })
      );

      // Upload new images
      updatedImages = await Promise.all(
        files.map((file) =>
          cloudinary.uploader
            .upload(file.tempFilePath)
            .then((result) => result.secure_url)
        )
      );
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title,
        accommodationType,
        location,
        description,
        facilities,
        nearArea,
        category,
        guest,
        isAvailable,
        price,
        mosqueProximity,
        prayerFacilities,
        genderRestriction,
        nearbyFacilities,
        rules,
        landlordContact,
        images: updatedImages,
        slug: slug(title, { lower: true }),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating post",
      error: error.message
    });
  }
};

// Get related posts
export const getRelatedPostController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    
    console.log('Finding related posts with:', {
      productId: pid,
      categoryId: cid
    });

    // Convert string IDs to ObjectIds and validate
    let productId, categoryId;
    try {
      productId = new mongoose.Types.ObjectId(pid);
      categoryId = new mongoose.Types.ObjectId(cid);
      
      console.log('Converted IDs:', {
        productId: productId.toString(),
        categoryId: categoryId.toString()
      });
    } catch (err) {
      console.error('Invalid ID format:', err);
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: err.message
      });
    }

    // First verify if the post exists
    const originalPost = await Post.findById(productId);
    if (!originalPost) {
      console.log('Original post not found');
      return res.status(404).send({
        success: false,
        message: "Original post not found"
      });
    }

    // Find related posts from same category
    const products = await Post.find({
      $and: [
        { _id: { $ne: pid } },  // Exclude current post
        { category: categoryId }, // Same category
        { isAvailable: true }  // Only available posts
      ]
    })
    .populate('category')  // Include category details
    .select('title description price images location isAvailable slug genderRestriction guest mosqueProximity prayerFacilities')
    .limit(4);

    console.log('Query parameters:', {
      categoryId: categoryId,
      excludedPostId: productId
    });

    console.log('Found related posts:', {
      count: products.length,
      posts: products.map(p => ({
        id: p._id,
        title: p.title,
        category: p.category,
        isAvailable: p.isAvailable
      }))
    });

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error in getRelatedPostController:', error);
    res.status(500).send({
      success: false,
      message: "Error while getting related products",
      error: error.message
    });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const post = await Post.findById(req.params.pid);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Delete images from Cloudinary
    await Promise.all(
      post.images.map((url) => {
        const publicId = url.split("/").pop().split(".")[0];
        return cloudinary.uploader.destroy(publicId);
      })
    );

    await Post.findByIdAndDelete(req.params.pid);
    
    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message
    });
  }
};

export const nearMosqueController = async (req, res) => {
  try {
    const { maxDistance = 1000 } = req.query; // Default 1km
    
    const posts = await Post.find({
      mosqueProximity: { $lte: maxDistance },
      isAvailable: true,
    })
      .sort({ mosqueProximity: 1 });

    res.status(200).send({
      success: true,
      message: "Posts near mosques fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts near mosques:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching posts near mosques",
      error: error.message,
    });
  }
};
