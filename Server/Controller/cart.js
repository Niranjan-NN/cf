const Cart = require('../Model/cart')
const Product = require('../Model/product')

const addtoCart = async (req, res) => {
  try {
      const { productId, quantity } = req.body;
      const userId = req.user.id; 
      
      let cart = await Cart.findOne({ user: userId });
  
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }
  
      // Check if product already exists in cart
      const existingItem = cart.items.find(item => item.product.toString() === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity; // Update quantity
      } else {
        cart.items.push({ product: productId, quantity });
      }
  
      await cart.save();
      res.status(200).json({ message: "Item added to cart", cart });
  
    } catch (error) {
      res.status(500).json({ message:error.message });
    }
  };

    //get cart items
    const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "_id title price image shopStocks",
    });

    if (!cart) {
      return res.status(200).json({ items: [] }); // Return empty array instead of 404
    }

    // Remove items with missing product reference
    cart.items = cart.items.filter(item => item.product !== null);

    res.status(200).json({ items: cart.items });
  } catch (error) {
    console.error("Cart Fetch Error:", error);
    res.status(500).json({ error: error.message });
  }
};


        //remove item from cart
        const removeItemFromCart = async (req, res) => {
          try {
            if (!req.user) {
              return res.status(401).json({ message: "Unauthorized! Please log in." });
            }
        
            const userId = req.user.id; 
            const productId = req.params.productId; 
        
            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
              return res.status(404).json({ message: "Cart not found" });
            }
        
            
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
            await cart.save();
        
            res.status(200).json({ message: "Item removed from cart", cart });
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
          }
        };

module.exports = {addtoCart,getCartItems,removeItemFromCart}