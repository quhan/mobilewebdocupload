'use strict';
/* global $:false, document:false, window:false, alert:false, FormData:false */

var MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
var SUPPORTED_IMG_MIME_TYPES = new RegExp('image\/(?=jpeg|pjpeg|png)'); // JPG, PNG
var SUPPORTED_FILE_MIME_TYPES = new RegExp(SUPPORTED_IMG_MIME_TYPES.source + '|application\/pdf|pplication\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document'); // ... + PDF, DOC, DOCX
var UPLOAD_URL = '/upload';

var files = [];
var totalFileSize = 0;

$(document).ready(function () {

    // var $pageContainer = $(':mobile-pagecontainer');
    var $introPage = $('#intro'),
        $uploadPage = $('#upload'),
        $summaryPage = $('#summary');

    var $uploadForm = $('#uploadform'),
        $applicationType = $uploadForm.find('#applicationtype'),
        $fileInput = $uploadForm.find('#file'),
        $csrf = $uploadForm.find('#_csrf');

    var $uploadControls = $('#uploadcontrols'),
        $cameraHeroBtn = $('#camerahero'),
        $thumbnails = $uploadControls.find('#thumbnails'),
        $cameraBtn = $uploadControls.find('#camera'),
        $submitBtn = $uploadControls.find('#submit');

    var $progressBar = $('#progress'),
        $progressCounter = $progressBar.find('span');

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

    // Allows choosing the same file again
    $fileInput.on('click', function () {
        this.value = null;
    });

    $fileInput.change(function () {
        var file = $(this).get(0).files[0];

        // Test for supported files
        if (!SUPPORTED_FILE_MIME_TYPES.test(file.type)) {
            return alert('File unsupported!');
        }

        // Test for file size limits
        if (totalFileSize + file.size > MAX_FILE_SIZE) {
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
        var formData = new FormData();
        formData.append('_csrf', $csrf.val());
        formData.append('type', $applicationType.val());
        for (var i = 0; i < files.length; i++) {
            formData.append('files' + i, files[i].file);
            console.log(files[i].file);
        }

        showProgressBar();

        $.ajax({

            url: UPLOAD_URL,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener('progress', function (event) {
                    if (event.lengthComputable) {
                        var percentComplete = (event.loaded / event.total) * 0.5,
                            progress = Math.round(percentComplete * 100) + '%';
                        $progressCounter.width(progress).text(progress);
                    }
                }, false);
                return xhr;
            }

        }).done(function (result) {

            // Complete the progress display
            var percentComplete = 0.5;

            function progressToCompletion() {
                if (percentComplete < 1) {
                    percentComplete += 0.05;
                    var progress = Math.round(percentComplete * 100) + '%';
                    $progressCounter.width(progress).text(progress);
                } else {
                    clearInterval(progressCompletion);
                    goToSummaryPage();
                }
            }

            var progressCompletion = setInterval(progressToCompletion, 25);

        }).fail(function (result) {

            hideProgressBar();

            console.dir(result);
            if (result && result.status === 403) {
                // To handle CSRF errors
                return alert('Upload timed out: Please reload the page and try again.');
            } else {
                // General error handler
                return alert('An error has occured: Please try again later.');
            }

        });
    });

    function addThumbnail(uuid, url) {
        var $thumbnail = $('<div class="thumbnail" id="' + uuid + '"><a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext remove-file">Remove</a><img src="' + url + '" /></div>');
        $thumbnail.appendTo($thumbnails).hide().fadeIn(250);

        $thumbnail.find('.remove-file').click(function (event) {
            event.preventDefault();
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
    }

    function showUploadControls() {
        $cameraHeroBtn.addClass('hide');
        $uploadControls.removeClass('hide');
    }

    function hideUploadControls() {
        $cameraHeroBtn.removeClass('hide');
        $uploadControls.addClass('hide');
    }

    function showProgressBar() {
        $cameraHeroBtn.addClass('hide');
        $uploadControls.addClass('hide');
        $progressBar.removeClass('hide');
        $progressCounter.width('0%').text('0%');
    }

    function hideProgressBar() {
        $cameraHeroBtn.addClass('hide');
        $uploadControls.removeClass('hide');
        $progressBar.addClass('hide');
        $progressCounter.width('0%').text('0%');
    }

    function goToUploadPage(applicationType) {
        $applicationType.val(applicationType);
        // $pageContainer.pagecontainer('change', '#upload', {changeHash: false, transition: 'slide'});
        $introPage.addClass('hide');
        $uploadPage.removeClass('hide');
        $summaryPage.addClass('hide');
    }

    function goToSummaryPage() {
        // $pageContainer.pagecontainer('change', '#summary', {changeHash: false, transition: 'slide'});
        $introPage.addClass('hide');
        $uploadPage.addClass('hide');
        $summaryPage.removeClass('hide');
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
