'use strict';
/* global $:false, document:false, window:false, FormData:false */

var imageType = /^image\//;
var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
var SUPPORTED_IMG_MIME_TYPES = new RegExp('image\/(?=jpeg|pjpeg|gif|png)'); // JPG, GIF, PNG
var SUPPORTED_FILE_MIME_TYPES = new RegExp(SUPPORTED_IMG_MIME_TYPES.source + '|application\/pdf|pplication\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document'); // ... + PDF, DOC, DOCX

// var formData = new FormData();
var files = [];
var totalFileSize = 0;

$(document).ready(function () {

    var $pageContainer = $(':mobile-pagecontainer');

    var $uploadForm = $('#uploadform'),
        $applicationType = $uploadForm.find('#applicationtype'),
        $fileInput = $uploadForm.find('#file');

    var $uploadControls = $('#uploadcontrols'),
        $cameraHeroBtn = $('#camerahero'),
        $thumbnails = $uploadControls.find('#thumbnails'),
        $cameraBtn = $uploadControls.find('#camera'),
        $submitBtn = $uploadControls.find('#submit');

    // Attach listeners to Application Type buttons
    $('.js-application-type').click(function () {
        var applicationType = $(this).data('applicationtype');

        if (applicationType) {
            goToUploadPage(applicationType);
        }
    });

    $cameraHeroBtn.click(function () {
        $fileInput.click();
    });

    $cameraBtn.click(function () {
        $fileInput.click();
    });

    $fileInput.change(function (event) {
        var file = $(this).get(0).files[0];

        // Test for supported files
        if (!SUPPORTED_FILE_MIME_TYPES.test(file.type)) {
            // TODO: Handle unsupported files
            return alert('File unsupported!');
        }

        // Test for file size limits
        if (totalFileSize + file.size > MAX_FILE_SIZE) {
            // TODO: Handle total file size
            return alert('Exceeded total file size limit!');
        }

        var uuid = guid();
        files.push({id: uuid, file: file});
        updateTotalFileSize();
        // formData.append('files', file);

        if (SUPPORTED_IMG_MIME_TYPES.test(file.type)) {
            // Generate thumbnail
            var thumbnailURL = window.URL.createObjectURL(file);
            addThumbnail(uuid, thumbnailURL);
        } else {
            // TODO: Show generic file
            addThumbnail(uuid, 'http://41.media.tumblr.com/16827d6a4b41ebb817c5a4a5d46baffc/tumblr_inline_nr4g6f4glB1rhj1f1_1280.png');
        }

        showUploadControls();
    });

    $submitBtn.click(function () {
        goToSummaryPage();
    });

    function addThumbnail(uuid, url) {
        var $thumbnail = $('<div class="thumbnail" id="' + uuid + '"><a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext remove-file">Remove</a><img src="' + url + '" /></div>');
        $thumbnail.appendTo($thumbnails).hide().fadeIn(250);

        $thumbnail.find('.remove-file').click(function () {
            removeThumbnail($thumbnail, uuid);
        });
    }

    function removeThumbnail($thumbnail, uuid) {
        // Remove thumbnail
        $thumbnail.fadeOut(300, function() {
            $thumbnail.remove();

            // Clean up list of files
            for (var i = 0; i < files.length; i++) {
                if(files[i].id === uuid) {
                    files.splice(i, 1);
                    updateTotalFileSize();
                    break;
                }
            }

            // Show the Camera Hero button if everything is reset
            if (files.length === 0) {
                hideUploadControls();
            }
        });
    }

    function updateTotalFileSize() {
        totalFileSize = 0;
        for (var i = 0; i < files.length; i++) {
            totalFileSize += files[i].file.size;
        }
        console.log('totalFileSize:', totalFileSize);
    }

    function showUploadControls() {
        $cameraHeroBtn.addClass('hide');
        $uploadControls.removeClass('hide');
    }

    function hideUploadControls() {
        $cameraHeroBtn.removeClass('hide');
        $uploadControls.addClass('hide');
    }

    function goToUploadPage(applicationType) {
        $applicationType.val(applicationType);
        $pageContainer.pagecontainer('change', '#upload', {changeHash: false, transition: 'slide'});
    }

    function goToSummaryPage() {
        $pageContainer.pagecontainer('change', '#summary', {changeHash: false, transition: 'slide'});
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
});
