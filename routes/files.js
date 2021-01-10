const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const {verifyToken} = require("../middleware/auth")
const {bulkUploads, singleUpload} = require("../Controller/file")

//upload files
router.post("/", verifyToken, bulkUploads)

//upload files
router.post("/single", verifyToken, singleUpload)




module.exports = router;