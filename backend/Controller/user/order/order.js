const HttpStatus =  require("../../../Config/HTTPstatusCodes");
const productModel = require("../../../Model/product");
const categoryModel = require("../../../Model/category");
const couponModel = require("../../../Model/coupon");

const walletModel= require("../../../Model/wallet");
const orderModel = require("../../../Model/order");
const orderItemModel = require("../../../Model/orderItem");
const orderAddressModel = require("../../../Model/orderAddress");
const helper = require("./orderBusnessLog");
const { default: mongoose } = require("mongoose");

const getNewObjIdOfId = (id)=>{
    return new mongoose.Types.ObjectId(id);
}

const checkWhichId=async (field,id)=>{
    let userId = "";
    
    if(field == "googleId"){
        const user = await userModel.findOne({[field]:id});
        userId = user._id ;
    } else {
        userId = getNewObjIdOfId(id);
    }

    return userId; 
}

const {generateTheRandomId} = require("../../../Controller/user/Wallet/Wallet.js");

const {getBestOfTheProduct} = require("../productDetails.js");
const JSONTransport = require("nodemailer/lib/json-transport/index.js");
const userModel = require("../../../Model/user.js");

const getAllOrders=async(req,res)=>{
    try{
        const { field, id } = req.query;
        let userId = await checkWhichId(field,id);

        if (!userId) {
            res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "User not found for the provided ID" });
            return;
        }

        const ordersOfUser = await orderModel.find({userId:userId});
        if(!ordersOfUser){
            res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "User Orders found for the provided ID" });
            return;
        }

        const orderItems =[]
        
        for (let ele of ordersOfUser){
            const orderItem = await orderItemModel.find({orderId:ele._id}).populate("orderId");

            orderItems.push(orderItem);
        }
        
        if(!orderItems || orderItems.length <= 0 ){
            res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "User Orders Items found for the provided ID" });
            return;
        }

        res.status(HttpStatus.OK)
                .json({ mission: "success", message: "OrderItems fetched Successfully", orderItems:orderItems });
            return;
    } catch (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", Error: err.message });
    }
}

const getOrderDetails = async(req,res)=>{
    try{
        const {orderId} = req.params;
        const order = await orderModel.findOne({orderId:orderId});
    
        if(!order){
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({mission:"failure",message:'the order is not created'});
        }
    
        return res.json({mission:'failed',message:"orderFetched successfully",order:order});
    } catch(err){
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({mission:'failure',message:"Server Error",Error:err.message});
    }
};

