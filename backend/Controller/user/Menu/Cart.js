const { default: mongoose } = require("mongoose");
const userModel = require("../../../Model/user");
const cartModel = require("../../../Model/cart");
const productModel = require("../../../Model/product"); 
const categoryModel = require("../../../Model/category");
const addressModel =  require("../../../Model/address");
const wishlistModel =  require("../../../Model/wishlist")
const HttpStatus =  require("../../../Config/HTTPstatusCodes");

const getObjectOfId=(id)=>{
    return new mongoose.Types.ObjectId(id);
}

const handleAddToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        let { field,id } = req.query;
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

        const product = await productModel.findOne({
            _id: getObjectOfId(productId),
            status: "available",
            isBlocked: false,
            quantity:{$gt : 0}
        });

        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "Product not found or has been discontinued or out-of-stock"
            });
        }

        const category = await categoryModel.findOne({
            _id: product.category,
            isDelete: false,
            isListed: true
        });

        if (!category) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "Product's category is not listed"
            });
        }

        const cart = await cartModel.findOne({ userId: getObjectOfId(userId) });

        const newCartItem = {
            productId: getObjectOfId(productId),
            quantity: 1,
            price: product.regularPrice,
            totalPrice: product.salePrice
        };

        if (!cart) {
            await new cartModel({
                userId: getObjectOfId(userId),
                items: [newCartItem],
                total: product.regularPrice,
                cartTotal: product.salePrice,
                discount: product.regularPrice - product.salePrice,
                couponCode: null
            }).save();

            return res.status(HttpStatus.OK).json({
                mission: "success",
                message: "Product added to cart"
            });
        }

        const existingItem = cart.items.find(item =>
            item.productId.equals(getObjectOfId(productId))
        );

        if (existingItem) {
            const populatedCart = await cartModel
                .findOne({ userId: getObjectOfId(userId) })
                .populate("items.productId");

            const matchedItem = populatedCart.items.find(item =>
                item.productId._id.equals(getObjectOfId(productId))
            );

            const validation = validateIncrementQuantity(matchedItem.quantity, matchedItem.productId.quantity);

            if (!validation.isValid) {
                return res.status(HttpStatus.CONFLICT).json({
                    mission: "failed",
                    message: validation.message
                });
            }

            existingItem.quantity += 1;
            existingItem.price = existingItem.quantity * product.regularPrice;
            existingItem.totalPrice = existingItem.quantity * product.salePrice;

            await calculateCartTotals(cart);

            await cart.save();

            await removeProductFromWishlist(userId, productId);
            
            return res.status(HttpStatus.OK).json({
                mission: "success",
                message: "Item quantity increased in cart"
            });
        }

        const added = await addToCart(userId, productId);

        if (!added) {
            return res.status(HttpStatus.CONFLICT).json({
                mission: "failed",
                message: "Product could not be added to cart"
            });
        }

        await removeProductFromWishlist(userId, productId);

        return res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Product added to cart"
        });

    } catch (err) {
        console.error("Add to Cart Error:", err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            mission: "failed",
            message: "Server error",
            error: err.message
        });
    }
};
const addToCart = async (userId, productId) => {
    const cart = await cartModel.findOne({ userId: getObjectOfId(userId) });
    if (!cart) return false;

    const product = await productModel.findById(productId);
    if (!product) return false;

    cart.items.push({
        productId: getObjectOfId(productId),
        quantity: 1,
        price: product.regularPrice,
        totalPrice: product.salePrice
    });

    await calculateCartTotals(cart);
    
    await cart.save();
    
    return true;
};
const calculateCartTotals = async (cart) => {
    await cart.populate("items.productId");

    let total = 0;
    let cartTotal = 0;
    let discount = 0;

    for (const item of cart.items) {
        const product = item.productId;
        const quantity = item.quantity;

        total += quantity * product.regularPrice;
        cartTotal += quantity * product.salePrice;
        discount += quantity * (product.regularPrice - product.salePrice);
    }

    cart.total = Number(total.toFixed(2));
    cart.cartTotal = Number(cartTotal.toFixed(2));
    cart.discount = Number(discount.toFixed(2));

    await cart.save();
};


const removeProductFromWishlist =async(userId, productId)=>{
    const productInWishList = wishlistModel.findOne(
        {
        userId:getObjectOfId(userId),
        "products.productId":getObjectOfId(productId)
        }
    );

    if(!productInWishList){
        return;
    }

    await wishlistModel.updateOne(
        { userId: getObjectOfId(userId) },
        { $pull: { products: { productId: getObjectOfId(productId) } } }
    );

    return true;
}

