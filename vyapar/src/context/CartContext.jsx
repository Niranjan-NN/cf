import React, { createContext, useReducer, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return action.payload;
    case "INCREASE_QUANTITY":
      return state.map(item =>
        item.product._id === action.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    case "DECREASE_QUANTITY":
      return state.map(item =>
        item.product._id === action.id
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      );
    case "REMOVE_FROM_CART":
      return state.filter(item => item.product._id !== action.id);
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const api = import.meta.env.VITE_API_URL;

  const addToCart = (items) => {
  dispatch({ type: "SET_CART", payload: items });
};


  const fetchCartItemsFromAPI = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const response = await axiosInstance.get(`${api}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch({ type: "SET_CART", payload: response.data.items });
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const increaseQuantity = async (id) => {
    dispatch({ type: "INCREASE_QUANTITY", id });
    // Optionally update on backend here
  };

  const decreaseQuantity = async (id) => {
    dispatch({ type: "DECREASE_QUANTITY", id });
    // Optionally update on backend here
  };

  const removeFromCart = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`${api}/api/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCartItemsFromAPI();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCartItemsFromAPI,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        addToCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
