const HttpStatus =  require("../../../Config/HTTPstatusCodes");
const productModel = require("../../../Model/product");
const categoryModel = require("../../../Model/category");

const orderModel = require("../../../Model/order");
const orderItemModel = require("../../../Model/orderItem");
const orderAddressModel = require("../../../Model/orderAddress");
const helper = require("./orderBusnessLog");

const { default: mongoose } = require("mongoose");

const getNewObjIdOfId = (id)=>{
    return new mongoose.Types.ObjectId(id);
}

const getAllOrders=async(req,res)=>{
    try{
        const { field, id } = req.query;
        let userId = "";

        if (!field || !id) {
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "Missing field or id in query parameters" });
            return;
        }

        if (field === "googleId") {
            const user = await userModel.findOne({ [field]: id });

            if (!user) {
                res.status(HttpStatus.NOT_FOUND)
                    .json({ mission: "failure", message: "User not found for the provided googleId" });
                return;
            }

            userId = user._id;
        } else {
            userId = id;
        }

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
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", Error: err.message });
    }
}

const handlesNewOrder = async (req, res) => {
    try {
        const { field, id } = req.query;
        let userId = "";

        if (!field || !id) {
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "Missing field or id in query parameters" });
            return;
        }

        if (field === "googleId") {
            const user = await userModel.findOne({ [field]: id });

            if (!user) {
                res.status(HttpStatus.NOT_FOUND)
                    .json({ mission: "failure", message: "User not found for the provided googleId" });
                return;
            }

            userId = user._id;
        } else {
            userId = id;
        }

        if (!userId) {
            res.status(HttpStatus.NOT_FOUND)
                .json({ mission: "failure", message: "User not found for the provided ID" });
            return;
        }

        const noOrders = await orderModel.find({ userId: getNewObjIdOfId(userId) });

        const orderId = helper.generateOrderId(noOrders.length);

        const { orderData, orderItemsData, orderAddressData } = req.body;

        if (!orderData || !orderItemsData || !orderAddressData) {
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "Missing orderData, orderItemsData, or orderAddressData in request body" });
            return;
        }

        // Create new Order
        const newOrder = await new orderModel({
            orderId,
            userId: getNewObjIdOfId(userId),
            finalAmount: orderData.finalAmount,
            totalPrice: orderData.totalPrice,
            paymentAmount: orderData.paymentAmount,
            cancellationReason:"",
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
        console.log(err.message);
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

        const order = await orderModel.findOne({ orderId:orderId}).populate("userId");

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


        return res.status(HttpStatus.OK)
            .json({ mission: "success", message: "Order Invoice fetched successfully", invoice: orderInvoice });

    } catch (err) {
        console.error("Error fetching invoice:", err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
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
        console.error("Cancel Order Error:", error);
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
        console.error("Cancel Order Error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong", Error: error.message });
    }
};

const updateCancelOrder = async (field, value, reason) => {
    const updatedOrder = await orderModel.findOneAndUpdate(
        { [field]: value },
        { status: "Cancel requested", cancellationReason: reason }
    );
    return !!updatedOrder;
};

const updateReturnObject = async (field, value, reason) => {
    const updatedOrder = await orderItemModel.findOneAndUpdate(
        { [field]: getNewObjIdOfId(value) },
        { status: "Return Requested", returnReason: reason }
    );
    return !!updatedOrder;
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

    } catch (error) {
        console.error("Cancel Order Error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong", Error: error.message });
    }
};


module.exports = {
    getAllOrders,
    handlesNewOrder,
    handleGetInvoice,
    cancelOrderSpecificOrder,
    handleCancelOrder,
    handleReturnDeliveredOrder,
};