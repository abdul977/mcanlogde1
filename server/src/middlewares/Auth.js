import UserModel from "../models/User.js";
import JWT from "jsonwebtoken";
import tokenManager from "../utils/tokenManager.js";

export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
      return res
        .status(401)
        .send({ success: false, message: "Authorization header is missing" });
    }

    // Extract token using token manager
    const token = tokenManager.extractTokenFromHeader(authHeader);
    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "No token provided" });
    }

    // Verify access token using new token manager
    const verification = tokenManager.verifyAccessToken(token);

    if (!verification.valid) {
      return res.status(401).send({
        success: false,
        message: "Invalid or expired token",
        error: verification.error
      });
    }

    const decode = verification.decoded;
    console.log("Decoded Token Object:", decode);

    // Ensure we have a user ID (support both _id and id formats)
    const userId = decode._id || decode.id || decode.userId;
    if (!userId) {
      return res
        .status(401)
        .send({ success: false, message: "Token does not contain user ID" });
    }

    // Normalize the user object to always have both _id and id
    req.user = {
      ...decode,
      _id: userId,
      id: userId
    };
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log("User ID from token:", userId);
    if (!userId) {
      return res
        .status(401)
        .send({ success: false, message: "No user ID found in token" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found in database" });
    }

    console.log("User from database:", user);
    if (user?.role !== "admin") {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }
    next();
  } catch (error) {
    console.error("Error in admin middleware:", error);
    res.status(401).send({
      success: false,
      message: "Error in admin middleware",
    });
  }
};

// Aliases for backward compatibility
export const requireAuth = requireSignIn;
export const requireAdmin = isAdmin;
