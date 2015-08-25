'use strict';

var IndexModel = require('../models/index');

var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

module.exports = function (router) {

    var model = new IndexModel();

    router.get('/', function (req, res) {


        res.render('index', model);


    });

    router.post('/upload', function (req, res) {
        var files = req.files;
        var totalFileSize = 0;

        for (var obj in files) {
            if (files.hasOwnProperty(obj)) {
                var file = files[obj];
                console.log('file.name:', file.name);
                console.log('file.size:', file.size);
                console.log('file.type:', file.type);
                console.log('file.path:', file.path);
                totalFileSize += file.size;
            }
        }

        if (totalFileSize === 0) {
            // No files detected
            return res.status(500).json({});
        } else if (totalFileSize > MAX_FILE_SIZE) {
            // Total file sizes above the limit
            return res.status(413).json({});
        }

        return res.status(200).json({});
    });

};
