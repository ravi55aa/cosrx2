const express = require("express");
const router = express.Router();
const {
    handleAddToWishlist,
    handleFetchWishlist,
    handleRemoveFromWishlist,
} = require(".././../../Controller/user/Menu/wishlist");

router.get("/fetchData",handleFetchWishlist);
router.post("/add/:productId",handleAddToWishlist);
router.delete("/remove/:productId",handleRemoveFromWishlist);

module.exports = router;