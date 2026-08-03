const Order = require("../../../model/orderSchema");
const Product = require("../../../model/productModel");
const { getIO } = require("../../../services/socket");

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, shippingAddress, totalAmount, paymentDetails, phoneNumber } = req.body;
  if (!items.length > 0 || !shippingAddress || !totalAmount || !paymentDetails || !phoneNumber) {
    return res.status(400).json({
      message: "Please provide items, shippingAddress, totalAmount, phoneNumber, and paymentDetails",
    });
  }
  // insert into order
  const order = await Order.create({
    user: userId,
    items,
    totalAmount,
    shippingAddress,
    phoneNumber,
    paymentDetails,
  });
  res.status(201).json({
    message: "Order created successfully",
    data: order,
  });
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate({ path: "items.product", select: "productName productDescription productPrice" })
    .populate({ path: "user", select: "userName email" })
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "Orders fetched successfully",
    data: orders,
  });
};

exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  const order = await Order.findById(orderId)
    .populate({ path: "items.product", select: "productName productDescription productPrice" })
    .populate({ path: "user", select: "userName email" });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.status(200).json({
    message: "Order fetched successfully",
    data: order,
  });
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  const validStatuses = ["pending", "preparing", "shipped", "delivered", "cancelled"];
  if (!orderStatus || !validStatuses.includes(orderStatus)) {
    return res.status(400).json({ message: "Please provide a valid orderStatus" });
  }

  const order = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true })
    .populate({ path: "items.product", select: "productName productDescription productPrice" })
    .populate({ path: "user", select: "userName email" });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // notify only the customer who owns this order — emitted to their private
  // room (named after their user ID), so no one else receives this event
 const io = getIO(); // grab the already-initialized io instance
 io.to(order.user._id.toString()).emit("orderStatusUpdated", order);

  res.status(200).json({
    message: "Order status updated successfully",
    data: order,
  });
};

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

  // Prevent cancelling preparing/shipped/delivered orders
  if (order.orderStatus === "preparing" || order.orderStatus === "shipped" || order.orderStatus === "delivered") {
    return res.status(400).json({
      message: `Order is already ${order.orderStatus}. It cannot be cancelled.`,
    });
  }

  // only restore stock if it was actually decremented for this order —
  // most cancellations happen before payment completes, so there's
  // nothing to give back in that case
  if (order.stockDecremented) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          productStock: item.quantity,
        },
      });
    }
    // Mark stock as restored to prevent duplicate restoration
    order.stockDecremented = false;
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

  if (
    existingOrder.orderStatus === "preparing" ||
    existingOrder.orderStatus === "shipped" ||
    existingOrder.orderStatus === "delivered" ||
    existingOrder.orderStatus === "cancelled"
  ) {
    return res.status(400).json({
      message: `Order is already ${existingOrder.orderStatus}. It cannot be updated.`,
    });
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId, { items, shippingAddress, paymentMethod }, { new: true });

  res.status(200).json({
    message: "Order updated successfully",
    data: updatedOrder,
  });
};

exports.updatePaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  const validStatuses = ["pending", "completed", "failed"];
  if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
    return res.status(400).json({ message: "Please provide a valid paymentStatus" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // only decrement stock the first time payment becomes "completed" —
  // stockDecremented guards against double-decrementing if this is called
  // more than once (e.g. admin clicks the button twice by accident)
  if (paymentStatus === "completed" && !order.stockDecremented) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { productStock: -item.quantity },
      });
    }
    order.stockDecremented = true;
  }

  order.paymentDetails.paymentStatus = paymentStatus;
  await order.save();

  const populatedOrder = await Order.findById(orderId)
    .populate({ path: "items.product", select: "productName productDescription productPrice" })
    .populate({ path: "user", select: "userName email" });

  res.status(200).json({
    message: "Payment status updated successfully",
    data: populatedOrder,
  });
};
