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
const { issuesCheck } = require('../helpers/file')


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

const deleteAwsFiles = (params) => {
    return new Promise((resolve, reject) => {
        s3.deleteObjects(params, (err, data) => {
            if (err) {
                console.log(err, err.stack)
                return reject(err)
            }
            else {
                console.log(data)
                return resolve(data)
            }
        })
    })
}

const deleteAwsFile = (params) => {
    return new Promise((resolve, reject) => {
        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err, err.stack)
                return reject(err)
            }
            else {
                console.log("file deleted successfully")
                return resolve(data)
            }
        })
    })
}


module.exports.filesUpload = async (req, res) => {
    try {

        req.setTimeout(500000);
        if (!req.files || Object.keys(req.files).length === 0) return res.status(400).send('No files were attached.')

        if (!req.files.hasOwnProperty("uploads")) {
            return res.status(400).send("the uploads field is required")
        }

        let filesIssues;
        let files;
        //this works on bulk uploads of files sent in an array.
        if (req.query.bulk == "true" && req.files.uploads.length > 1) {
            files = req.files.uploads
            filesIssues = issuesCheck(files, mimeTypes)
        }
        //this work on single file uploads of a file sent as an object. 
        else if (req.files.uploads.length == undefined) {
            files = [req.files.uploads]
            filesIssues = issuesCheck(files, mimeTypes)
        }

        /*
        Handles when a wrong bulk query is passes. 
        E.g, a bulk query is set to true and a single
        file is uploaded. 
        */
        else {
            return res.status(400).send("bulk query value must match files uploaded")
        }

        if (filesIssues) return res.status(400).json({
            filesIssues,
            permittedFormats: "png, jpg, jpeg, gif",
            permittedFileSize: "2MB",
            permittedTotalFiles: "20"
        })

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
            userFile.fileKey = result.Key
            userFile.filePath = result.Location
            const record = new File(userFile)
            await record.save()
            userFiles.push(record)
        }

        res.json(userFiles)

    } catch (error) {
        console.log(error);
        res.status(500).send("unable to perform request")
    }
}

module.exports.bulkDelete = async (req, res) => {
    try {

        const v = new Validator(req.body, {

            "files": "required|array"
        })

        const match = await v.check()
        if (!match) return res.status(422).json(VerrorsMessageFormatter(v.errors))

        //get the files and file keys from the req body
        const { files } = req.body

        //fetch the AWS file keys from the DB
        const userFileKeys = await File.find({ userId: req.user._id, _id: { $in: [...files] } }).select("fileKey")

        if (userFileKeys.length < files.length) return res.status(400).send("unable to delete files. No corresponding keys")

        //array to hold keys to be sent to AWS for deleting.
        const awsKeyParams = []
        userFileKeys.forEach(file => {
            awsKeyParams.push({ Key: file.fileKey })
        });

        //AWS params
        const params = {
            Bucket: process.env.bucketName,
            Delete: {
                Objects: awsKeyParams,
                Quiet: false
            }
        };

        //delete files from AWS using helper function
        const awsDelete = await deleteAwsFiles(params)

        // //query ensures user with token is the owner of the file
        const deleteFiles = await File.deleteMany({ userId: req.user._id, _id: { $in: [...files] } })
        res.send("Files deleted successfully")

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

module.exports.singleDelete = async (req, res) => {
    try {

        const v = new Validator(req.body, {
            "file": "required"
        })

        const match = await v.check()
        if (!match) return res.status(422).json(VerrorsMessageFormatter(v.errors))

        //get the files and file keys from the req body
        const { file } = req.body

        //fetch the AWS file key from the DB
        const userFile = await File.findOne({ userId: req.user._id, _id: file }).select("fileKey")
        if (!userFile) return res.status(400).send("unable to delete file.")

        // AWS params
        const params = {
            Bucket: process.env.bucketName,
            Key: userFile.fileKey
        };

        //delete files from AWS using helper function
        const awsDelete = await deleteAwsFile(params)

        //query ensures user with token is the owner of the file
        const deletedFile = await File.deleteOne({ userId: req.user._id, _id: file })
        res.send("File deleted successfully")

    } catch (error) {
        console.log(error);
        res.status(500).send("oops")
    }
}
