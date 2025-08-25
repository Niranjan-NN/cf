const Product = require('../Model/product');
const path = require('path');
const fs = require('fs');

// Add new product
const AddProduct = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'You are not authorized to perform this action' });
    }

    const { title, description, category, price, offerDescription, shopStocks } = req.body;
    const image = req.file; // may be undefined

    // Parse shopStocks if it's sent as a JSON string
    let parsedShopStocks;
    try {
      parsedShopStocks = typeof shopStocks === 'string' ? JSON.parse(shopStocks) : shopStocks;

      // Validate that each shopStock entry has vendor
      if (!Array.isArray(parsedShopStocks) || parsedShopStocks.length === 0) {
        return res.status(400).json({ message: 'shopStocks must be a non-empty array' });
      }

      for (const stock of parsedShopStocks) {
        if (!stock.shopName || !stock.vendor || !stock.quantity) {
          return res.status(400).json({ message: 'Each shop stock must include shopName, vendor, and quantity' });
        }
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid shopStocks format' });
    }

    const newProduct = {
      title,
      description,
      category,
      price,
      offerDescription,
      shopStocks: parsedShopStocks,
      user: req.user.id,
    };

    if (image) {
      newProduct.image = image.filename;
    }

    const product = await Product.create(newProduct);

    // Populate vendor details for response
    await product.populate('shopStocks.vendor');

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while adding the product' });
  }
};



// Get all products
// Get all products with vendor info
const GetProduct = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("shopStocks.vendor", "name phoneNumber"); // ✅ populate vendor fields

        res.status(200).json( {products} );
    } catch (error) {
        res.status(500).json({ message: 'Error Occurred' });
    }
};

// Get product by ID with vendor info
const GetProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id)
            .populate("shopStocks.vendor", "name phoneNumber"); // ✅ populate vendor

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Error Occurred' });
    }
};


// Update product
const UpdateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'You are not authorized to perform this action' });
    }

    const { title, description, category, price, offerDescription, shopStocks } = req.body;
    const image = req.file;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields only if provided
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (offerDescription !== undefined) product.offerDescription = offerDescription;

    // Handle shopStocks update
    if (shopStocks !== undefined) {
      try {
        const parsedShopStocks = typeof shopStocks === 'string' ? JSON.parse(shopStocks) : shopStocks;

        // Validate vendor, shopName, and quantity
        if (!Array.isArray(parsedShopStocks) || parsedShopStocks.length === 0) {
          return res.status(400).json({ message: 'shopStocks must be a non-empty array' });
        }
        for (const stock of parsedShopStocks) {
          if (!stock.shopName || !stock.vendor || !stock.quantity) {
            return res.status(400).json({ message: 'Each shop stock must include shopName, vendor, and quantity' });
          }
        }

        product.shopStocks = parsedShopStocks;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid shopStocks format' });
      }
    }

    // Optional image update
    if (image) {
      product.image = image.filename;
    }

    const updatedProduct = await product.save();

    // Populate vendor details for response
    await updatedProduct.populate('shopStocks.vendor');

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });

  } catch (error) {
    console.error("UpdateProduct error:", error);
    res.status(500).json({ message: 'Error occurred during product update' });
  }
};



// Delete product
const DeleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'You are not authorized to perform this action' });
        }

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete image file if exists
        if (product.image) {
            const imagePath = path.join(__dirname, '..', 'uploads', product.image);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                } else {
                    console.log('Image deleted:', product.image);
                }
            });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error occurred during deletion' });
    }
};

module.exports = {
    AddProduct,
    GetProduct,
    GetProductById,
    UpdateProduct,
    DeleteProduct
};
