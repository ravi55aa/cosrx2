const express = require("express");
const router = express.Router();
const upload = require("../../../Config/multer");

const {
    fetchProfile,
    profileEdit,
    handleIsEmailExist,
    handlePasswordChange,
    handleForgotPasswordOnEdit,
    handleNewAddAddress,
    handleGetAddress,
    handleDeleteAddress,
    handleEditFetchAddress,
    handleEditAddress,
    handleChangingDefaultAddr,
} = require("../../../Controller/user/personal");

router.get("/fetchUserProfile",fetchProfile);

router.post("/edit/:id",upload.single("image"),profileEdit);
router.get("/isEmailExist",handleIsEmailExist);
router.patch("/editPassword/:id",handlePasswordChange);
router.patch("/edit/PasswordChange",handleForgotPasswordOnEdit);

router.post("/addAddress",handleNewAddAddress)
router.get("/getAddress",handleGetAddress);
router.delete("/address/delete/:addressID",handleDeleteAddress);
router.get("/address/edit/fetchData/:addressID",handleEditFetchAddress);
router.patch("/address/edit/:addressID",handleEditAddress);
router.patch("/address/changeDefaultAddr/:addressID",handleChangingDefaultAddr);



module.exports = router;          