const productModel = require("../../../Model/product");
const couponModel = require("../../../Model/coupon");
const categoryModel = require("../../../Model/category");
const HttpStatus =  require("../../../Config/HTTPstatusCodes");


const getAllCoupons= async(req,res)=>{
    try{
        const coupons = await couponModel.find({isDeleted:false});
    
        if(!coupons || coupons.length<=0){
            res
                .status(HttpStatus.CONFLICT)
                .json({mission:"failed",message:"no coupons found"});
            return false;
        } 
    
        return res
                .status(HttpStatus.OK)
                .json({mission:"success",message:"Fetched all Coupons",coupons:coupons});
    } catch(err){
        return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({mission:"failed",message:"Server Error",Error:err.message});
    }
}

const addCoupon = async (req, res) => {
    try {
        const {
            code,
            name,
            startDate,
            expireOn,
            offerPrice,
            minimumPrice,
            isActive,
            usageLimit
        } = req.body;

        if (!code || !name || !startDate || !expireOn || !offerPrice || !minimumPrice) {
            return res.status(400).json({
                mission: "failed",
                message: "Some Fields are null"
            });
        }

        if (new Date(expireOn) <= new Date(startDate)) {
            return res.status(400).json({
                mission: "failed",
                message: "Expiry date must be after the start date"
            });
        }


        const existing = await couponModel.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(409).json({
                mission: "failed",
                message: "Coupon code already exists"
            });
        }

        const newCoupon = new couponModel({
            code: code.toUpperCase(),
            name,
            startDate,
            expireOn,
            offerPrice,
            minimumPrice,
            usageLimit: usageLimit || 1,
            isActive:isActive,
            isDeleted: false,
            usedBy: [],
        });

        await newCoupon.save();

        return res.status(201).json({
            mission: "success",
            message: "Coupon created successfully",
            coupons: newCoupon
        });

    } catch (err) {
        console.error("Add Coupon Error:", err);
        return res.status(500).json({
            mission: "failed",
            message: "Intervalserver error",
            error: err.message
        });
    }
};

const fetchEditCoupon=async(req,res)=>{

    try{
        const {couponId} = req.params;
    
        if(!couponId){
            return res.status(400).json({
                mission: "failed",
                message: "couponId  are null"
            });
        }
    
        const coupon = await couponModel.findById(couponId);
        
        if(!coupon){
            return res.status(HttpStatus.OK).json({
                mission: "success",
                message: "No coupon available"
            });
        }
    
        return res.status(HttpStatus.OK).json({
            mission: "success",
            message: "coupon available",
            coupon:coupon
        });
    } catch(err){
        console.error("Add Coupon Error:", err);
        return res.status(500).json({
            mission: "failed",
            message: "Intervalserver error",
            error: err.message
        });
    }

}

const editCoupon = async (req, res) => {
    try {
        const {couponId} = req.params;

        if(!couponId){
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({mission:"failed",message:"CouponId not found"})
            }

        const {
            code,
            name,
            startDate,
            expireOn,
            offerPrice,
            minimumPrice,
            usageLimit
        } = req.body;

        if (!code || !name || !startDate || !expireOn || !offerPrice || !minimumPrice) {
            return res.status(400).json({
                mission: "failed",
                message: "Some Fields are null"
            });
        }

        if (new Date(expireOn) <= new Date(startDate)) {
            return res.status(400).json({
                mission: "failed",
                message: "Expiry date must be after the start date"
            });
        }


        const coupon = await couponModel.findById(couponId);
        
        coupon.code =  code?.toUpperCase() || coupon.code;
        coupon.name = name || coupon.name ;
        coupon.startDate = startDate || coupon.startDate ;
        coupon.expireOn = expireOn || coupon.expireOn;
        coupon.offerPrice = offerPrice || coupon.offerPrice;
        coupon.minimumPrice = minimumPrice || coupon.minimumPrice;
        coupon.usageLimit = usageLimit || coupon.usageLimit;

        await coupon.save();

        return res.status(201).json({
            mission: "success",
            message: "Coupon created successfully",
            coupon: coupon
        });

    } catch (err) {
        console.error("Add Coupon Error:", err);
        return res.status(500).json({
            mission: "failed",
            message: "Intervalserver error",
            error: err.message
        });
    }
};

const removeCoupon = async(req,res)=>{
    try{
        const {couponId} = req.params;
    
        if(!couponId){
            res
                .status(HttpStatus.NOT_FOUND)
                .json({mission:'failed',message:"ID IS NULL"});
            return false;
        }

        await couponModel.findByIdAndUpdate(couponId,{isDeleted:true});
        return res
                .status(HttpStatus.OK)
                .json({mission:"failed",message:"Coupon Removed Successfully"});
    } catch(err){
        return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({mission:"failed",message:"Server Error",Error:err.message});
    }

}

const updateListCoupon = async(req,res)=>{
    try{
        const {couponId} = req.params;
        const {isListed}  = req.body;

        if(!couponId){
            res
                .status(HttpStatus.NOT_FOUND)
                .json({mission:'failed',message:"ID IS NULL || isListed is not find"});
            return false;
        }

        await couponModel.findByIdAndUpdate(couponId,{isActive:isListed});
        return res
                .status(HttpStatus.OK)
                .json({mission:"success",message:"Coupon listing is updated Successfully"});
    } catch(err){
        return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({mission:"failed",message:"Server Error",Error:err.message});
    }

}

const searchCouponHandler=async(req,res)=>{
    try{
        const {searchQuery} = req.query;

        if(!searchQuery?.trim()){
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({mission:'failed',message:"Search Query is null"});
        }

        const regexOfQuery = new RegExp(searchQuery,"i");

        const coupons =  await couponModel.find({$or : 
            [
                {name:regexOfQuery},
                {code:regexOfQuery}
            ]
        });

        return res
                .status(HttpStatus.OK)
                .json({mission:"success",message:"Coupon Searched Successfully",
                coupons : coupons 
                });

    } catch(err){
        return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({mission:"failed",message:"Server Error",Error:err.message});
        }
}

module.exports = {
    getAllCoupons,
    addCoupon,
    fetchEditCoupon,
    editCoupon,
    removeCoupon,
    updateListCoupon,
    searchCouponHandler,
}
