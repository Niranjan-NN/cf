import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AdminHome.css';
import { FaSearch, FaSignOutAlt } from "react-icons/fa";

const AdminHome = () => {
  const navigate = useNavigate();

  // Check admin login on mount
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken'); // Or whatever token/key you use
    if (!adminToken) {
      navigate('/adminloginpage');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken'); // Clear token
    navigate("/adminloginpage");
  };

  return (
    <div className="home-container">
      <header>
        <nav className="navbar">
          <div className="navbar-brand">CORE FOUR / Admin</div>
          <div className="navbar-search">
            <input type="text" placeholder="Search for grocery, vegetables, spices..." className="search-input" />
            <FaSearch className="search-icon" />
          </div>
          <div className="navbar-icons">
            <FaSignOutAlt onClick={handleLogout} className="logout-icon" title="Logout" />
          </div>
        </nav>
      </header>
      <main>
        <div className="button-container">
          <Link to="/adminproduct" className="button">Add Product</Link>
          <Link to="/adminview" className="button">View Product</Link>
          <Link to="/admin-dashboard" className="button">Admin Dashboard</Link>
          <Link to="/productMeta" className="button">Add Meta Details</Link>
          <Link to="/viewMeta" className="button">Meta Details</Link>
        </div>
      </main>
    </div>
  );
};

export default AdminHome;
