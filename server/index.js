import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import { createServer } from "http";

import { connectToDb } from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import { initializeSocket } from "./src/config/socket.js";
import authRoutes from "./src/routes/User.js";
import postRoutes from "./src/routes/Post.js";
import categoryRoutes from "./src/routes/Category.js";
import eventRoutes from "./src/routes/Event.js";
import blogRoutes from "./src/routes/Blog.js";
import serviceRoutes from "./src/routes/Service.js";
import lectureRoutes from "./src/routes/Lecture.js";
import quranClassRoutes from "./src/routes/QuranClass.js";
import resourceRoutes from "./src/routes/Resource.js";
import communityRoutes from "./src/routes/Community.js";
import donationRoutes from "./src/routes/Donation.js";
import bookingRoutes from "./src/routes/Booking.js";
import messageRoutes from "./src/routes/Message.js";

// Load environment variables from .env file
dotenv.config({ path: './.env' });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

// Connect to database with error handling
try {
  connectToDb();
} catch (error) {
  console.error("Failed to connect to database:", error);
  process.exit(1);
}

// Connect to Redis
connectRedis();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'https://mcanlogde1.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove any undefined values
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true,
  preserveExtension: true,
  safeFileNames: true,
  debug: process.env.NODE_ENV === 'development'
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) =>{
  res.send("Welcome")
})

// Routes
app.use("/auth/api", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/quran-classes", quranClassRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Socket.IO server initialized`);
});
