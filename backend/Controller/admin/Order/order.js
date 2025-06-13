const mongoose = require("mongoose");

const orderModel = require("../../../Model/order") 
const orderItemModel = require("../../../Model/orderItem") 
const orderAddressModel = require("../../../Model/orderAddress");

const Razorpay = require("razorpay");
const productModel = require("../../../Model/product");
const userModel = require("../../../Model/user");
const walletModel = require("../../../Model/wallet");

const HttpStatus = require("../../../Config/HTTPstatusCodes");
const OrderedItem = require("../../../Model/orderItem");
require("dotenv").config();

const {generateTheRandomId} = require("../../../Controller/user/Wallet/Wallet.js");

const getObjId= (id)=>{
    return new mongoose.Types.ObjectId(id);
}

const handle_admin_listOrders=async(req,res)=>{
    try{
        const orderData={};

        const orders = await orderModel.find({}).sort({createdAt:-1}).populate("userId");
        if(orders.length <= 0){
            res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "No Orders"});
            return false;
        }
        orderData.orders = orders;


        const orderItems = await orderItemModel.find().populate("product");
        if(orderItems.length <= 0){
            res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "No Order_items"});
            return false;
        }
        orderData.items = orderItems;

        const orderAddressItems = await orderAddressModel.find();
        if(orderAddressItems.length <= 0){
            res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "No_Address"});
            return false;
        }
        orderData.address = orderAddressItems;

        res.status(HttpStatus.OK)
                .json({ mission: "success", message: "Order's fetched Successfully", orderData:orderData });
            return;

    } catch (err) {
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", Error: err.message });
    }
}

const handle_product_returnRequest=async(req,res)=>{
    try{
        const {productId} = req.params;

        if(!productId){
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "ProductId not found"});
            return false;
        }

        const product = await orderItemModel.findById(productId);

        if(!product){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Item not found"});
            return false;
        }

        product.status = "Returned";
        await product.save();

        await productModel.findByIdAndUpdate(
                    product.product,
                    {$inc :{quantity:product.quantity}},
                    {new:true}
                );

        const allOrderItems = await orderItemModel.find({ orderId: product.orderId });

        const returnedOrderItems = allOrderItems.filter(item => item.status === "Returned");

        if (allOrderItems.length === returnedOrderItems.length) {
            await orderModel.findByIdAndUpdate(product.orderId, { status: "Order Returned" });
        }

        //UPDATE THE WALLET;
        const updatedOrder = await orderModel.findById(product.orderId);

        if(!updatedOrder || Object.keys(updatedOrder).length <=0){
            return res.status(HttpStatus.BAD_REQUEST).json({mission:"failed",message:"orderId of the product not found"});
        }

        const walletTOupdate = await walletModel.findOne({userId:updatedOrder.userId});

        const modifyFields = {
            amount:product.price*product.quantity,
            type:"credit",
            description:"Refund successful ",
            orderId:product.orderId,
            transactId:generateTheRandomId(walletTOupdate?.transactions?.length || 0)
        }
        
        if(walletTOupdate){
            const totalItemAmount = product.price*product.quantity;
            const updatedWallet = await walletModel.findOneAndUpdate(
                {userId:updatedOrder.userId},
                {
                    $push:{transactions:modifyFields},
                    $inc:{balance:totalItemAmount}
                },
                {new:true}
            );

        } else {
            const wallet = await new walletModel({
                            userId: updatedOrder.userId,
                            balance: product.price*product.quantity,
                            transactions: [modifyFields],
                }).save();
        }

        res.status(HttpStatus.OK).json({mission:"success",message:"Item returned successfully"});
        return;

    } catch (err) {
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", 
                        Error: err.message });
    }
}

const handle_product_returnRequest_reject=async(req,res)=>{
    try{
        const {productId} = req.params;

        if(!productId){
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "ProductId not found"});
            return false;
        }

        const product = await orderItemModel.findById(productId);

        if(!product){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Item not found"});
            return false;
        }

        if(!req.body?.reason){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Reason for rejection is missing "});
            return false;
        }

        product.status = "Pending";
        product.returnRejectReason = req.body?.reason;
        await product.save();

        res.status(HttpStatus.OK).json({mission:"success",message:"Item rejected successfully"});
        return;

    } catch (err) {
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", Error: err.message });
    }
}

