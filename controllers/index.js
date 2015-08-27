'use strict';

var shortid = require('shortid');
var moment = require('moment');
var fs = require('fs');
var archiver = require('archiver');
var aws = require('aws-sdk');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

var UPLOAD_PATH = 'resume/';

var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
var SUPPORTED_IMG_MIME_TYPES = new RegExp('image\/(?=jpeg|pjpeg|png)'); // JPG, PNG
var SUPPORTED_FILE_MIME_TYPES = new RegExp(SUPPORTED_IMG_MIME_TYPES.source + '|application\/pdf|pplication\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document'); // ... + PDF, DOC, DOCX

function generateFileName(prefix, timeStamp, uniqueId) {
    return prefix + '_' + timeStamp + '_' + uniqueId + '.zip';
}

module.exports = function (router) {

    router.get('/', function (req, res) {
        res.render('index', {});
    });

    router.post('/upload', function (req, res) {
        var files = req.files;
        var totalFileSize = 0;
        var documents = [];

        // Set the file prefix based on Application Type
        var filePrefix = (req.body && req.body.type === 'intern') ? 'INT' : 'DEV';
        var fileTimeStamp = moment().format('YYMMDD');
        var fileUniqueId = shortid.generate();
        var zipFileName = generateFileName(filePrefix, fileTimeStamp, fileUniqueId);

        for (var obj in files) {
            if (files.hasOwnProperty(obj)) {
                var file = files[obj];

                // Test if the total file sizes are above the limit
                if (totalFileSize + file.size > MAX_FILE_SIZE) {
                    return res.status(413).json({});
                } else {
                    totalFileSize += file.size;
                }

                // Test if an invalid file is detected
                if (!SUPPORTED_FILE_MIME_TYPES.test(file.type)) {
                    return res.status(422).json({});
                }

                documents.push(file);
            }
        }

        if (totalFileSize === 0) {
            // No files detected
            return res.status(500).json({});
        }

        var zip = archiver('zip');

        documents.forEach(function (doc) {
            zip.append(fs.createReadStream(doc.path), {name: doc.name});
        });

        zip.finalize();

        aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
        var s3obj = new aws.S3({params: {Bucket: S3_BUCKET, Key: UPLOAD_PATH + zipFileName}});
        s3obj.upload({Body: zip})
            .on('httpUploadProgress', function (evt) { /*console.log(evt);*/ })
            .send(function (err, data) {
                if (err) {
                    console.err(err);
                    return res.status(500).json({});
                }

                console.dir(data);
                return res.status(200).json({});
            });
    });

};
