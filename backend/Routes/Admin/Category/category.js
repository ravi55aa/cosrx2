const express = require("express");
const router = express.Router();
const upload =  require("../../../Config/multer");
const {adminHandler} = require("../../../Config/jwt");

const {
    loadCategory,
    addCategory,
    readdCategory,
    handleSearchInputForCategory,   
    handleListing,
    handleDelete,
    handleEdit,
} = require("../../../Controller/adminController");

//category
router.get("/manageCategory",loadCategory);

router.post("/addCategory",  upload.single("image"),addCategory);

router.get("/reAddCategory", readdCategory);

router.get("/handleSearchInputForCategory", adminHandler, handleSearchInputForCategory);

router.post("/handleListed/:id", adminHandler, handleListing);

router.patch("/handleSoftDelete/:id", adminHandler, handleDelete);

router.patch("/handleEdit/:id",adminHandler, upload.single("image"),handleEdit);


module.exports = router;    