const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    items: [
      {
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product ID is required"],
        },
      },
    ],

    phoneNumber: {
      type: Number,
      required: [true, "Phone number is required"],
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },

    shippingAddress: {
      type: String,
      required: [true, "Shipping address is required"],
    },

    orderStatus: {
      type: String,
      enum: ["pending", "preparing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    paymentDetails: {
      pidx: {
        type: String,
      },
      paymentMethod: {
        type: String,
        enum: ["COD", "Khalti"],
        required: [true, "Payment method is required"],
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
    },
    
    // tracks whether stock has actually been decremented for this order.
    // prevents double-decrementing if paymentStatus is set to "completed" twice,
    // and tells cancelOrder whether there's anything to restore
    stockDecremented: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);