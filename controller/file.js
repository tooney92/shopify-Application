const express = require("express")
const router = express.Router()
const { Validator } = require('node-input-validator')
const jwt = require("jsonwebtoken")
const webToken = require("../middleware/auth")
const File = require("../models/file")
const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path')
const { uuid } = require('uuidv4')
const {mimeCheck} = require('../helpers/file')


//format errors from the node-input validator into an array 
const VerrorsMessageFormatter = (Verrors) => {
    let errors = Object.entries(Verrors)
    errorsFormatted = errors.map(h => h[1].message)
    return errorsFormatted
}

const BUCKET_NAME = process.env.bucketName
const IAM_USER_KEY = process.env.aws_access_key_id
const IAM_USER_SECRET = process.env.aws_secret_access_key

const s3 = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
})

const duplicateMessageFormatter = (message) => {
    const messagePolish = Object.entries(message)[0][0]
    console.log(messagePolish);

    return `${messagePolish} already exists!`
}

const mimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
]

const uploadFile = (params) => {
    return new Promise((resolve, reject) => {
        s3.upload(params, function (err, data) {
            if (err) {
                console.log(err);
                return reject(err);
            } else {
                console.log(`${data.key} uploaded sucessfully`);
                return resolve(data)
            }
        });
    })
}


module.exports.bulkUploads = async (req, res) => {
    try {
        req.setTimeout(500000);
        if (!req.files || Object.keys(req.files).length === 0) return res.status(400).send('No files were attached.')

        const v = new Validator(req.files, {
            "uploads": "required"
        })

        const match = await v.check()
        if (!match) return res.status(422).json(VerrorsMessageFormatter(v.errors))

        //files uploaded
        const files = req.files.uploads
        
        //check for invalif formats
        // console.log(files);
        const filesCheck = mimeCheck(files, mimeTypes)
        if(filesCheck.issues) return res.status(400).json({
            message: "invalid file format",
            files: filesCheck.invalidFiles,
            permittedFormat: "png, jpg, jpeg, gif"
        })
        
        if(files.length > 20) return res.status(400).send("only 20 files per upload is allowed")

        //bulk uploads
        const userFiles = []
        for (let count = 0; count < files.length; count++) {

            let file = files[count]
            let extension = path.extname(file.name)
            let filename = uuid() + extension

            const params = {
                Bucket: BUCKET_NAME,
                Key: filename, // File name you want to save as in S3
                Body: file.data,
                ContentEncoding: 'base64',
                ContentType: file.mimetype,
                ACL: req.query.private === "true" ? 'private' : "public-read"
            };
            const result = await uploadFile(params)
            
            //create the record to be sent to DB
            const userFile = {}

            userFile.private = req.query.private === "true" ? true : false
            userFile.userId = req.user._id
            userFile.fileName = file.name
            userFile.extension = file.mimetype
            userFile.fileSize = file.size
            userFile.filePath = result.Location
            const record = new File(userFile)
            await record.save()
            userFiles.push(record)
        }

        res.json(userFiles)

    } catch (error) {
        console.log(error);
        res.status(500).send("oops")
    }
}

module.exports.singleUpload = async (req, res) => {

    try {

        if (!req.files || Object.keys(req.files).length === 0) return res.status(400).send('No files were attached.')

        const v = new Validator(req.files, {
            "uploads": "required"
        })

        const match = await v.check()
        if (!match) return res.status(422).json(VerrorsMessageFormatter(v.errors))

        let file = req.files.uploads

        //file format check
        if(!mimeTypes.includes(file.mimetype)) return res.status(400).send("file format must be png, jpg, jpeg, gif")

        let extension = path.extname(file.name)
        let filename = uuid() + extension

        const params = {
            Bucket: BUCKET_NAME,
            Key: filename, // File name you want to save as in S3
            Body: file.data,
            ContentEncoding: 'base64',
            ContentType: file.mimetype,
            ACL: req.query.private === "true" ? 'private' : "public-read"
        };
        const result = await uploadFile(params)
        console.log(result);
        //create the record to be sent to DB

        const userFile = {}
        userFile.userId = req.user._id
        userFile.fileName = file.name
        userFile.extension = file.mimetype
        userFile.fileSize = file.size
        userFile.filePath = result.Location

        const record = new File(userFile)
        await record.save()

        res.json({file: record})

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }

}




