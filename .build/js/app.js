'use strict';
/* global $:false, document:false, window:false, FormData:false */

var imageType = /^image\//;
// var formData = new FormData();
var files = [];

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

        var uuid = guid();
        files.push({id: uuid, file: file});
        // formData.append('files', file);

        if (imageType.test(file.type)) {
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
        var thumbnail = '<div class="thumbnail" id="' + uuid + '"><a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext remove-file">Remove</a><img src="' + url + '" /></div>';
        var $thumbnail = $(thumbnail);
        $thumbnail.appendTo($thumbnails).hide().fadeIn(250);

        $thumbnail.find('.remove-file').click(function () {
            // Remove thumbnail
            $thumbnail.fadeOut(300, function() {
                $thumbnail.remove();

                // Clean up list of files
                for (var i = 0; i < files.length; i++) {
                    if(files[i].id === uuid) {
                        files.splice(i, 1);
                        break;
                    }
                }

                // Show the Camera Hero button if everything is reset
                if (files.length === 0) {
                    hideUploadControls();
                }
            });
        });
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
