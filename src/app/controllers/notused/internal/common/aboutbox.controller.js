(function() {
	'use strict';

	angular.module('EventsApp').controller('AboutBoxController', AboutBoxController);

	AboutBoxController.$inject = [ '$scope', '$uibModalInstance'];
	function AboutBoxController($scope, $uibModalInstance) {

		(function initController() {
			fetch('./assets/licenses.json')
				.then(function(response) { return response.json(); })
				.then(function(json) {
					processJsonInCorrectFormat(json);
				});
        })();

		$scope.dismiss = function() {
			$uibModalInstance.dismiss();
		}

		function processJsonInCorrectFormat(json) {
			$scope.libraries = {};
			json.forEach(function(item) {
				if($scope.libraries[item.license]) {
					$scope.libraries[item.license].entries.push(item);
				} else {
					$scope.libraries[item.license] = { licenseText: item.licenseText, entries: [item] };
				}
			});
			if(!$scope.$$phase) {
			    $scope.$apply();
			}
		}

	}
})();
