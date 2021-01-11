const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const {verifyToken} = require("../middleware/auth")
const {bulkUploads, singleUpload,bulkDelete,singleDelete} = require("../Controller/file")

//upload files
router.post("/", verifyToken, bulkUploads)

//upload file
router.post("/single", verifyToken, singleUpload)

//delete files
router.delete("/", verifyToken, bulkDelete)

//delete file
router.delete("/single", verifyToken, singleDelete)


module.exports = router;