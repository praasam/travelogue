const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDb = require("./src/Config/db");

// Import Routes
const authRoute = require("./src/Routes/authRoute");
const sentimentRoute = require("./src/Routes/sentimentRoute");
// const reelRoute = require("./src/Routes/reelRoute"); // Ensure it's inside Routes folder
const imageUploadRoute = require("./src/Routes/imageUploadRoute");

const app = express();
const PORT = process.env.PORT || 5000; // Default fallback port

// Connect to Database
connectDb();

// Middleware
app.use(express.json()); // Handle JSON data
app.use(express.urlencoded({ extended: true })); // Handle form data
app.use(cors()); // Enable CORS

// Serve Uploaded Images as Static Files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/auth", authRoute);
app.use("/api/sentiment", sentimentRoute);
// app.use("/api/reels", reelRoute);
app.use("/api/images", imageUploadRoute);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});