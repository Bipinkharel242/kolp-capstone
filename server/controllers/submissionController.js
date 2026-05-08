const db = require("../config/db");

exports.submitAssignment = (req, res) => {
  const { assignment_id, student_email, submission_text } = req.body;
  const file = req.file;

  if (!assignment_id || !student_email) {
    return res.status(400).json({
      message: "Assignment and student email are required",
    });
  }

  const checkSql = `
    SELECT * FROM submissions
    WHERE assignment_id = ? AND student_email = ?
    LIMIT 1
  `;

  db.query(checkSql, [assignment_id, student_email], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Submission check error:", checkErr);
      return res.status(500).json({ message: "Submission check failed" });
    }

    if (checkResult.length > 0) {
      return res.status(400).json({
        message: "You have already submitted this assignment",
      });
    }

    const file_name = file ? file.originalname : null;
    const file_path = file ? file.path : null;

    const insertSql = `
      INSERT INTO submissions 
      (assignment_id, student_email, submission_text, file_name, file_path, status)
      VALUES (?, ?, ?, ?, ?, 'submitted')
    `;

    db.query(
      insertSql,
      [assignment_id, student_email, submission_text || null, file_name, file_path],
      (err) => {
        if (err) {
          console.error("Submit assignment error:", err);
          return res.status(500).json({ message: "Assignment submission failed" });
        }

        res.status(201).json({
          message: "Assignment submitted successfully",
        });
      }
    );
  });
};

exports.getSubmissionsByStudent = (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT *
    FROM submissions
    WHERE student_email = ?
    ORDER BY submitted_at DESC
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Fetch submissions error:", err);
      return res.status(500).json({ message: "Failed to fetch submissions" });
    }

    res.status(200).json(result);
  });
};
exports.getSubmissionsByCourse = (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT 
      s.*,
      ca.title AS assignment_title,
      ca.assignment_type,
      ca.due_week,
      ca.course_id
    FROM submissions s
    INNER JOIN course_assignments ca ON s.assignment_id = ca.id
    WHERE ca.course_id = ?
    ORDER BY s.submitted_at DESC
  `;

  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error("Fetch course submissions error:", err);
      return res.status(500).json({ message: "Failed to fetch submissions" });
    }

    res.status(200).json(result);
  });
};

exports.deleteSubmission = (req, res) => {
  const { submissionId } = req.params;

  const sql = "DELETE FROM submissions WHERE id = ?";

  db.query(sql, [submissionId], (err, result) => {
    if (err) {
      console.error("Delete submission error:", err);
      return res.status(500).json({ message: "Failed to delete submission" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json({
      message: "Submission deleted successfully. Student can submit again.",
    });
  });
};