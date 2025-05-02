const express = require("express");
const router = express.Router();
const {
    loadUsers,
    handleBlocking,
    handleSearchInput,
} = require("../../../Controller/adminController");

router.get("/manageUsers", loadUsers);

router.post("/handleBlocking", handleBlocking);

router.post("/searchUsers", handleSearchInput);

module.exports = router;