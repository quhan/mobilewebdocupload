'use strict';
/* global $:false, document:false, window:false, FormData:false */
var imageType = /^image\//;
var formData = new FormData();

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

		if (imageType.test(file.type)) {
			// Generate thumbnail
			var thumbnailURL = window.URL.createObjectURL(file);
			addThumbnail(thumbnailURL);
		} else {
			// TODO: Show generic file
			addThumbnail('http://41.media.tumblr.com/16827d6a4b41ebb817c5a4a5d46baffc/tumblr_inline_nr4g6f4glB1rhj1f1_1280.png');
		}

		formData.append('files', file);
		showUploadControls();
	});

	$submitBtn.click(function () {
		goToSummaryPage();
	});

	function addThumbnail(url) {
		var thumbnail = '<div class="thumbnail"><a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext remove">Remove</a><img src="' + url + '" /></div>';
		$(thumbnail).appendTo($thumbnails).hide().fadeIn(250);
	}

	function showUploadControls() {
		$cameraHeroBtn.addClass('hide');
		$uploadControls.removeClass('hide');
	}

	function goToUploadPage(applicationType) {
		$applicationType.val(applicationType);
		$pageContainer.pagecontainer('change', '#upload', {changeHash: false, transition: 'slide'});
	}

	function goToSummaryPage() {
		$pageContainer.pagecontainer('change', '#summary', {changeHash: false, transition: 'slide'});
	}
});
