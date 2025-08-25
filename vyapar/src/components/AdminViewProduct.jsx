import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaSearch, FaSignOutAlt } from "react-icons/fa";
import '../styles/AdminViewProduct.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import adminAxiosInstance from '../utils/adminAxiosInstance';



const AdminViewProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({
    title: '', description: '', price: '', offerDescription: '', category: '',
    image: null, shopStocks: []
  });

  const unitOptions = ["kg", "g", "litre", "ml", "piece", "dozen", "pack"];
  const modalRef = useRef(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const api = import.meta.env.VITE_API_URL;

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    type === "success" ? setShowSuccessToast(true) : setShowErrorToast(true);
    setTimeout(() => {
      type === "success" ? setShowSuccessToast(false) : setShowErrorToast(false);
    }, 2000);
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") return navigate("/");
      fetchProducts(token);
    } catch {
      navigate("/");
    }
  }, []);

  const fetchProducts = async (token) => {
    try {
      const res = await adminAxiosInstance.get(`${api}/api/products`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setProducts(res.data.product);
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  const handleEditClick = async (product) => {
    setEditedProduct({ ...product, image: null });
    setEditingProductId(product._id);
    const bootstrap = await import("bootstrap/dist/js/bootstrap.bundle.min.js");
    const modal = new bootstrap.Modal(modalRef.current);
    modal.show();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (index, field, value) => {
    const updatedStocks = [...editedProduct.shopStocks];
    updatedStocks[index][field] = value;
    setEditedProduct((prev) => ({ ...prev, shopStocks: updatedStocks }));
  };

  const handleAddStockRow = () => {
    setEditedProduct((prev) => ({
      ...prev,
      shopStocks: [...prev.shopStocks, { shopName: "", quantity: "", unit: "piece" }]
    }));
  };

  const handleRemoveStockRow = (index) => {
    const updatedStocks = [...editedProduct.shopStocks];
    updatedStocks.splice(index, 1);
    setEditedProduct((prev) => ({ ...prev, shopStocks: updatedStocks }));
  };

  const handleFileChange = (e) => {
    setEditedProduct((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSaveClick = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const formData = new FormData();
      Object.entries(editedProduct).forEach(([key, value]) => {
        if (key === "shopStocks") {
          formData.append("shopStocks", JSON.stringify(value));
        } else if (value !== null) {
          formData.append(key, value);
        }
      });

      await adminAxiosInstance.put(
        `${api}/api/updateProduct/${editingProductId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${token}`,
          },
        }
      );

      const modal = (await import("bootstrap/dist/js/bootstrap.bundle.min.js")).Modal.getInstance(modalRef.current);
      modal.hide();
      setEditingProductId(null);
      setEditedProduct({
        title: '', description: '', price: '', offerDescription: '', category: '', image: null, shopStocks: [],
      });
      fetchProducts(token);
      showToast("Product updated successfully!");
    } catch (error) {
      console.error("Save error", error);
      showToast("Update failed", "error");
    }
  };

  const handleCancelClick = async () => {
    const modal = (await import("bootstrap/dist/js/bootstrap.bundle.min.js")).Modal.getInstance(modalRef.current);
    modal.hide();
    setEditingProductId(null);
  };

  const handleDeleteClick = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!window.confirm("Are you sure?")) return;
    try {
      await adminAxiosInstance.delete(`${api}/api/deleteProduct/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      fetchProducts(token);
      showToast("Product deleted");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="home-container">
      {showSuccessToast && <div className="success-toast">{toastMessage}</div>}
      {showErrorToast && <div className="error-toast">{toastMessage}</div>}

      <header>
        <nav className="navbar">
          <div className="navbar-brand">CORE FOUR / Admin</div>
          <div className="navbar-search">
            <input type="text" placeholder="Search..." className="search-input" />
            <FaSearch className="search-icon" />
          </div>
          <div className="navbar-icons">
            <FaSignOutAlt onClick={() => { localStorage.removeItem("adminToken"); navigate("/adminloginpage"); }} className="logout-icon" />
          </div>
        </nav>
      </header>

      <main>
        <aside className="sidebar">
          <ul>
            <li><Link to="/adminproduct">Add products</Link></li>
            <li><Link to="/adminview">View product</Link></li>
          </ul>
        </aside>

        <section className="content">
          <h2>View Products</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Description</th><th>Price</th><th>Offer</th>
                <th>Stocks</th><th>Category</th><th>Image</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.description}</td>
                  <td>{p.price}</td>
                  <td>{p.offerDescription}</td>
                  <td>
                    {p.shopStocks?.length ? (
                      <ul className="stock-list">
                        {p.shopStocks.map((s, i) => (
                          <li key={i}>{s.shopName}: {s.quantity} {s.unit}</li>
                        ))}
                      </ul>
                    ) : "-"}
                  </td>
                  <td>{p.category}</td>
                  <td><img src={`${api}/uploads/${p.image}`} alt={p.title} width="50" /></td>
                  <td>
                    <button onClick={() => handleEditClick(p)}>Edit</button>
                    <button onClick={() => handleDeleteClick(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Modal */}
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Edit Product</h5>
              <button className="btn-close" onClick={handleCancelClick}></button>
            </div>
            <div className="modal-body">
              <form>
                <label>Title: <input className="form-control" name="title" value={editedProduct.title} onChange={handleInputChange} /></label>
                <label>Description: <input className="form-control" name="description" value={editedProduct.description} onChange={handleInputChange} /></label>
                <label>Price: <input className="form-control" type="number" name="price" value={editedProduct.price} onChange={handleInputChange} /></label>
                <label>Offer: <input className="form-control" name="offerDescription" value={editedProduct.offerDescription} onChange={handleInputChange} /></label>
                <label>Category: <input className="form-control" name="category" value={editedProduct.category} onChange={handleInputChange} /></label>
                <label>Image: <input className="form-control" type="file" onChange={handleFileChange} /></label>

                <h6 className="mt-3">Shop Stocks</h6>
                {editedProduct.shopStocks?.map((stock, index) => (
                  <div className="row mb-2" key={index}>
                    <div className="col"><input className="form-control" placeholder="Shop Name" value={stock.shopName} onChange={e => handleStockChange(index, "shopName", e.target.value)} /></div>
                    <div className="col"><input className="form-control" type="number" placeholder="Quantity" value={stock.quantity} onChange={e => handleStockChange(index, "quantity", e.target.value)} /></div>
                    <div className="col">
                      <select className="form-control" value={stock.unit} onChange={e => handleStockChange(index, "unit", e.target.value)}>
                        {unitOptions.map((unit, i) => (
                          <option key={i} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-1">
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveStockRow(index)}>X</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={handleAddStockRow}>+ Add Shop Stock</button>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" onClick={handleSaveClick}>Save</button>
              <button className="btn btn-secondary" onClick={handleCancelClick}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewProduct;

