const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  uploadMaterial,
  getMaterialsByCourse,
} = require("../controllers/materialController");

// POST upload
router.post("/upload", upload.single("file"), uploadMaterial);

// GET materials by course
router.get("/course/:courseId", getMaterialsByCourse);

module.exports = router;