import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Details.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../utils/axiosInstance";


const Details = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    locationDetails: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    defaultAddress: false,
  });

  const states = [
    "Select State",
    "Andhra Pradesh",
    "Bihar",
    "Karnataka",
    "Maharashtra",
    "Tamil Nadu",
    "Uttar Pradesh",
  ];
  const api = import.meta.env.VITE_API_URL

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken')|| localStorage.getItem('token');
      
      
      if (!token) {
        alert("Please login with the Signup email again to Continue.");
        navigate("/login");
        return;
      }

      const res = await axiosInstance.post(
        `${api}/api/addAddress`,
        formData,
        {
          headers: {
            "authorization": `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201) {
        alert("Address added successfully!");
        navigate("/"); // or wherever you want to redirect
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Failed to add address.");
    }
  };

  return (
    <div className="full-page d-flex align-items-center justify-content-center">
      <div className="form-container p-4 shadow-lg">
        <h2 className="text-center">Add New Address</h2>
        <p className="text-center text-muted">
          Fill in the details to save your address
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="tel"
              className="form-control"
              placeholder="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
          </div>

          <button type="button" className="btn btn-primary w-100 mb-3">
            📍 Use My Location
          </button>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Location Details (Street, Sector)"
              name="locationDetails"
              value={formData.locationDetails}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Landmark"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <select
              className="form-control"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              {states.map((state, index) => (
                <option key={index} value={index === 0 ? "" : state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              name="defaultAddress"
              checked={formData.defaultAddress}
              onChange={handleChange}
            />
            <label className="form-check-label">Set as Default Address</label>
          </div>

          <button type="submit" className="btn btn-success w-100">
            Add Address
          </button>
        </form>
      </div>
    </div>
  );
};

export default Details;
