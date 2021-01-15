const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const {verifyToken} = require("../middleware/auth")
const {filesUpload, singleUpload,bulkDelete,singleDelete} = require("../controller/file")

//upload files
router.post("/", verifyToken, filesUpload)

//delete files
router.delete("/", verifyToken, bulkDelete)

//delete file
router.delete("/single", verifyToken, singleDelete)


module.exports = router;