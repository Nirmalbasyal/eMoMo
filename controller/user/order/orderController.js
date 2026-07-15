const Order = require("../../../model/orderSchema");
const Product = require("../../../model/productModel");

exports.createOrder = async (req, res) => {
    const userId = req.user.id;
    const { items, shippingAddress,totalAmount, paymentDetails } = req.body;
    if (!items.length > 0 || !shippingAddress || !totalAmount || !paymentDetails) {
        return res.status(400).json({
            message: "Please provide items, shippingAddress, totalAmount, and paymentDetails",
        });
    }
    // insert into order
    const order = await Order.create({
        user: userId,
        items,
        totalAmount,
        shippingAddress,
        paymentDetails
    });
    res.status(201).json({
        message: "Order created successfully",
        data: order,
    });
}
exports.getMyOrders = async (req, res) => {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).populate({
        path: "items.product",
        select: "productName productDescription productPrice",
    });

    if (orders.length === 0) {
      return res.status(404).json({
        message: "No orders found",
        data: [],
      });
    }
    res.status(200).json({
        message: "Orders fetched successfully",
        data: orders,
    });
};

// cancel order api

exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  // Check if orderId is provided
  if (!orderId) {
    return res.status(400).json({
      message: "Please provide order id",
    });
  }

  // Find the order
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  // Check if the logged-in user owns the order
  if (order.user.toString() !== userId) {
    return res.status(403).json({
      message: "You are not authorized to cancel this order",
    });
  }

  // Check if already cancelled
  if (order.orderStatus === "cancelled") {
    return res.status(400).json({
      message: "Order is already cancelled",
    });
  }

  // Prevent cancelling shipped/delivered orders
  if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
    return res.status(400).json({
      message: `Order is already ${order.orderStatus}. It cannot be cancelled.`,
    });
  }

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        productStock: item.quantity,
      },
    });
  }

  // Update order status
  order.orderStatus = "cancelled";
  await order.save();

  res.status(200).json({
    message: "Order cancelled successfully",
    data: order,
  });
};

// delete order api
exports.deleteMyOrder = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }

    if (order.user.toString() !== userId) {
        return res.status(403).json({
            message: "You are not the owner of this order",
        });
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
        message: "Order deleted successfully",
    });
};

exports.updateMyOrder = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod } = req.body; 

    if (!items && !shippingAddress && !paymentMethod) {
        return res.status(400).json({
            message: "Please provide at least one field to update (items, shippingAddress, paymentMethod)",
        });
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
        return res.status(404).json({
            message: "Order not found",
        });
    }

    if (existingOrder.user.toString() !== userId) {
        return res.status(403).json({
            message: "You are not the owner of this order",
        });
    }

    if (existingOrder.orderStatus === "shipped" || existingOrder.orderStatus === "delivered" || existingOrder.orderStatus === "cancelled" ) {
        return res.status(400).json({
            message: `Order is already ${existingOrder.orderStatus}. It cannot be updated.`,
        });
    }
  
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { items, shippingAddress, paymentMethod }, { new: true });

    res.status(200).json({
        message: "Order updated successfully",
        data: updatedOrder,
    });
}

