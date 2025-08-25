const express = require('express');
const router = express.Router();
const ProductMeta = require('../Model/productMeta');
const {
  getAllProductMeta,
  addProductMeta,
  getProductMeta,
  updateProductMeta,
  deleteProductMeta
} = require('../Controller/productMetaController');
const { authenticateJWT } = require('../Middleware/Authorization');

// Add new product meta
router.post("/addMeta", authenticateJWT, addProductMeta);

// Get all product metas (considered as admin view)
router.get("/all", authenticateJWT, getAllProductMeta);

// Get meta for a specific product by product ID
router.get("/:productId", authenticateJWT, getProductMeta);

// Update a meta by its ID
router.put("/:id", authenticateJWT, updateProductMeta);

// Delete a meta by its ID
router.delete("/:id", authenticateJWT, deleteProductMeta);

module.exports = router;
