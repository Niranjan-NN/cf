import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import axios from "axios";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const api = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowErrorPopup(false);

    try {
      const response = await axios.post(
        `${api}/api/adminLogin`,
        { email, password, secretKey },
        { withCredentials: true }
      );

      const token = response.data.token;
      localStorage.setItem("adminToken", token);
      setShowSuccessPopup(true);

      setTimeout(() => {
        const toast = document.querySelector(".success-toast");
        if (toast) toast.classList.add("fade-out");
      }, 1200);

      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate("/adminhome");
      }, 1800);
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed.";
      setErrorMessage(msg);
      setShowErrorPopup(true);

      setTimeout(() => {
        const toast = document.querySelector(".error-toast");
        if (toast) toast.classList.add("fade-out");
      }, 1500);

      setTimeout(() => {
        setShowErrorPopup(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {showSuccessPopup && (
        <div className="success-toast">Admin Login Successful 🎉 Redirecting...</div>
      )}
      {showErrorPopup && (
        <div className="error-toast">❌ {errorMessage}</div>
      )}

      <div className="login-box">
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
            <h2 className="brand-name">CORE FOUR / Admin</h2>
          </div>

          <h2 className="welcome-title">Welcome Back</h2>
          <p className="welcome-subtitle">Please login to your Admin account</p>

          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              required
              className="input-field mb-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="input-field mb-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Secret Key"
              required
              className="input-field mb-2"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
            <button className="signin-button" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="divider">OR</div>

          <button className="social-button google" disabled>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStGPI7wuecWNAG_b4NphVf6Og3KHIreUMTvQ&s"
              alt="Google Logo"
              className="social-icon"
            />
            Login with Google
          </button>

          <button className="social-button apple" disabled>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple Logo"
              className="social-icon"
            />
            Login with Apple
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
