// controllers/productMetaController.js
const ProductMeta =require( "../Model/productMeta");
const Product = require("../Model/product");
const mongoose = require("mongoose");
const getAllProductMeta = async (req, res) => {
  try {
    const metaList = await ProductMeta.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: {
          path: "$productInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          product: 1,
          productTitle: "$productInfo.title",
          manufactureDate: 1,
          expiryDate: 1,
          deliveryDate: 1,
          deliveryTime: 1,
          addedBy: 1,
          createdAt: 1
        }
      }
    ]);

    res.status(200).json({ success: true, meta: metaList });
  } catch (error) {
    console.error("Error in getAllProductMeta:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};



// Create metadata entry
const addProductMeta = async (req, res) => {
  try {
    const { product, manufactureDate, expiryDate, deliveryDate, deliveryTime } = req.body;
    const addedBy = req.user.id;

    // ✅ Check if product is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ success: false, error: "Invalid product ID." });
    }

    // ✅ Check if product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({ success: false, error: "Product not found." });
    }

    const newMeta = new ProductMeta({
      product,
      addedBy,
      manufactureDate,
      expiryDate,
      deliveryDate,
      deliveryTime,
    });

    const savedMeta = await newMeta.save();
    res.status(201).json({ success: true, meta: savedMeta });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get metadata for a product
const getProductMeta = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, error: "Invalid Product ID" });
    }

    const meta = await ProductMeta.find({ product: productId }).populate("product", "title");
    res.status(200).json({ success: true, meta });
  } catch (err) {
    console.error("Error in getProductMeta:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// Update metadata
const updateProductMeta = async (req, res) => {
  try {
    const { id } = req.params; // meta ID
    const updates = req.body;

    const updatedMeta = await ProductMeta.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedMeta) return res.status(404).json({ message: "Metadata not found" });

    res.json({ success: true, meta: updatedMeta });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete metadata
const deleteProductMeta = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ProductMeta.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Metadata not found" });

    res.json({ success: true, message: "Metadata deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {getAllProductMeta,addProductMeta, getProductMeta, updateProductMeta, deleteProductMeta}