import Lecture from "../models/Lecture.js";
import { v2 as cloudinary } from "cloudinary";

// Get all lectures (public)
export const getAllLecturesController = async (req, res) => {
  try {
    const { type, level, status = "published" } = req.query;
    
    let query = { status };
    if (type && type !== "all") {
      query.type = type;
    }
    if (level && level !== "all") {
      query.level = level;
    }

    const lectures = await Lecture.find(query)
      .sort({ date: 1, createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Lectures retrieved successfully",
      lectures,
      count: lectures.length
    });
  } catch (error) {
    console.error("Error fetching lectures:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lectures",
      error: error.message
    });
  }
};

// Get all lectures for admin (includes all statuses)
export const getAllLecturesAdminController = async (req, res) => {
  try {
    const lectures = await Lecture.find({})
      .sort({ date: 1, createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Lectures retrieved successfully",
      lectures,
      count: lectures.length
    });
  } catch (error) {
    console.error("Error fetching lectures for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lectures",
      error: error.message
    });
  }
};

// Get upcoming lectures (public)
export const getUpcomingLecturesController = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const upcomingLectures = await Lecture.find({
      status: "published",
      $or: [
        { 
          "schedule.frequency": "once",
          date: { $gte: currentDate }
        },
        {
          "schedule.frequency": { $ne: "once" }
        }
      ]
    })
    .sort({ date: 1 })
    .limit(10)
    .select('-__v');

    res.status(200).json({
      success: true,
      message: "Upcoming lectures retrieved successfully",
      lectures: upcomingLectures,
      count: upcomingLectures.length
    });
  } catch (error) {
    console.error("Error fetching upcoming lectures:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming lectures",
      error: error.message
    });
  }
};

// Get single lecture by slug (public)
export const getLectureController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const lecture = await Lecture.findOne({ 
      slug, 
      status: "published" 
    }).select('-__v');

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lecture retrieved successfully",
      lecture
    });
  } catch (error) {
    console.error("Error fetching lecture:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lecture",
      error: error.message
    });
  }
};

// Get single lecture by ID (admin)
export const getLectureByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lecture = await Lecture.findById(id).select('-__v');

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lecture retrieved successfully",
      lecture
    });
  } catch (error) {
    console.error("Error fetching lecture:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lecture",
      error: error.message
    });
  }
};

// Create lecture (admin only)
export const createLectureController = async (req, res) => {
  try {
    const {
      title,
      description,
      speaker,
      type = "regular",
      schedule,
      date,
      topics,
      level = "all",
      venue,
      prerequisites,
      learningOutcomes,
      status = "draft",
      registrationRequired = false,
      maxAttendees,
      tags,
      language = "english",
      materials
    } = req.body;

    // Validate required fields
    if (!title || !description || !speaker || !schedule || !venue) {
      return res.status(400).json({
        success: false,
        message: "Title, description, speaker, schedule, and venue are required"
      });
    }

    // Parse JSON fields if they're strings
    let parsedSpeaker, parsedSchedule, parsedVenue, parsedTopics, parsedPrerequisites, parsedLearningOutcomes, parsedTags, parsedMaterials;
    
    try {
      parsedSpeaker = typeof speaker === 'string' ? JSON.parse(speaker) : speaker;
      parsedSchedule = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
      parsedVenue = typeof venue === 'string' ? JSON.parse(venue) : venue;
      parsedTopics = topics ? (typeof topics === 'string' ? JSON.parse(topics) : topics) : [];
      parsedPrerequisites = prerequisites ? (typeof prerequisites === 'string' ? JSON.parse(prerequisites) : prerequisites) : [];
      parsedLearningOutcomes = learningOutcomes ? (typeof learningOutcomes === 'string' ? JSON.parse(learningOutcomes) : learningOutcomes) : [];
      parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
      parsedMaterials = materials ? (typeof materials === 'string' ? JSON.parse(materials) : materials) : [];
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
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
          folder: "mcan/lectures"
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Error uploading image"
        });
      }
    }

    // Handle speaker image upload
    let speakerImageUrl = null;
    if (req.files?.speakerImage) {
      try {
        const result = await cloudinary.uploader.upload(req.files.speakerImage.tempFilePath, {
          folder: "mcan/speakers"
        });
        speakerImageUrl = result.secure_url;
        parsedSpeaker.image = speakerImageUrl;
      } catch (uploadError) {
        console.error("Speaker image upload error:", uploadError);
      }
    }

    // Create new lecture
    const newLecture = new Lecture({
      title,
      description,
      speaker: parsedSpeaker,
      type,
      schedule: parsedSchedule,
      date: date ? new Date(date) : undefined,
      topics: parsedTopics,
      level,
      venue: parsedVenue,
      image: imageUrl,
      materials: parsedMaterials,
      prerequisites: parsedPrerequisites,
      learningOutcomes: parsedLearningOutcomes,
      status,
      registrationRequired: registrationRequired === 'true' || registrationRequired === true,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      tags: parsedTags,
      language
    });

    await newLecture.save();

    res.status(201).json({
      success: true,
      message: "Lecture created successfully",
      lecture: newLecture
    });
  } catch (error) {
    console.error("Error creating lecture:", error);
    res.status(500).json({
      success: false,
      message: "Error creating lecture",
      error: error.message
    });
  }
};

// Update lecture (admin only)
export const updateLectureController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find existing lecture
    const existingLecture = await Lecture.findById(id);
    if (!existingLecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    // Handle image upload if provided
    if (req.files?.image) {
      try {
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
          folder: "mcan/lectures"
        });
        updateData.image = result.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Error uploading image"
        });
      }
    }

    // Handle speaker image upload if provided
    if (req.files?.speakerImage) {
      try {
        const result = await cloudinary.uploader.upload(req.files.speakerImage.tempFilePath, {
          folder: "mcan/speakers"
        });
        if (updateData.speaker) {
          const speaker = typeof updateData.speaker === 'string' ? JSON.parse(updateData.speaker) : updateData.speaker;
          speaker.image = result.secure_url;
          updateData.speaker = speaker;
        }
      } catch (uploadError) {
        console.error("Speaker image upload error:", uploadError);
      }
    }

    // Parse JSON fields if they're strings
    ['speaker', 'schedule', 'venue', 'topics', 'prerequisites', 'learningOutcomes', 'tags', 'materials'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (error) {
          // Keep original value if parsing fails
        }
      }
    });

    // Parse date if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    // Parse boolean and number fields
    if (updateData.registrationRequired !== undefined) {
      updateData.registrationRequired = updateData.registrationRequired === 'true' || updateData.registrationRequired === true;
    }
    if (updateData.maxAttendees) {
      updateData.maxAttendees = parseInt(updateData.maxAttendees);
    }

    // Update lecture
    const updatedLecture = await Lecture.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      lecture: updatedLecture
    });
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(500).json({
      success: false,
      message: "Error updating lecture",
      error: error.message
    });
  }
};

// Delete lecture (admin only)
export const deleteLectureController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLecture = await Lecture.findByIdAndDelete(id);
    
    if (!deletedLecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
      lecture: deletedLecture
    });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting lecture",
      error: error.message
    });
  }
};
