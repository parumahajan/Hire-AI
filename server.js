const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Import routes
const uploadRoutes = require("./routes/upload");
const analyzeRoutes = require("./routes/analyze");
const interviewRoutes = require("./routes/interview");

// Use routes
app.use("/api/upload", uploadRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/interview", interviewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Resume Analyzer API is running...");
});
