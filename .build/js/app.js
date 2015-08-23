'use strict';
/* global $:false, document:false, window:false */
var imageType = /^image\//;

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
		$(this).addClass('hide');
		$uploadControls.removeClass('hide');
	});

	$cameraBtn.click(function () {
		$fileInput.click();
	});

	$fileInput.change(function (event) {
		var file = $(this).get(0).files[0];
		console.log('file.name:', file.name);
		console.log('file.type:', file.type);
		console.log('file.size:', file.size);

		if (imageType.test(file.type)) {
			// Generate thumbnail
			var thumbnailURL = window.URL.createObjectURL(file);
			addThumbnail(thumbnailURL);
		} else {
			// TODO: Show generic file
			addThumbnail('http://41.media.tumblr.com/16827d6a4b41ebb817c5a4a5d46baffc/tumblr_inline_nr4g6f4glB1rhj1f1_1280.png');
		}
	});

	$submitBtn.click(function () {
		goToSummaryPage();
	});

	$(document).onPage('show', '#intro', function () {
		// console.log('onPage.show: intro');
	});

	$(document).onPage('show', '#upload', function () {
		// console.log('onPage.show: upload');
	});

	$(document).onPage('show', '#summary', function () {
		// console.log('onPage.show: summary');
	});

	function addThumbnail(url) {
		var thumbnail = '<div class="thumbnail"><img src="' + url + '" /></div>';
		$(thumbnail).appendTo($thumbnails).hide().fadeIn(250);
	}

	function getPageId() {
		return $pageContainer.pagecontainer('getActivePage').attr('id');
	}

	function goToUploadPage(applicationType) {
		$applicationType.val(applicationType);
		$pageContainer.pagecontainer('change', '#upload', {changeHash: false, transition: 'slide'});
	}

	function goToSummaryPage() {
		$pageContainer.pagecontainer('change', '#summary', {changeHash: false, transition: 'slide'});
	}
});