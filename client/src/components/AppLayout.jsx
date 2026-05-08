import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  PlusCircle,
  Settings2,
  ClipboardList,
  MessageSquare,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

function SidebarLink({ to, label, icon, active, darkMode }) {
  const [hovered, setHovered] = useState(false);

  const baseBg = darkMode ? "#0f172a" : "#ffffff";
  const hoverBg = darkMode ? "#1e293b" : "#eff6ff";
  const activeBg = "linear-gradient(135deg, #2563eb, #06b6d4)";

  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textDecoration: "none",
        padding: "12px 14px",
        borderRadius: "14px",
        color: active ? "white" : darkMode ? "#e2e8f0" : "#0f172a",
        background: active
          ? activeBg
          : hovered
          ? hoverBg
          : "transparent",
        boxShadow: active ? "0 10px 24px rgba(37,99,235,0.22)" : "none",
        transform: hovered && !active ? "translateX(4px)" : "translateX(0)",
        transition: "all 0.25s ease",
        fontWeight: 600,
        fontSize: "14px",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "18px",
          height: "18px",
        }}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function AppLayout({ children, title = "KOLP Portal" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("kolpUser"));

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("kolpDarkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("kolpDarkMode", darkMode);
  }, [darkMode]);

  const theme = useMemo(() => {
    return darkMode
      ? {
          pageBg:
            "linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%)",
          panelBg: "rgba(15, 23, 42, 0.82)",
          cardBg: "rgba(15, 23, 42, 0.76)",
          text: "#f8fafc",
          subText: "#94a3b8",
          border: "rgba(255,255,255,0.08)",
          topBar: "rgba(15, 23, 42, 0.65)",
        }
      : {
          pageBg:
            "linear-gradient(135deg, #eef2ff 0%, #dbeafe 35%, #f8fafc 70%, #ecfeff 100%)",
          panelBg: "rgba(255,255,255,0.72)",
          cardBg: "rgba(255,255,255,0.78)",
          text: "#0f172a",
          subText: "#64748b",
          border: "rgba(15,23,42,0.06)",
          topBar: "rgba(255,255,255,0.58)",
        };
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("kolpUser");
    navigate("/");
  };

  const links = [
    {
      show: true,
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      show: true,
      to: "/courses",
      label: "Courses",
      icon: <BookOpen size={18} />,
    },
    {
      show: user?.role === "Student",
      to: "/my-learning",
      label: "My Learning",
      icon: <GraduationCap size={18} />,
    },
    {
      show: user?.role === "Admin",
      to: "/create-course",
      label: "Create Course",
      icon: <PlusCircle size={18} />,
    },
    {
      show: user?.role === "Instructor" || user?.role === "Admin",
      to: "/manage-course-content",
      label: "Manage Content",
      icon: <Settings2 size={18} />,
    },
    {
      show: user?.role === "Admin",
      to: "/enrollments",
      label: "Enrollments",
      icon: <ClipboardList size={18} />,
    },
    {
      show: true,
      to: "/forum",
      label: "Forum",
      icon: <MessageSquare size={18} />,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        color: theme.text,
        fontFamily: "Arial, sans-serif",
      }}
    >
<div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>        <aside
          style={{
            width: "280px",
            padding: "20px",
            position: "sticky",
            top: 0,
            height: "100vh",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            background: theme.panelBg,
            borderRight: `1px solid ${theme.border}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              padding: "18px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #2563eb, #06b6d4)",
              color: "white",
              boxShadow: "0 14px 32px rgba(37,99,235,0.25)",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "22px" }}>KOLP</h2>
            <p style={{ margin: "8px 0 0 0", color: "#dbeafe", fontSize: "13px" }}>
              University Learning Portal
            </p>
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "18px",
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              marginBottom: "18px",
            }}
          >
            <p style={{ margin: 0, color: theme.subText, fontSize: "12px" }}>
              LOGGED IN AS
            </p>
            <h3 style={{ margin: "8px 0 4px 0", fontSize: "18px" }}>
              {user?.name || "Guest User"}
            </h3>
            <p style={{ margin: 0, color: theme.subText, fontSize: "13px" }}>
              {user?.role || "No Role"}
            </p>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            {links
              .filter((item) => item.show)
              .map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={location.pathname === item.to}
                  darkMode={darkMode}
                />
              ))}
          </div>

          <div
            style={{
              marginTop: "22px",
              display: "grid",
              gap: "10px",
            }}
          >
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "14px",
                border: `1px solid ${theme.border}`,
                background: theme.cardBg,
                color: theme.text,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 10px 24px rgba(37,99,235,0.20)",
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

<main style={{ flex: 1, minWidth: 0, width: "100%" }}>          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              padding: "18px 24px",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              background: theme.topBar,
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                color: theme.text,
              }}
            >
              {title}
            </h1>
          </div>

          <div style={{ padding: "28px" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;