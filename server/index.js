import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";

import { connectToDb } from "./src/config/db.js";
import authRoutes from "./src/routes/User.js";
import postRoutes from "./src/routes/Post.js";
import categoryRoutes from "./src/routes/Category.js";
import bookingRoutes from "./src/routes/Booking.js";
import eventRoutes from "./src/routes/Event.js";

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

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(fileUpload({ useTempFiles: true }));

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
app.use("/api/booking", bookingRoutes);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
