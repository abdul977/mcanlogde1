import Booking from "../models/Booking.js";
import Post from "../models/Post.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Stripe from "stripe";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const searchBookings = async (req, res) => {
  try {
    const { keyword } = req.params;
    const words = keyword.split(" ");

    const results = await Post.find({
      isAvailable: true,
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: words.join("|"), $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
      ],
    }).select("title location images description mosqueProximity price genderRestriction");

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error searching accommodations",
      error,
    });
  }
};

export const updateAvailability = async (req, res) => {
  const { postId, isAvailable } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid accommodation ID format." });
  }

  try {
    const accommodation = await Post.findByIdAndUpdate(
      postId,
      { isAvailable },
      { new: true }
    );
    
    if (!accommodation) {
      return res.status(404).json({ error: "Accommodation not found." });
    }
    
    res.json({ 
      success: true, 
      message: "Accommodation availability updated",
      accommodation 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const {
      token,
      postId,
      checkInDate,
      duration,
      agreementToRules,
      additionalRequirements,
      emergencyContact,
      nyscDetails,
    } = req.body;

    // Validate required fields
    if (!token || !postId || !checkInDate || !duration || !emergencyContact || !nyscDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking information",
      });
    }

    // Validate Islamic housing agreement
    if (!agreementToRules) {
      return res.status(400).json({
        success: false,
        message: "You must agree to the Islamic housing rules",
      });
    }

    // Decode and verify user token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    const userId = decoded.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify accommodation exists and is available
    const accommodation = await Post.findById(postId);
    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found",
      });
    }

    if (!accommodation.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This accommodation is no longer available",
      });
    }

    // Create booking
    const booking = new Booking({
      user: userId,
      post: postId,
      checkInDate: new Date(checkInDate),
      duration,
      agreementToRules,
      additionalRequirements,
      emergencyContact,
      nyscDetails,
    });

    const savedBooking = await booking.save();

    // Update accommodation availability
    accommodation.isAvailable = false;
    await accommodation.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "name email")
      .populate("post", "title location price");

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "usd", description, customerName, customerAddress } = req.body;

    // Validate required fields
    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        message: "Amount and description are required",
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      description,
      metadata: {
        customerName: customerName || "Unknown",
        customerAddress: JSON.stringify(customerAddress || {}),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error.message,
    });
  }
};
