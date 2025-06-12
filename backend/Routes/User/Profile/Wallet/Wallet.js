const express = require("express");
const router =  express.Router();
const { 
    handleAddFund ,
    handleFetchingData,
    createOrder_Service,
    payWithWallet
} = require("../../../../Controller/user/Wallet/Wallet");

router.post("/add-funds",handleAddFund);
router.get("/details",handleFetchingData)
router.post("/create-order",createOrder_Service)
router.patch("/payWithWallet",payWithWallet);

module.exports = router;
