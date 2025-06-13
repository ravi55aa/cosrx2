const express = require("express");
const router =  express.Router();
const {
    getAllCoupons,
    addCoupon,
    fetchEditCoupon,
    editCoupon,
    removeCoupon,
    updateListCoupon,
    searchCouponHandler
}
= require("../../../Controller/admin/Coupon/index");

router.get("/getAll",getAllCoupons);
router.post("/add",addCoupon);
router.get("/edit/:couponId",fetchEditCoupon),
router.put("/edit/:couponId",editCoupon),
router.patch("/toggle-listing/:couponId",updateListCoupon);
router.delete("/remove/:couponId",removeCoupon);
router.get("/search",searchCouponHandler);

module.exports = router;