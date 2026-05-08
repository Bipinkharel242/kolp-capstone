const express = require("express");

const router = express.Router();
const {
  createCourse,
  getCourses,
  updateCourseContent,
} = require("../controllers/courseController");

router.post("/courses", createCourse);
router.get("/courses", getCourses);
router.put("/courses/:id/content", updateCourseContent);

module.exports = router;