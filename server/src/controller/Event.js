import Event from "../models/Event.js";
import cloudinary from "../config/cloudinary.js";
import slug from "slugify";

// Get event by ID
export const getEventByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Event fetched successfully",
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while getting event by ID",
      error: error.message,
    });
  }
};

// Get all events
export const getAllEventsController = async (req, res) => {
  try {
    const { status, location, startDate, endDate } = req.query;
    const query = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add location filter if provided
    if (location) {
      query.location = location;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const events = await Event.find(query)
      .sort({ date: 1 }); // Sort by date ascending

    res.status(200).send({
      success: true,
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while getting events",
      error: error.message,
    });
  }
};

// Get single event
export const getEventController = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Event fetched successfully",
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while getting event",
      error: error.message,
    });
  }
};

// Create event
export const createEventController = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      status = "draft"
    } = req.body;

    // Validate required fields
    const requiredFields = {
      title,
      description,
      date,
      location
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Handle image upload
    if (!req.files?.image) {
      return res.status(400).json({
        success: false,
        message: "Event image is required"
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);

    // Create new event
    const newEvent = new Event({
      title,
      description,
      date: new Date(date),
      location,
      status,
      image: result.secure_url,
      slug: slug(title, { lower: true }),
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message
    });
  }
};

// Update event
export const updateEventController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      location,
      status
    } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Handle image update if provided
    let imageUrl = event.image;
    if (req.files?.image) {
      // Delete old image from Cloudinary
      const publicId = event.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);

      // Upload new image
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
      imageUrl = result.secure_url;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        description,
        date: date ? new Date(date) : event.date,
        location,
        status,
        image: imageUrl,
        slug: title ? slug(title, { lower: true }) : event.slug,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message
    });
  }
};

// Delete event
export const deleteEventController = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Delete image from Cloudinary
    const publicId = event.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    // Delete event
    await Event.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message
    });
  }
};

// Get upcoming events
export const getUpcomingEventsController = async (req, res) => {
  try {
    const events = await Event.find({
      status: "published",
      date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .limit(3);

    res.status(200).send({
      success: true,
      message: "Upcoming events fetched successfully",
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while getting upcoming events",
      error: error.message,
    });
  }
};
