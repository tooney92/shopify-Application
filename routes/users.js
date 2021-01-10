const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const webtoken = require("../middleware/auth")
const {signUp, login} = require("../controller/users")

//signuP
router.post("/",  signUp)

//login
router.post("/login",  login)

module.exports = router;