const handleIncQuantity = async (req, res) => {
    const { field, id } = req.query;
    const { productId } = req.params;

    let userId;

    if (field === "googleId") {
        const user = await userModel.findOne({ [field]: id });
        userId = user?._id;
    } else {
        userId = id;
    }

    if (!userId) {
        return res.status(HttpStatus.NOT_FOUND).json({
            mission: "failed",
            message: "User ID not found"
        });
    }

    const cart = await cartModel
        .findOne({ userId: getObjectOfId(userId) })
        .populate("items.productId");

    const product = await productModel.findOne({
        _id: getObjectOfId(productId),
        status: "available",
        isBlocked: false
    });

    if (!product) {
        return res.status(HttpStatus.NOT_FOUND).json({
            mission: "failed",
            message: "Product not found or discontinued"
        });
    }

    const cartItem = cart?.items?.find(item =>
        item.productId.equals(getObjectOfId(productId))
    );

    console.log("Cart Item Found:", cartItem);

    const quantityCheck = validateIncrementQuantity(cartItem.quantity, cartItem.productId?.quantity);

    if (!quantityCheck.isValid) {
        return res.status(HttpStatus.CONFLICT).json({
            mission: "failed",
            message: quantityCheck.message
        });
    }

    cartItem.quantity += 1;
    cartItem.price = cartItem.quantity * product.regularPrice;
    cartItem.totalPrice = cartItem.quantity * product.salePrice;

    cart.total += product.regularPrice;
    cart.cartTotal += product.salePrice;
    cart.discount += product.regularPrice - product.salePrice;

    await cart.save();

    return res.status(HttpStatus.OK).json({
        mission: "success",
        message: "Item quantity incremented successfully"
    });
};
const validateIncrementQuantity = (cartQuantity, stockQuantity) => {
    console.log({ cartQuantity, stockQuantity });

    if (cartQuantity >= 10) {
        return {
            isValid: false,
            message: "Per-product limit of 10 reached"
        };
    }

    if (cartQuantity >= stockQuantity) {
        return {
            isValid: false,
            message: "Stock limit reached"
        };
    }

    return {
        isValid: true,
        message: "Quantity increment is valid"
    };
};


const handleDecQuantity = async (req, res) => {
    const { field, id } = req.query;
    const { productId } = req.params;

    let userId;

    if (field === "googleId") {
        const user = await userModel.findOne({ [field]: id });
        userId = user?._id;
    } else {
        userId = id;
    }

    if (!userId) {
        return res.status(HttpStatus.NOT_FOUND).json({
            mission: "failed",
            message: "User ID not found"
        });
    }

    const cart = await cartModel
        .findOne({ userId: getObjectOfId(userId) })
        .populate("items.productId");

    const product = await productModel.findOne({
        _id: getObjectOfId(productId),
        status: "available",
        isBlocked: false
    });

    if (!product) {
        return res.status(HttpStatus.NOT_FOUND).json({
            mission: "failed",
            message: "Product not found or discontinued"
        });
    }

    const cartItem = cart?.items?.find(item =>
        item.productId.equals(getObjectOfId(productId))
    );

    const quantityCheck = validateDecrementQuantity(cartItem.quantity, cartItem.productId?.quantity);

    if (!quantityCheck.isValid) {
        return res.status(HttpStatus.CONFLICT).json({
            mission: "failed",
            message: quantityCheck.message
        });
    }

    cartItem.quantity -= 1;
    cartItem.price = (cartItem.quantity - 1) * product.regularPrice;
    cartItem.totalPrice = (cartItem.quantity - 1) * product.salePrice;

    cart.total -= product.regularPrice;
    cart.cartTotal -= product.salePrice;
    cart.discount -= product.regularPrice - product.salePrice;

    await cart.save();

    return res.status(HttpStatus.OK).json({
        mission: "success",
        message: "Item quantity decreased successfully"
    });
};
const validateDecrementQuantity = (cartQuantity, stockQuantity) => {
    if (cartQuantity <= 1) {
        return {
            isValid: false,
            message: "Cannot decrease quantity below 1"
        };
    }
    return {
        isValid: true,
        message: "Quantity decrement is valid"
    };
};

const handleRemoveFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { field, id } = req.query;

        if (!id || !productId) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failed",
                message: "Missing userId or productId"
            });
        }
    
        let userId;
    
        if (field === "googleId") {
            const user = await userModel.findOne({ [field]: id });
            userId = user?._id;
        } else {
            userId = id;
        }

        const cart = await cartModel.findOne({ userId: getObjectOfId(userId) }).populate("items.productId");

        if (!cart) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "Cart not found"
            });
        }

        const itemToRemove = cart.items.find(item =>
            item.productId._id.equals(getObjectOfId(productId))
        );

        if (!itemToRemove) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "Product not found in cart"
            });
        }

        cart.total -= itemToRemove.price;
        cart.cartTotal -= itemToRemove.totalPrice;
        cart.discount -= (itemToRemove.price - itemToRemove.totalPrice);

        cart.items = cart.items.filter(item =>
            !item.productId._id.equals(getObjectOfId(productId))
        );

        await cart.save();

        return res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Product removed from cart"
        });

    } catch (err) {
        console.error("Remove from Cart Error:", err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            mission: "failed",
            message: "Server error",
            error: err.message
        });
    }
};

