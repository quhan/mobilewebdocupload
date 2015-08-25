'use strict';

var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();

    router.get('/', function (req, res) {


        res.render('index', model);


    });

    router.post('/upload', function (req, res) {
        var files = req.files;
        var hasFiles = false;

        for (var obj in files) {
            if (files.hasOwnProperty(obj)) {
                hasFiles = true;
                var file = files[obj];
                console.log('file.name:', file.name);
                console.log('file.size:', file.size);
                console.log('file.type:', file.type);
                console.log('file.path:', file.path);
            }
        }

        if (hasFiles) {
            res.status(200).json({});
        } else {
            res.status(500).json({});
        }
    });

};
