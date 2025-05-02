const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderAddressSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    addressType: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    landMark: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    altPhone: {
        type: String,
        required: true
    }
}, { timestamps: true });

const OrderAddress = mongoose.model("OrderAddress", orderAddressSchema);

module.exports = OrderAddress;
