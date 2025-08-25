import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import "../styles/Delivery.css";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import gif from "../assets/loading.mp4";

const Delivery = () => {
  const [profileData, setProfileData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id || decoded.userId;

      // Fetch user profile
      axiosInstance
        .get(`${api}/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          setProfileData({
            id: res.data._id,
            name: res.data.name,
            phone: res.data.mobileNumber,
            email: res.data.email
          });
        });

      // Fetch addresses
      axiosInstance
        .get(`${api}/api/getByIdAddress/${userId}`)
        .then((res) => {
          setAddresses(res.data || []);
          if (res.data.length > 0) {
            setSelectedAddressId(res.data[0]._id);
          }
        })
        .catch((err) => console.error("Address fetch error:", err));

      // Fetch cart
      axiosInstance
        .get(`${api}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const items = res.data.items || [];
          setCartItems(items);

          const total = items.reduce(
            (sum, item) => sum + (item.product?.price || 0) * item.quantity,
            0
          );
          setTotalPrice(total);
        })
        .catch((err) => console.error("Cart fetch error:", err));
    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/login");
    }
  }, [navigate, api]);

  // ✅ Group cart items by shop
  // ✅ Group cart items by shop
const groupedByShop = cartItems.reduce((acc, item) => {
  const shopName =
    item.product?.shopStocks?.[0]?.shopName || // from DB product data
    item.shopName ||                           // from updated backend if available
    "Unknown Shop";
  if (!acc[shopName]) acc[shopName] = [];
  acc[shopName].push(item);
  return acc;
}, {});


  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    axiosInstance
      .post(
        `${api}/api/order/place`,
        { paymentMethod, addressId: selectedAddressId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then(() => {
        setOrderPlaced(true);
        setTimeout(() => {
          navigate("/order");
        }, 2000);
      })
      .catch((err) => {
        console.error("Order placement error:", err);
        alert("Failed to place order. Please try again.");
      });
  };

  return (
    <div className="delivery-page">
      <Navbar />
      <div className="delivery-container">
        <h2 className="delivery-title">Delivery Details</h2>

        {profileData && (
          <div className="delivery-section">
            <h3>Recipient Information</h3>
            <p><strong>Name:</strong> {profileData.name}</p>
            <p><strong>Phone:</strong> {profileData.phone}</p>
            <p><strong>Email:</strong> {profileData.email}</p>

            {addresses.length > 0 ? (
              <div className="delivery-address-select">
                <label>Select Address:</label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                >
                  {addresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {`${addr.locationDetails}, ${addr.city}, ${addr.state} - ${addr.pincode}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p><strong>Address:</strong> No saved addresses</p>
            )}
          </div>
        )}

        <div className="delivery-section">
          <h3>Order Summary (Grouped by Shop)</h3>
          {Object.keys(groupedByShop).length > 0 ? (
            <>
              {Object.entries(groupedByShop).map(([shop, items]) => (
                <div key={shop} className="shop-group">
                  <h4>{shop}</h4>
                  <ul className="delivery-cart-list">
                    {items.map((item, idx) => (
                      <li key={idx} className="delivery-cart-item">
                        <span>{item.product?.title} ({item.quantity}x)</span>
                        <span>₹{(item.product?.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="delivery-total">
                <strong>Total:</strong> ₹{totalPrice.toFixed(2)}
              </div>
            </>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>

        <div className="delivery-section">
          <h3>Payment Method</h3>
          <select
            className="payment-method-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="COD">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="Razorpay">Razorpay</option>
          </select>
        </div>

        <div className="delivery-button-container">
          {orderPlaced ? (
            <div className="success-overlay">
              <video autoPlay loop muted className="success-video">
                <source src={gif} type="video/mp4" />
              </video>
              <h2 className="success-text">Payment Successful!</h2>
            </div>
          ) : (
            <button className="delivery-place-order" onClick={handlePlaceOrder}>
              Place Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Delivery;