const axios = require("axios");
const Order = require("../../../model/orderSchema");

exports.initiateKhaltiPayment = async (req, res) => {
    const {orderId, amount} = req.body;
    if (!orderId || !amount) {
        return res.status(400).json({message: "Order ID and amount are required"});
    }

    const data = {
        return_url: "http://localhost:3000/api/payment/success",
        website_url: "http://localhost:3000",
        amount: amount,
        purchase_order_id: orderId,
        purchase_order_name: "Order Payment",
    
    };

    const response = await axios.post("https://dev.khalti.com/api/v2/epayment/initiate/", data, {
        headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`
        }
    });

    console.log(response.data);
    let order = await Order.findById(orderId);
    order.paymentDetails.pidx = response.data.pidx;
    await order.save();

    res.redirect(response.data.payment_url);

   
}

exports.verifyPidx = async (req, res) => {
    const { pidx } = req.query;  
    const response = await axios.post("https://dev.khalti.com/api/v2/epayment/lookup/", { pidx }, {
        headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`
        }
    });

   if (response.data.status === "Completed") {
    // update order payment status in database
    let order = await Order.findOne({ "paymentDetails.pidx": pidx });
    order.paymentDetails.paymentStatus = "completed";
    order.paymentDetails.paymentMethod = "Khalti";
    await order.save();
    // notify to frontend
    res.redirect("http://localhost:3000")
   } else {
    // notify error to frontend
    res.redirect("http://localhost:3000/error")
    }
  
}
