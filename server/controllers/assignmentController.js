const db = require("../config/db");

exports.createAssignment = (req, res) => {
  const {
    course_id,
    title,
    description,
    due_week,
    assignment_type,
    created_by_email,
    created_by_role,
  } = req.body;

  if (
    !course_id ||
    !title ||
    !description ||
    !due_week ||
    !assignment_type ||
    !created_by_email ||
    !created_by_role
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (created_by_role !== "Admin" && created_by_role !== "Instructor") {
    return res.status(403).json({ message: "Only Admin or Instructor can create assignments" });
  }

  const sql = `
    INSERT INTO course_assignments
    (course_id, title, description, due_week, assignment_type, created_by_email, created_by_role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      course_id,
      title,
      description,
      due_week,
      assignment_type,
      created_by_email,
      created_by_role,
    ],
    (err, result) => {
      if (err) {
        console.error("Create assignment error:", err);
        return res.status(500).json({ message: "Failed to create assignment" });
      }

      res.status(201).json({
        message: "Assignment created successfully",
        assignmentId: result.insertId,
      });
    }
  );
};

exports.getAssignmentsByCourse = (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT *
    FROM course_assignments
    WHERE course_id = ?
    ORDER BY due_week ASC, created_at DESC
  `;

  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error("Fetch assignments error:", err);
      return res.status(500).json({ message: "Failed to fetch assignments" });
    }

    res.status(200).json(result);
  });
};