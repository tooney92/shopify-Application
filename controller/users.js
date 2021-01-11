const express = require("express")
const router = express.Router()
const { Validator } = require('node-input-validator')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const webtoken = require("../middleware/auth")
const jwt = require("jsonwebtoken")
// const webToken = require("../middleware/auth")
const User = require("../models/user")

const VerrorsMessageFormatter = (Verrors) => {       //formats verror message
    let errors = Object.entries(Verrors)
    errorsFormatted = errors.map(h => h[1].message)
    return errorsFormatted
}

const duplicateMessageFormatter = (message)=>{
    const messagePolish = Object.entries(message)[0][0]
    console.log(messagePolish);
    
    return `${messagePolish} already exists!`
}

module.exports.signUp =  async(req,res) => {
    try {
        const v = new Validator(req.body, {
            firstName: "required|minLength:2",
            lastName: "required|minLength:2",
            gender: "required",
            email: "required|email",
            password: "required|minLength:8",
            userName: "required|minLength:3",
        })

        const match = await v.check()
        if(!match) return res.status(422).json({error:  VerrorsMessageFormatter(v.errors)})
        const hash = bcrypt.hashSync(req.body.password, saltRounds)
        req.body.password = hash
        
        const user = new User(req.body)
        await user.save()

        //expires after 24hours
        await jwt.sign({data: user}, process.env.token_secret, {expiresIn: 60 * 60 * 24}, (err, token) => {
            if(err) return res.status(500).json({message: "Token Could not be generated. Please try signinUp in again!"})
            return res.status(201).json({user, token})
        })

    } catch (error) {
        console.log(error);
        if(error.code === 11000) return res.status(422).json({error: duplicateMessageFormatter(error.keyPattern)})
        return res.status(422).send("issues registering account")
    }
}

module.exports.login = async(req, res)=>{
    try {
        const v = new Validator(req.body, {
            userName: "required", 
            password: "required"
        })
        const match = await v.check()
        if(!match) return res.status(422).json({error:  VerrorsMessageFormatter(v.errors)})

        const {userName} = req.body
        const user =  await User.findOne({userName: userName})
        if(!user) return res.status(422).json({error: "User name does not exist!"})

        if(user.deactivate) return res.status(422).json({error: "account has been deactivated please contact help desk"})
        const matchPassword = await bcrypt.compare(req.body.password, user.password)

        await jwt.sign({data: user}, process.env.token_secret, {expiresIn: 60 * 60 * 24}, (err, token) => {
            if(err) return res.status(500).json({message: "Token Could not be generated. Please try signinUp in again!"})
            return res.status(201).json({user, token})
        })
        
    }catch(error) {
        console.log(error);
        return res.status(422).json({error: error})
    }
}






