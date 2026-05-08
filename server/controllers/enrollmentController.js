const db = require("../config/db");

exports.enrollCourse = (req, res) => {
  const { student_email, course_id, user_role } = req.body;

  if (!student_email || !course_id || !user_role) {
    return res
      .status(400)
      .json({ message: "Student email, course ID, and role are required" });
  }

  if (user_role !== "Student") {
    return res.status(403).json({ message: "Only students can enroll in courses" });
  }

  const checkSql =
    "SELECT * FROM enrollments WHERE student_email = ? AND course_id = ?";

  db.query(checkSql, [student_email, course_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Enrollment check error:", checkErr);
      return res.status(500).json({ message: "Enrollment failed" });
    }

    if (checkResult.length > 0) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    const insertSql =
      "INSERT INTO enrollments (student_email, course_id) VALUES (?, ?)";

    db.query(insertSql, [student_email, course_id], (err) => {
      if (err) {
        console.error("Enroll error:", err);
        return res.status(500).json({ message: "Enrollment failed" });
      }

      res.status(201).json({ message: "Enrolled successfully" });
    });
  });
};

exports.getEnrollments = (req, res) => {
  const sql = `
    SELECT enrollments.id, enrollments.student_email, enrollments.enrolled_at,
           courses.title, courses.category, courses.instructor,
           courses.video_url, courses.material_url
    FROM enrollments
    JOIN courses ON enrollments.course_id = courses.id
    ORDER BY enrollments.enrolled_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Fetch enrollments error:", err);
      return res.status(500).json({ message: "Failed to fetch enrollments" });
    }

    res.status(200).json(result);
  });
};