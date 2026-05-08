import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppLayout from "../components/AppLayout";

function MyLearning() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseMaterials, setCourseMaterials] = useState({});
  const [courseAssignments, setCourseAssignments] = useState({});
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [submissionText, setSubmissionText] = useState({});
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [submissionLoading, setSubmissionLoading] = useState({});
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("kolpDarkMode") === "true"
  );

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("kolpUser"));
    setUser(savedUser || null);

    if (savedUser?.email) {
      axios
        .get(`http://localhost:5000/api/student-courses/${savedUser.email}`)
        .then(async (response) => {
          const courses = Array.isArray(response.data) ? response.data : [];
          setEnrolledCourses(courses);

          const materialsMap = {};
          const assignmentsMap = {};

          for (const course of courses) {
            try {
              const materialRes = await axios.get(
                `http://localhost:5000/api/materials/course/${course.id}`
              );

              materialsMap[course.id] = Array.isArray(materialRes.data)
                ? materialRes.data
                : [];
            } catch {
              materialsMap[course.id] = [];
            }

            try {
              const assignmentRes = await axios.get(
                `http://localhost:5000/api/assignments/course/${course.id}`
              );

              assignmentsMap[course.id] = Array.isArray(assignmentRes.data)
                ? assignmentRes.data
                : [];
            } catch {
              assignmentsMap[course.id] = [];
            }
          }

          setCourseMaterials(materialsMap);
          setCourseAssignments(assignmentsMap);

          try {
            const submissionRes = await axios.get(
              `http://localhost:5000/api/submissions/student/${savedUser.email}`
            );

            const submissionMap = {};

            if (Array.isArray(submissionRes.data)) {
              submissionRes.data.forEach((submission) => {
                submissionMap[submission.assignment_id] = submission;
              });
            }

            setStudentSubmissions(submissionMap);
          } catch {
            setStudentSubmissions({});
          }
        })
        .catch((error) => {
          console.error("MyLearning load error:", error);
          setMessage("Failed to load learning data.");
        });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDarkMode(localStorage.getItem("kolpDarkMode") === "true");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const allMaterials = Object.values(courseMaterials).flat();
    const allAssignments = Object.values(courseAssignments).flat();
    const uniqueWeeks = new Set(
      allMaterials.map((item) => item.week_no).filter(Boolean)
    );

    return {
      totalCourses: enrolledCourses.length,
      videoCount: enrolledCourses.filter((course) => course.video_url).length,
      materialCount: allMaterials.length,
      activeWeeks: uniqueWeeks.size,
      assignmentCount: allAssignments.length,
    };
  }, [enrolledCourses, courseMaterials, courseAssignments]);

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
        softBg: "rgba(30, 41, 59, 0.65)",
        softBorder: "rgba(255,255,255,0.06)",
        pillBg: "rgba(125,211,252,0.12)",
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
        softBg: "linear-gradient(135deg, #eff6ff, #ffffff)",
        softBorder: "#dbeafe",
        pillBg: "#eff6ff",
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

  const getGroupedMaterials = (materials) => {
    const grouped = {};

    materials.forEach((material) => {
      const weekKey = material.week_no ? `Week ${material.week_no}` : "General";
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(material);
    });

    return grouped;
  };

  const getMaterialButtonLabel = (type) => {
    const normalized = String(type || "").toLowerCase();

    if (normalized === "pdf") return "Open PDF";
    if (normalized === "slide") return "Open Slides";
    if (normalized === "video") return "Open Video";
    if (normalized === "document") return "Open Document";
    if (normalized === "image") return "Open Image";
    return "Open File";
  };

  const handleSubmissionTextChange = (assignmentId, value) => {
    setSubmissionText((prev) => ({
      ...prev,
      [assignmentId]: value,
    }));
  };

  const handleSubmissionFileChange = (assignmentId, file) => {
    setSubmissionFiles((prev) => ({
      ...prev,
      [assignmentId]: file,
    }));
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!user?.email) {
      setSubmissionStatus((prev) => ({
        ...prev,
        [assignmentId]: "Please login again",
      }));
      return;
    }

    try {
      setSubmissionLoading((prev) => ({
        ...prev,
        [assignmentId]: true,
      }));

      const formData = new FormData();
      formData.append("assignment_id", assignmentId);
      formData.append("student_email", user.email);
      formData.append("submission_text", submissionText[assignmentId] || "");

      if (submissionFiles[assignmentId]) {
        formData.append("file", submissionFiles[assignmentId]);
      }

      const response = await axios.post(
        "http://localhost:5000/api/submissions",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmissionStatus((prev) => ({
        ...prev,
        [assignmentId]:
          response.data.message || "Assignment submitted successfully",
      }));

      setStudentSubmissions((prev) => ({
        ...prev,
        [assignmentId]: {
          assignment_id: assignmentId,
          submitted_at: new Date().toISOString(),
          status: "submitted",
        },
      }));

      setSubmissionText((prev) => ({
        ...prev,
        [assignmentId]: "",
      }));

      setSubmissionFiles((prev) => ({
        ...prev,
        [assignmentId]: null,
      }));
    } catch (error) {
      console.error(error);

      setSubmissionStatus((prev) => ({
        ...prev,
        [assignmentId]:
          error.response?.data?.message || "Failed to submit assignment",
      }));
    } finally {
      setSubmissionLoading((prev) => ({
        ...prev,
        [assignmentId]: false,
      }));
    }
  };

  return (
    <AppLayout title="My Learning">
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
              Student Learning Hub
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
              Welcome back{user?.name ? `, ${user.name}` : ""}
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
              Access your enrolled courses, weekly resources, lecture files,
              assessments, and submit assignments.
            </p>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {[
            ["Enrolled Courses", stats.totalCourses],
            ["Main Video Lectures", stats.videoCount],
            ["Uploaded Materials", stats.materialCount],
            ["Active Weeks", stats.activeWeeks],
            ["Assignments", stats.assignmentCount],
          ].map(([label, value]) => (
            <div key={label} style={cardStyle}>
              <p style={{ margin: 0, color: theme.sub }}>{label}</p>
              <h2
                style={{
                  margin: "12px 0 0 0",
                  fontSize: "34px",
                  fontWeight: "800",
                  color: theme.stat,
                }}
              >
                {value}
              </h2>
            </div>
          ))}
        </div>

        <div>
          <h2
            style={{
              color: theme.title,
              marginBottom: "16px",
              fontSize: "28px",
            }}
          >
            Your Course Library
          </h2>

          {message && (
            <div style={{ ...cardStyle, marginBottom: "16px" }}>
              <p style={{ margin: 0, color: "#f87171", fontWeight: 700 }}>
                {message}
              </p>
            </div>
          )}

          {enrolledCourses.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ margin: 0, color: theme.text }}>
                You are not enrolled in any courses yet.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "22px" }}>
              {enrolledCourses.map((course, index) => {
                const materials = courseMaterials[course.id] || [];
                const groupedMaterials = getGroupedMaterials(materials);
                const weekKeys = Object.keys(groupedMaterials);
                const assignments = courseAssignments[course.id] || [];

                return (
                  <div key={`${course.id}-${index}`} style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "16px",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        marginBottom: "18px",
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
                          {course.category || "Course"}
                        </p>

                        <h3
                          style={{
                            margin: "8px 0 8px 0",
                            color: theme.title,
                            fontSize: "30px",
                          }}
                        >
                          {course.title}
                        </h3>
                      </div>

                      <span
                        style={{
                          padding: "10px 14px",
                          borderRadius: "999px",
                          fontWeight: 700,
                          color: theme.title,
                          background: theme.pillBg,
                          border: `1px solid ${theme.softBorder}`,
                        }}
                      >
                        Enrolled
                      </span>
                    </div>

                    <p style={{ margin: "6px 0", color: theme.text }}>
                      <strong>Instructor:</strong>{" "}
                      {course.instructor || "Not assigned"}
                    </p>

                    <p style={{ margin: "6px 0 18px 0", color: theme.text }}>
                      <strong>Description:</strong>{" "}
                      {course.description || "No description"}
                    </p>

                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "18px",
                        background: theme.softBg,
                        border: `1px solid ${theme.softBorder}`,
                        marginBottom: "18px",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 14px 0",
                          color: theme.title,
                          fontSize: "22px",
                        }}
                      >
                        Weekly Learning Materials
                      </h4>

                      {weekKeys.length > 0 ? (
                        <div style={{ display: "grid", gap: "16px" }}>
                          {weekKeys.map((weekKey) => (
                            <div
                              key={weekKey}
                              style={{
                                padding: "16px",
                                borderRadius: "16px",
                                background: darkMode
                                  ? "rgba(15,23,42,0.55)"
                                  : "#ffffff",
                                border: `1px solid ${theme.softBorder}`,
                              }}
                            >
                              <h5
                                style={{
                                  margin: "0 0 12px 0",
                                  color: theme.title,
                                  fontSize: "18px",
                                }}
                              >
                                {weekKey}
                              </h5>

                              <div style={{ display: "grid", gap: "12px" }}>
                                {groupedMaterials[weekKey].map((material) => (
                                  <div
                                    key={material.id}
                                    style={{
                                      padding: "14px",
                                      borderRadius: "14px",
                                      background: theme.softBg,
                                      border: `1px solid ${theme.softBorder}`,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "12px",
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div>
                                        <p
                                          style={{
                                            margin: "0 0 6px 0",
                                            color: theme.title,
                                            fontWeight: 700,
                                          }}
                                        >
                                          {material.title}
                                        </p>

                                        <p
                                          style={{
                                            margin: 0,
                                            color: theme.text,
                                            fontSize: "14px",
                                          }}
                                        >
                                          <strong>Type:</strong>{" "}
                                          {material.material_type}
                                        </p>
                                      </div>

                                      <a
                                        href={`http://localhost:5000/${String(
                                          material.file_path || ""
                                        ).replace(/\\/g, "/")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          textDecoration: "none",
                                          padding: "10px 14px",
                                          borderRadius: "12px",
                                          fontWeight: 700,
                                          color: "#ffffff",
                                          background:
                                            "linear-gradient(135deg, #2563eb, #06b6d4)",
                                        }}
                                      >
                                        {getMaterialButtonLabel(
                                          material.material_type
                                        )}
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: theme.text }}>
                          No uploaded materials yet for this course.
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "18px",
                        background: theme.softBg,
                        border: `1px solid ${theme.softBorder}`,
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 12px 0",
                          color: theme.title,
                          fontSize: "22px",
                        }}
                      >
                        Upcoming Assessments
                      </h4>

                      {assignments.length > 0 ? (
                        <div style={{ display: "grid", gap: "12px" }}>
                          {assignments.map((assignment) => {
                            const submitted =
                              studentSubmissions[assignment.id];

                            return (
                              <div
                                key={assignment.id}
                                style={{
                                  padding: "14px",
                                  borderRadius: "14px",
                                  background: darkMode
                                    ? "rgba(15,23,42,0.55)"
                                    : "#ffffff",
                                  border: `1px solid ${theme.softBorder}`,
                                }}
                              >
                                <p
                                  style={{
                                    margin: "0 0 6px 0",
                                    color: theme.title,
                                    fontWeight: 700,
                                  }}
                                >
                                  {assignment.title}
                                </p>

                                <p
                                  style={{
                                    margin: "4px 0",
                                    color: theme.text,
                                    fontSize: "14px",
                                  }}
                                >
                                  <strong>Type:</strong>{" "}
                                  {assignment.assignment_type}
                                </p>

                                <p
                                  style={{
                                    margin: "4px 0",
                                    color: theme.text,
                                    fontSize: "14px",
                                  }}
                                >
                                  <strong>Due Week:</strong>{" "}
                                  {assignment.due_week}
                                </p>

                                <p
                                  style={{
                                    margin: "6px 0 0 0",
                                    color: theme.text,
                                    fontSize: "14px",
                                  }}
                                >
                                  {assignment.description}
                                </p>

                                {submitted ? (
                                  <div
                                    style={{
                                      marginTop: "16px",
                                      padding: "14px",
                                      borderRadius: "14px",
                                      background: darkMode
                                        ? "rgba(22,163,74,0.12)"
                                        : "#ecfdf5",
                                      border:
                                        "1px solid rgba(34,197,94,0.35)",
                                    }}
                                  >
                                    <p
                                      style={{
                                        margin: "0 0 8px 0",
                                        color: "#22c55e",
                                        fontWeight: 800,
                                      }}
                                    >
                                      Assignment Submitted
                                    </p>

                                    <p
                                      style={{
                                        margin: 0,
                                        color: theme.text,
                                        fontSize: "14px",
                                      }}
                                    >
                                      Submitted on:{" "}
                                      <strong>
                                        {submitted?.submitted_at
                                          ? new Date(
                                              submitted.submitted_at
                                            ).toLocaleString()
                                          : "Recently submitted"}
                                      </strong>
                                    </p>

                                    <p
                                      style={{
                                        margin: "8px 0 0 0",
                                        color: theme.sub,
                                        fontSize: "13px",
                                      }}
                                    >
                                      Submitted.
                                    </p>
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      marginTop: "16px",
                                      padding: "14px",
                                      borderRadius: "14px",
                                      background: darkMode
                                        ? "rgba(15,23,42,0.45)"
                                        : "#f8fafc",
                                      border: `1px solid ${theme.softBorder}`,
                                    }}
                                  >
                                    <p
                                      style={{
                                        margin: "0 0 10px 0",
                                        color: theme.title,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Submit Assignment
                                    </p>

                                    <textarea
                                      rows="3"
                                      placeholder="Enter submission comments or answers..."
                                      value={
                                        submissionText[assignment.id] || ""
                                      }
                                      onChange={(e) =>
                                        handleSubmissionTextChange(
                                          assignment.id,
                                          e.target.value
                                        )
                                      }
                                      style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "12px",
                                        border: `1px solid ${theme.softBorder}`,
                                        marginBottom: "12px",
                                        resize: "vertical",
                                        background: darkMode
                                          ? "#0f172a"
                                          : "#ffffff",
                                        color: theme.text,
                                        boxSizing: "border-box",
                                      }}
                                    />

                                    <input
                                      type="file"
                                      onChange={(e) =>
                                        handleSubmissionFileChange(
                                          assignment.id,
                                          e.target.files[0]
                                        )
                                      }
                                      style={{
                                        marginBottom: "12px",
                                        color: theme.text,
                                      }}
                                    />

                                    <br />

                                    <button
                                      onClick={() =>
                                        handleSubmitAssignment(assignment.id)
                                      }
                                      disabled={
                                        submissionLoading[assignment.id]
                                      }
                                      style={{
                                        padding: "10px 16px",
                                        borderRadius: "12px",
                                        border: "none",
                                        background:
                                          "linear-gradient(135deg, #2563eb, #06b6d4)",
                                        color: "white",
                                        fontWeight: 700,
                                        cursor: submissionLoading[
                                          assignment.id
                                        ]
                                          ? "not-allowed"
                                          : "pointer",
                                      }}
                                    >
                                      {submissionLoading[assignment.id]
                                        ? "Submitting..."
                                        : "Submit Assignment"}
                                    </button>

                                    {submissionStatus[assignment.id] && (
                                      <p
                                        style={{
                                          marginTop: "10px",
                                          color: submissionStatus[
                                            assignment.id
                                          ]
                                            .toLowerCase()
                                            .includes("failed")
                                            ? "#f87171"
                                            : "#22c55e",
                                          fontWeight: 700,
                                          fontSize: "14px",
                                        }}
                                      >
                                        {submissionStatus[assignment.id]}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: theme.text }}>
                          No assignments added yet for this course.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default MyLearning;