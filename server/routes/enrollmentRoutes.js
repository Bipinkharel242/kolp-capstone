const express = require("express");
const router = express.Router();

const {
  enrollCourse,
  getEnrollments,
} = require("../controllers/enrollmentController");

const { getStudentCourses } = require("../controllers/getStudentCourses");

router.post("/enrollments", enrollCourse);
router.get("/enrollments", getEnrollments);
router.get("/student-courses/:email", getStudentCourses);

module.exports = router;