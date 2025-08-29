const Order = require("../Model/order");
const Cart = require("../Model/cart");
const Address = require("../Model/Address");

// Place an order
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, addressId } = req.body;

    // Fetch cart with products
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Group items by shop
    const shopOrders = {};
    for (const item of cart.items) {
      if (!item.product) {
        // Product was deleted -> skip or handle differently
        console.warn(`Product missing for cart item: ${item._id}`);
        continue;
      }

      const shopName = item.product.shopStocks?.[0]?.shopName || "Unknown Shop";

      if (!shopOrders[shopName]) {
        shopOrders[shopName] = [];
      }

      shopOrders[shopName].push({
        product: item.product._id,
        quantity: item.quantity,
        shopName
      });
    }

    if (Object.keys(shopOrders).length === 0) {
      return res.status(400).json({ message: "No valid products in cart" });
    }

    const createdOrders = [];

    for (const shopName in shopOrders) {
      const shopItems = shopOrders[shopName];
      const totalPrice = shopItems.reduce((sum, item) => {
        const productData = cart.items.find(
          c => c.product && String(c.product._id) === String(item.product)
        );
        return sum + ((productData?.product?.price || 0) * item.quantity);
      }, 0);

      const newOrder = new Order({
        user: userId,
        address: address._id,  // ✅ store only ObjectId
        items: shopItems,
        totalPrice,
        paymentMethod,
        status: "Pending"
      });

      await newOrder.save();
      createdOrders.push(newOrder);
    }

    // Clear cart after successful order(s)
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      message: "Orders placed successfully",
      orders: createdOrders
    });

  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


// Get user orders
// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .populate("address")
      .sort({createdAt:-1});
    // Inject shopName into each order item
    const formattedOrders = orders.map(order => {
      const itemsWithShop = order.items.map(item => ({
        ...item.toObject(),
        shopName: item.product?.shopStocks?.[0]?.shopName || "Unknown Shop"
      }));
      return {
        ...order.toObject(),
        items: itemsWithShop
      };
    });

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get all orders (Admin only)
// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "items.product",
        populate: {
          path: "shopStocks.vendor",
          model: "Vendor",
          select: "phoneNumber"
        }
      })
      .populate({ path: "user", select: "-password" })
      .populate("address")
      .sort({createdAt:-1});
    const formattedOrders = orders.map(order => {
      const itemsWithShop = order.items.map(item => {
        // ✅ match the correct shopStock based on shopName
        const matchedStock = item.product?.shopStocks?.find(
          s => s.shopName === item.shopName
        );

        return {
          ...item.toObject(),
          shopName: item.shopName || matchedStock?.shopName || "Unknown Shop",
          vendorNumber: matchedStock?.vendor?.phoneNumber
            ? `+${matchedStock.vendor.phoneNumber.replace(/^\+?/, "")}`
            : null
        };
      });

      return { ...order.toObject(), items: itemsWithShop };
    });

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getOrderById = async(req,res) =>{
  try{
    const {orderId} = req.params;

    const order = await Order.findById(orderId)
    .populate("items.product") // 🔥 ensures product details come in
      .populate("address");
    if (!order) return res.status(404).json({ message: "Order not found" });
  res.status(200).json( order );
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}


// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status } }
    );

    res.status(200).json({ message: "Orders updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update orders" });
  }
};

// Cancel order (User)
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optional: check if the logged-in user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Either delete or mark as cancelled
    // await order.remove();   // 🔴 Permanently delete
    order.status = 'Cancelled';  // ✅ Better: mark as cancelled
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {placeOrder,getAllOrders,getUserOrders,updateOrderStatus,cancelOrder,bulkUpdateOrderStatus,getOrderById}