const handleListOfCatProducts=async(req,res)=>{
    try {
        const {field,id} = req.query;
        let userId = "";

        if(field == "googleId"){
            const user =await userModel.findOne({[field]:id});
            userId = user._id;
        } else {
            userId = id;
        }

        if(!userId){
            return false;
        }

        const cartData = await cartModel.findOne({userId:getObjectOfId(userId)}).populate("items.productId");

        if(!cartData || Object?.keys(cartData).length <= 0 ){
            return false;
        }

        for (let i = cartData.items.length - 1; i >= 0; i--) {
            const inCartProduct = await productModel.findById(cartData.items[i]?.productId?._id);
            
            if (inCartProduct.quantity == 0) {
                cartData.items.splice(i, 1); 
            }
        }

        await cartData.save();

        res.status(HttpStatus.OK).json({mission:"success",message:"Data fetched Successfully",cartData:cartData});
        return;

    } catch(err){
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"ServerError",Error :err.message});
    }
}

const handleFetchAddress=async(req,res)=>{
    try {        
        const {field,id} = req.query;
        let userId = "";

        if(field == "googleId"){
            const user =await userModel.findOne({[field]:id});
            userId = user._id;
        } else {
            userId = id;
        }

        if(!userId){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failure",message:"User not found for the send Id"});
            return false;
        }

        const addressArray = await addressModel.findOne({userId:getObjectOfId(userId)});

        const address = addressArray?.address?.find((addr =>addr.isPrimary == true)) || addressArray?.address[0];

        if(!address || Object?.keys(address).length <= 0 ){
            res.status(HttpStatus.NOT_FOUND).json({mission:"success",message:"No Primary Address Selected"});
            return false;
        }

        res.status(HttpStatus.OK).json({mission:"success",message:"Address fetched Successfully",address:address});
        return;

    } catch(err){
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"ServerError",Error :err.message});
    }
}

module.exports = {
    handleListOfCatProducts,
    handleAddToCart,
    handleIncQuantity,
    handleDecQuantity,
    handleRemoveFromCart,
    handleFetchAddress,
}




/*
{
    {
    "cartObjData": {
        "_id": "680b32143915cfae1bd55a1a",
        "userId": "680b31d93915cfae1bd55a0c",
        "cartTotal": 468,
        "discount": 505,
        "couponCode": null,
        "items": [
            {
                "productId": {
                    "_id": "67ea4b34612ca6453ea1bc28",
                    "productName": "Toner for Face",
                    "description": "cucumber extract, basil extract;\r\nParaben Free: Yes;",
                    "fullDescription": "balanced skin with this beauty essential!",
                    "productType": "Hydrating",
                    "skinType": "Dry",
                    "category": "67e90a0a94e67a4d4659a3dd",
                    "regularPrice": 349,
                    "salePrice": 149,
                    "productOffer": 3557.31,
                    "validOffer": 57.31,
                    "quantity": 9,
                    "productImage": ["https://res.cloudinary.com/",],
                    "weight": 200,
                    "isBlocked": false,
                    "status": "available",
                    "createdAt": "2025-03-31T07:58:44.177Z",
                    "updatedAt": "2025-04-12T12:23:06.775Z",
                    "__v": 0
                },
                "quantity": 2,
                "price": 698,
                "totalPrice": 298,
                "status": "placed",
                "cancellationReason": null,
                "_id": "680b32143915cfae1bd55a1b"
            },
            {
                "productId": {
                    "_id": "67ea49e4612ca6453ea1bc22",
                    "productName": "Oshea Herbals Skin Toner & Healthy,Glowing Skin",
                    "description": "Skin Type: All Skin Types\r\nApplied For: Skin Brightening\r\nIdeal For: Men & Women\r\nOrganic Type: Herbal\r\nParaben Free: Yes",
                    "fullDescription": "Alcohol-free: Alcohol has been traditionally used in toners because it can prone skin is now over! About Plum natural skin care - Plum is India's first online-only beauty solution brand focused on restoring and maintaining your skin as nature made it to be. Always free of parabens, phthalates, SLS and other harmful chemicals.",
                    "productType": "Brightening",
                    "skinType": "Oily",
                    "category": "67e23c1a9a74dd6919618fb3",
                    "regularPrice": 275,
                    "salePrice": 170,
                    "productOffer": 3538.18,
                    "validOffer": 38.18,
                    "quantity": 56,
                    "productImage": [
                        "https://res.cloudinary.com/ds5go6bcb/image/upload/v1743655795/ecommerce/products/product_1743655793615_0.webp",
                        "https://res.cloudinary.com/ds5go6bcb/image/upload/v1743655796/ecommerce/products/product_1743655793672_1.webp",
                        "https://res.cloudinary.com/ds5go6bcb/image/upload/v1743655796/ecommerce/products/product_1743655793674_2.webp",
                        "https://res.cloudinary.com/ds5go6bcb/image/upload/v1743655796/ecommerce/products/product_1743655793676_3.webp"
                    ],
                    "weight": 120,
                    "isBlocked": false,
                    "status": "available",
                    "createdAt": "2025-03-31T07:53:08.901Z",
                    "updatedAt": "2025-04-12T12:23:06.018Z",
                    "__v": 0
                },
                "quantity": 1,
                "price": 275,
                "totalPrice": 170,
                "status": "placed",
                "cancellationReason": null,
                "_id": "680b334b3915cfae1bd55a27"
            }
        ],
        "__v": 1
    }
}
*/


























