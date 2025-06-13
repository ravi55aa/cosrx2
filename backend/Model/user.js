
const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type: String,
        trim:true,
        required: false
    },
    lastName:{
        type: String,
        trim:true,
        required: false
    },
    userName:{
        type: String,
        trim:true,
        required: false
    },
    email:{
        type: String,
        trim:true,
        required: true,
        unique: true
    },
    phone:{
        type: String,
        trim:true,
        required: false,
        unique: false,
        sparse: true,
        default: null
    },
    googleId:{
        type: String,
        trim:true,
        default: "",
    },
    password:{
        type: String,
        trim:true,
        required: false,
    },
    referralCode: {
        type: String,
        trim:true,
        default: null
    },
    isBlocked:{
        type: Boolean,
        default: false     
    },
    isAdmin:{
        type: Boolean,
        default: false     
    },
    profilePicture:{
        type: String,
        required: false,
        trim:true,
        default: "https://res.cloudinary.com/ds5go6bcb/image/upload/v1745349313/ecommerce/products/1745349311021-6353_a8sbch.jpg"
    },
    cart:[{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    wallet:{
        type: Number,
        default: 0
    },
    wishlist:[{
        type: Schema.Types.ObjectId,
        ref: 'Wishlist'
    }],
    orderHistory:[{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    createdOn:{
        type: Date,
        default: Date.now
    },
    modifiedAt:{
    type: Date,
    default: Date.now
    },
    referrerCode:{
        type: String,
        trim:true,
    },
    redeemed:{
        type: Boolean,
        default:false
    },
    redeemedUsers:[{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    searchHistory:[{
        category:{
            type: Schema.Types.ObjectId,
            ref: 'Category'
        },
        brand:{
            type: String
        },
        searchOn:{
            type: Date,
            default: Date.now
        },

    }]

})

// Middleware to update `modifiedAt` on save
userSchema.pre("save", function (next) {
    this.modifiedAt = Date.now();
    next();
});


const userModel = mongoose.model("User", userSchema)
module.exports = userModel;

