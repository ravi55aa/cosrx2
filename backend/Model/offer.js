const mongoose = require('mongoose');
    const {Schema} = mongoose

    const offerSchema = new Schema({
    offerName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['Flat', 'Percentage'],
        required: true
    },
    discountAmount: {
        type: Number,
        required: true
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUpto: {
        type: Date,
        required: true
    },
    offerType: {
        type: String,
        enum: ['Category', 'Product'],
        required: true
    },
    applicableTo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'offerTypeRef'
    },
    offerTypeRef: {
        type: String,
        required: true,
        enum: ['Category', 'Product']
    },
    isListed: {
        type: Boolean,
        default: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
    },{timestamps:true});

    const Offer = mongoose.model('Offer', offerSchema);

    module.exports = Offer;