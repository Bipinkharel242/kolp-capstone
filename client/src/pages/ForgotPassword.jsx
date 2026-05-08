import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/forgot-password",
        { email }
      );
      setMessage(response.data.message);
    } catch (error) {
  console.log("Forgot password error:", error.response?.data || error.message);
  setMessage(error.response?.data?.message || "Failed to send reset email");
}
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #e0f2fe, #f8fafc)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "380px",
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <h1
  style={{
    textAlign: "center",
    margin: "0 0 10px 0",
    color: "#0f172a",
    fontSize: "28px",
    lineHeight: "1.1",
    letterSpacing: "0",
    fontWeight: "700",
  }}
>
  Forgot Password
</h1>
        <p style={{ textAlign: "center", marginBottom: "25px", color: "#475569" }}>
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <p
            style={{
              textAlign: "center",
              marginTop: "15px",
              color: message.includes("sent") ? "#16a34a" : "#dc2626",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}

        <p style={{ textAlign: "center", marginTop: "18px" }}>
          <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;