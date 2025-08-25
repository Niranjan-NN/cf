import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/OtpVerificationPage.css";

const ForgotOTP = ({ email }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const api = import.meta.env.VITE_API_URL
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("resetToken"); // token received from /forgotPassword
  
    if (!token) {
      alert("Temporary token not found.");
      return;
    }
  
    // Manually set the token in a cookie before making the request
    document.cookie = `jwt_otp=${token}; path=/;`;
  
    try {
      const response = await axios.post(
        `${api}/api/verifyOtp`,
        { otp: Number(otp) },
        { withCredentials: true }
      );
  
      if (response.status === 200) {
        alert("OTP Verified Successfully!");
        localStorage.setItem("finalToken", response.data.token);
        navigate("/SetNewPasswordPage");
      }
    } catch{
      alert("Invalid or expired OTP");
    }
  };
  

  const handleResendOtp = async () => {
    try {
      const response = await axios.post(`${api}/api/verifyUser`);
      if (response.status === 200) {
        alert("A new OTP has been sent!");
      }
    } catch{
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <div className="brand">
          <img
            src="/corefour.jpeg"
            alt="CORE FOUR Logo"
            className="logo"
          />
          <h2 className="brand-name">CORE FOUR</h2>
        </div>
        <div className="otp-header">
          <p className="otp-message">
            You will receive an email with a verification code within 5 minutes
          </p>
          {/* Only show email if it's provided */}
          {email && <p className="otp-phone">{email}</p>}
        </div>
        <div className="otp-input-section">
          <p className="otp-instruction">Enter the OTP you received in your email</p>
          <form className="otp-form" onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              className="otp-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" className="verify-button">
              Submit
            </button>
          </form>
          <button
            type="button"
            className="resend-button"
            onClick={handleResendOtp}
          >
            Click here to resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotOTP;
