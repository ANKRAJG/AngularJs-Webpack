(function () {
    'use strict';

    angular.module('EventsApp').controller('TrialInfoPopupCtrl', TrialInfoPopupCtrl);

    TrialInfoPopupCtrl.$inject = ['$scope', '$uibModalInstance', 'trialProducts'];
    function TrialInfoPopupCtrl($scope, $uibModalInstance, trialProducts) {
        $scope.trialProducts = trialProducts;
        $scope.slide1 = true;

        $scope.close = function () {
            $uibModalInstance.close();
        }
    }
})();
