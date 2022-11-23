(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('CompanyAdminManagementController', CompanyAdminManagementController);

    CompanyAdminManagementController.$inject = ['$location', '$window', 'AuthenticationService', 'MAINURL', '$rootScope', '$scope'];
    function CompanyAdminManagementController($location, $window, AuthenticationService, MAINURL, $rootScope, $scope) {

        var vm = this;
        vm.CompanyUserManagement = CompanyUserManagement;
        vm.CompanyProjectManagement = CompanyProjectManagement;
        vm.CompanyApiDetails = CompanyApiDetails;
        vm.CompanyUsage = CompanyUsage;
        (function initController() {
        	LoadUserDetails();
        	$rootScope.hideSmartLinks = true;
        	GetCompanyInfo();
            GetCompanyName();
        })();
        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

        function GetCompanyInfo() {
        	vm.companyInfo = AuthenticationService.GetCompanyInfo();
        }
        

        function CompanyProjectManagement(){
        	$location.path('/companyprojectsmanagement');
        }
        
        function CompanyUserManagement() {
        	$location.path('/companyusersmanagement');
        }
        function CompanyApiDetails() {
        	$location.path('/companyapidetails');
        }
        function CompanyUsage() {
        	AuthenticationService.setAdminType('companyadminreports');
            $location.path('/companyusage');
        }
        $scope.$on('$locationChangeStart', function (event, next, current) {
			$rootScope.hideSmartLinks = false;
        });

		$window.onbeforeunload = function (event) {
			$rootScope.hideSmartLinks = false;
        };

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

    }

})();