const handle_orderCancel_Accept=async(req,res)=>{
    try{
        const {orderId} = req.params;

        if(!orderId){
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "ProductId not found"});
            return false;
        }
    

        const updatedOrder = await orderModel.findOne({ orderId });
        if (!updatedOrder) {
            return res.status(HttpStatus.BAD_REQUEST)
                    .json({ mission: "failed", message: "Order not found" });
        }
        updatedOrder.status = "Cancelled";
        await updatedOrder.save();

        //increase the Quantity of the respective product:
        const statusToCheck = ["Pending","Shipped"];
        const orderItems = await orderItemModel.find(
            { orderId: updatedOrder._id,status:{$in:statusToCheck}}
        );

        await Promise.all(
            orderItems.map(async (item) => {
                await productModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { quantity: item.quantity } },
                    { new: true }
                );

                item.status = "Cancelled";
                item.save();
            })
        );

        //at last update the wallet amount:
        const walletTOupdate = await walletModel.findOne({userId:updatedOrder.userId});

        const amountAddToWallet = orderItems.reduce((acc,ele)=>acc+ele.price*ele.quantity,0);

        const modifyFields = {
            amount:amountAddToWallet > 500 
            ? amountAddToWallet+3:amountAddToWallet+43,
            type:"credit",
            description:"Refund successful ",
            orderId:updatedOrder._id,
            transactId:generateTheRandomId(walletTOupdate?.transactions?.length || 0)
        }

        if(!walletTOupdate){
            const wallet = await new walletModel({
                                userId: updatedOrder.userId,
                                balance: amountAddToWallet > 500 
            ? amountAddToWallet+3:amountAddToWallet+43,
                                transactions: [modifyFields],
                    }).save();
        }

        if(walletTOupdate && updatedOrder.paymentMethod != "cod"){
            const updatedWallet = await walletModel.findOneAndUpdate(
                {userId:updatedOrder.userId},
                {
                    $push:{transactions:modifyFields},
                    $inc:{balance:amountAddToWallet}
                },
                {new:true}
            );
        } 



        return res.status(HttpStatus.OK).json({mission:"success",message:"Order Cancelled successfully",order:updatedOrder});

    } catch (err) {
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", Error: err.message });
    }
}

const handle_orderCancel_reject=async(req,res)=>{
    try{
        const {orderId} = req.params;

        if(!orderId){
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "ProductId not found"});
            return false;
        }

        const order = await orderModel.findOne({orderId:orderId});

        if(!order){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"No order found"});
            return false;
        }

        order.status = "Pending";
        await order.save();

        res.status(HttpStatus.OK).json({mission:"success",message:"Order Cancellation Request rejected successfully"});
        return;

    } catch (err) {
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", Error: err.message });
    }
}

const handle_orderStatus_update = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { newStatus } = req.body;

        if (!orderId || !newStatus) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failure",
                message: "orderId or newStatus is missing"
            });
        }

        const order = await orderModel.findOne({orderId:orderId});

        const validStatuses = ["Pending", "Shipped", "Cancelled", "Delivered",];
        if (!validStatuses.includes(newStatus)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failure",
                message: "Invalid status provided"
            });
        }

        if(newStatus =="Shipped"){
            await orderItemModel.updateMany(
                { orderId: order._id , status:{$eq:"Pending"}},
                { status: newStatus },
                { new: true }
            );
        }

        if(newStatus =="Delivered"){
            const statusToCheck = ["Pending","Shipped"];
            await orderItemModel.updateMany(
                { orderId: order._id, status:{$in:statusToCheck}},
                { status: newStatus },
                { new: true }
            );
        }

        if (newStatus == "Cancelled") {
            // Increase product quantities
            const statusToCheck = ["Delivered","Cancelled"]
            const orderItems = await orderItemModel.find({ orderId: order._id,status:{$nin:statusToCheck} });
            const cancelledItems = await Promise.all(
                orderItems.map(async (item) => {
                    return await productModel.findOneAndUpdate(
                        { _id:item.product },
                        { $inc: { quantity: item.quantity }},
                        { new: true }
                    );
                })
            );

            for(let i=0; i<orderItems.length; i++){
                orderItems[i].status = "Cancelled";
                await orderItems[i].save();
            }

            const walletAmt = cancelledItems.reduce((acc,val)=> acc+val.price,0);
            const wallet = await walletModel.findOne({ userId: order.userId });
            const transaction = {
                paymentAmount: walletAmt,
                type: "credit",
                description: `Refund for cancelled order ${orderId}`,
                orderId: order._id,
                transactId: generateTheRandomId(wallet?.transactions?.length || 0)
            };
            
            if (wallet && order.paymentMethod !== "cod") {
                await walletModel.findOneAndUpdate(
                    { userId: order.userId },
                    {
                        $push: { transactions: transaction },
                        $inc: { balance: order.paymentAmount }
                    },
                    { new: true }
                );
            } else if (order.paymentMethod !== "cod") {
                await new walletModel({
                    userId: order.userId,
                    balance: updatedOrder.paymentAmount,
                    transactions: [transaction]
                }).save();
            }
        }

        order.status = newStatus;
        await order.save();

        return res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Order status updated successfully",
            order: order
        });

    } catch (err) {
        console.error("Error in handle_orderStatus_update:", err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            mission: "failure",
            message: "Server Error",
            error: err.message
        });
    }
};

