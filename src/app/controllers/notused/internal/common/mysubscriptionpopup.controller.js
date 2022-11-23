(function () {
    'use strict';

    angular.module('EventsApp').controller('MySubscriptionPopupCtrl', MySubscriptionPopupCtrl);

    MySubscriptionPopupCtrl.$inject = ['$scope', '$uibModalInstance', 'AccService', 'FlashService'];
    function MySubscriptionPopupCtrl($scope, $uibModalInstance, AccService, FlashService) {

        (function initController() {
            $scope.mySubscriptions = [];
            getUserSubscriptionDetails();
        })();

        $scope.dismiss = function() {
            $uibModalInstance.dismiss();
        }

        function getUserSubscriptionDetails() {
            $scope.dataLoading = true;
            AccService.getUserSubscriptions().then(function(response) {
                if(response.data) {
                    $scope.mySubscriptions = response.data.results;
                }
                $scope.dataLoading = false;
            }).catch(function(error) {
                FlashService.Error(error.data.message || 'Failed to get User Subscriptions');
                $scope.dataLoading = false;
            });
        }
    }
})();
