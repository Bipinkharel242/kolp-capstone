const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  submitAssignment,
  getSubmissionsByStudent,
  getSubmissionsByCourse,
  deleteSubmission,
} = require("../controllers/submissionController");

router.post("/submissions", upload.single("file"), submitAssignment);
router.get("/submissions/student/:email", getSubmissionsByStudent);
router.get("/submissions/course/:courseId", getSubmissionsByCourse);
router.delete("/submissions/:submissionId", deleteSubmission);

module.exports = router;