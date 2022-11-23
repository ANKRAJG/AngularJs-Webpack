(function () {
    'use strict';

    angular.module('EventsApp').controller(
			'ConfirmController', ConfirmController);

    ConfirmController.$inject = ['$scope', '$uibModalInstance','title','message', 'hideYesNo', 'yesText', 'noText', 'hideImg'];
    function ConfirmController($scope, $uibModalInstance, title, message, hideYesNo, yesText, noText, hideImg) {
        (function () {
            $scope.title = title;
            $scope.message = message;
            $scope.hideYesNo = hideYesNo;
            $scope.yesText = yesText;
            $scope.noText = noText;
            $scope.hideImg = hideImg;
        })();

        $scope.close = function () {
            $uibModalInstance.close();
        }
        $scope.dismiss = function() {
            $uibModalInstance.dismiss();
        }
    }
})();
