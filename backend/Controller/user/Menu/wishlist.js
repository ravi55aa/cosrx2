const { default: mongoose } = require("mongoose");
const userModel = require("../../../Model/user");
const cartModel = require("../../../Model/cart");
const productModel = require("../../../Model/product"); 
const categoryModel = require("../../../Model/category");
const addressModel =  require("../../../Model/address");
const wishlistModel = require("../../../Model/wishlist");
const HttpStatus =  require("../../../Config/HTTPstatusCodes");

const getObjectOfId=(id)=>{
    return new mongoose.Types.ObjectId(id);
}

const handleFetchWishlist = async (req, res) => {
    try {
        const { field,id } = req.query;

        let userId;

        if (field == "googleId") {
            user = await userModel.findOne({[field]:id});
            userId =  user._id;
        }else {
            userId = id;
        }

        if (!userId ) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "ProductID or Userid is null"
            });
        }

        const wishlist = await wishlistModel.findOne({ userId: getObjectOfId(userId) })
            .populate("products.productId");

        if (!wishlist || wishlist.products.length === 0) {
            res.status(HttpStatus.NOT_FOUND).json({ mission: "success", message: "No products in Wishlist" });
            return;
        }

        const wishlistProducts = wishlist.products.map(item => ({
            _id: item.productId._id,
            name: item.productId.name,
            price: item.productId.salePrice,
            regularPrice: item.productId.regularPrice,
            image: item.productId.productImage?.[0] || null,
            status: item.productId.status,
            addedOn: item.addedOn
        }));

        res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Wishlist fetched successfully",
            wishlist: wishlistProducts
        });
        return;

    } catch (err) {
        console.log(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mission: "failed", message: "ServerError", Error: err.message });
    }
};

const handleAddToWishlist = async (req, res) => {
    try {

        const { productId } = req.params;
        const { field,id } = req.query;

        let userId;

        if (field == "googleId") {
            user = await userModel.findOne({[field]:id});
            userId =  user._id;
        }else {
            userId = id;
        }

        if (!userId || !productId) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "ProductID or Userid is null"
            });
        }

        const productFromStore = await productModel.findOne({
            _id: getObjectOfId(productId),
            isBlocked: false
        });

        if (!productFromStore) {
            res.status(HttpStatus.NOT_FOUND).json({ mission: "failed", message: "Product not available or has been discontinued" });
            return;
        }

        const categoryFromStore = await categoryModel.findOne({
            _id: productFromStore.category,
            isDelete: false,
            isListed: true
        });

        if (!categoryFromStore) {
            res.status(HttpStatus.NOT_FOUND).json({ mission: "failed", message: "Product's category is not listed" });
            return;
        }

        let wishlist = await wishlistModel.findOne({ userId: getObjectOfId(userId) });

        if (!wishlist) {
            wishlist = new wishlistModel({
                userId: getObjectOfId(userId),
                products: []
            });
        }

        const isAlreadyInWishlist = wishlist.products.find(
            (item) => item.productId.equals(getObjectOfId(productId))
        );

        if (isAlreadyInWishlist) {
            res.status(HttpStatus.CONFLICT).json({ mission: "failed", message: "Product already in Wishlist" });
            return;
        }

        wishlist.products.push({
            productId: getObjectOfId(productId)
        });

        await wishlist.save();

        res.status(HttpStatus.OK).json({ mission: "success", message: "Product added to Wishlist" });
        return;

    } catch (err) {
        console.log(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mission: "failed", message: "ServerError", Error: err.message });
    }
};

const handleRemoveFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const { field,id } = req.query;

        let userId;

        if (field == "googleId") {
            user = await userModel.findOne({[field]:id});
            userId =  user._id;
        }else {
            userId = id;
        }

        if (!userId || !productId) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "UserId or ProductId not found",
            });
        }

        const wishlist = await wishlistModel.findOne({ userId: getObjectOfId(userId) });

        if (!wishlist) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "Wishlist not found for the user",
            });
        }

        const existingProduct = wishlist.products.find(
            (item) => item.productId.equals(getObjectOfId(productId))
        );

        if (!existingProduct) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "Product not found in wishlist",
            });
        }

        wishlist.products = wishlist.products.filter(
            (item) => !item.productId.equals(getObjectOfId(productId))
        );

        await wishlist.save();

        res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Product removed from wishlist",
        });
        return;

    } catch (err) {
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            mission: "failed",
            message: "ServerError",
            Error: err.message,
        });
    }
};


module.exports = {
    handleAddToWishlist,
    handleFetchWishlist,
    handleRemoveFromWishlist,
}