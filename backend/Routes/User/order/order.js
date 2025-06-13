const express = require("express");
const router = express.Router();
const {
    getAllOrders,
    handlesNewOrder,
    handleGetInvoice,
    handleCancelOrder,
    handleCancelProduct,
    handleReturnDeliveredOrder,
    handleReturnDeliveredProduct,
    handleCoupons,
    getOrderDetails,
} = require("../../../Controller/user/order/order.js");

// router.items
// router.address

router.get("/getAllOrders",getAllOrders)

router.post("/new",handlesNewOrder);

router.get("/order/:orderId",getOrderDetails);

router.get("/invoice/:orderId",handleGetInvoice);

router.patch("/cancelOrReturn",handleCancelOrder)
router.patch("/cancelProduct",handleCancelProduct)

router.patch("/cancelOrReturn/deliveredOrder",handleReturnDeliveredOrder)

router.get("/fetchCoupons",handleCoupons);

// router.patch("/cancelOrReturn/deliveredOrder",handleReturnDeliveredProduct);

module.exports = router;
