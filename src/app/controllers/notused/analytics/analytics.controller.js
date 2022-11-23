(function() {
	'use strict';

	angular.module('EventsApp').controller('AnalyticsController',
			AnalyticsController);

	AnalyticsController.$inject = ['AuthenticationService','$sce', 'ANALYTICS'];
	function AnalyticsController(AuthenticationService, $sce, ANALYTICS) {

		var vm = this;

		(function initController() {
			LoadUserDetails();
			GetCompanyName();

			AuthenticationService.GetEnterpriseDashboardToken(function(response) {
					localStorage.removeItem('dashboardSettings');
                        var url = ANALYTICS.uiUrl + "application/" + ANALYTICS.applicationId
                        + "/token/"
						+ response.data;;
						vm.trustedUrl = $sce.trustAsResourceUrl(url);
					});
		})();

		function GetCompanyName() {
			vm.companyName = AuthenticationService.GetCompanyName();
		}

		function LoadUserDetails() {
			vm.user = AuthenticationService.GetUserInfo();
		}

	}

})();
