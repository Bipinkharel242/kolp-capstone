const db = require("../config/db");

exports.createCourse = (req, res) => {
  const {
    title,
    description,
    category,
    instructor,
    assigned_instructor_email,
    created_by_role,
  } = req.body;

  if (
    !title ||
    !description ||
    !category ||
    !instructor ||
    !assigned_instructor_email ||
    !created_by_role
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (created_by_role !== "Admin") {
    return res.status(403).json({ message: "Only admin can create courses" });
  }

  const sql = `
    INSERT INTO courses 
    (title, description, category, instructor, assigned_instructor_email, created_by_role) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      description,
      category,
      instructor,
      assigned_instructor_email,
      created_by_role,
    ],
    (err, result) => {
      if (err) {
        console.error("Create course error:", err);
        return res.status(500).json({ message: "Course creation failed" });
      }

      res.status(201).json({
        message: "Course created successfully",
        course: {
          id: result.insertId,
          title,
          description,
          category,
          instructor,
          assigned_instructor_email,
        },
      });
    }
  );
};

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

    res.status(200).json(results);
  });
};

exports.getCourses = (req, res) => {
  const sql = "SELECT * FROM courses ORDER BY created_at DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Fetch courses error:", err);
      return res.status(500).json({ message: "Failed to fetch courses" });
    }

    res.status(200).json(result);
  });
};

exports.updateCourseContent = (req, res) => {
  const { id } = req.params;
  const { video_url, material_url, user_email, user_role } = req.body;

  const findSql = "SELECT * FROM courses WHERE id = ?";

  db.query(findSql, [id], (findErr, findResult) => {
    if (findErr) {
      console.error(findErr);
      return res.status(500).json({ message: "Failed to find course" });
    }

    if (findResult.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const course = findResult[0];

    const isAdmin = user_role === "Admin";
    const isAssignedInstructor =
      user_role === "Instructor" &&
      course.assigned_instructor_email === user_email;

    if (!isAdmin && !isAssignedInstructor) {
      return res.status(403).json({
        message: "Only admin or assigned instructor can update this course",
      });
    }

    const updateSql =
      "UPDATE courses SET video_url = ?, material_url = ? WHERE id = ?";

    db.query(updateSql, [video_url, material_url, id], (err) => {
      if (err) {
        console.error("Update course error:", err);
        return res.status(500).json({ message: "Failed to update course" });
      }

      res.status(200).json({ message: "Course content updated successfully" });
    });
  });
};