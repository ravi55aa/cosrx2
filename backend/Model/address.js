const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: [{
        _id: {  
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId() 
        },
        name: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default:"India",
            required: true
        },
        city: {
            type: String,
            required: true
        },
        streetAddress: {
            type: String,
            required: true
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
            type: String
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }]
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;