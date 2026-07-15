

exports.getAllOrders = async (req, res) => {

    const orders = await Order.find().populate({
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

exports.getSingleOrder = async (req, res) => {
    const { orderId } = req.params;

    // Check if orderId is provided
    if (!orderId) {
        return res.status(400).json({
            message: "Please provide order id",
        });
    }
    // check if order exists
    const order = await Order.findById(orderId)
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }

    res.status(200).json({
        message: "Order fetched successfully",
        data: order,
    });
}

exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    // Check if orderId is provided
    if (!orderId) {
        return res.status(400).json({
            message: "Please provide order id",
        });
    }

    // Check if status is provided
    if (!orderStatus) {
        return res.status(400).json({
            message: "Please provide order status",
        });
    }

    if (!["pending", "shipped", "delivered", "cancelled"].includes(orderStatus)) {
        return res.status(400).json({
            message: "Invalid order status",
        });
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus },
        { new: true }
    );

    res.status(200).json({
        message: "Order status updated successfully",
        data: updatedOrder,
    });
};

exports.deleteOrder = async (req, res) => {
    const { orderId } = req.params;

    // Check if orderId is provided
    if (!orderId) {
        return res.status(400).json({
            message: "Please provide order id",
        });
    }
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
        message: "Order deleted successfully",
        data: null,
    });
}

