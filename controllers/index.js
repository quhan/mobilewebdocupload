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
        var hasFiles = false;
        var totalFileSize = 0;

        for (var obj in files) {
            if (files.hasOwnProperty(obj)) {
                hasFiles = true;
                var file = files[obj];
                console.log('file.name:', file.name);
                console.log('file.size:', file.size);
                console.log('file.type:', file.type);
                console.log('file.path:', file.path);
                totalFileSize += file.size;
            }
        }

        if (totalFileSize > MAX_FILE_SIZE) {
            return res.status(413).json({});
        }

        if (hasFiles) {
            return res.status(200).json({});
        } else {
            return res.status(500).json({});
        }
    });

};
