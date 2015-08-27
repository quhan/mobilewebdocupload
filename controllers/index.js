'use strict';

var shortid = require('shortid');
var moment = require('moment');
var pdfkit = require('pdfkit');
var fs = require('fs');
// var zlib = require('zlib');
var aws = require('aws-sdk');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

var UPLOAD_PATH = 'resume/';

var IndexModel = require('../models/index');

var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
var SUPPORTED_IMG_MIME_TYPES = new RegExp('image\/(?=jpeg|pjpeg|png)'); // JPG, PNG
var SUPPORTED_FILE_MIME_TYPES = new RegExp(SUPPORTED_IMG_MIME_TYPES.source + '|application\/pdf|pplication\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document'); // ... + PDF, DOC, DOCX

function getFileExtension(fileName) {
    return fileName.substr(fileName.lastIndexOf('.') + 1);
}

function generateFileName(prefix, timeStamp, uniqueId, fileNumber, extension) {
    return prefix + '_' + timeStamp + '_' + uniqueId + '_' + fileNumber + '.' + extension;
}

module.exports = function (router) {

    var model = new IndexModel();

    router.get('/', function (req, res) {


        res.render('index', model);


    });

    router.post('/upload', function (req, res) {
        var files = req.files;
        var totalFileSize = 0;
        var fileNumber = 0;

        var images = [];
        var nonImages = [];

        // Set the file prefix based on Application Type
        var filePrefix = (req.body && req.body.type === 'intern') ? 'INT' : 'DEV';
        var fileTimeStamp = moment().format('YYMMDD');
        var fileUniqueId = shortid.generate();

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

                // Split files into image and non-image types
                if (SUPPORTED_IMG_MIME_TYPES.test(file.type)) {
                    images.push(file);
                } else {
                    nonImages.push(file);
                }
            }
        }

        if (totalFileSize === 0) {
            // No files detected
            return res.status(500).json({});
        }

        // Generate a PDF out of image files
        var totalPages = images.length;

        if (totalPages > 0) {
            fileNumber += 1;
            var doc = new pdfkit();
            var pdfFileName = generateFileName(filePrefix, fileTimeStamp, fileUniqueId, fileNumber, 'pdf');

            doc.pipe(fs.createWriteStream(pdfFileName));
            images.forEach(function (image) {
                doc.image(image.path, 0, 0, {fit: [600, 750]});
                totalPages -= 1;
                if (totalPages > 0) {
                    doc.addPage();
                }
            });
            doc.end();

            // var body = fs.createReadStream(pdfFileName).pipe(zlib.createGzip());
            var body = fs.createReadStream(pdfFileName);
            aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
            var s3obj = new aws.S3({params: {Bucket: S3_BUCKET, Key: UPLOAD_PATH + pdfFileName}});
            s3obj.upload({Body: body})
                .on('httpUploadProgress', function (evt) { /*console.log(evt);*/ })
                .send(function (err, data) {
                    if (err) {
                        console.err(err);
                        return res.status(500).json({});
                    }

                    console.dir(data);
                    return res.status(200).json({});
                });
        }

        // Rename non-image files
        // nonImages.forEach(function (file) {
        //     fileNumber += 1;
        //     var fileName = generateFileName(filePrefix, fileTimeStamp, fileUniqueId, fileNumber, getFileExtension(file.name));
        //     console.log(fileName);
        // });
    });

};
