import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppLayout from "../components/AppLayout";

function Forum() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [discussions, setDiscussions] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("kolpDarkMode") === "true"
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/courses");
        setCourses(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load courses:", error);
        setStatusMessage("Failed to load courses");
      }
    };

    loadCourses();
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

  const loadDiscussions = async (courseId) => {
    if (!courseId) {
      setDiscussions([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/discussions?course_id=${courseId}`
      );
      setDiscussions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load discussions:", error);
      setStatusMessage("Failed to load discussions");
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setStatusMessage("");
    setDiscussions([]);
    loadDiscussions(courseId);
  };

  const handlePost = async (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("kolpUser"));

    if (!savedUser) {
      setStatusMessage("Please login first");
      return;
    }

    if (!selectedCourse) {
      setStatusMessage("Please select a course first");
      return;
    }

    if (!messageText.trim()) {
      setStatusMessage("Please write a message");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/discussions", {
        course_id: selectedCourse,
        user_name: savedUser.name,
        message: messageText.trim(),
      });

      setStatusMessage(response.data.message || "Discussion posted successfully");
      setMessageText("");
      await loadDiscussions(selectedCourse);
    } catch (error) {
      console.error("Failed to post discussion:", error);
      setStatusMessage(
        error.response?.data?.message || "Failed to post discussion"
      );
    }
  };

  const selectedCourseTitle = useMemo(() => {
    return (
      courses.find((course) => String(course.id) === String(selectedCourse))
        ?.title || "No course selected"
    );
  }, [courses, selectedCourse]);

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
        inputBg: "rgba(30, 41, 59, 0.9)",
        inputBorder: "rgba(255,255,255,0.08)",
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
        inputBg: "#ffffff",
        inputBorder: "#cbd5e1",
      };

  const cardStyle = {
    background: theme.cardBg,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: "24px",
    boxShadow: theme.cardShadow,
    padding: "28px",
  };

  const inputStyle = {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "16px",
    border: `1px solid ${theme.inputBorder}`,
    background: theme.inputBg,
    color: theme.title,
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <AppLayout title="Forum">
      <div style={{ display: "grid", gap: "24px" }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "30px",
            padding: "34px",
            color: "white",
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
              Community Discussion Space
            </p>

            <h2
              style={{
                margin: "14px 0 10px 0",
                fontSize: "40px",
                lineHeight: 1.15,
                fontWeight: "800",
                color: "white",
              }}
            >
              Join Course Conversations
            </h2>

            <p
              style={{
                margin: 0,
                maxWidth: "760px",
                color: "#dbeafe",
                fontSize: "16px",
                lineHeight: 1.8,
              }}
            >
              Select a course, ask questions, post updates, and interact with the
              academic discussion community.
            </p>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <p
              style={{
                margin: 0,
                color: theme.sub,
                fontSize: "13px",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Select Course
            </p>

            <h3
              style={{
                margin: "12px 0 18px 0",
                color: theme.title,
                fontSize: "28px",
              }}
            >
              {selectedCourseTitle}
            </h3>

            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              style={inputStyle}
            >
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div style={cardStyle}>
            <p
              style={{
                margin: 0,
                color: theme.sub,
                fontSize: "13px",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Discussion Status
            </p>

            <h3
              style={{
                margin: "14px 0 10px 0",
                color: theme.stat,
                fontSize: "48px",
                lineHeight: 1,
              }}
            >
              {selectedCourse ? discussions.length : 0}
            </h3>

            <p
              style={{
                margin: 0,
                color: theme.text,
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              {selectedCourse
                ? "Messages in the selected course discussion"
                : "Select a course to view and post discussions"}
            </p>
          </div>
        </div>

        <div style={cardStyle}>
          <p
            style={{
              margin: 0,
              color: theme.sub,
              fontSize: "13px",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            New Discussion Post
          </p>

          <h3
            style={{
              margin: "12px 0 18px 0",
              color: theme.title,
              fontSize: "28px",
            }}
          >
            Write a Message
          </h3>

          <form onSubmit={handlePost}>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows="6"
              placeholder="Share your thoughts here..."
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                style={{
                  padding: "14px 24px",
                  borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(37,99,235,0.20)",
                }}
              >
                Post Message
              </button>

              {statusMessage && (
                <span
                  style={{
                    color:
                      statusMessage.toLowerCase().includes("success") ||
                      statusMessage.toLowerCase().includes("posted")
                        ? "#22c55e"
                        : "#f87171",
                    fontWeight: 700,
                  }}
                >
                  {statusMessage}
                </span>
              )}
            </div>
          </form>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          {!selectedCourse ? (
            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.text }}>
                Please select a course to view discussion posts.
              </p>
            </div>
          ) : discussions.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.text }}>
                No discussion posts yet for this course.
              </p>
            </div>
          ) : (
            discussions.map((item) => (
              <div key={item.id} style={cardStyle}>
                <h3 style={{ margin: "0 0 8px 0", color: theme.title }}>
                  {item.title || selectedCourseTitle}
                </h3>

                <p style={{ margin: "8px 0", color: theme.text }}>
                  <strong>User:</strong> {item.user_name}
                </p>

                {item.posted_at && (
                  <p style={{ margin: "8px 0", color: theme.sub, fontSize: "14px" }}>
                    <strong>Posted:</strong>{" "}
                    {new Date(item.posted_at).toLocaleString()}
                  </p>
                )}

                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: theme.text,
                    lineHeight: 1.7,
                  }}
                >
                  {item.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default Forum;