import React, { useEffect, useState } from "react";
import "../styles/home.css";
import "../styles/orderhistory.css";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;

  // ✅ Format date as DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get(`${api}/api/order/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch delivery dates from ProductMeta
        const ordersWithMeta = await Promise.all(
          res.data.map(async (order) => {
            const itemsWithMeta = await Promise.all(
              order.items.map(async (item) => {
                let deliveryDate = null;
                let deliveryTime = null;

                try {
                  const metaRes = await axiosInstance.get(
                    `${api}/api/productMeta/${item.product?._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  if (metaRes.data?.success && metaRes.data.meta) {
                    deliveryDate = metaRes.data.meta.deliveryDate;
                    deliveryTime = metaRes.data.meta.deliveryTime;
                  }
                } catch (err) {
                  console.warn(
                    `No productMeta found for product ${item.product?._id}`
                  );
                }

                return {
                  name: item.product?.title || "Unnamed Product",
                  quantity: item.quantity,
                  price: item.product?.price || 0,
                  deliveryDate,
                  deliveryTime,
                };
              })
            );

            return {
              id: order._id,
              date: order.createdAt,
              items: itemsWithMeta,
              total: order.totalPrice || 0,
              status: order.status || "Pending",
            };
          })
        );

        setOrders(ordersWithMeta);
        setFilteredOrders(ordersWithMeta);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, [api, navigate]);

  // Search & Filter logic
  useEffect(() => {
    let updatedOrders = orders;

    if (searchTerm.trim() !== "") {
      updatedOrders = updatedOrders.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (statusFilter !== "All") {
      updatedOrders = updatedOrders.filter(
        (order) => order.status === statusFilter
      );
    }

    setFilteredOrders(updatedOrders);
  }, [searchTerm, statusFilter, orders]);

  // Navigate to order details
  const handleOrderClick = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  return (
    <div className="orderhistory-page">
      <Navbar />
      <div className="orderhistory-container">
        <h2 className="orderhistory-title">Order History</h2>

        {/* Search & Filter */}
        <div className="orderhistory-filters">
          <input
            type="text"
            placeholder="Search by Order ID or Product Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="orderhistory-search"
          />
          <select
            className="orderhistory-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="orderhistory-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="orderhistory-card"
                onClick={() => handleOrderClick(order.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="orderhistory-card-header">
                  <span>
                    <strong>Order ID:</strong> {order.id}
                  </span>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <p>
                  <strong>Order Date:</strong> {formatDate(order.date)}
                </p>

                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} ({item.quantity}x) - ₹
                      {(item.price * item.quantity).toFixed(2)} <br />
                      <small>
                        Delivery:{" "}
                        {item.deliveryDate
                          ? `${formatDate(item.deliveryDate)} at ${
                              item.deliveryTime || "N/A"
                            }`
                          : "Not Available"}
                      </small>
                    </li>
                  ))}
                </ul>

                <p>
                  <strong>Total:</strong> ₹{order.total.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <p className="no-orders">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
