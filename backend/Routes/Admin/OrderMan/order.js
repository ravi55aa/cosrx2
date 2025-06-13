const express =  require("express");
const router = express.Router();
const {
    handle_admin_listOrders,
    handle_product_returnRequest,
    handle_product_returnRequest_reject,
    handle_orderCancel_Accept,
    handle_orderCancel_reject,
    handle_orderStatus_update,
    handle_order_item_updateStatus,
    handle_Search,
    handle_order_delivered_returnRequest,
} = require("../../../Controller/admin/Order/order.js");

router.get("/listOrders",handle_admin_listOrders);

router.patch(`/order/cancel/:productId`,handle_product_returnRequest);

router.patch("/order/cancel/reject/:productId",handle_product_returnRequest_reject);

router.patch("/allOrder_cancel/accept/:orderId",handle_orderCancel_Accept);

router.patch("/allOrder_cancel/reject/:orderId",handle_orderCancel_reject);

router.patch("/order/status_update/:orderId",handle_orderStatus_update);

router.patch(`/orders/:orderId/items/:itemId/status`, handle_order_item_updateStatus);

router.get(`/order/search/:searchTerm`,handle_Search);

router.patch(`/order/returnRequest/:orderId`,handle_order_delivered_returnRequest);

module.exports = router;
