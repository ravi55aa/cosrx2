const offerModel = require("../../../Model/offer");
const productModel = require("../../../Model/product");
const categoryModel = require("../../../Model/category");
const userModel = require("../../../Model/user");
const orderItemsModel = require("../../../Model/orderItem");
const orderModel = require("../../../Model/order");

const HttpStatus = require("../../../Config/HTTPstatusCodes");
const { default: mongoose } = require("mongoose");

const {
    handleGetAllItems,
    handleGetTopCategories 
} = require("./bussines");

const modelMap = {
    Product: productModel,
    Category: categoryModel,
};

const getObjOfId = (id)=>{
    return new mongoose.Types.ObjectId(id);
}

const getTopData = async (req, res) => {
    try {
        const { dateRange, startDate, endDate, category } = req.query;

        let dateFilter = {};
        const now = new Date();

        if (dateRange && dateRange !== 'All Time') {
            let start, end;

            if (dateRange === 'This Month') {
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
            } else if (dateRange === 'This Year') {
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                end.setHours(23, 59, 59, 999);
            } else if (dateRange === 'Custom' && startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
            }

            if (start && end) {
                dateFilter = {
                    createdAt: {
                        $gte: start,
                        $lte: end
                    }
                };
            }
        }

        const allOrders = await orderModel.find(dateFilter).populate("userId").lean();

        let itemQuery = {};

        if (Object.keys(dateFilter).length > 0) {
            const filteredOrderIds = allOrders.map(order => order._id);
            itemQuery.orderId = { $in: filteredOrderIds };
        }

        if (category && category !== 'All') {
            let categoryFilter = {};
            if (category === 'sunScreen') {
                categoryFilter = { name: { $regex: 'sunscreen', $options: 'i' } };
            } else if (category === 'Tooner') {
                categoryFilter = { name: { $regex: 'toner', $options: 'i' } };
            } else if (category === 'Serum') {
                categoryFilter = { name: { $regex: 'serum', $options: 'i' } };
            }
            itemQuery = { ...itemQuery, ...categoryFilter };
        }

        const allOrderedItems = await orderItemsModel.find(itemQuery).lean();

        const filteredItemOrderIds = [...new Set(allOrderedItems.map(item => item.orderId.toString()))];
        const finalOrders = allOrders.filter(order => filteredItemOrderIds.includes(order._id.toString()));

        const topCategories = await handleGetTopCategories(allOrderedItems);

        res.status(200).json({
            mission: "success",
            message: "Fetched Successfully",
            allOrders: finalOrders,
            allOrderedItems: allOrderedItems,
            topCategories: topCategories,
        });
    } catch (err) {
        res.status(500).json({ mission: "failed", message: "Server Error", Error: err.message });
    }
};

module.exports = {
    getTopData,
}