const handle_order_item_updateStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    if (!orderId || !itemId) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            mission: "failure",
            message: "ProductId or itemId is not found",
        });
    }

    const order = await orderModel.findOne({ orderId }).populate("userId");
    const orderItem = await orderItemModel.findById(itemId);

    if (!orderItem || !order) {
        return res.status(HttpStatus.NOT_FOUND).json({
        mission: "failure",
        message: "Order or Order Item not found",
        });
    }

    const updateItem = await orderItemModel.findByIdAndUpdate(
        itemId,
        { status },
        { new: true }
        );

    if (!updateItem) {
        return res.status(HttpStatus.CONFLICT).json({
            mission: "failure",
            message: "Order item update failed",
        });
    }

    const handleLastItemStatus=async(orderId,status)=>{
        const arun = ["Pending","Shipped","Order Returned"];
        
        const allItemOfOrder = await orderItemModel.find(
            {orderId:orderId ,status:{$in:arun}
        });

        if(allItemOfOrder.length <=0 || !allItemOfOrder){
            order.status = status;
            await order.save()
        }

        return true;
    }
    
    if (status === "Cancelled") {
      const itemPrice = orderItem.price * orderItem.quantity;

        order.paymentAmount -= itemPrice;
        await order.save();

        // Handle wallet
        const userId = order.userId._id;
        const userWallet = await walletModel.findOne({ userId });

        const newTransaction = {
            type: "credit",
            amount: itemPrice,
            description: `Refund for cancelled item (${orderItem.name}) in Order #${orderId}`,
            orderId: order._id,
            transactId: generateTheRandomId(userWallet ? userWallet.transactions.length : 0),
        };

        if (!userWallet) {
            await new walletModel({
            userId,
            balance: itemPrice,
            transactions: [newTransaction],
            }).save();
        } else {
            await walletModel.updateOne(
            { userId },
            {
                $inc: { balance: itemPrice },
                $push: { transactions: newTransaction },
            },
            {new:true}
            );
        }

        //increase the quantity of the respective item:
        const quantityModified = await productModel.findByIdAndUpdate(
            updateItem.product,
            {$inc: {quantity:updateItem.quantity}},
            {new:true}
        );

        console.log("----------------------",quantityModified);

        //if no other product is to deliver or cancel make entire order status = "new Status";
        await handleLastItemStatus(order._id,status);
    }

    if(status == "Delivered"){
        await handleLastItemStatus(order._id,status);
    }

    return res.status(HttpStatus.OK).json({
        mission: "success",
        message: "Status updated successfully",
        updatedItem: updateItem,
    });

    } catch (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        mission: "failed",
        message: "Server Error",
        Error: err.message,
        });
    }
};

