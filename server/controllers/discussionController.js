const db = require("../config/db");

exports.createDiscussion = (req, res) => {
  const { course_id, user_name, message } = req.body;

  if (!course_id || !user_name || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql =
    "INSERT INTO discussions (course_id, user_name, message) VALUES (?, ?, ?)";

  db.query(sql, [course_id, user_name, message], (err, result) => {
    if (err) {
      console.error("Create discussion error:", err);
      return res.status(500).json({ message: "Failed to post discussion" });
    }

    res.status(201).json({ message: "Discussion posted successfully" });
  });
};

exports.getDiscussions = (req, res) => {
  const { course_id } = req.query;

  if (!course_id) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  const sql = `
    SELECT discussions.*, courses.title
    FROM discussions
    JOIN courses ON discussions.course_id = courses.id
    WHERE discussions.course_id = ?
    ORDER BY discussions.posted_at DESC
  `;

  db.query(sql, [course_id], (err, result) => {
    if (err) {
      console.error("Fetch discussions error:", err);
      return res.status(500).json({ message: "Failed to fetch discussions" });
    }

    res.status(200).json(result);
  });
};