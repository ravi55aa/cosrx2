
const express = require("express")
const router =  express.Router();
const {
    getHighestOffer,
    getAll,
    add,
    editOffer_fetchOfferData,
    editOffer,
    updateListing,
    deleteOffer,
    searchOfferHandler
} = require("../../../Controller/admin/Offer/index.js");


//User side route: => getHighest/:productId
router.get("/getHighest/:productId",getHighestOffer);

router.get("/getAll",getAll); 

router.post("/add",add); 

router.get("/edit/fetchOffer/:offerId",editOffer_fetchOfferData);
router.post("/edit/:offerId",editOffer);

router.patch("/toggle-listing/:offerId",updateListing);
router.delete("/remove/:offerId",deleteOffer);
router.get("/search",searchOfferHandler);

module.exports = router;