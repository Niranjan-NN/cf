import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Signup.css";
import axios from "axios";

const AdminSignup = () => {
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setAdminSecretKey] = useState("");

  const api = import.meta.env.VITE_API_URL;

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (!adminName || !email || !password || !secretKey) {
      alert("Please fill in all fields.");
      return;
    }

    const adminData = {
      name: adminName,
      email,
      password,
      secretKey,
    };

    try {
      const response = await axios.post(
        `${api}/api/adminRegister`,
        adminData,
        { withCredentials: true }
      );

      alert(response.data.message || "Admin registered successfully!");
      navigate("/adminloginpage");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong during admin registration.";
      alert(msg);
      console.error("Admin Registration Error:", error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="left-section">
          <h1 className="title">Admin Control at Your Fingertips</h1>
          <p className="subtitle">
            Manage your marketplace with ease and security using CORE FOUR Admin.
          </p>
          <img
            src="https://i.pinimg.com/736x/c0/22/f7/c022f70d3ede6216f171aeac5efb1e1b.jpg"
            alt="Admin Illustration"
            className="illustration"
          />
        </div>

        <div className="right-section">
          <div className="brand">
            <img
              src="/corefour.jpeg"
              alt="CORE FOUR Logo"
              className="logo"
            />
            <h2 className="brand-name">CORE FOUR / Admin</h2>
          </div>

          <h2 className="welcome-title">Register as Admin</h2>
          <p className="welcome-subtitle">Please fill in the details below</p>

          <form className="signup-form" onSubmit={handleAdminSubmit}>
            <input
              type="text"
              placeholder="Admin Name"
              className="form-control mb-3"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="form-control mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="form-control mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Admin Secret Key"
              className="form-control mb-3"
              value={secretKey}
              onChange={(e) => setAdminSecretKey(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary w-100">
              Register as Admin
            </button>
          </form>

          <div className="divider">OR</div>

          <button className="btn apple-button w-100 mb-3" disabled>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple Logo"
              className="social-icon"
            />
            Sign up with Apple
          </button>

          <p className="login-link">
            Already have an admin account?{" "}
            <span
              onClick={() => navigate("/adminloginpage")}
              style={{ cursor: "pointer" }}
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
