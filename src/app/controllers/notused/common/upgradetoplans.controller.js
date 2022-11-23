(function() {
	'use strict';

	angular.module('EventsApp').controller('UpgradeToPlansPopupCtrl',
			UpgradeToPlansPopupCtrl);

	UpgradeToPlansPopupCtrl.$inject = ['$scope', '$uibModalInstance'];
	function UpgradeToPlansPopupCtrl($scope, $uibModalInstance) {
		var vm = this;

        $scope.contactSupport = function() {
            $uibModalInstance.close();
        }

		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		}
	}
})();
