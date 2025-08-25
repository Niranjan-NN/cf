import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import adminAxiosInstance from '../utils/adminAxiosInstance';

const AdminProductMetaView = () => {
  const [metaList, setMetaList] = useState([]);
  const [editMeta, setEditMeta] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('adminToken');
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'admin') return navigate('/');
      fetchMeta(token);
    } catch {
      navigate('/');
    }
  }, []);

  const fetchMeta = async () => {
    try {
      const res = await adminAxiosInstance.get(`${api}/api`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setMetaList(res.data.meta);
    } catch (err) {
      setError('Failed to load metadata');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this metadata?")) return;
    try {
      await adminAxiosInstance.delete(`${api}/api/productMeta/${id}`, {
        headers: { authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      setSuccess('Metadata deleted');
      setTimeout(() => setSuccess(''), 2000);
      fetchMeta();
    } catch (err) {
      setError('Failed to delete metadata');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleEditChange = (e) => {
    setEditMeta({ ...editMeta, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAxiosInstance.put(`${api}/api/productMeta/${editMeta._id}`, editMeta, {
        headers: { authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      setSuccess('Metadata updated');
      setTimeout(() => setSuccess(''), 2000);
      setEditMeta(null);
      fetchMeta();
    } catch (err) {
      setError('Failed to update metadata');
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Product Metadata</h2>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Product</th>
              <th>Manufacture</th>
              <th>Expiry</th>
              <th>Delivery Date</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {metaList.map(meta => (
              editMeta && editMeta._id === meta._id ? (
                <tr key={meta._id}>
                  <td>{meta.product.title}</td>
                  <td><input type="date" name="manufactureDate" value={editMeta.manufactureDate.slice(0, 10)} onChange={handleEditChange} className="form-control" /></td>
                  <td><input type="date" name="expiryDate" value={editMeta.expiryDate.slice(0, 10)} onChange={handleEditChange} className="form-control" /></td>
                  <td><input type="date" name="deliveryDate" value={editMeta.deliveryDate.slice(0, 10)} onChange={handleEditChange} className="form-control" /></td>
                  <td><input type="time" name="deliveryTime" value={editMeta.deliveryTime} onChange={handleEditChange} className="form-control" /></td>
                  <td>
                    <button className="btn btn-success btn-sm me-2" onClick={handleEditSubmit}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditMeta(null)}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={meta._id}>
                  <td>{meta.product.title}</td>
                  <td>{new Date(meta.manufactureDate).toLocaleDateString()}</td>
                  <td>{new Date(meta.expiryDate).toLocaleDateString()}</td>
                  <td>{new Date(meta.deliveryDate).toLocaleDateString()}</td>
                  <td>{meta.deliveryTime}</td>
                  <td>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => setEditMeta(meta)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(meta._id)}>Delete</button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductMetaView;
