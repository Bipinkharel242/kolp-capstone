import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppLayout from "../components/AppLayout";

function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("kolpDarkMode") === "true"
  );

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/enrollments")
      .then((response) => {
        setEnrollments(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Enrollments load error:", error);
        setMessage("Failed to load enrollments");
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

  const stats = useMemo(() => {
    const uniqueStudents = new Set(
      enrollments.map((item) => item.student_email).filter(Boolean)
    ).size;

    const uniqueCourses = new Set(
      enrollments.map((item) => item.title || item.course_id).filter(Boolean)
    ).size;

    const uniqueInstructors = new Set(
      enrollments.map((item) => item.instructor).filter(Boolean)
    ).size;

    return {
      totalEnrollments: enrollments.length,
      totalStudents: uniqueStudents,
      totalCourses: uniqueCourses,
      totalInstructors: uniqueInstructors,
    };
  }, [enrollments]);

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
        stat: "#1d4ed8",
        innerBg: "linear-gradient(135deg, #eff6ff, #ffffff)",
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

  return (
    <AppLayout title="Enrollments">
      <div style={{ display: "grid", gap: "24px" }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "30px",
            padding: "32px",
            color: "white",
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
              Enrollment Management
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
              Student Course Enrollments
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
              View course participation, track enrolled students, and monitor
              instructor-linked learning access across the KOLP platform.
            </p>
          </div>
        </section>

        {message && (
          <div
            style={{
              ...cardStyle,
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: "700",
                color: "#dc2626",
              }}
            >
              {message}
            </p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <p style={{ margin: 0, color: theme.sub }}>Total Enrollments</p>
            <h2
              style={{
                margin: "12px 0 0 0",
                fontSize: "34px",
                fontWeight: "800",
                color: theme.stat,
              }}
            >
              {stats.totalEnrollments}
            </h2>
          </div>

          <div style={cardStyle}>
            <p style={{ margin: 0, color: theme.sub }}>Active Students</p>
            <h2
              style={{
                margin: "12px 0 0 0",
                fontSize: "34px",
                fontWeight: "800",
                color: theme.stat,
              }}
            >
              {stats.totalStudents}
            </h2>
          </div>

          <div style={cardStyle}>
            <p style={{ margin: 0, color: theme.sub }}>Courses In Use</p>
            <h2
              style={{
                margin: "12px 0 0 0",
                fontSize: "34px",
                fontWeight: "800",
                color: theme.stat,
              }}
            >
              {stats.totalCourses}
            </h2>
          </div>

          <div style={cardStyle}>
            <p style={{ margin: 0, color: theme.sub }}>Instructors</p>
            <h2
              style={{
                margin: "12px 0 0 0",
                fontSize: "34px",
                fontWeight: "800",
                color: theme.stat,
              }}
            >
              {stats.totalInstructors}
            </h2>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div style={cardStyle}>
            <p style={{ margin: 0, color: theme.text }}>
              No enrollments found yet.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "22px",
            }}
          >
            {enrollments.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
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
                      {item.category || "Enrollment"}
                    </p>
                    <h3
                      style={{
                        margin: "8px 0 0 0",
                        color: theme.title,
                        fontSize: "24px",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title || "Course"}
                    </h3>
                  </div>

                  <div
                    style={{
                      minWidth: "86px",
                      textAlign: "center",
                      padding: "8px 10px",
                      borderRadius: "14px",
                      background: theme.innerBg,
                      color: theme.stat,
                      fontWeight: "700",
                      fontSize: "13px",
                    }}
                  >
                    Enrolled
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                    padding: "14px",
                    borderRadius: "16px",
                    background: theme.innerBg,
                  }}
                >
                  <p style={{ margin: 0, color: theme.text }}>
                    <strong>Student:</strong> {item.student_email}
                  </p>
                  <p style={{ margin: 0, color: theme.text }}>
                    <strong>Instructor:</strong> {item.instructor || "Not assigned"}
                  </p>
                  <p style={{ margin: 0, color: theme.text }}>
                    <strong>Category:</strong> {item.category || "N/A"}
                  </p>
                  {item.enrolled_at && (
                    <p style={{ margin: 0, color: theme.text }}>
                      <strong>Enrolled At:</strong> {item.enrolled_at}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Enrollments;