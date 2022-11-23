(function () {
    'use strict';

    angular.module('EventsApp').controller(
			'SSOUserAlertMessageController', SSOUserAlertMessageController);

    SSOUserAlertMessageController.$inject = ['$scope', '$uibModalInstance', 'items'];
    function SSOUserAlertMessageController($scope, $uibModalInstance, items) {
        (function () {
            $scope.items = items;
        })();
        
        $scope.Continue = function(){
        	$uibModalInstance.close();
        }

        $scope.Close = function () {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();