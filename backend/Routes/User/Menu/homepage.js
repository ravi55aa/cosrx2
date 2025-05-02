const express = require('express');
let router = express.Router();
const {fetchData,getSearchData} = require("../../../Controller/user/homePage");
const {authMiddleware} =  require("../../../Config/jwt");

router.get("/homepage",authMiddleware ,fetchData);

// for home-page
// router.get("/searchData", getSearchData);

module.exports = router;