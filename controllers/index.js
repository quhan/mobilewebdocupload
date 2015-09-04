'use strict';

var _ = require('lodash');
var shortid = require('shortid');
var moment = require('moment');
var fs = require('fs');
var archiver = require('archiver');
var aws = require('aws-sdk');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
var UPLOAD_PATH = 'resume/';

var MIN_FILE_SIZE = 5 * 1024; // 5KB - Anything less might be spam
var MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
var SUPPORTED_IMG_MIME_TYPES = new RegExp('image\/(?=jpeg|pjpeg|png)'); // JPG, PNG
var SUPPORTED_FILE_MIME_TYPES = new RegExp(SUPPORTED_IMG_MIME_TYPES.source + '|application\/pdf|pplication\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document'); // ... + PDF, DOC, DOCX

function generateFilePrefix(applicationType) {
    var fileTimestamp = moment().format('YYMMDD');
    var fileUniqueId = shortid.generate();

    return applicationType + '_' + fileTimestamp + '_' + fileUniqueId;
}

function getFileExtension(fileName) {
    return fileName.substr(fileName.lastIndexOf('.') + 1);
}

function generateFileName(prefix, version, extension) {
    return prefix + (version ? '_' + version : '') + '.' + extension;
}

function validateFiles(rawFiles, next) {
    var files = [];
    var totalPayloadSize = 0;

    _.forOwn(rawFiles, function (file) { 
        // Test if an invalid file is detected
        if (!SUPPORTED_FILE_MIME_TYPES.test(file.type)) {
            return next({status: 422}, null);
        }

        if (file.size < MIN_FILE_SIZE) {
            // Test if file is spam
            return next({status: 500}, null);
        } else if (totalPayloadSize + file.size > MAX_FILE_SIZE) {
            // Test if the total payload size is above the limit
            return next({status: 413}, null);
        } else {
            totalPayloadSize += file.size;
        }

        files.push(file);
    });

    if (!files.length && totalPayloadSize < MIN_FILE_SIZE) {
        return next({status: 500}, null);
    } else {
        return next(null, files);
    }
}

function zipFiles(files, filePrefix, next) {
    var zip = archiver('zip');

    files.forEach(function (file, index) {
        var newFileName = generateFileName(filePrefix, (index + 1), getFileExtension(file.name));
        zip.append(fs.createReadStream(file.path), {name: newFileName});
    });

    // TODO: Handle errors?

    zip.finalize();

    return next(null, zip);
}

function uploadToS3(zip, filePrefix, next) {
    var uploadFileName = generateFileName(filePrefix, null, 'zip');

    var s3obj = new aws.S3({params: {Bucket: S3_BUCKET, Key: UPLOAD_PATH + uploadFileName}});
    s3obj.upload({Body: zip})
        // .on('httpUploadProgress', function (evt) { console.log(evt); })
        .send(function (err, result) {
            if (err) {
                console.dir(err);
                return next({status: 500, error: err}, null);
            }

            // console.dir(result);
            return next(null, result);
        });

}

module.exports = function (router) {

    router.get('/', function (req, res) {
        res.render('index', {});
    });

    router.post('/upload', function (req, res) {
        var applicationType = (req.body && req.body.type === 'intern') ? 'INT' : 'DEV';
        var filePrefix = generateFilePrefix(applicationType);

        validateFiles(req.files, function (err, files) {
            if (err) {
                // TODO: Log error
                return res.status(err.status).json({});
            }
            zipFiles(files, filePrefix, function (err, zip) {
                if (err) {
                    // TODO: Log error
                    return res.status(err.status).json({});
                }
                uploadToS3(zip, filePrefix, function (err, result) {
                    if (err) {
                        // TODO: Log error
                        return res.status(err.status).json({});
                    }
                    return res.status(200).json({});
                });
            });
        });
    });

};
