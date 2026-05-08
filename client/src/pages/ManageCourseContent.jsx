import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import { useNavigate } from "react-router-dom";

const createWeeklyContent = () =>
  Array.from({ length: 12 }, (_, index) => ({
    week: index + 1,
    topic: "",
    tutorial_activity: "",
    video_url: "",
    material_url: "",
    extra_link: "",
    image_or_file_url: "",
  }));

const createAssessments = () => [
  {
    title: "Assessment 1",
    type: "Quiz",
    due_week: 3,
    description: "",
  },
  {
    title: "Assessment 2",
    type: "Assignment",
    due_week: 6,
    description: "",
  },
  {
    title: "Assessment 3",
    type: "Project",
    due_week: 9,
    description: "",
  },
  {
    title: "Assessment 4",
    type: "Final Assessment",
    due_week: 12,
    description: "",
  },
];

function ManageCourseContent() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [message, setMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("kolpDarkMode") === "true"
  );
  const [savingStructure, setSavingStructure] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [videoUrl, setVideoUrl] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");

  const [weeklyContent, setWeeklyContent] = useState(createWeeklyContent());
  const [assessments, setAssessments] = useState(createAssessments());

  const [uploadForm, setUploadForm] = useState({
    week_no: "1",
    title: "",
    material_type: "pdf",
    file: null,
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("kolpUser"));
    setUser(savedUser);

    if (
      !savedUser ||
      (savedUser.role !== "Instructor" && savedUser.role !== "Admin")
    ) {
      navigate("/dashboard");
      return;
    }

    axios
      .get("http://localhost:5000/api/courses")
      .then((response) => {
        const allCourses = Array.isArray(response.data) ? response.data : [];

        if (savedUser.role === "Admin") {
          setCourses(allCourses);
        } else {
          const assigned = allCourses.filter(
            (course) => course.assigned_instructor_email === savedUser.email
          );
          setCourses(assigned);
        }
      })
      .catch(() => {
        setMessage("Failed to load courses");
      });
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

  const selectedCourseDetails = useMemo(() => {
    return courses.find((course) => String(course.id) === String(selectedCourse));
  }, [courses, selectedCourse]);

  const handleWeeklyChange = (index, field, value) => {
    setWeeklyContent((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAssessmentChange = (index, field, value) => {
    setAssessments((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleLoadCourseDefaults = () => {
    if (!selectedCourseDetails) return;

    setVideoUrl(selectedCourseDetails.video_url || "");
    setMaterialUrl(selectedCourseDetails.material_url || "");
    setMessage("Base course content loaded. You can now update weekly plan.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse) {
      setMessage("Please select a course");
      return;
    }

    if (!user) {
      setMessage("User not found. Please login again.");
      return;
    }

    try {
      setSavingStructure(true);

      const payload = {
        video_url: videoUrl,
        material_url: materialUrl,
        user_email: user.email,
        user_role: user.role,
        weekly_content: weeklyContent,
        assessments: assessments,
      };

      const response = await axios.put(
        `http://localhost:5000/api/courses/${selectedCourse}/content`,
        payload
      );

      setMessage(response.data.message || "Course content updated successfully");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update course content and weekly structure"
      );
    } finally {
      setSavingStructure(false);
    }
  };

  const handleUploadFieldChange = (e) => {
    const { name, value } = e.target;
    setUploadForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setUploadForm((prev) => ({
      ...prev,
      file: e.target.files[0] || null,
    }));
  };
const loadCourseSubmissions = async (courseId) => {
  if (!courseId) return;

  try {
    setLoadingSubmissions(true);

    const response = await axios.get(
      `http://localhost:5000/api/submissions/course/${courseId}`
    );

    setCourseSubmissions(
      Array.isArray(response.data) ? response.data : []
    );
  } catch (error) {
    console.error(error);
    setCourseSubmissions([]);
  } finally {
    setLoadingSubmissions(false);
  }
};
  const handleUploadMaterial = async (e) => {
    e.preventDefault();

    if (!selectedCourse) {
      setUploadMessage("Please select a course first");
      return;
    }

    if (!uploadForm.title.trim()) {
      setUploadMessage("Please enter a material title");
      return;
    }

    if (!uploadForm.file) {
      setUploadMessage("Please choose a file to upload");
      return;
    }

    if (!user) {
      setUploadMessage("User not found. Please login again.");
      return;
    }

    try {
      setUploadingFile(true);
      setUploadMessage("");

      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("course_id", selectedCourse);
      formData.append("week_no", uploadForm.week_no);
      formData.append("title", uploadForm.title);
      formData.append("material_type", uploadForm.material_type);
      formData.append("uploaded_by_email", user.email);
      formData.append("uploaded_by_role", user.role);

      const response = await axios.post(
        "http://localhost:5000/api/materials/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadMessage(response.data.message || "File uploaded successfully");

      setUploadForm({
        week_no: "1",
        title: "",
        material_type: "pdf",
        file: null,
      });

      const fileInput = document.getElementById("course-material-file");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(error);
      setUploadMessage(
        error.response?.data?.message || "File upload failed"
      );
    } finally {
      setUploadingFile(false);
    }
  };
  const handleAssignmentFieldChange = (e) => {
  const { name, value } = e.target;
  setAssignmentForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleCreateAssignment = async (e) => {
  e.preventDefault();

  if (!selectedCourse) {
    setAssignmentMessage("Please select a course first");
    return;
  }

  if (!assignmentForm.title.trim() || !assignmentForm.description.trim()) {
    setAssignmentMessage("Please complete all assignment fields");
    return;
  }

  if (!user) {
    setAssignmentMessage("User not found. Please login again.");
    return;
  }

  try {
    setAssignmentLoading(true);
    setAssignmentMessage("");

    const response = await axios.post("http://localhost:5000/api/assignments", {
      course_id: selectedCourse,
      title: assignmentForm.title,
      description: assignmentForm.description,
      due_week: assignmentForm.due_week,
      assignment_type: assignmentForm.assignment_type,
      created_by_email: user.email,
      created_by_role: user.role,
    });

    setAssignmentMessage(
      response.data.message || "Assignment created successfully"
    );

    setAssignmentForm({
      title: "",
      description: "",
      due_week: "1",
      assignment_type: "assignment",
    });
  } catch (error) {
    console.error(error);
    setAssignmentMessage(
      error.response?.data?.message || "Failed to create assignment"
    );
  } finally {
    setAssignmentLoading(false);
  }
};
const handleDeleteSubmission = async (submissionId) => {
  const confirmed = window.confirm(
    "Delete this submission? Student will be able to submit again."
  );

  if (!confirmed) return;

  try {
    const response = await axios.delete(
      `http://localhost:5000/api/submissions/${submissionId}`
    );

    setSubmissionActionMessage(
      response.data.message || "Submission deleted"
    );

    setCourseSubmissions((prev) =>
      prev.filter((item) => item.id !== submissionId)
    );
  } catch (error) {
    console.error(error);

    setSubmissionActionMessage(
      error.response?.data?.message ||
        "Failed to delete submission"
    );
  }
};
const [assignmentForm, setAssignmentForm] = useState({
  title: "",
  description: "",
  due_week: "1",
  assignment_type: "assignment",
});

const [assignmentMessage, setAssignmentMessage] = useState("");
const [assignmentLoading, setAssignmentLoading] = useState(false);
const [courseSubmissions, setCourseSubmissions] = useState([]);
const [loadingSubmissions, setLoadingSubmissions] = useState(false);
const [submissionActionMessage, setSubmissionActionMessage] = useState("");
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
        softBg: "rgba(30,41,59,0.55)",
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
        softBg: "#eff6ff",
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

  const buildMessageStyle = (text) => ({
    marginTop: "18px",
    fontWeight: 700,
    color:
      text.toLowerCase().includes("failed") ||
      text.toLowerCase().includes("please") ||
      text.toLowerCase().includes("not found")
        ? "#f87171"
        : "#22c55e",
  });

  return (
    <AppLayout title="Manage Content">
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
              Course Delivery Control
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
              Manage Weekly Course Content
            </h2>

            <p
              style={{
                margin: 0,
                maxWidth: "820px",
                color: "#dbeafe",
                fontSize: "16px",
                lineHeight: 1.8,
              }}
            >
              Admins and instructors can update assigned courses, upload real
              files, add weekly materials, lecture links, tutorial activities,
              and define 4 assessments across the 12-week teaching period.
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
              Course Setup
            </p>

            <h3
              style={{
                margin: "12px 0 24px 0",
                color: theme.title,
                fontSize: "28px",
              }}
            >
              Base Course Content
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Select Course</label>
                <select
  value={selectedCourse}
  onChange={(e) => {
    setSelectedCourse(e.target.value);
    loadCourseSubmissions(e.target.value);
  }}
  style={inputStyle}
>
                  <option value="">Choose course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Main Video URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste main course video link"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Main Material URL / PDF Link</label>
                <input
                  type="text"
                  value={materialUrl}
                  onChange={(e) => setMaterialUrl(e.target.value)}
                  placeholder="Paste base course material link"
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={handleLoadCourseDefaults}
                  style={{
                    padding: "14px 18px",
                    borderRadius: "14px",
                    border: `1px solid ${theme.inputBorder}`,
                    background: theme.softBg,
                    color: theme.title,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Load Current Course Content
                </button>

                <button
                  type="submit"
                  disabled={savingStructure}
                  style={{
                    padding: "14px 22px",
                    borderRadius: "14px",
                    border: "none",
                    background: savingStructure
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #2563eb, #06b6d4)",
                    color: "white",
                    fontWeight: 700,
                    cursor: savingStructure ? "not-allowed" : "pointer",
                    boxShadow: "0 12px 24px rgba(37,99,235,0.22)",
                  }}
                >
                  {savingStructure ? "Saving..." : "Save Full Course Structure"}
                </button>
              </div>
            </form>

            {message && <p style={buildMessageStyle(message)}>{message}</p>}
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
                Access Rules
              </p>

              <h3
                style={{
                  margin: "12px 0 10px 0",
                  color: theme.stat,
                  fontSize: "34px",
                  lineHeight: 1,
                }}
              >
                {user?.role || "User"}
              </h3>

              <p style={{ margin: 0, color: theme.text, lineHeight: 1.8 }}>
                Only Admin and Instructor can manage course content. Students can
                only access the uploaded materials.
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
                Course Delivery Model
              </p>

              <div
                style={{
                  marginTop: "14px",
                  display: "grid",
                  gap: "10px",
                  color: theme.text,
                  fontSize: "15px",
                }}
              >
                <div>• 12 teaching weeks</div>
                <div>• 1 class per week</div>
                <div>• Weekly tutorial activity</div>
                <div>• Weekly upload of materials and files</div>
                <div>• 4 assessments per course</div>
              </div>
            </div>
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
            Real File Upload
          </p>

          <h3
            style={{
              margin: "12px 0 20px 0",
              color: theme.title,
              fontSize: "28px",
            }}
          >
            Upload Videos, PDFs, Slides and Files
          </h3>

          <form onSubmit={handleUploadMaterial}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "18px",
              }}
            >
              <div>
                <label style={labelStyle}>Week Number</label>
                <select
                  name="week_no"
                  value={uploadForm.week_no}
                  onChange={handleUploadFieldChange}
                  style={inputStyle}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Week {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Material Title</label>
                <input
                  type="text"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleUploadFieldChange}
                  placeholder="e.g. Week 1 Lecture Slides"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Material Type</label>
                <select
                  name="material_type"
                  value={uploadForm.material_type}
                  onChange={handleUploadFieldChange}
                  style={inputStyle}
                >
                  <option value="pdf">PDF</option>
                  <option value="slide">Slide</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Choose File</label>
              <input
                id="course-material-file"
                type="file"
                onChange={handleFileChange}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={uploadingFile}
              style={{
                padding: "14px 22px",
                borderRadius: "14px",
                border: "none",
                background: uploadingFile
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #2563eb, #06b6d4)",
                color: "white",
                fontWeight: 700,
                cursor: uploadingFile ? "not-allowed" : "pointer",
                boxShadow: "0 12px 24px rgba(37,99,235,0.22)",
              }}
            >
              {uploadingFile ? "Uploading..." : "Upload Material"}
            </button>
          </form>

          {uploadMessage && (
            <p style={buildMessageStyle(uploadMessage)}>{uploadMessage}</p>
          )}
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
            Assessment Plan
          </p>
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
    Student Assignment Submissions
  </p>

  <h3
    style={{
      margin: "12px 0 20px 0",
      color: theme.title,
      fontSize: "28px",
    }}
  >
    Submitted Assignments
  </h3>

  {loadingSubmissions ? (
    <p style={{ color: theme.text }}>Loading submissions...</p>
  ) : courseSubmissions.length === 0 ? (
    <p style={{ color: theme.text }}>
      No submissions found for this course.
    </p>
  ) : (
    <div style={{ display: "grid", gap: "16px" }}>
      {courseSubmissions.map((submission) => (
        <div
          key={submission.id}
          style={{
            padding: "18px",
            borderRadius: "18px",
            background: theme.softBg,
            border: `1px solid ${theme.inputBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontWeight: 800,
                  color: theme.title,
                  fontSize: "18px",
                }}
              >
                {submission.assignment_title}
              </p>

              <p style={{ margin: "4px 0", color: theme.text }}>
                <strong>Student:</strong> {submission.student_email}
              </p>

              <p style={{ margin: "4px 0", color: theme.text }}>
                <strong>Type:</strong> {submission.assignment_type}
              </p>

              <p style={{ margin: "4px 0", color: theme.text }}>
                <strong>Due Week:</strong> {submission.due_week}
              </p>

              <p style={{ margin: "4px 0", color: theme.text }}>
                <strong>Submitted:</strong>{" "}
                {new Date(submission.submitted_at).toLocaleString()}
              </p>

              {submission.submission_text && (
                <p
                  style={{
                    marginTop: "10px",
                    color: theme.text,
                    lineHeight: 1.7,
                  }}
                >
                  <strong>Submission Note:</strong><br />
                  {submission.submission_text}
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                minWidth: "220px",
              }}
            >
              {submission.file_path && (
                <a
                  href={`http://localhost:5000/${String(
                    submission.file_path || ""
                  ).replace(/\\/g, "/")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, #2563eb, #06b6d4)",
                    color: "white",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  Open Submitted File
                </a>
              )}

              <button
                onClick={() =>
                  handleDeleteSubmission(submission.id)
                }
                style={{
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Delete Submission
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {submissionActionMessage && (
    <p style={buildMessageStyle(submissionActionMessage)}>
      {submissionActionMessage}
    </p>
  )}
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
    Assessment Plan
  </p>

  <h3
    style={{
      margin: "12px 0 20px 0",
      color: theme.title,
      fontSize: "28px",
    }}
  >
    Create Course Assignment
  </h3>

  <form onSubmit={handleCreateAssignment}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "16px",
      }}
    >
      <div>
        <label style={labelStyle}>Assignment Title</label>
        <input
          type="text"
          name="title"
          value={assignmentForm.title}
          onChange={handleAssignmentFieldChange}
          placeholder="e.g. Assignment 1"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Assignment Type</label>
        <select
          name="assignment_type"
          value={assignmentForm.assignment_type}
          onChange={handleAssignmentFieldChange}
          style={inputStyle}
        >
          <option value="quiz">Quiz</option>
          <option value="assignment">Assignment</option>
          <option value="project">Project</option>
          <option value="final">Final</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Due Week</label>
        <select
          name="due_week"
          value={assignmentForm.due_week}
          onChange={handleAssignmentFieldChange}
          style={inputStyle}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              Week {i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div style={{ marginBottom: "18px" }}>
      <label style={labelStyle}>Assignment Description</label>
      <textarea
        rows="4"
        name="description"
        value={assignmentForm.description}
        onChange={handleAssignmentFieldChange}
        placeholder="Enter assignment details"
        style={{ ...inputStyle, resize: "vertical" }}
      />
    </div>

    <button
      type="submit"
      disabled={assignmentLoading}
      style={{
        padding: "14px 22px",
        borderRadius: "14px",
        border: "none",
        background: assignmentLoading
          ? "#94a3b8"
          : "linear-gradient(135deg, #2563eb, #06b6d4)",
        color: "white",
        fontWeight: 700,
        cursor: assignmentLoading ? "not-allowed" : "pointer",
        boxShadow: "0 12px 24px rgba(37,99,235,0.22)",
      }}
    >
      {assignmentLoading ? "Creating..." : "Create Assignment"}
    </button>
  </form>

  {assignmentMessage && (
    <p style={buildMessageStyle(assignmentMessage)}>{assignmentMessage}</p>
  )}
</div>

          <div style={{ display: "grid", gap: "18px" }}>
            {assessments.map((assessment, index) => (
              <div
                key={index}
                style={{
                  padding: "20px",
                  borderRadius: "20px",
                  background: theme.softBg,
                  border: `1px solid ${theme.inputBorder}`,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Assessment Title</label>
                    <input
                      type="text"
                      value={assessment.title}
                      onChange={(e) =>
                        handleAssessmentChange(index, "title", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Assessment Type</label>
                    <input
                      type="text"
                      value={assessment.type}
                      onChange={(e) =>
                        handleAssessmentChange(index, "type", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Due Week</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={assessment.due_week}
                      onChange={(e) =>
                        handleAssessmentChange(index, "due_week", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Assessment Description</label>
                  <textarea
                    rows="3"
                    value={assessment.description}
                    onChange={(e) =>
                      handleAssessmentChange(index, "description", e.target.value)
                    }
                    placeholder="Enter assessment details"
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              </div>
            ))}
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
            Weekly Learning Structure
          </p>

          <h3
            style={{
              margin: "12px 0 20px 0",
              color: theme.title,
              fontSize: "28px",
            }}
          >
            12-Week Course Plan
          </h3>

          <div style={{ display: "grid", gap: "18px" }}>
            {weeklyContent.map((weekItem, index) => (
              <div
                key={weekItem.week}
                style={{
                  padding: "22px",
                  borderRadius: "22px",
                  background: theme.softBg,
                  border: `1px solid ${theme.inputBorder}`,
                }}
              >
                <h4
                  style={{
                    margin: "0 0 18px 0",
                    color: theme.title,
                    fontSize: "22px",
                  }}
                >
                  Week {weekItem.week}
                </h4>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Weekly Topic</label>
                    <input
                      type="text"
                      value={weekItem.topic}
                      onChange={(e) =>
                        handleWeeklyChange(index, "topic", e.target.value)
                      }
                      placeholder={`Enter week ${weekItem.week} topic`}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Tutorial Activity</label>
                    <input
                      type="text"
                      value={weekItem.tutorial_activity}
                      onChange={(e) =>
                        handleWeeklyChange(
                          index,
                          "tutorial_activity",
                          e.target.value
                        )
                      }
                      placeholder="Enter tutorial activity"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Video Link</label>
                    <input
                      type="text"
                      value={weekItem.video_url}
                      onChange={(e) =>
                        handleWeeklyChange(index, "video_url", e.target.value)
                      }
                      placeholder="Weekly lecture video link"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>PDF / Material Link</label>
                    <input
                      type="text"
                      value={weekItem.material_url}
                      onChange={(e) =>
                        handleWeeklyChange(index, "material_url", e.target.value)
                      }
                      placeholder="Weekly PDF or material"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Extra Link</label>
                    <input
                      type="text"
                      value={weekItem.extra_link}
                      onChange={(e) =>
                        handleWeeklyChange(index, "extra_link", e.target.value)
                      }
                      placeholder="Additional external resource"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Image / File URL</label>
                    <input
                      type="text"
                      value={weekItem.image_or_file_url}
                      onChange={(e) =>
                        handleWeeklyChange(
                          index,
                          "image_or_file_url",
                          e.target.value
                        )
                      }
                      placeholder="Image, file, or media URL"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default ManageCourseContent;