const db = require("../config/db");

exports.getStudentCourses = (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT c.*
    FROM enrollments e
    INNER JOIN courses c ON e.course_id = c.id
    WHERE e.student_email = ?
    ORDER BY c.id ASC
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching student courses:", err);
      return res.status(500).json({ message: "Failed to fetch student courses" });
    }

    return res.status(200).json(results);
  });
};