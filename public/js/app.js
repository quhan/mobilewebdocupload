'use strict';
/* global $:false, document:false */

$(document).ready(function () {

	var $pageContainer = $(':mobile-pagecontainer');

	// Attach listeners to Application Type buttons
	$('.js-application-type').click(function () {
		var applicationType = $(this).data('applicationtype');
		
		if (applicationType) {
			goToUploadPage(applicationType);
		}
	});

	function getPageId() {
		return $pageContainer.pagecontainer('getActivePage').attr('id');
	}

	function goToUploadPage(applicationType) {
		$('#applicationtype').val(applicationType);
		$pageContainer.pagecontainer('change', '#upload', {changeHash: false, transition: 'slide'});
	}
});