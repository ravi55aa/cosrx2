const express = require("express");
const router = express.Router();
const {
    getAllOrders,
    handlesNewOrder,
    handleGetInvoice,
    handleCancelOrder,
    handleReturnDeliveredOrder
} = require("../../../Controller/user/order/order.js");

// router.items
// router.address

router.get("/getAllOrders",getAllOrders)
router.post("/new",handlesNewOrder);
router.get("/invoice/:orderId",handleGetInvoice);
router.patch("/cancelOrReturn",handleCancelOrder)
router.patch("/cancelOrReturn/deliveredOrder",handleReturnDeliveredOrder)

module.exports = router;
