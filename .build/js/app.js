'use strict';
/* global $:false, document:false */

$(document).ready(function () {

	var $pageContainer = $(':mobile-pagecontainer');

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
		$(this).addClass('hide');
		$uploadControls.removeClass('hide');
		addThumbnail();
	});

	$cameraBtn.click(function () {
		addThumbnail();
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

	function addThumbnail() {
		var thumbnail = '<div class="thumbnail"><img src="http://41.media.tumblr.com/16827d6a4b41ebb817c5a4a5d46baffc/tumblr_inline_nr4g6f4glB1rhj1f1_1280.png" /></div>';
		$(thumbnail).appendTo($thumbnails).hide().fadeIn(250);
	}

	function getPageId() {
		return $pageContainer.pagecontainer('getActivePage').attr('id');
	}

	function goToUploadPage(applicationType) {
		$('#applicationtype').val(applicationType);
		$pageContainer.pagecontainer('change', '#upload', {changeHash: false, transition: 'slide'});
	}

	function goToSummaryPage() {
		$pageContainer.pagecontainer('change', '#summary', {changeHash: false, transition: 'slide'});
	}
});