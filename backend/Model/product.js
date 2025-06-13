const mongoose = require('mongoose');
const {Schema} = mongoose;

const productSchema = new Schema({
    productName:{
        type: String,
        trim:true,
        required: true,
    },
    description :{
        type: String,
        trim:true,
        required: true
    },
    fullDescription :{
        type: String,
        trim:true,
        required: true
    },
    productType : {
        type:String,
        enum:['Brightening','Hydrating','Anti-aging'],
        required:true
    },
    skinType:{
        type: String,
        enum:['Oily','Dry','Normal','Combination'],
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category',
        required: false
    },
    salePrice:{
        type: Number,
        required: true
    },
    productOffer:{
        type: Number,
        default: 0
    },
    validOffer:{
        type: Number,
        default:0
    },
    quantity:{
        type: Number,
        required: true
    },

    productImage:{
        type: [String],
        required: false
    },
    weight : {
        type:Number,
        required:true
    },
    isBlocked:{
        type: Boolean,
        default: false
    },
    status:{
        type: String,
        enum:['available','out of stock','Discontinued'],
        required: true,
        default: 'available'
    },
},{timestamps: true})

// Middleware to update `modifiedAt` on save
productSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
