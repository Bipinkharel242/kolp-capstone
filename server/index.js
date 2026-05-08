require("dotenv").config();

const express = require("express");
const cors = require("cors");
require("./config/db");

const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const authRoutes = require("./routes/authRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const materialRoutes = require("./routes/materialRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("KOLP Server is running");
});

app.use("/api", authRoutes);
app.use("/api", courseRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", discussionRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api", assignmentRoutes);
app.use("/api", submissionRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});