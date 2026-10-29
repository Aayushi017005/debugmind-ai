require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { initDB } = require("./config/db");
const bugRoutes = require("./routes/bugRoutes");

const app = express();

// Initialize PostgreSQL database connection gracefully
initDB().catch((err) => {
  console.warn("Database initialization notice:", err.message);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Routes
app.use("/api/bugs", bugRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).send("🚀 DebugMind AI Backend Running");
});

// Start Server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
  });
}

module.exports = app;
