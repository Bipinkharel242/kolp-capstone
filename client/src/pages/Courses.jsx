import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AppLayout from "../components/AppLayout";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("kolpDarkMode") === "true"
  );

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("kolpUser"));
    setUser(savedUser);

    axios
      .get("http://localhost:5000/api/courses")
      .then((response) => {
        setCourses(response.data);
      })
      .catch(() => {
        setMessage("Failed to load courses");
      });
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setDarkMode(localStorage.getItem("kolpDarkMode") === "true");
    };

    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(() => {
      setDarkMode(localStorage.getItem("kolpDarkMode") === "true");
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleEnroll = async (courseId) => {
    const savedUser = JSON.parse(localStorage.getItem("kolpUser"));

    if (!savedUser) {
      setActionMessage("Please login first");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/enrollments", {
        student_email: savedUser.email,
        course_id: courseId,
        user_role: savedUser.role,
      });

      setActionMessage(response.data.message);
    } catch (error) {
      setActionMessage(error.response?.data?.message || "Enrollment failed");
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const theme = darkMode
    ? {
        heroBg:
          "linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #0891b2 100%)",
        cardBg: "rgba(15, 23, 42, 0.72)",
        cardBorder: "rgba(255,255,255,0.08)",
        cardShadow: "0 16px 34px rgba(0,0,0,0.28)",
        title: "#f8fafc",
        sub: "#94a3b8",
        text: "#e2e8f0",
        accent: "#7dd3fc",
        buttonBg: "linear-gradient(135deg, #2563eb, #06b6d4)",
        innerBg: "rgba(30, 41, 59, 0.65)",
      }
    : {
        heroBg:
          "linear-gradient(135deg, #0f172a 0%, #2563eb 45%, #06b6d4 100%)",
        cardBg: "rgba(255,255,255,0.76)",
        cardBorder: "rgba(15,23,42,0.06)",
        cardShadow: "0 16px 34px rgba(37,99,235,0.12)",
        title: "#0f172a",
        sub: "#64748b",
        text: "#334155",
        accent: "#1d4ed8",
        buttonBg: "linear-gradient(135deg, #2563eb, #06b6d4)",
        innerBg: "linear-gradient(135deg, #eff6ff, #ffffff)",
      };

  const cardStyle = {
    background: theme.cardBg,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: "24px",
    boxShadow: theme.cardShadow,
    padding: "22px",
  };

  return (
    <AppLayout title="Courses">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "30px",
          padding: "32px",
          color: "white",
          marginBottom: "28px",
          background: theme.heroBg,
          boxShadow: "0 20px 45px rgba(37,99,235,0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-70px",
            right: "-40px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-50px",
            left: "-30px",
            width: "170px",
            height: "170px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#bfdbfe",
            }}
          >
            Course Catalogue
          </p>

          <h1
            style={{
                margin: "14px 0 10px 0",
                fontSize: "40px",
                lineHeight: 1.15,
                fontWeight: "800",
                color: "white",
              }}
          >
            Explore Available Courses
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "760px",
              color: "#dbeafe",
              fontSize: "16px",
              lineHeight: 1.8,
            }}
          >
            Browse the academic catalogue, review available learning units,
            enroll as a student, and access institution-managed teaching content
            based on your role.
          </p>
        </div>
      </motion.div>

      {(message || actionMessage) && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.55, delay: 0.05 }}
          style={{
            ...cardStyle,
            marginBottom: "22px",
            padding: "18px 20px",
          }}
        >
          {message && (
            <p
              style={{
                margin: 0,
                fontWeight: "700",
                color: "#dc2626",
              }}
            >
              {message}
            </p>
          )}

          {actionMessage && (
            <p
              style={{
                margin: message ? "10px 0 0 0" : 0,
                fontWeight: "700",
                color: actionMessage.toLowerCase().includes("failed") ||
                  actionMessage.toLowerCase().includes("only") ||
                  actionMessage.toLowerCase().includes("already")
                  ? "#dc2626"
                  : "#16a34a",
              }}
            >
              {actionMessage}
            </p>
          )}
        </motion.div>
      )}

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.55, delay: 0.1 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "22px",
        }}
      >
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.45, delay: 0.08 * index }}
            style={cardStyle}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "14px",
                marginBottom: "14px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: theme.sub,
                    fontSize: "12px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  {course.category}
                </p>
                <h3
                  style={{
                    margin: "8px 0 0 0",
                    color: theme.title,
                    fontSize: "24px",
                    lineHeight: 1.3,
                  }}
                >
                  {course.title}
                </h3>
              </div>

              <div
                style={{
                  minWidth: "70px",
                  textAlign: "center",
                  padding: "8px 10px",
                  borderRadius: "14px",
                  background: theme.innerBg,
                  color: theme.accent,
                  fontWeight: "700",
                  fontSize: "13px",
                }}
              >
                Course
              </div>
            </div>

            <p
              style={{
                margin: "0 0 14px 0",
                color: theme.text,
                lineHeight: 1.7,
                minHeight: "72px",
              }}
            >
              {course.description}
            </p>

            <div
              style={{
                display: "grid",
                gap: "8px",
                marginBottom: "16px",
                padding: "14px",
                borderRadius: "16px",
                background: theme.innerBg,
              }}
            >
              <p style={{ margin: 0, color: theme.text }}>
                <strong>Instructor:</strong> {course.instructor}
              </p>

              {course.assigned_instructor_email && (
                <p style={{ margin: 0, color: theme.text }}>
                  <strong>Assigned Email:</strong> {course.assigned_instructor_email}
                </p>
              )}

              <p style={{ margin: 0, color: theme.text }}>
                <strong>Video:</strong> {course.video_url ? "Available" : "Not added yet"}
              </p>

              <p style={{ margin: 0, color: theme.text }}>
                <strong>Material:</strong> {course.material_url ? "Available" : "Not added yet"}
              </p>
            </div>

            {user?.role === "Student" && (
              <button
                onClick={() => handleEnroll(course.id)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: theme.buttonBg,
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "15px",
                  boxShadow: "0 12px 24px rgba(37,99,235,0.18)",
                }}
              >
                Enroll Now
              </button>
            )}

            {user?.role === "Instructor" && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: theme.innerBg,
                  color: theme.text,
                  fontWeight: "600",
                }}
              >
                Instructors can manage assigned course content only.
              </div>
            )}

            {user?.role === "Admin" && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: theme.innerBg,
                  color: theme.text,
                  fontWeight: "600",
                }}
              >
                Admin can create courses, assign instructors, and manage all content.
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </AppLayout>
  );
}

export default Courses;