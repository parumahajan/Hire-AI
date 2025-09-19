const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Validate MongoDB URI
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

// MongoDB Connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Import Routes
const uploadRoutes = require("./routes/upload");
const analyzeRoutes = require("./routes/analyze");
const interviewRoutes = require("./routes/interview");
const callRoutes = require("./routes/calls");
const transcribeRoutes = require("./routes/transcribe"); // ✅ Added transcription API
const finalEvaluationRoute = require("./routes/finalevaluation");

// Use Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/transcribe", transcribeRoutes);
app.use("/api/finaleval", finalEvaluationRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Root Route
app.get("/", (req, res) => {
  res.send("Resume Analyzer API is running...");
});
