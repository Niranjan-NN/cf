import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axiosInstance from "../utils/axiosInstance";
import "../styles/orderdetails.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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

    // Fetch order details
    axiosInstance
      .get(`${api}/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const data = res.data;

        // Fetch productMeta for each product
        const itemsWithMeta = await Promise.all(
          data?.items?.map(async (item) => {
            let deliveryDate = null;
            let deliveryTime = null;

            try {
              const metaRes = await axiosInstance.get(
                `${api}/api/productMeta/${item.product?._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (metaRes.data?.success && metaRes.data?.meta) {
                deliveryDate = metaRes.data.meta.deliveryDate;
                deliveryTime = metaRes.data.meta.deliveryTime;
              }
            } catch (err) {
              console.warn(
                `No meta found for product ${item?.product?._id}`,
                err
              );
            }

            return {
              id: item?.product?._id || "",
              name: item?.product?.title || "Unnamed Product",
              quantity: Number(item?.quantity) || 0,
              price: Number(item?.product?.price) || 0,
              image: item?.product?.image
                ? `${api}/uploads/${item.product.image}`
                : null,
              shopName:
                item?.product?.shopStocks?.[0]?.shopName ||
                item?.shopName ||
                "Unknown Shop",
              description: item?.product?.description || "",
              category: item?.product?.category || "",
              deliveryDate,
              deliveryTime,
            };
          }) || []
        );

        setOrder({
          id: data?._id || "",
          date: data?.createdAt ? formatDate(data.createdAt) : "",
          status: data?.status || "Pending",
          items: itemsWithMeta,
          total: Number(data?.totalPrice) || 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching order details:", err);
        setLoading(false);
      });
  }, [api, orderId, navigate]);

  const handleCancelOrder = async () => {
  if (!orderId) {
    alert("Invalid order ID");
    return;
  }

  if (!window.confirm("Are you sure you want to cancel this order?")) return;

  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  if (!token) {
    alert("You must be logged in to cancel an order");
    return;
  }

  try {
    setCancelling(true);

    const res = await axiosInstance.delete(`${api}/api/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Update order status locally
    setOrder((prev) => ({
      ...prev,
      status: "Cancelled",
    }));

    alert(res.data?.message || "Order cancelled successfully");
  } catch (error) {
    console.error("Error cancelling order:", error);

    const errorMsg =
      error.response?.data?.message || "Failed to cancel the order. Try again.";
    alert(errorMsg);
  } finally {
    setCancelling(false);
  }
};


  if (loading) {
    return (
      <div className="orderdetails-page">
        <Navbar />
        <div className="orderdetails-container">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="orderdetails-page">
        <Navbar />
        <div className="orderdetails-container">Order not found.</div>
      </div>
    );
  }

  return (
    <div className="orderdetails-page">
      <Navbar />
      <div className="orderdetails-container">
        <h2>Order Details</h2>

        <div className="orderdetails-header">
          <p>
            <strong>Order ID:</strong> {order.id}
          </p>
          <p>
            <strong>Date:</strong> {order.date}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status ${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </p>
        </div>

        {/* Cancel Order Button */}
        {order.status === "Pending" && (
          <button
            className="cancel-order-btn"
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}

        {/* Product Table with Details */}
        <table className="orderdetails-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Shop</th>
              <th>Qty</th>
              <th>Price (₹)</th>
              <th>Line Total (₹)</th>
              <th>Delivery Date</th>
              <th>Delivery Time</th>
            </tr>
          </thead>
          <tbody>
            {order.items.length > 0 ? (
              order.items.map((item, index) => (
                <tr key={index}>
                  <td className="orderdetails-product-cell">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="orderdetails-product-img"
                      />
                    )}
                    <div>
                      <strong>{item.name}</strong>
                      <br />
                      <small>{item.description}</small>
                      <br />
                      <em>{item.category}</em>
                    </div>
                  </td>
                  <td>{item.shopName}</td>
                  <td>{item.quantity}</td>
                  <td>₹{Number(item.price).toFixed(2)}</td>
                  <td>
                    ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </td>
                  <td>{item.deliveryDate ? formatDate(item.deliveryDate) : "N/A"}</td>
                  <td>{item.deliveryTime || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No items in this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="orderdetails-total">
          <strong>Total:</strong> ₹{Number(order.total).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
