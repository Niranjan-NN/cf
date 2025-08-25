import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SetNewPasswordPage.css"; // Custom styles

const SetNewPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
const api = import.meta.env.VITE_API_URL
  useEffect(() => {
    const token = localStorage.getItem('finalToken')
    if (!token) {
      alert("No reset session found. Please restart the reset process.");
      navigate("/forgotPassword");
    }
  }, [navigate]);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('finalToken');
    if (!token) {
      alert("No reset session found. Please restart the reset process.");
      navigate("/forgotPassword");
      return;
    }
  
    // Set the token manually in cookie (same name your backend expects)
    document.cookie = `jwt_new=${token}; path=/;`;
  
    try {
      const response = await axios.post(
        `${api}/api/resetPassword`,
        { password },
        { withCredentials: true }
      );
  
      alert(response.data.message || "Password updated!");
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("finalToken");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reset password.");
      console.error("Set password error:", error);
    }
  };
  

  return (
    <div className="set-password-container">
      <div className="set-password-box">
        <div className="brand">
          <img
            src="/corefour.jpeg"
            alt="CORE FOUR Logo"
            className="logo"
          />
          <h2 className="brand-name">CORE FOUR</h2>
        </div>
        <h2 className="set-password-title">Set New Password</h2>
        <form className="set-password-form" onSubmit={handleSetPassword}>
          <input
            type="password"
            placeholder="New Password"
            className="set-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="set-password-button">
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetNewPasswordPage;
