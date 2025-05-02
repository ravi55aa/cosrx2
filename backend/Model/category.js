const mongoose = require("mongoose")
const {Schema} = mongoose

const categorySchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
    },
    isListed:{
        type:Boolean,
        default:true
    },
    banner: {
        type:String,
        default:null,
        trim:true,
        unique:false
    },
    isDelete :{
        type:Boolean,
        default:false
    },
    categoryOffer:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const categoryModel = mongoose.model("Category",categorySchema)

module.exports = categoryModel;


