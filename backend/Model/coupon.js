const mongoose = require("mongoose");
const { Schema } = mongoose;

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  startDate:{
    type: Date,
    required: true
  },
  expireOn: {
    type: Date,
    required: true
  },
  offerPrice: {
    type: Number,
    required: true
  },
  minimumPrice: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted:{
    type: Boolean,
    default: false
  },
  usageLimit: {
    type: Number, 
    default: 1
  },
  usedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timesUsed: { type: Number, default: 0 }
    }
  ]
},{
  timestamps:true
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;