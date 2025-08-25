import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import adminAxiosInstance from '../utils/adminAxiosInstance';

const AddProductMeta = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product: '',
    manufactureDate: '',
    expiryDate: '',
    deliveryDate: '',
    deliveryTime: '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'admin') return navigate('/');
      fetchProducts(token);
    } catch {
      navigate('/');
    }
  }, []);

  const fetchProducts = async (token) => {
    try {
      const res = await adminAxiosInstance.get(`${api}/api/products`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setProducts(res.data.product);
    } catch (err) {
      console.error('Error fetching products', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      await adminAxiosInstance.post(`${api}/api/addMeta`, formData, {
        headers: { authorization: `Bearer ${token}` },
      });
      setSuccessMsg('Product metadata added successfully!');
      setFormData({ product: '', manufactureDate: '', expiryDate: '', deliveryDate: '', deliveryTime: '' });
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      console.error('Error adding product meta', err);
      setErrorMsg('Failed to add product meta');
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  return (
    <div className="add-meta-container">
      <h2>Add Product Metadata</h2>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form className="meta-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product</label>
          <select name="product" value={formData.product} onChange={handleChange} required className="form-control">
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Manufacture Date</label>
          <input type="date" name="manufactureDate" value={formData.manufactureDate} onChange={handleChange} required className="form-control" />
        </div>

        <div className="form-group">
          <label>Expiry Date</label>
          <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="form-control" />
        </div>

        <div className="form-group">
          <label>Delivery Date</label>
          <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required className="form-control" />
        </div>

        <div className="form-group">
          <label>Delivery Time</label>
          <input type="time" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} required className="form-control" />
        </div>

        <button type="submit" className="btn btn-primary mt-3">Add Metadata</button>
      </form>
    </div>
  );
};

export default AddProductMeta;