const handlesNewOrder = async (req, res) => {
    try {
        const { field, id } = req.query;
        let userId = await checkWhichId(field,id);

        if (!userId) {
            res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "User not found for the provided ID" });
            return;
        }

        const noOrders = await orderModel.find({ userId: getNewObjIdOfId(userId) });

        const orderId = helper.generateOrderId(noOrders.length);   

        const { 
            orderData, 
            orderItemsData, 
            orderAddressData,
        } = req.body;

        if (!orderData || !orderItemsData || !orderAddressData) {
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "Missing orderData, orderItemsData, or orderAddressData in request body" });
            return;
        }

        //validate the order Items here:
        const validateItemProducts = await Promise.all(
            orderItemsData.map(async(item)=>
                await productModel.findById(item.productId))
        )

        const outOfStockEle = validateItemProducts.find((product,i)=>
            orderItemsData[i].quantity > product.quantity
        )

        if(outOfStockEle){
            return res.status(HttpStatus.BAD_REQUEST).json({mission:"failed",message:"Some Product are Out Of Stock"});
        }

        const newOrder = await new orderModel({
            orderId,
            userId: getNewObjIdOfId(userId),
            finalAmount: orderData.finalAmount,
            totalPrice: orderData.totalPrice,
            paymentAmount: orderData.paymentAmount,
            cancellationReason:"",
            paymentMethod:orderData.paymentMethod,
            offerDiscount:orderData.offerDiscount,
            couponId:orderData.couponId,
            couponDiscount:orderData.couponDiscount,
            shippingFee:orderData.shippingFee,
            razorpayOrderId:orderData.razorpayOrderId
        }).save();


        const handleQuantityOf=async(productId,quantity)=>{
            const updatedProduct = await productModel.findByIdAndUpdate(
                productId,
                { $inc: { quantity: -quantity } }, 
                { new: true, runValidators: true } 
            );

            if(!updatedProduct){
                res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "Product quantity is not updating While adding the  nre product" });
                return false;
            }

            if(updatedProduct.quantity <=0){
                updatedProduct.status = "out of stock";
            }
            await updatedProduct.save();

            return getNewObjIdOfId(productId);
        }

        //Todo => add A check does the product exist for the itemsData
        for (let ele of orderItemsData) {
            await new orderItemModel({
                orderId: newOrder._id,
                product: await handleQuantityOf(ele.productId,ele.quantity), //just pass the product getNewObjIdOfId(ele.productId)
                quantity: ele.quantity,
                name: ele.name,
                price: ele.price,
                cancellationReason:"",
                returnReason:"",
                returnRejectReason:"",
            }).save();
        }

        // Create Order Address
        await new orderAddressModel({
            orderId: newOrder._id,
            addressType: orderAddressData.addressType,
            name: orderAddressData.name,
            city: orderAddressData.city,
            state: orderAddressData.state,
            landMark:orderAddressData.landMark,
            pincode: orderAddressData.pincode,
            phone: orderAddressData.phone,
            altPhone: orderAddressData.altPhone,
        }).save();

        res.status(HttpStatus.OK)
            .json({ mission: "success", message: "Order Placed Successfully", order_id : orderId });
        return;
    } catch (err) {
        
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", Error: err.message });
    }
}

const handleGetInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const orderInvoice = {};

        if (!orderId) {
            return res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "Missing OrderId in parameters" });
        }

        const {field,id} = req.query;
        let userId = await checkWhichId(field,id);

        const order = await orderModel.findOne({orderId:orderId}).populate("userId");

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "Order not found" });
        } 
        orderInvoice.order= order;

        const arrayOfOrderItems = await orderItemModel.find({ orderId: order._id }).populate("product");

        if (!arrayOfOrderItems || arrayOfOrderItems.length === 0) {
            return res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "Order items not found" });
        }
        orderInvoice.orderItems =  arrayOfOrderItems;


        const address = await orderAddressModel.findOne({ orderId: order._id });

        if (!address) {
            return res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "Order address not found" });
        }
        orderInvoice.orderAddress = address;

        //available offers to get evaluate:
        const bestOffersOfProduct = [];
                
        for (let i = arrayOfOrderItems.length - 1; i >= 0; i--) {
            const invoiceProduct = arrayOfOrderItems[i];
            
            const productId = invoiceProduct?.product._id;

            // Get offers for valid products
            const offer = await getBestOfTheProduct(productId);
            if (offer) {
                bestOffersOfProduct.push(offer);
            }
        }

        return res
            .status(HttpStatus.OK)
            .json({ mission: "success", message: "Order Invoice fetched successfully", 
                invoice: orderInvoice ,
                offersOfProducts:bestOffersOfProduct,
            });

    } catch (err) {
        return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ mission: "failure", message: "Server Error", error: err.message });
    }
};

const cancelOrderSpecificOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        const order = await orderModel.findOne({ orderId });

        if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status === 'Cancelled' || "Cancel requested") {
        return res.status(400).json({ success: false, message: "Order already cancelled || Under Process " });
        }

        order.status = 'Cancelled';
        await order.save();

        return res.status(200).json({ success: true, message: "Order cancelled successfully" });

    } catch (error) {
        
        return res.status(500).json({ success: false, message: "Something went wrong",Error:error.message });
    }
};

