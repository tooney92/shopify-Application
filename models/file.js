const mongoose = require("mongoose")

const fileSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required:true
    },
    extension:{
        type: String,
        required:true
    },
    fileName:{
        type: String,
        required:true
    },
    filePath:{
        type: String,
        required:true
    },
    fileKey:{
        type: String,
        required:true
    },
    fileSize:{
        type: String,
        required:true
    },
    private:{
        type: Boolean,
        default: false
    },
    deleted:{
        type: Boolean,
        default: false
    },
    
},{
    timestamps: true
})


module.exports = mongoose.model("File", fileSchema)