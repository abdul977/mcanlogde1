import User from "../models/User.js";
import JWT from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Register controller
export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // hash password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// login controller
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = JWT.sign({
      _id: user._id,
      id: user._id,
      role: user.role
    }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const getUserInfo = (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // Get token from Authorization header

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  JWT.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const user = await User.findById(decoded.id).select('-password'); // Exclude password
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          gender: user.gender,
          stateCode: user.stateCode,
          batch: user.batch,
          stream: user.stream,
          callUpNumber: user.callUpNumber,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          institution: user.institution,
          course: user.course,
          profileCompleted: user.profileCompleted,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
};

// Get user profile (protected route)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        stateCode: user.stateCode,
        batch: user.batch,
        stream: user.stream,
        callUpNumber: user.callUpNumber,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        institution: user.institution,
        course: user.course,
        profileCompleted: user.profileCompleted,
        nyscDetails: user.nyscDetails,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Update user profile
// Refresh token controller
export const refreshTokenController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing"
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify the current token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id || decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate new token
    const newToken = JWT.sign({
      _id: user._id,
      id: user._id,
      role: user.role
    }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// Logout controller
export const logoutController = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // But we can still provide a logout endpoint for consistency and future token blacklisting
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout"
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      gender,
      stateCode,
      batch,
      stream,
      callUpNumber,
      phone,
      dateOfBirth,
      institution,
      course
    } = req.body;

    // Only validate fields that are being updated (allow partial updates)
    const fieldsToUpdate = {};
    if (name && name.trim()) fieldsToUpdate.name = name.trim();
    if (gender) fieldsToUpdate.gender = gender;
    if (stateCode) fieldsToUpdate.stateCode = stateCode.toUpperCase();
    if (batch) fieldsToUpdate.batch = batch;
    if (stream) fieldsToUpdate.stream = stream;
    if (callUpNumber) fieldsToUpdate.callUpNumber = callUpNumber;
    if (phone) fieldsToUpdate.phone = phone;
    if (dateOfBirth) fieldsToUpdate.dateOfBirth = dateOfBirth;
    if (institution) fieldsToUpdate.institution = institution;
    if (course) fieldsToUpdate.course = course;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    // Validate enum values only if they're being updated
    if (fieldsToUpdate.gender && !['male', 'female'].includes(fieldsToUpdate.gender)) {
      return res.status(400).json({
        success: false,
        message: "Gender must be either 'male' or 'female'"
      });
    }

    if (fieldsToUpdate.stream && !['A', 'B', 'C'].includes(fieldsToUpdate.stream)) {
      return res.status(400).json({
        success: false,
        message: "Stream must be A, B, or C"
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        gender: updatedUser.gender,
        stateCode: updatedUser.stateCode,
        batch: updatedUser.batch,
        stream: updatedUser.stream,
        callUpNumber: updatedUser.callUpNumber,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        institution: updatedUser.institution,
        course: updatedUser.course,
        profileCompleted: updatedUser.profileCompleted,
        nyscDetails: updatedUser.nyscDetails,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
