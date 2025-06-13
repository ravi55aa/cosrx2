const offerModel = require("../../../Model/offer");
const productModel = require("../../../Model/product");
const categoryModel = require("../../../Model/category");
const HttpStatus = require("../../../Config/HTTPstatusCodes");
const { default: mongoose } = require("mongoose");

const modelMap = {
    Product: productModel,
    Category: categoryModel,
};

const getObjOfId = (id)=>{
    return new mongoose.Types.ObjectId(id);
}

//bestOne
const getAll = async(req,res)=>{
    try{
    
        const listOfOffers= await offerModel.find({
            isDeleted: false
        }).sort({ createdAt: 1 });

        if(!listOfOffers){
            return res.status(HttpStatus.CONFLICT).json({mission:"Failed",message:"Offers Not Available || Its may null"});
        }

        return res
                .status(HttpStatus.OK)
                .json({mission:"Success",message:"Fetched The Offer", offers:listOfOffers});
                
    }catch(err){
        return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({mission:'failed',message:"Server Error",Error:err.message});
    }
}

const getHighestOffer=async(req,res)=>{
    try{
        const {productId} = req.params;

        let arrayOfOffers = [];

        const theProduct = await productModel.findById(productID);
        if (!theProduct) {
        return res.status(404).json({ message: "Product not found" });
        }

        const availableOffersOfProduct = await offerModel.find({
            applicableTo: getObjOfId(productID),
            validFrom: { $lte: new Date() },
            validUpto: { $gte: new Date() },
            isListed: true,
            isDeleted: false
        }).sort({ discountAmount: -1 });

        if (availableOffersOfProduct.length > 0) {
            arrayOfOffers.push({ ...availableOffersOfProduct[0]._doc });
        }

        const availableOffersOfCategory = await offerModel.find({
            applicableTo: getObjOfId(theProduct.category),
            validFrom: { $lte: new Date() },
            validUpto: { $gte: new Date() },
            isListed: true,
            isDeleted: false
        }).sort({ discountAmount: -1 });

        if (availableOffersOfCategory.length > 0) {
            arrayOfOffers.push({ ...availableOffersOfCategory[0]._doc });
        }

        if(availableOffers.length <= 0){
            return res
                    .status(HttpStatus.OK)
                    .json({mission:"success",message:"OFFERS NOT AVAILABLE"});
        }

        const highestOffer = availableOffers.sort((a,b)=>b.discountAmount - a.discountAmount)[0] || null;

        return res
                .status(HttpStatus.OK)
                .json({mission:'Success',message:"The highest offer Fetched successfully",offer:highestOffer});

    } catch(err){
        return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({mission:"failed",message:"Server Error",Error:err.message});
    }
}

const add = async (req, res) => {
    try {
        const {
            offerName,
            description,
            discountAmountType, 
            discountAmount,
            startDate, 
            endDate,   
            offerType,
            applyTo,
            status
        } = req.body;

        if (!offerName || !discountAmountType || !discountAmount || !startDate || !endDate || !applyTo || !offerType) {
            return res.status(400).json({
                mission: "failed",
                message: "Missing required offer fields"
            });
        }

        const validFrom = new Date(startDate);
        const validUpto = new Date(endDate);

        if (isNaN(validFrom.getTime()) || isNaN(validUpto.getTime())) {
            return res.status(400).json({
                mission: "failed",
                message: "Invalid date format for validFrom or validUpto"
            });
        }

        const newOffer = new offerModel({
            offerName,
            description,
            discountType: discountAmountType, 
            discountAmount,
            validFrom,
            validUpto,
            offerType,
            applicableTo: getObjOfId(applyTo),
            offerTypeRef: offerType,
            isListed: status ?? true,
            isDeleted: false,
        });

        await newOffer.save();

        return res.status(201).json({
            mission: "success",
            message: "Offer created successfully",
            offer: newOffer
        });

    } catch (err) {
        console.error("Add Offer Error:", err.message);
        return res.status(500).json({
            mission: "failed",
            message: "Internal server error",
            error: err.message
        });
    }
};


