import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaShoppingCart, FaBell, FaUserCircle, FaHome } from "react-icons/fa";
import "../styles/Product.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../utils/axiosInstance";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [meta, setMeta] = useState(null); // ✅ safe meta
  const [loading, setLoading] = useState(true);
  const [selectedShopIndex, setSelectedShopIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [review, setReview] = useState("");
  const [question, setQuestion] = useState("");
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, reviewRes, questionRes] = await Promise.all([
          axiosInstance.get(`${api}/api/product/${id}`),
          axiosInstance.get(`${api}/api/review/${id}`),
          axiosInstance.get(`${api}/api/question/${id}`),
        ]);

        setProduct(productRes.data.product);
        setReviews(reviewRes.data.reviews || []);
        setQuestions(questionRes.data.questions || []);

        // ✅ Try fetching meta separately (ignore if 404)
        try {
          const metaRes = await axiosInstance.get(`${api}/api/productMeta/${id}`);
          setMeta(metaRes.data.meta || null);
        } catch (err) {
          if (err.response?.status === 404) {
            setMeta(null); // no meta → safe fallback
          } else {
            console.error("Meta fetch error:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center mt-5">Loading product...</div>;

  if (!product || typeof product.price !== "number" || isNaN(product.price)) {
    return (
      <div className="text-danger text-center mt-5">
        Product data is invalid
      </div>
    );
  }

  const discountedPrice =
    product.price * (1 - (product.discount ? product.discount / 100 : 0));

  const selectedStock = product?.shopStocks?.[selectedShopIndex];

  // ✅ format delivery date safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const itemToAdd = { productId: product._id, quantity: 1 };

      const response = await axiosInstance.post(
        `${api}/api/cart/add`,
        itemToAdd,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      addToCart(response.data.cart.items);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      navigate("/cart");
    } catch (error) {
      console.error(
        "Error adding item to cart:",
        error.response?.data || error.message
      );
    }
  };

  const handleSubmitReview = async () => {
    if (!review.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await axiosInstance.post(
        `${api}/api/review`,
        { productId: id, comment: review },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews((prev) => [...prev, res.data.review]);
      setReview("");
    } catch (err) {
      console.error("Review submission error:", err.response?.data || err.message);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await axiosInstance.post(
        `${api}/api/question`,
        { productId: id, question },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions((prev) => [...prev, res.data.question]);
      setQuestion("");
    } catch (err) {
      console.error("Question submission error:", err.response?.data || err.message);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">CORE FOUR</div>
        <div className="navbar-icons d-flex gap-3">
          <FaHome className="icon" onClick={() => navigate("/")} />
          <FaShoppingCart className="icon" onClick={() => navigate("/cart")} />
          <FaBell className="icon" />
          <FaUserCircle className="icon" onClick={() => navigate("/profile")} />
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          {/* Product Image */}
          <div className="col-md-5 text-center">
            <img
              src={`${api}/uploads/${product.image}`}
              alt={product.title}
              className="img-fluid rounded"
            />
          </div>

          {/* Product Details */}
          <div className="col-md-7">
            <h2 className="fw-bold">{product.title}</h2>
            <p className="h4 text-success">₹{discountedPrice.toFixed(2)}</p>

            {/* ✅ Delivery Date (fallback to N/A) */}
            <p className="text-info">
              Delivery Date: {formatDate(meta?.deliveryDate)}
            </p>

            <p>{product.description}</p>

            {product.shopStocks?.length > 0 && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Shop</label>
                <select
                  value={selectedShopIndex}
                  onChange={(e) => setSelectedShopIndex(Number(e.target.value))}
                  className="form-select"
                >
                  {product.shopStocks.map((stock, index) => (
                    <option key={index} value={index}>
                      {stock.shopName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="d-flex align-items-center mb-3">
              <span className="me-2">Quantity:</span>
              <strong>1 {selectedStock?.unit || ""}</strong>
            </div>

            <div className="d-flex gap-3">
              <button className="btn btn-primary" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button
                className="btn btn-success"
                onClick={() => navigate("/cart")}
              >
                Buy Now
              </button>
            </div>

            {showMessage && (
              <div className="alert alert-success mt-3" role="alert">
                Item added to cart!
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <h4>Description</h4>
          <p>{product.description}</p>
        </div>

        {/* Reviews */}
        <div className="mt-4">
          <h4>Reviews ({reviews.length})</h4>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
            className="form-control mb-2"
            rows="3"
          ></textarea>
          <button
            onClick={handleSubmitReview}
            className="btn btn-outline-primary"
          >
            Submit Review
          </button>

          <div className="mt-3">
            {reviews.map((rev, index) => (
              <div key={index} className="border p-2 rounded mb-2 bg-light">
                <p className="fw-bold mb-1">{rev.user?.name || "Anonymous"}:</p>
                <p className="mb-0">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="mt-4">
          <h4>Q & A ({questions.length})</h4>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question here..."
            className="form-control mb-2"
            rows="2"
          ></textarea>
          <button
            onClick={handleSubmitQuestion}
            className="btn btn-outline-secondary"
          >
            Submit Question
          </button>

          <div className="mt-3">
            {questions.map((q, index) => (
              <div key={index} className="border p-2 rounded mb-2 bg-light">
                <p className="fw-bold mb-1">
                  {q.user?.name || "Anonymous"} asked:
                </p>
                <p className="mb-0">{q.question}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-5">
          <h4>Viewers Also Liked</h4>
          <div className="border p-4 text-muted text-center">
            Related products will be shown here.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
