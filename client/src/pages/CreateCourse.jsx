import { useState, useEffect } from "react";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import { useNavigate } from "react-router-dom";

function CreateCourse() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("kolpDarkMode") === "true"
  );
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    instructor: "",
    assigned_instructor_email: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("kolpUser"));
    setUser(savedUser || null);

    if (!savedUser || savedUser.role !== "Admin") {
      navigate("/dashboard");
    }
  }, [navigate]);

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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category.trim() ||
      !formData.instructor.trim() ||
      !formData.assigned_instructor_email.trim()
    ) {
      setMessage("All fields are required");
      return;
    }

    if (!user) {
      setMessage("User not found. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post("http://localhost:5000/api/courses", {
        ...formData,
        created_by_role: user.role,
      });

      setMessage(response.data.message || "Course created successfully");

      setFormData({
        title: "",
        description: "",
        category: "",
        instructor: "",
        assigned_instructor_email: "",
      });
    } catch (error) {
      console.error("Create course error:", error);
      setMessage(error.response?.data?.message || "Course creation failed");
    } finally {
      setLoading(false);
    }
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
    padding: "14px 16px",
    borderRadius: "16px",
    border: `1px solid ${theme.inputBorder}`,
    background: theme.inputBg,
    color: theme.title,
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    marginTop: "8px",
  };

  const labelStyle = {
    display: "block",
    color: theme.text,
    fontSize: "14px",
    fontWeight: 600,
  };

  const messageIsError =
    message.toLowerCase().includes("failed") ||
    message.toLowerCase().includes("required") ||
    message.toLowerCase().includes("not found");

  return (
    <AppLayout title="Create Course">
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
              Administration Panel
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
              Create a New Course
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
              Add a new course to the KOLP platform, assign an instructor, and
              expand the learning catalogue for students.
            </p>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
            gap: "24px",
            alignItems: "start",
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
              Course Information
            </p>

            <h3
              style={{
                margin: "12px 0 24px 0",
                color: theme.title,
                fontSize: "28px",
              }}
            >
              Enter Course Details
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Course Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Write a short course description"
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <label style={labelStyle}>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Web Development"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Instructor Name</label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    placeholder="Enter instructor name"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Assigned Instructor Email</label>
                <input
                  type="email"
                  name="assigned_instructor_email"
                  value={formData.assigned_instructor_email}
                  onChange={handleChange}
                  placeholder="Enter instructor email"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: loading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #2563eb, #06b6d4)",
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 12px 24px rgba(37,99,235,0.22)",
                }}
              >
                {loading ? "Creating..." : "Create Course"}
              </button>
            </form>

            {message && (
              <p
                style={{
                  marginTop: "18px",
                  fontWeight: 700,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: messageIsError
                    ? "rgba(248,113,113,0.15)"
                    : "rgba(34,197,94,0.15)",
                  color: messageIsError ? "#f87171" : "#22c55e",
                }}
              >
                {message}
              </p>
            )}
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
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
                Access Control
              </p>

              <h3
                style={{
                  margin: "12px 0 10px 0",
                  color: "#7dd3fc",
                  fontSize: "36px",
                  lineHeight: 1,
                }}
              >
                Admin
              </h3>

              <p
                style={{
                  margin: 0,
                  color: theme.text,
                  fontSize: "16px",
                  lineHeight: 1.7,
                }}
              >
                Only administrators can create and publish new courses in the
                platform.
              </p>
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
                Creation Checklist
              </p>

              <div
                style={{
                  marginTop: "16px",
                  display: "grid",
                  gap: "12px",
                  color: theme.text,
                  fontSize: "15px",
                }}
              >
                <div>• Add a clear course title</div>
                <div>• Write a meaningful description</div>
                <div>• Set the correct category</div>
                <div>• Assign the right instructor</div>
                <div>• Confirm instructor email carefully</div>
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
                Current Admin
              </p>

              <h3
                style={{
                  margin: "12px 0 6px 0",
                  color: theme.title,
                  fontSize: "24px",
                }}
              >
                {user?.name || "Administrator"}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: theme.text,
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                You are currently managing course creation for the KOLP platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default CreateCourse;