const handle_Search = async (req, res) => {
    try {
        const { searchTerm } = req.params;
    
        const orderData = { orders: [], items: [], address: [] };
        console.log("searchTerm:", searchTerm);
    
        if (!searchTerm?.trim()) {
            return res.status(HttpStatus.BAD_REQUEST).json({
            status: "success",
            message: "No orders found. Empty search term.",
            orderData,
            });
        }
    
        const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const regExSearchTerm = new RegExp(escapeRegex(searchTerm), "i");
    
        const orders = await orderModel.find({ orderId: regExSearchTerm }).populate("userId");    
        if (!orders.length) {
            return res.status(HttpStatus.OK).json({
            status: "success",
            message: "No matching order items found.",
            orderData,
            });
        }

        orderData.orders = orders;
    
        const orderIds = orders.map((item) => item._id);
        console.log('orderIds---',orderIds);
        const items = await orderItemModel.find({ _id: { $in: orderIds } }).populate("product");
        const addresses = await orderAddressModel.find({
            orderId: { $in: orderIds },
        });

        console.log("orders",items.length)
        console.log("address",addresses.length);
    
        orderData.items = items;
        orderData.address = addresses;
    
        return res.status(HttpStatus.OK).json({
            status: "success",
            message: "Orders fetched successfully.",
            orderData:orderData,
        });
    } catch (err) {
    console.error("Search error:", err.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "failed",
        message: "Server error",
        error: err.message,
    });
    }
};

// Helper function of the erazor pay.....
// Helper function to initiate Razorpay refund using razorpayOrderId
const initiateRazorpayRefund = async (razorpayOrderId, amount) => {
    try {
        // Debug environment variables
        if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
            throw new Error("Razorpay credentials are missing. Check RAZORPAY_KEY and RAZORPAY_SECRET in .env file.");
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        // Fetch payments associated with the Razorpay order ID
        const payments = await razorpay.orders.fetchPayments(razorpayOrderId);
        if (!payments || payments.items.length === 0) {
            throw new Error("No payments found for this Razorpay order");
        }

        // Assuming the first payment is the one to refund (adjust if multiple payments exist)
        const paymentId = payments.items[0].id;
        console.log(`Initiating refund for payment ID: ${paymentId}`);

        // Initiate the refund
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount * 100, // Amount in paisa
        });

        return { success: true, refund };
    } catch (err) {
        console.error("Razorpay Refund Error:", err.message);
        return { success: false, error: err.message };
    }
};

const handle_order_delivered_returnRequest = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failure",
                message: "OrderId not found",
            });
        }

        const order = await orderModel.findOne({ orderId: orderId }).populate("userId");

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "Order not found",
            });
        }

        if (order.refundProcessed) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failure",
                message: "Refund already processed for this order",
            });
        }

        order.status = "Order Returned";
        order.refundProcessed = true;
        await order.save();

        // Increment stock
        const allTheReturnedItems = await orderItemModel.find({
            orderId: order._id,
            status: "Delivered",
        });

        await Promise.all(
            allTheReturnedItems.map(async (item) => {
                await productModel.findByIdAndUpdate(
                    item.product,
                    {
                        $inc: { quantity: item.quantity },
                        $set: { status: "available" },
                    },
                    { new: true }
                );
            })
        );

        await orderItemModel.updateMany(
            { orderId: order._id, status: "Delivered" },
            { status: "Returned" }
        );

        // Wallet Credit Logic (Unified for all payment methods)
        const refundAmount = order.paymentAmount;
        const refundDescription = `Refund for returned order #${orderId}`;
        const userWallet = await walletModel.findOne({ userId: order.userId });

        const newTransaction = {
            type: "credit",
            amount: refundAmount,
            description: refundDescription,
            orderId: order._id,
            transactId: generateTheRandomId(userWallet ? userWallet.transactions.length : 0),
        };

        if (!userWallet) {
            const wallet = await new walletModel({
                userId: order.userId,
                balance: refundAmount,
                transactions: [newTransaction],
            }).save();

            if (!wallet) {
                return res.status(HttpStatus.CONFLICT).json({
                    mission: "failed",
                    message: "Cannot create wallet for refund",
                });
            }
        } else {
            const updatedWallet = await walletModel.updateOne(
                { userId: order.userId },
                {
                    $inc: { balance: refundAmount },
                    $push: { transactions: newTransaction },
                }
            );

            if (updatedWallet.modifiedCount <= 0) {
                return res.status(HttpStatus.CONFLICT).json({
                    mission: "failed",
                    message: "Failed to process refund to wallet",
                });
            }
        }

        return res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Order returned and wallet credited successfully",
        });

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
    handle_admin_listOrders,
    handle_product_returnRequest,
    handle_product_returnRequest_reject,
    handle_orderCancel_Accept,
    handle_orderCancel_reject,
    handle_orderStatus_update,
    handle_order_item_updateStatus,
    handle_Search,
    handle_order_delivered_returnRequest,
}



