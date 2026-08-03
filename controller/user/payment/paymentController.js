const axios = require("axios");
const Order = require("../../../model/orderSchema");
const Product = require("../../../model/productModel");

exports.initiateKhaltiPayment = async (req, res) => {
  const { orderId, amount } = req.body;
  if (!orderId || !amount) {
    return res.status(400).json({ message: "Order ID and amount are required" });
  }

  let order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found with the provided ID" });
  }

  // check coming amount is same as order total amount
  if (order.totalAmount !== amount) {
    return res.status(400).json({ message: "Amount does not match the order total amount" });
  }

  const data = {
    return_url: `${process.env.FRONTEND_URL}/payment/success`,
    website_url: process.env.FRONTEND_URL,
    amount: amount * 100, // amount in paisa
    purchase_order_id: orderId,
    purchase_order_name: "Order Payment",
  };
  let response;
  try {
    response = await axios.post("https://dev.khalti.com/api/v2/epayment/initiate/", data, {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      },
    });
  } catch (error) {
    // this is the part catchAsync can't see — the real Khalti rejection reason
    console.error("Khalti initiate error:", error.response?.data || error.message);
    return res.status(502).json({
      message: "Khalti payment initiation failed",
      error: error.response?.data || error.message,
    });
  }

  console.log(response.data);
  // let order = await Order.findById(orderId);
  order.paymentDetails.pidx = response.data.pidx;
  await order.save();

  // res.redirect(response.data.payment_url);
  res.status(200).json({
    payment_url: response.data.payment_url,
    pidx: response.data.pidx,
  });
};

exports.verifyPidx = async (req, res) => {
  const { pidx } = req.body;

  if (!pidx) {
    return res.status(400).json({ message: "pidx is required" });
  }

  let response;
  try {
    response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } },
    );
  } catch (error) {
    console.error("Khalti verify error:", error.response?.data || error.message);
    return res.status(502).json({
      message: "Khalti verification failed",
      error: error.response?.data || error.message,
    });
  }

  if (response.data.status === "Completed") {
    const order = await Order.findOne({ "paymentDetails.pidx": pidx });
    if (!order) {
      return res.status(404).json({ message: "No matching order found for this payment" });
    }

    // decrement stock only the first time this order's payment is confirmed —
    // guards against Khalti calling this twice, or the user refreshing the
    // success page and re-triggering verification
    if (!order.stockDecremented) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { productStock: -item.quantity },
        });
      }
      order.stockDecremented = true;
    }

    order.paymentDetails.paymentStatus = "completed";
    order.paymentDetails.paymentMethod = "Khalti";
    await order.save();

    return res.status(200).json({
      message: "Payment verified successfully",
      orderId: order._id,
    });
  }

  return res.status(400).json({
    message: "Payment not completed",
    data: response.data,
  });
};