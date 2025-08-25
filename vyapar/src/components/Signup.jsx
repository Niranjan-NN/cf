import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Signup.css"; // Custom styles
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const api = import.meta.env.VITE_API_URL;

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        `${api}/api/user`,
        { name, email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        localStorage.setItem("tempToken", response.data.token);
        alert("OTP sent to your email");
        navigate("/OtpVerificationPage");
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const response = await axios.post(`${api}/api/google-login`, {
        token: credential,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);
        alert("Signed up successfully with Google!");
        navigate("/");
      }
    } catch (err) {
      console.error("Google signup failed", err);
      alert("Google signup failed.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="left-section">
          <h1 className="title">Simplify management with our dashboard.</h1>
          <p className="subtitle">
            Simplify your e-commerce management with our user-friendly admin dashboard.
          </p>
          <img
            src="https://i.pinimg.com/736x/c0/22/f7/c022f70d3ede6216f171aeac5efb1e1b.jpg"
            alt="Illustration"
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
            <h2 className="brand-name">CORE FOUR</h2>
          </div>
          <h2 className="welcome-title">Create Your Account</h2>
          <p className="welcome-subtitle">Please sign up to get started</p>

          <form className="signup-form" onSubmit={handleSignIn}>
            <input
              type="text"
              placeholder="Name"
              className="form-control mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="Confirm Password"
              className="form-control mb-3"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary w-100">
              Sign Up
            </button>
          </form>

          <div className="divider">OR</div>

          {/* ✅ Google Sign Up */}
          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => {
                alert("Google signup failed");
              }}
            />
          </div>

          {/* Optional Apple Sign Up */}
          <button className="btn apple-button w-100 mb-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple Logo"
              className="social-icon"
            />
            Sign up with Apple
          </button>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
