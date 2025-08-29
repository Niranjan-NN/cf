import React, { useEffect, useState, useRef } from 'react';
import {
  FaSearch,
  FaShoppingCart,
  FaBell,
  FaUserCircle,
  FaHome,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

import { jwtDecode } from 'jwt-decode';
import '../styles/Profile.css';
import axiosInstance from '../utils/axiosInstance';

const Profile = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    mobileNumber: '',
    locationDetails: '',
    landmark: '',
    pincode: '',
    city: '',
    state: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const editFormRef = useRef(null); // 📌 reference for scrolling
const api = import.meta.env.VITE_API_URL
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
          alert('Login with the signup email to continue');
          navigate('/login');
          return;
        }
        const decoded = jwtDecode(token);
        const id = decoded.id || decoded._id;
        setUserId(id);

        const res = await axiosInstance.get(`${api}/api/getByIdAddress/${id}`);
        setAddresses(res.data);
      } catch (error) {
        console.error('Failed to fetch addresses', error);
      }
    };
    fetchAddresses();
  }, [navigate]);

  const handleInputChange = (e) => {
    setNewAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddAddress = async () => {
  try {
    // get token
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    if (!token) {
      console.error("No token found. Please login again.");
      return;
    }

    // decode token safely
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      return;
    }

    const userId = decoded.id || decoded._id;
    if (!userId) {
      console.error("User ID not found in token");
      return;
    }

    // send request
    const res = await axiosInstance.post(
      `${api}/api/addAddress`,
      { ...newAddress, user: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // update state
    setAddresses(prev => [...prev, res.data]);
    setNewAddress({
      fullName: '',
      mobileNumber: '',
      locationDetails: '',
      landmark: '',
      pincode: '',
      city: '',
      state: ''
    });

    navigate('/');
  } catch (error) {
    console.error('Failed to add address:', error.response?.data || error.message);
  }
};


  const handleEditAddress = (address) => {
    setEditingId(address._id);
    setNewAddress({ ...address });

    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100); // wait for UI render
  };

  const handleUpdateAddress = async () => {
    try {
      const res = await axiosInstance.put(
        `${api}/api/putAddress/${userId}`,
        newAddress,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAddresses(prev =>
        prev.map(addr => addr._id === res.data.address._id ? res.data.address : addr)
      );
      setEditingId(null);
      setNewAddress({
        fullName: '',
        mobileNumber: '',
        locationDetails: '',
        landmark: '',
        pincode: '',
        city: '',
        state: ''
      });

      setSuccessMessage('Address updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update address', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axiosInstance.delete(`${api}/api/deleteAddress/${addressId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
    } catch (error) {
      console.error('Failed to delete address', error);
    }
  };

  return (
    <div className="profile-body">
      <nav className="navbar">
        <div className="navbar-brand">CORE FOUR</div>
        <div className="navbar-icons">
          <FaHome onClick={() => navigate("/")} />
          <FaShoppingCart onClick={() => navigate("/cart")} />
          <FaBell />
          <FaUserCircle onClick={() => navigate("/profile")} />
        </div>
      </nav>

      <div className="profile-container">
        <div className="profile-sidebar">
          <ul>
            <li><a className="active" href="#">Personal information</a></li>
            <li><a href="#">Billing & Payments</a></li>
            <li><a href="/order">Order History</a></li>
            <li><a href="#">Gift Cards</a></li>
          </ul>
        </div>

        <div className="profile-main-content">
          <button className="profile-back-button" onClick={() => navigate('/')}>Back</button>

          <div className="profile-picture"><FaUserCircle size={150} /></div>
          <h1>Manage Addresses</h1>

          {successMessage && <div className="success-toast">{successMessage}</div>}

          {addresses.map(address => (
            <div key={address._id} className="info-box">
              <div className="details">
                <p><strong>Name:</strong> {address.fullName}</p>
                <p><strong>Mobile:</strong> {address.mobileNumber}</p>
                <p><strong>Location:</strong> {address.locationDetails}</p>
                <p><strong>Landmark:</strong> {address.landmark}</p>
                <p><strong>Pincode:</strong> {address.pincode}</p>
                <p><strong>City:</strong> {address.city}</p>
                <p><strong>State:</strong> {address.state}</p>
              </div>
              <div className="actions">
                <FaEdit onClick={() => handleEditAddress(address)} />
                <FaTrash onClick={() => handleDeleteAddress(address._id)} />
              </div>
            </div>
          ))}

          <h2>{editingId ? "Edit Address" : "Add New Address"}</h2>
          <div className="edit-form" ref={editFormRef}>
            <input name="fullName" value={newAddress.fullName} onChange={handleInputChange} placeholder="Full Name" />
            <input name="mobileNumber" value={newAddress.mobileNumber} onChange={handleInputChange} placeholder="Mobile Number" />
            <input name="locationDetails" value={newAddress.locationDetails} onChange={handleInputChange} placeholder="Location" />
            <input name="landmark" value={newAddress.landmark} onChange={handleInputChange} placeholder="Landmark" />
            <input name="pincode" value={newAddress.pincode} onChange={handleInputChange} placeholder="Pincode" />
            <input name="city" value={newAddress.city} onChange={handleInputChange} placeholder="City" />
            <input name="state" value={newAddress.state} onChange={handleInputChange} placeholder="State" />
            <button onClick={editingId ? handleUpdateAddress : handleAddAddress}>
              {editingId ? "Update Address" : "Add Address"}
            </button>
            {editingId && <button onClick={() => setEditingId(null)} className="cancel-button">Cancel</button>}
          </div>
        </div>

        <button className="profile-sign-out" onClick={() => {
          localStorage.removeItem('token');
          navigate('/login');
        }}>Sign out</button>
      </div>
    </div>
  );
};

export default Profile;
