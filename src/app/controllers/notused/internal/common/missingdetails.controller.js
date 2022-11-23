(function () {
    'use strict';

    angular.module('EventsApp').controller(
			'MissingDetailsController', MissingDetailsController);

    MissingDetailsController.$inject = ['$scope', '$uibModalInstance', 'user'];
    function MissingDetailsController($scope, $uibModalInstance, user) {
        (function () {
            $scope.userdetails = user;
        })();
        
        $scope.Continue = function(){
        	$uibModalInstance.close({user : $scope.userdetails});
        };

        $scope.Close = function () {
            $uibModalInstance.dismiss('cancel');
        };
        
        $scope.emailChanged = function(event){
        	debugger;
        };
    }
})();