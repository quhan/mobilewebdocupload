'use strict';

var shortid = require('shortid');
var moment = require('moment');
var pdfkit = require('pdfkit');
var fs = require('fs');

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
                fileNumber += 1;
                // console.log('file.name:', file.name);
                // console.log('file.size:', file.size);
                // console.log('file.type:', file.type);
                // console.log('file.path:', file.path);

                if (totalFileSize + file.size > MAX_FILE_SIZE) {
                    // Total file sizes above the limit
                    return res.status(413).json({});
                } else {
                    totalFileSize += file.size;
                }

                if (!SUPPORTED_FILE_MIME_TYPES.test(file.type)) {
                    // Invalid file detected
                    return res.status(422).json({});
                }

                if (SUPPORTED_IMG_MIME_TYPES.test(file.type)) {
                    images.push(file);
                } else {
                    nonImages.push(file);
                }

                console.log(generateFileName(filePrefix, fileTimeStamp, fileUniqueId, fileNumber, getFileExtension(file.name)));
            }
        }

        if (totalFileSize === 0) {
            // No files detected
            return res.status(500).json({});
        }

        // Generate a PDF out of image files
        var doc = new pdfkit();
        var totalPages = images.length;
        doc.pipe(fs.createWriteStream('sample.pdf'));
        images.forEach(function (image) {
            doc.image(image.path, 0, 0, {fit: [600, 750]});
            totalPages -= 1;
            if (totalPages > 0) {
                doc.addPage();
            }
        });
        doc.end();

        return res.status(200).json({});
    });

};