const handleCancelOrder = async (req, res) => {
    try {
        const { itemId, cancellingMode } = req.query;
        const { reason } = req.body;

        let updateStatus = "";
        let idField = "";

        if (cancellingMode === "returnProduct") {
            idField = "_id";
            updateStatus = "Return Requested";

            if (!itemId) {
            return res.status(400).json({ success: false, message: "OrderItem ID is required" });
            }

            const order = await orderItemModel.findById(itemId);

            if (!order) {
            return res.status(404).json({ success: false, message: "OrderItem not found" });
            }

            if(order.status == "Return" || order.status == "Return Requested" ){
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Already requested to Return" });
            }

            if (order.status === 'Returned' || order.status === 'Return Requested') {
            return res.status(400).json({ success: false, message: "Order already Returned or Under Process" });
            }

            await updateReturnObject(idField, itemId, reason);

        } else {
            idField = "orderId";
            updateStatus = "Cancel requested";

            if (!itemId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
            }

            const order = await orderModel.findOne({ orderId: itemId });

            if(order.status == "Cancel requested"){
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Already requested to Cancel" });
            }

            if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
            }

            if (order.status === 'Cancelled' || order.status === 'Cancel requested') {
            return res.status(400).json({ success: false, message: "Order already Cancelled or Under Process" });
            }

            await updateCancelOrder(idField, itemId, reason);
        }

        return res.status(200).json({ success: true, message: "Status updated successfully" });

    } catch (error) {
        
        return res.status(500).json({ success: false, message: "Something went wrong", Error: error.message });
    }
};

const handleCancelProduct = async (req, res) => {
    try {

        const { itemId } = req.query;
        if (!itemId) {
            return res.status(400).json({ success: false, message: "OrderItem ID is required" });
        }

        const orderItem = await orderItemModel.findById(itemId).populate("product");

        if(orderItem.status == "Cancelled"){
            return res.status(HttpStatus.BAD_REQUEST).json({ mission: false, message: "Product already cancelled" });
        }


        if (!orderItem) {
            return res.status(404).json({ success: false, message: "OrderItem not found" });
        }
        if (orderItem.status === 'Returned' || orderItem.status === 'Return Requested') {
            return res.status(400).json({ success: false, message: "Order already Returned or Under Process" });
        }

        const updatedOrderItem = await updateReturnObject("_id", itemId);
        if (!updatedOrderItem) {
            return res.status(400).json({ success: false, message: "Failed to update order status" });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate( 
            updatedOrderItem.orderId,
            {
                $inc:
                {
                    totalPrice:-orderItem.product.salePrice,
                    finalAmount:-updatedOrderItem.price,paymentAmount:-updatedOrderItem.price
                }
            });

            const arun = ["Pending","Shipped"];
            const allItemOfOrder = await orderItemModel.find({orderId:updatedOrder._id ,status:{$in:arun}});
            if(allItemOfOrder.length <=0 || !allItemOfOrder){
                updatedOrder.status = "Cancelled";
                await updatedOrder.save()
            }
        
        //refunding the amount into the wallet:
        const walletToUpdate = await walletModel.findOne({ userId: updatedOrder.userId });

        let amountToUpdateIntoWallet = updatedOrderItem.price*updatedOrderItem.quantity;

        const modifyFields = {
            amount: amountToUpdateIntoWallet, 
            type: "credit",
            description: "Refund successful",
            orderId: updatedOrder._id, 
            transactId: generateTheRandomId(walletToUpdate?.transactions?.length || 0)
        };

        if (walletToUpdate && updatedOrder.paymentMethod !== "cod") {
            await walletModel.findOneAndUpdate(
                { userId: updatedOrder.userId },
                {
                    $push: { transactions: modifyFields },
                    $inc: { balance: amountToUpdateIntoWallet }
                },
                { new: true }
            );
        } else if (updatedOrder.paymentMethod !== "cod") {

            await new walletModel({
                userId: updatedOrder.userId,
                balance: amountToUpdateIntoWallet,
                transactions: [modifyFields]
            }).save();
        }

        await productModel.findByIdAndUpdate(
            orderItem.product._id,
            {
                $inc :{quantity:orderItem.quantity},
                $set : {status:"available"}
            },
            {new:true}
        );

        //here i need to increment the respective product quantity;


        return res.status(200).json({ success: true, message: "Status updated successfully" });

    } catch (error) {
        
        return res.status(500).json({ success: false, message: "Something went wrong", Error: error.message });
    }
};

const updateCancelOrder = async (field, value, reason) => {
    
    const updatedOrder = await orderModel.findOneAndUpdate(
        { [field]: value },
        { status: "Cancel requested", cancellationReason: reason ? reason :" i want to cancel this order" }
    );
    return !!updatedOrder;
};

const updateReturnObject = async (field, value, reason) => {
    const updatedOrderItem = await orderItemModel.findOneAndUpdate(
        { [field]: getNewObjIdOfId(value) },
        { status: "Cancelled", returnReason: reason }
    );

    if(!updatedOrderItem || Object.keys(updatedOrderItem).length<=0 ){
        return false;
    }

    return updatedOrderItem;
};

//when user return the order delivered
//based on the 7 days policyy 
//i need to return the order to the user
//--------------------------------------------------------
const handleReturnDeliveredOrder = async (req, res) => {
    try {
        const { itemId, cancellingMode } = req.query;
        const { reason } = req.body;

        if (!itemId) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        if(cancellingMode == "returnProduct"){
            return await handleReturnDeliveredProduct(res,reason,itemId);
        } else {
            const order = await orderModel.findOne({ orderId: itemId });
    
            if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
            }
    
            if (order.status === 'Cancelled' || order.status === 'Cancel requested' || order.status == "Order Return Requested") {
            return res.status(400).json({ success: false, message: "Order already Cancelled or Under Process" });
            }
    
            order.status = "Order Return Requested";
            order.cancellationReason = reason;
    
            await order.save();
    
            return res.status(200).json({ success: true, message: "Status updated successfully" });
        }

    } catch (error) {
        
        return res.status(500).json({ success: false, message: "Something went wrong", Error: error.message });
    }
};

