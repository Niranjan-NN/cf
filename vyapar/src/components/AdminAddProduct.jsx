import React, { useRef, useState, useEffect } from 'react';
import { FaSearch, FaSignOutAlt, FaPlus, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/AdminAddProduct.css';
import adminAxiosInstance from '../utils/adminAxiosInstance';

const AdminAddProduct = () => {
    const descriptionRef = useRef(null);
    const stackRef = useRef(null);
    const navigate = useNavigate();

    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [offerDescription, setOfferDescription] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);

    const [shopStocks, setShopStocks] = useState([
        { shopName: '', quantity: '', unit: 'kg' }
    ]);

    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            setToastMessage("Access denied. Please log in as admin.");
            setShowErrorToast(true);
            navigate("/");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== "admin") {
                setToastMessage("Access denied. Admins only.");
                setShowErrorToast(true);
                navigate("/");
                return;
            }
        } catch (error) {
            console.error("Invalid token", error);
            setToastMessage("Access denied. Invalid token.");
            setShowErrorToast(true);
            navigate("/");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/adminloginpage");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };

    const handleShopStockChange = (index, field, value) => {
        const updated = [...shopStocks];
        updated[index][field] = value;
        setShopStocks(updated);
    };

    const addShopStockField = () => {
        setShopStocks([...shopStocks, { shopName: '', quantity: '', unit: 'kg' }]);
    };

    const removeShopStockField = (index) => {
        const updated = shopStocks.filter((_, i) => i !== index);
        setShopStocks(updated);
    };

    const resetForm = () => {
        setProductName('');
        setPrice('');
        setCategory('');
        setOfferDescription('');
        setDescription('');
        setImage(null);
        setShopStocks([{ shopName: '', quantity: '', unit: 'kg' }]);
        if (document.getElementById('image')) {
            document.getElementById('image').value = '';
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", productName);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("price", price);
        formData.append("offerDescription", offerDescription);
        if (image) {
  formData.append("image", image);
}

        formData.append("shopStocks", JSON.stringify(shopStocks));

        try {
            const response = await adminAxiosInstance.post(
                `${api}/api/addProduct`,
                formData,
                {
                    headers: {
                        "authorization": 'Bearer ' + localStorage.getItem('adminToken')
                    }
                }
            );
            setToastMessage(response.data.message || "Product added successfully!");
            setShowSuccessToast(true);
            resetForm();
        } catch (error) {
            setToastMessage(error.response?.data?.message || "Failed to add product.");
            setShowErrorToast(true);
        }

        setTimeout(() => setShowSuccessToast(false), 2000);
        setTimeout(() => setShowErrorToast(false), 2000);
    };

    return (
        <div>
            {showSuccessToast && <div className="success-toast">{toastMessage}</div>}
            {showErrorToast && <div className="error-toast">{toastMessage}</div>}

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
                <div className="sidebar">
                    <ul>
                        <li><Link to="/adminview">View product</Link></li>
                        <li><Link to="/admindetials">View details</Link></li>
                        <li><a href="#">Sales graph</a></li>
                    </ul>
                </div>

                <div className="content">
                    <h2>Add product</h2>
                    <form onSubmit={handleAddProduct}>
                        <label htmlFor="product-name">Product Name</label>
                        <input
                            type="text"
                            id="product-name"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                        />

                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />

                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select category</option>
                            <option value="fruits">Fruits</option>
                            <option value="vegetables">Vegetables</option>
                            <option value="greens">Greens</option>
                            <option value="grocery">Grocery</option>
                        </select>

                        <label htmlFor="offer-description">Offer Description (Optional)</label>
                        <input
                            type="text"
                            id="offer-description"
                            value={offerDescription}
                            onChange={(e) => setOfferDescription(e.target.value)}
                        />

                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            ref={descriptionRef}
                            required
                        ></textarea>

                        <label>Stock by Shop</label>
                        {shopStocks.map((stock, index) => (
                            <div key={index} className="stock-entry">
                                <input
                                    type="text"
                                    placeholder="Shop Name"
                                    value={stock.shopName}
                                    onChange={(e) => handleShopStockChange(index, 'shopName', e.target.value)}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={stock.quantity}
                                    onChange={(e) => handleShopStockChange(index, 'quantity', e.target.value)}
                                    required
                                />
                                <select
                                    value={stock.unit}
                                    onChange={(e) => handleShopStockChange(index, 'unit', e.target.value)}
                                    required
                                >
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="mg">mg</option>
                                    <option value="box">box</option>
                                    <option value="bunch">bunch</option>
                                    <option value="pack">pack</option>
                                    <option value="litre">litre</option>
                                    <option value="ml">ml</option>
                                    <option value="piece">piece</option>
                                </select>
                                {shopStocks.length > 1 && (
                                    <button type="button" onClick={() => removeShopStockField(index)} className="remove-stock-btn">
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addShopStockField} className="add-stock-btn">
                            <FaPlus /> Add Shop
                        </button>

                        <label htmlFor="image">Product Image</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            
                        />

                        <button type="submit" className="add-btn">Add</button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminAddProduct;
