require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const bugRoutes = require("./routes/bugRoutes");

const app = express();

// MongoDB temporarily disabled for deployment
// connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/bugs", bugRoutes);

// Health Check
app.get("/", (req, res) => {
    res.status(200).send("🚀 DebugMind AI Backend Running");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});