const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../../../Config/jwt");

const { loadCategory } = require("../../../Controller/user/productDetails");

router.get("/manageCategory", authMiddleware, loadCategory);

module.exports = router;