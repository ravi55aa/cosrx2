const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    orderType: {
        type: String,
        required: true,
        enum: ['razorPay', 'cod', 'wallet'],
        default:"cod",
    },
    couponDiscount: {
        type: Number,
        default: 0
    },
    offerDiscount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    invoiceDate: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Return Rejected', 'Cancel requested','Order Return Requested','Order Returned','Order Rejected'],
        default:"Pending",
    },
    couponApplied: {
        type: Boolean,
        default: false
    },
    cancellationReason: {
        type: String
    },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
