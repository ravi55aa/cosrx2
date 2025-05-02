const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderedItemSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Return Rejected', 'Cancel Requested','Order Return Requested','Order Returned','Order Rejected'],
        default:"Pending",
    },
    cancellationReason: String,
    returnReason: String,
    returnRejectReason: String
}, { timestamps: true });

const OrderedItem = mongoose.model("OrderedItem", orderedItemSchema);

module.exports = OrderedItem;
