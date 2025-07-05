import QuranClass from "../models/QuranClass.js";
import supabaseStorage from "../services/supabaseStorage.js";

// Get all Quran classes (public)
export const getAllQuranClassesController = async (req, res) => {
  try {
    const { program, level, status = "published" } = req.query;
    
    let query = { status };
    if (program && program !== "all") {
      query.program = program;
    }
    if (level && level !== "all") {
      query.level = level;
    }

    const classes = await QuranClass.find(query)
      .sort({ 'schedule.startDate': 1, createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Quran classes retrieved successfully",
      classes,
      count: classes.length
    });
  } catch (error) {
    console.error("Error fetching Quran classes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Quran classes",
      error: error.message
    });
  }
};

// Get all Quran classes for admin (includes all statuses)
export const getAllQuranClassesAdminController = async (req, res) => {
  try {
    const classes = await QuranClass.find({})
      .sort({ 'schedule.startDate': 1, createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Quran classes retrieved successfully",
      classes,
      count: classes.length
    });
  } catch (error) {
    console.error("Error fetching Quran classes for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Quran classes",
      error: error.message
    });
  }
};

// Get available classes for enrollment (public)
export const getAvailableClassesController = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const availableClasses = await QuranClass.find({
      status: "published",
      "enrollment.isOpen": true,
      $or: [
        { "enrollment.registrationDeadline": { $gte: currentDate } },
        { "enrollment.registrationDeadline": { $exists: false } }
      ]
    })
    .sort({ 'schedule.startDate': 1 })
    .select('-__v');

    res.status(200).json({
      success: true,
      message: "Available classes retrieved successfully",
      classes: availableClasses,
      count: availableClasses.length
    });
  } catch (error) {
    console.error("Error fetching available classes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available classes",
      error: error.message
    });
  }
};

// Get single Quran class by slug (public)
export const getQuranClassController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const quranClass = await QuranClass.findOne({ 
      slug, 
      status: "published" 
    }).select('-__v');

    if (!quranClass) {
      return res.status(404).json({
        success: false,
        message: "Quran class not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Quran class retrieved successfully",
      class: quranClass
    });
  } catch (error) {
    console.error("Error fetching Quran class:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Quran class",
      error: error.message
    });
  }
};

// Get single Quran class by ID (admin)
export const getQuranClassByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quranClass = await QuranClass.findById(id).select('-__v');

    if (!quranClass) {
      return res.status(404).json({
        success: false,
        message: "Quran class not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Quran class retrieved successfully",
      class: quranClass
    });
  } catch (error) {
    console.error("Error fetching Quran class:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Quran class",
      error: error.message
    });
  }
};

