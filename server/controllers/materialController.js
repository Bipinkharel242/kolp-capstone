const db = require("../config/db");

exports.uploadMaterial = (req, res) => {
  const {
    course_id,
    week_no,
    title,
    material_type,
    uploaded_by_email,
    uploaded_by_role,
  } = req.body;

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "File is required" });
  }

  const file_path = file.path;

  const sql = `
    INSERT INTO course_materials 
    (course_id, week_no, title, material_type, file_name, file_path, uploaded_by_email, uploaded_by_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      course_id,
      week_no,
      title,
      material_type,
      file.originalname,
      file_path,
      uploaded_by_email,
      uploaded_by_role,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Upload failed" });
      }

      res.json({ message: "File uploaded successfully" });
    }
  );
};

exports.getMaterialsByCourse = (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT *
    FROM course_materials
    WHERE course_id = ?
    ORDER BY week_no ASC, created_at DESC
  `;

  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error("Fetch materials error:", err);
      return res.status(500).json({ message: "Failed to fetch materials" });
    }

    res.status(200).json(result);
  });
};