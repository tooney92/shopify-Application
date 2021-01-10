const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    firstName:{
        type:String,
        required: true
    },
    lastName:{
        type:String,
        required: true
    },
    gender:{
        type:String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    email: {
        type: String,
        required: true,
        unique: true  
    },
    password: {
        type: String,
        required: true  
    },
    userName:{
        type: String,
        required: true,
        unique: true
    },
    deactivate: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

//added stuff here
module.exports = mongoose.model("User", userSchema)