// Create Quran class (admin only)
export const createQuranClassController = async (req, res) => {
  try {
    const {
      title,
      description,
      program,
      level = "beginner",
      instructor,
      schedule,
      venue,
      curriculum,
      prerequisites,
      targetAudience,
      fees,
      enrollment,
      status = "draft",
      tags,
      language = "english"
    } = req.body;

    // Validate required fields
    if (!title || !description || !program || !instructor || !schedule || !venue) {
      return res.status(400).json({
        success: false,
        message: "Title, description, program, instructor, schedule, and venue are required"
      });
    }

    // Parse JSON fields if they're strings
    let parsedInstructor, parsedSchedule, parsedVenue, parsedCurriculum, parsedPrerequisites, parsedTargetAudience, parsedFees, parsedEnrollment, parsedTags;
    
    try {
      parsedInstructor = typeof instructor === 'string' ? JSON.parse(instructor) : instructor;
      parsedSchedule = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
      parsedVenue = typeof venue === 'string' ? JSON.parse(venue) : venue;
      parsedCurriculum = curriculum ? (typeof curriculum === 'string' ? JSON.parse(curriculum) : curriculum) : {};
      parsedPrerequisites = prerequisites ? (typeof prerequisites === 'string' ? JSON.parse(prerequisites) : prerequisites) : [];
      parsedTargetAudience = targetAudience ? (typeof targetAudience === 'string' ? JSON.parse(targetAudience) : targetAudience) : {};
      parsedFees = fees ? (typeof fees === 'string' ? JSON.parse(fees) : fees) : {};
      parsedEnrollment = enrollment ? (typeof enrollment === 'string' ? JSON.parse(enrollment) : enrollment) : {};
      parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in request data"
      });
    }

    // Handle optional image upload
    let imageUrl = null;
    if (req.files?.image) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.image,
          'mcan-quran-classes',
          'classes'
        );

        if (result.success) {
          imageUrl = result.data.secure_url;
        } else {
          throw new Error(result.error);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Error uploading image"
        });
      }
    }

    // Handle instructor image upload
    let instructorImageUrl = null;
    if (req.files?.instructorImage) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.instructorImage,
          'mcan-authors', // Using authors bucket for instructors
          'instructors'
        );

        if (result.success) {
          instructorImageUrl = result.data.secure_url;
          parsedInstructor.image = instructorImageUrl;
        } else {
          console.error("Instructor image upload error:", result.error);
        }
      } catch (uploadError) {
        console.error("Instructor image upload error:", uploadError);
      }
    }

    // Create new Quran class
    const newQuranClass = new QuranClass({
      title,
      description,
      program,
      level,
      instructor: parsedInstructor,
      schedule: parsedSchedule,
      venue: parsedVenue,
      curriculum: parsedCurriculum,
      prerequisites: parsedPrerequisites,
      targetAudience: parsedTargetAudience,
      fees: parsedFees,
      enrollment: parsedEnrollment,
      image: imageUrl,
      status,
      tags: parsedTags,
      language
    });

    await newQuranClass.save();

    res.status(201).json({
      success: true,
      message: "Quran class created successfully",
      class: newQuranClass
    });
  } catch (error) {
    console.error("Error creating Quran class:", error);
    res.status(500).json({
      success: false,
      message: "Error creating Quran class",
      error: error.message
    });
  }
};

// Update Quran class (admin only)
export const updateQuranClassController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find existing class
    const existingClass = await QuranClass.findById(id);
    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: "Quran class not found"
      });
    }

    // Handle image upload if provided
    if (req.files?.image) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.image,
          'mcan-quran-classes',
          'classes'
        );

        if (result.success) {
          updateData.image = result.data.secure_url;
        } else {
          throw new Error(result.error);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Error uploading image"
        });
      }
    }

    // Handle instructor image upload if provided
    if (req.files?.instructorImage) {
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.instructorImage,
          'mcan-authors', // Using authors bucket for instructors
          'instructors'
        );

        if (result.success) {
          if (updateData.instructor) {
            const instructor = typeof updateData.instructor === 'string' ? JSON.parse(updateData.instructor) : updateData.instructor;
            instructor.image = result.data.secure_url;
            updateData.instructor = instructor;
          }
        } else {
          console.error("Instructor image upload error:", result.error);
        }
      } catch (uploadError) {
        console.error("Instructor image upload error:", uploadError);
      }
    }

    // Parse JSON fields if they're strings
    ['instructor', 'schedule', 'venue', 'curriculum', 'prerequisites', 'targetAudience', 'fees', 'enrollment', 'tags'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (error) {
          // Keep original value if parsing fails
        }
      }
    });

    // Parse date fields if provided
    if (updateData.schedule?.startDate) {
      updateData.schedule.startDate = new Date(updateData.schedule.startDate);
    }
    if (updateData.schedule?.endDate) {
      updateData.schedule.endDate = new Date(updateData.schedule.endDate);
    }
    if (updateData.enrollment?.registrationDeadline) {
      updateData.enrollment.registrationDeadline = new Date(updateData.enrollment.registrationDeadline);
    }

    // Update class
    const updatedClass = await QuranClass.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: "Quran class updated successfully",
      class: updatedClass
    });
  } catch (error) {
    console.error("Error updating Quran class:", error);
    res.status(500).json({
      success: false,
      message: "Error updating Quran class",
      error: error.message
    });
  }
};

// Delete Quran class (admin only)
export const deleteQuranClassController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await QuranClass.findByIdAndDelete(id);
    
    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: "Quran class not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Quran class deleted successfully",
      class: deletedClass
    });
  } catch (error) {
    console.error("Error deleting Quran class:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting Quran class",
      error: error.message
    });
  }
};
