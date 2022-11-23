(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('UnauthorizedController', UnauthorizedController);

    UnauthorizedController.$inject = ['$location', 'AuthenticationService', 'AccService','ACC_LOGOUT_URL'];
    function UnauthorizedController($location, AuthenticationService, AccService, ACC_LOGOUT_URL) {

        var vm = this;
        vm.Login = Login;
        (function initController() {
            LoadUserDetails();
            Logout();
        })();

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function Login() {
//            $location.path('/login');
              window.location.href = ACC_LOGOUT_URL;  
        }
        function Logout() {
//			AuthenticationService.Logout(vm.user.userId);
			AuthenticationService.clearStorageData();
		}

    }
})();