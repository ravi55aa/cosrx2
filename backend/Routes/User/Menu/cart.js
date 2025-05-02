const express = require("express");
const router = express.Router();
const {
    handleAddToCart,
    handleListOfCatProducts,
    handleDecQuantity,
    handleIncQuantity,
    handleRemoveFromCart,
    handleFetchAddress,
} = require(".././../../Controller/user/Menu/Cart.js");

router.post("/addToCart/:productId", handleAddToCart);
router.get("/products",handleListOfCatProducts);
router.patch("/product/quantityInc/:productId",handleIncQuantity);
router.patch("/product/quantityDec/:productId",handleDecQuantity);
router.patch("/product/remove/:productId",handleRemoveFromCart);
router.get(`/product/address`,handleFetchAddress);

module.exports = router;