const handleCoupons=async(req,res)=>{
    try{
        const {price}= req.query;
    
        if(!price){
            return res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"price not found in the query"
            });
        }
    
        const coupons = await couponModel.find({minimumPrice:{$lte : price}});
    
        return res.status(HttpStatus.OK).json({
            mission:"success",message:"copupns fetched successfully",coupons:coupons
        })

    }catch(err){
        return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({mission:'failed',message:"Server Error",
        Error:err.message})
    }
}

const handleReturnDeliveredProduct=async(res,reason,itemId)=>{
    try{
    
        if(!itemId || !reason){
            return res
            .status(HttpStatus.NOT_FOUND)
            .json({mission:"failed",message:"itemId || reason is null"});
        }
    
        const productToReturn = await orderItemModel.findById(itemId);
        if(!productToReturn || Object.keys(productToReturn).length <=0){
            return res
            .status(HttpStatus.BAD_REQUEST)
            .json({mission:"failed",message:"Product to return is to found"});
        }
    
        productToReturn.returnReason = reason;
        productToReturn.status = "Return Requested";
        await productToReturn.save();
    
        return res
        .status(HttpStatus.OK)
        .json({mission:'success',message:"Return requested successfully"});
    } catch(err){
        return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({mission:'failure',message:"Server Error",Error:err.message});
    }
}

module.exports = {
    getAllOrders,
    handlesNewOrder,
    handleGetInvoice,
    cancelOrderSpecificOrder,
    handleCancelOrder,
    handleCancelProduct,
    handleReturnDeliveredOrder,
    handleReturnDeliveredProduct,
    handleCoupons,
    getOrderDetails
};