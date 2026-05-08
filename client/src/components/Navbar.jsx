import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("kolpUser"));

  const handleLogout = () => {
    localStorage.removeItem("kolpUser");
    navigate("/");
  };

  const linkStyle = {
    color: "#0f172a",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.25s ease",
  };

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        background: "rgba(255,255,255,0.65)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "14px 26px",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* LEFT SIDE */}
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#0f172a",
              fontWeight: "700",
            }}
          >
            🎓 KOLP
          </h2>

          {user && (
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              {user.name} • {user.role}
            </p>
          )}
        </div>

        {/* RIGHT SIDE LINKS */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link to="/dashboard" style={linkStyle}>
            Dashboard
          </Link>

          <Link to="/courses" style={linkStyle}>
            Courses
          </Link>

          {/* STUDENT */}
          {user?.role === "Student" && (
            <Link to="/my-learning" style={linkStyle}>
              My Learning
            </Link>
          )}

          {/* ADMIN */}
          {user?.role === "Admin" && (
            <Link to="/create-course" style={linkStyle}>
              Create Course
            </Link>
          )}

          {/* INSTRUCTOR + ADMIN */}
          {(user?.role === "Instructor" || user?.role === "Admin") && (
            <Link to="/manage-course-content" style={linkStyle}>
              Manage Content
            </Link>
          )}

          {/* ADMIN ONLY */}
          {user?.role === "Admin" && (
            <Link to="/enrollments" style={linkStyle}>
              Enrollments
            </Link>
          )}

          <Link to="/forum" style={linkStyle}>
            Forum
          </Link>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #2563eb, #06b6d4)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              transition: "0.3s",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default Navbar;