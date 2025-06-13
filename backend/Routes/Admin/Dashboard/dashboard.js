const express = require("express")
const router =  express.Router();
const {getTopData}= require("../../../Controller/admin/Dashboard/dashboard.js");

router.get("/topData",getTopData);

module.exports = router;