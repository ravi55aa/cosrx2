
const orderModel = require("../../../Model/order") 
const orderItemModel = require("../../../Model/orderItem") 
const orderAddressModel = require("../../../Model/orderAddress");

const productModel = require("../../../Model/product");
const userModel = require("../../../Model/user");

const HttpStatus = require("../../../Config/HTTPstatusCodes");
const OrderedItem = require("../../../Model/orderItem");

const handle_admin_listOrders=async(req,res)=>{
    try{
        const orderData={};

        const orders = await orderModel.find({}).populate("userId");
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


        const allOrderItems = await orderItemModel.find({orderId:product.orderId});
        
        const returnedOrderItems = await Promise.all(
            allOrderItems.filter( await (ele=>ele.status == "Returned"))
        )

        if(allOrderItems.length === returnedOrderItems.length){
            await orderModel.findByIdAndUpdate(product.orderId,{status:"Cancelled"});
        }


        res.status(HttpStatus.OK).json({mission:"success",message:"Item returned successfully"});
        return;

    } catch (err) {
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", Error: err.message });
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

        const updatedOrder = await orderModel.findOne({orderId:orderId});
        updatedOrder.status = "Cancelled";
        
        await orderItemModel.updateMany(
            { orderId: updatedOrder._id },
            { $set: { status: "Cancelled" } }
        );
        
        await updatedOrder.save();

        res.status(HttpStatus.OK).json({mission:"success",message:"Order Cancelled successfully"});

        return;
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


const handle_orderStatus_update=async(req,res)=>{
    try{
        const {orderId} = req.params;
        const {newStatus} = req.body;

        console.log(orderId,newStatus);
    
        if(!orderId || !newStatus){
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "ProductId or status_to_update is not found"});
            return false;
        }
    
        const updateOrder = await orderModel.findOneAndUpdate({orderId:orderId},{status:newStatus});
        
        if(!updateOrder){
            res.status(HttpStatus.CONFLICT)
                .json({ mission: "failure", message: "Order update if not done"});
            return false;
        }

        const updateOrderItems = await orderItemModel.updateMany(
            {orderId:updateOrder._id},
            {status:newStatus}
        );
    
        if(!updateOrderItems.length<=0 || !updateOrderItems.modifiedCount){
            res.status(HttpStatus.CONFLICT)
                .json({
                mission:"failed", 
                message:"No order-items status is updated "
                });
            return false;
        }

        res.status(HttpStatus.OK).json({mission:"failed",message:"Status updated successfully"});
        return true;
    } catch(err){
        res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
        mission:"failed",
        message:"Server Error",
        Error:err.message
        });
        return false;
    }

}

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

const handle_order_delivered_returnRequest=async(req,res)=>{
    try{
        const {orderId} = req.params;

        if(!orderId){
            res.status(HttpStatus.BAD_REQUEST)
                .json({ mission: "failure", message: "OrderId not found"});
            return false;
        }

        const order = await orderModel.findOne({orderId:orderId});

        if(!order || Object.keys(order).length <= 0){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Order not found"});
            return false;
        }

        order.status = "Order Returned";
        await order.save();

        const itemsUpdated = await orderItemModel.updateMany({orderId:order._id},{status:"Order Returned"});

        if(itemsUpdated.modifiedCount <=0 ){
            res.status(HttpStatus.OK).json({mission:"success",message:"modified count is 0"});
            return;
        }

        res.status(HttpStatus.OK).json({mission:"success",message:"Order returned successfully"});
        return;

    } catch (err) {
        console.log(err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ mission: "failed", message: "ServerError", Error: err.message });
    }
}


module.exports = {
    handle_admin_listOrders,
    handle_product_returnRequest,
    handle_product_returnRequest_reject,
    handle_orderCancel_Accept,
    handle_orderCancel_reject,
    handle_orderStatus_update,
    handle_Search,
    handle_order_delivered_returnRequest
}



