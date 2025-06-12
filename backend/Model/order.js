const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
{
    orderId: {
        type: String,
        required: true,
        unique: true,
        description: "Unique identifier for the order",
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        description: "Reference to the user who placed the order",
    },

    // Pricing and Discounts
    totalPrice: {
        type: Number,
        required: true,
        description: "Original total price before discounts",
    },
    offerDiscount: {
        type: Number,
        default: 0,
        description: "Discount applied from product offers",
    },
    couponId: {
        type: Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
        description: "Reference to the applied coupon, if any",
    },
    couponDiscount: {
        type: Number,
        default: 0,
        description: "Discount amount from the applied coupon",
    },
    couponApplied: {
        type: Boolean,
        default: false,
        description: "Indicates if a coupon was applied to the order",
    },
    shippingFee: {
        type: Number,
        default: 0,
        description: "Shipping fee for the order",
    },
    platformFee: {
        type: Number,
        default: 3,
        description: "Platform fee charged for the order",
    },
    finalAmount: {
        type: Number,
        required: true,
        description: "Final amount after all discounts, fees, and shipping",
    },

    // Payment Details
    paymentMethod: {
        type: String,
        required: true,
        enum: ["razorpay", "cod", "wallet"],
        default: "cod",
        description:
            "Method used for payment (Cash on Delivery, Razorpay, or Wallet)",
    },
    razorpayOrderId: { 
        type: String,
        default: null
    },
    paymentAmount: {
        type: Number,
        required: true,
        description: "Amount paid by the user",
    },

    status: {
        type: String,
        required: true,
        enum: [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Return Requested",
            "Returned",
            "Return Rejected",
            "Cancel requested",
            "Order Return Requested",
            "Order Returned",
            "Order Rejected",
        ],
        default: "Pending",
        description: "Current status of the order in its lifecycle",
    },
    refundProcessed: {
        type: Boolean,
        default: false,
        description: "Indicates if a refund has been processed for the order",
    },
    cancellationReason: {
        type: String,
        description: "Reason for order cancellation, if applicable",
    },

    invoiceDate: {
        type: Date,
        description: "Date when the invoice was generated",
    },
    },
    {
        timestamps: true, 
    }
);


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
