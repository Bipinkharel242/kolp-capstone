const express = require("express");
const router = express.Router();

const {
  createAssignment,
  getAssignmentsByCourse,
} = require("../controllers/assignmentController");

router.post("/assignments", createAssignment);
router.get("/assignments/course/:courseId", getAssignmentsByCourse);

module.exports = router;