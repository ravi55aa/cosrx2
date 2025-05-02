const express = require("express");
const router = express.Router();
const upload =  require("../../../Config/multer");

const {
addProducts,
checkProductExist,
reAddProducts,
loadProducts,
editProducts,
deleteProducts,
searchProducts,
listingProduct
} = require("../../../Controller/adminController");

router.get("/products",loadProducts);

router.post("/products/add",upload.array("images"),addProducts);

router.post("/products/check-exist",checkProductExist);

router.post("/product/readd/:id",reAddProducts);

router.put("/products/edit/:id",upload.array("images"),editProducts);

router.patch("/products/delete/:id",deleteProducts); 

router.patch("/products/listing/:id",listingProduct);

router.get("/products/search",searchProducts);

module.exports = router;