const express = require("express");
const router = express.Router();

const {authMiddleware} = require('../Config/jwt');

const {
    getSearchData,
    productDetails,
    getCategoryProducts,
    getFilteredProducts,
    getAllProductIntoShop,
    getCategoryProductsBasedOnSearch 
} = require("../Controller/user/productDetails");

router.get("/product/:id",authMiddleware, productDetails);
router.get("/products",authMiddleware, getAllProductIntoShop);
router.get("/filterProducts",authMiddleware, getFilteredProducts);

router.get("/products/:categoryId",authMiddleware, getCategoryProducts);
router.get("/searchProducts", authMiddleware, getCategoryProductsBasedOnSearch);

//for home-page
router.get("/searchData", authMiddleware ,getSearchData);

module.exports = router;