const editOffer_fetchOfferData=async(req,res)=>{
    try{
        const {offerId} = req.params;
    
        if(!offerId){
            res
            .status(HttpStatus.NOT_FOUND)
            .json({mission:"failed",message:'OfferID is null'});
            return false;
        }
    
        const offer = await offerModel.findById(offerId);
    
        if(!offer || Object.keys(offer).length <= 0){
            return res
                    .status(HttpStatus.CONFLICT)
                    .json({mission:"failed",message:"NOt Found any offr for provided id"});
        }
    
        return res.status(HttpStatus.OK).json({mission:"success",message:"Offer fetchedSuccessfully",offer:offer});
    } catch(err){
        return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({mission:"failed",message:"Server Error",Error:err.message});
    }
}

const editOffer = async (req, res) => {
    try {
        const { offerId } = req.params;
        let {
            offerName,
            description,
            discountType,
            discountAmount,
            validFrom,
            validUpto,
            offerType,
            applicableTo,
            isListed,
        } = req.body;

        console.log("Incoming dates from frontend:");
        console.log("validFrom:", req.body.validFrom);
        console.log("validUpto:", req.body.validUpto);


        const offer = await offerModel.findById(offerId);

        if (!offer) {
            return res.status(404).json({
                mission: "failed",
                message: "Offer not found for the given ID"
            });
        }

        validFrom = new Date(validFrom)
        validUpto = new Date(validUpto)

        if (isNaN(validFrom.getTime()) || isNaN(validUpto.getTime())) {
            return res.status(400).json({
                mission: "failed",
                message: "Invalid date format for validFrom or validUpto"
            });
        }

        offer.offerName = offerName ?? offer.offerName;
        offer.description = description ?? offer.description;
        offer.discountType = discountType ?? offer.discountType;
        offer.discountAmount = discountAmount ?? offer.discountAmount;
        offer.validFrom = validFrom ?? offer.validFrom;
        offer.validUpto = validUpto ?? offer.validUpto;
        offer.offerType = offerType ?? offer.offerType;
        offer.applicableTo = applicableTo ?? offer.applicableTo;
        offer.offerTypeRef = offerType ?? offer.offerTypeRef;
        offer.isListed = isListed ?? offer.isListed;

        await offer.save();

        return res.status(200).json({
            mission: "success",
            message: "Offer updated successfully",
            updatedOffer: offer
        });

    } catch (err) {
        console.error("Edit Offer Error:", err);
        return res.status(500).json({
            mission: "failed",
            message: "Internal server error",
            error: err.message
        });
    }
};

const updateListing = async (req, res) => {
    try {
        const { offerId } = req.params;

        if(!offerId){
            return res.status(404).json({
                mission: "failed",
                message: "offerId is null"
            });
        }

        const offer = await offerModel.findById(offerId);

        if (!offer) {
            return res.status(404).json({
                mission: "failed",
                message: "Offer not found"
            });
        }

        offer.isListed = req.body.isListed;
        await offer.save();

        return res.status(200).json({
            mission: "success",
            message: "Offer marked as deleted"
        });

    } catch (err) {
        console.error("Delete Offer Error:", err);
        return res.status(500).json({
            mission: "failed",
            message: "Internal server error",
            error: err.message
        });
    }
};


const deleteOffer = async (req, res) => {
    try {
        const { offerId } = req.params;

        if(!offerId){
            return res.status(404).json({
                mission: "failed",
                message: "offerId is null"
            });
        }

        const offer = await offerModel.findById(offerId);

        if (!offer) {
            return res.status(404).json({
                mission: "failed",
                message: "Offer not found"
            });
        }

        offer.isDeleted = true;
        await offer.save();

        return res.status(200).json({
            mission: "success",
            message: "Offer marked as deleted"
        });

    } catch (err) {
        console.error("Delete Offer Error:", err);
        return res.status(500).json({
            mission: "failed",
            message: "Internal server error",
            error: err.message
        });
    }
};


const searchOfferHandler=async(req,res)=>{
    try{
        const {searchQuery} = req.query;

        console.log("req.quiery is given by",req.query);

        if(!searchQuery?.trim()){
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({mission:'failed',message:"Search Query is null"});
        }

        const regexOfQuery = new RegExp(searchQuery,"i");

        const offers =  await 
        offerModel.find({offerName:regexOfQuery});

        return res
                .status(HttpStatus.OK)
                .json({mission:"success",message:"Coupon Searched Successfully",
                offers : offers 
                });

    } catch(err){
        return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({mission:"failed",message:"Server Error",Error:err.message});
        }
}


module.exports = {
    getHighestOffer,
    getAll,
    add,
    editOffer_fetchOfferData,
    editOffer,
    updateListing,
    deleteOffer,
    searchOfferHandler
}