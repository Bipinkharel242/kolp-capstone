import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AppLayout from "../components/AppLayout";

function Dashboard() {
  const [message, setMessage] = useState("Loading system status...");
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("kolpDarkMode") === "true"
  );

  useEffect(() => {
    const savedUser = localStorage.getItem("kolpUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    axios
      .get("http://localhost:5000/api/courses")
      .then((response) => setCourses(response.data))
      .catch(() => {});

    axios
      .get("http://localhost:5000/api/enrollments")
      .then((response) => setEnrollments(response.data))
      .catch(() => {});

    axios
      .get("http://localhost:5000/")
      .then((response) => {
        if (typeof response.data === "string") {
          setMessage(response.data);
        } else {
          setMessage("System connected successfully");
        }
      })
      .catch(() => {
        setMessage("Could not connect to backend.");
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

  const studentCourses =
    user?.role === "Student"
      ? enrollments.filter((item) => item.student_email === user.email)
      : [];

  const instructorCourses =
    user?.role === "Instructor"
      ? courses.filter((course) => course.assigned_instructor_email === user.email)
      : [];

  const adminStats = {
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    totalStudents: [...new Set(enrollments.map((item) => item.student_email))].length,
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
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
        stat: "#7dd3fc",
        innerBg: "rgba(30, 41, 59, 0.65)",
        innerBorder: "rgba(255,255,255,0.06)",
      }
    : {
        heroBg:
          "linear-gradient(135deg, #0f172a 0%, #2563eb 45%, #06b6d4 100%)",
        cardBg: "rgba(255,255,255,0.74)",
        cardBorder: "rgba(15,23,42,0.06)",
        cardShadow: "0 16px 34px rgba(37, 99, 235, 0.12)",
        title: "#0f172a",
        sub: "#64748b",
        text: "#334155",
        stat: "#1d4ed8",
        innerBg: "linear-gradient(135deg, #eff6ff, #ffffff)",
        innerBorder: "#dbeafe",
      };

  const cardStyle = {
    background: theme.cardBg,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: "24px",
    boxShadow: theme.cardShadow,
    padding: "24px",
  };

  const statNumberStyle = {
    margin: "12px 0 0 0",
    fontSize: "34px",
    fontWeight: "800",
    color: theme.stat,
  };

  return (
    <AppLayout title="Dashboard">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.55 }}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "30px",
          padding: "34px",
          color: "white",
          marginBottom: "28px",
          background: theme.heroBg,
          boxShadow: "0 20px 45px rgba(37, 99, 235, 0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-70px",
            right: "-40px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-50px",
            left: "-30px",
            width: "180px",
            height: "180px",
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
            KOLP Academic System
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
            Welcome back{user?.name ? `, ${user.name}` : ""}
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
            A modern learning dashboard designed for students, instructors, and
            administrators with practical access control for courses, content,
            enrollments, and academic discussions.
          </p>

          <div
            style={{
              marginTop: "22px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.14)",
                padding: "10px 16px",
                borderRadius: "999px",
                fontSize: "14px",
              }}
            >
              Role: {user?.role || "Unknown"}
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.14)",
                padding: "10px 16px",
                borderRadius: "999px",
                fontSize: "14px",
              }}
            >
              Status: {message}
            </div>
          </div>
        </div>
      </motion.div>

      {user && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div style={cardStyle}>
            <p style={{ margin: 0, color: theme.sub, fontSize: "12px", letterSpacing: "1px" }}>
              FULL NAME
            </p>
            <h3 style={{ margin: "10px 0 0 0", color: theme.title, fontSize: "24px" }}>
              {user.name}
            </h3>
          </div>

          <div style={cardStyle}>
            <p style={{ margin: 0, color: theme.sub, fontSize: "12px", letterSpacing: "1px" }}>
              EMAIL
            </p>
            <h3 style={{ margin: "10px 0 0 0", color: theme.title, fontSize: "20px" }}>
              {user.email}
            </h3>
          </div>

          <div style={cardStyle}>
            <p style={{ margin: 0, color: theme.sub, fontSize: "12px", letterSpacing: "1px" }}>
              ACCESS ROLE
            </p>
            <h3 style={{ margin: "10px 0 0 0", color: theme.title, fontSize: "24px" }}>
              {user.role}
            </h3>
          </div>
        </motion.div>
      )}

      {user?.role === "Student" && (
        <>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ color: theme.title, marginBottom: "16px", fontSize: "28px" }}
          >
            Student Overview
          </motion.h2>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "28px",
            }}
          >
            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>Enrolled Courses</p>
              <h2 style={statNumberStyle}>{studentCourses.length}</h2>
            </div>

            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>Learning Access</p>
              <h2 style={statNumberStyle}>Enabled</h2>
            </div>

            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>Forum Participation</p>
              <h2 style={statNumberStyle}>Active</h2>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.65, delay: 0.25 }}
            style={cardStyle}
          >
            <h3 style={{ marginTop: 0, color: theme.title, fontSize: "24px" }}>
              My Current Courses
            </h3>

            {studentCourses.length === 0 ? (
              <p style={{ color: theme.sub }}>You are not enrolled in any course yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {studentCourses.map((course, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "18px",
                      borderRadius: "18px",
                      background: theme.innerBg,
                      border: `1px solid ${theme.innerBorder}`,
                    }}
                  >
                    <h4 style={{ margin: "0 0 8px 0", color: theme.title }}>{course.title}</h4>
                    <p style={{ margin: "6px 0", color: theme.text }}>
                      <strong>Instructor:</strong> {course.instructor}
                    </p>
                    <p style={{ margin: "6px 0", color: theme.text }}>
                      <strong>Category:</strong> {course.category}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}

      {user?.role === "Instructor" && (
        <>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ color: theme.title, marginBottom: "16px", fontSize: "28px" }}
          >
            Instructor Overview
          </motion.h2>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "28px",
            }}
          >
            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>Assigned Courses</p>
              <h2 style={statNumberStyle}>{instructorCourses.length}</h2>
            </div>

            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>Content Management</p>
              <h2 style={statNumberStyle}>Enabled</h2>
            </div>

            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>Teaching Access</p>
              <h2 style={statNumberStyle}>Assigned Only</h2>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.65, delay: 0.25 }}
            style={cardStyle}
          >
            <h3 style={{ marginTop: 0, color: theme.title, fontSize: "24px" }}>
              Assigned Course Management
            </h3>

            {instructorCourses.length === 0 ? (
              <p style={{ color: theme.sub }}>No courses assigned yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {instructorCourses.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      padding: "18px",
                      borderRadius: "18px",
                      background: theme.innerBg,
                      border: `1px solid ${theme.innerBorder}`,
                    }}
                  >
                    <h4 style={{ margin: "0 0 8px 0", color: theme.title }}>{course.title}</h4>
                    <p style={{ margin: "6px 0", color: theme.text }}>
                      <strong>Category:</strong> {course.category}
                    </p>
                    <p style={{ margin: "6px 0", color: theme.text }}>
                      <strong>Video Status:</strong> {course.video_url ? "Uploaded" : "Pending"}
                    </p>
                    <p style={{ margin: "6px 0", color: theme.text }}>
                      <strong>Material Status:</strong> {course.material_url ? "Uploaded" : "Pending"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}

      {user?.role === "Admin" && (
        <>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ color: theme.title, marginBottom: "16px", fontSize: "28px" }}
          >
            Admin Overview
          </motion.h2>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "28px",
            }}
          >
            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>Total Courses</p>
              <h2 style={statNumberStyle}>{adminStats.totalCourses}</h2>
            </div>

            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>Total Enrollments</p>
              <h2 style={statNumberStyle}>{adminStats.totalEnrollments}</h2>
            </div>

            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>Active Students</p>
              <h2 style={statNumberStyle}>{adminStats.totalStudents}</h2>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.65, delay: 0.25 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: theme.title, fontSize: "22px" }}>
                Administrative Actions
              </h3>
              <ul style={{ paddingLeft: "18px", color: theme.text, lineHeight: 1.9 }}>
                <li>Create new courses</li>
                <li>Assign instructors to courses</li>
                <li>Manage all course content</li>
                <li>Track student enrollments</li>
              </ul>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: theme.title, fontSize: "22px" }}>
                Institutional Overview
              </h3>
              <p style={{ color: theme.text, lineHeight: 1.8 }}>
                The platform is operating with structured academic access for
                students, instructors, and administrators, supporting practical
                course delivery and role-based management.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AppLayout>
  );
}

export default Dashboard;