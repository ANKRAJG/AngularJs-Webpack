(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('TopbannerNonsecureController', TopbannerNonsecureController);

    TopbannerNonsecureController.$inject = ['$location', '$scope', '$log'];
    function TopbannerNonsecureController($location, $scope, $log) {
        var vm = $scope;
        vm.$location = $location;
        vm.Register = Register;
        vm.Login = Login;
        //Events
        (function initController() {
            $log.log("TopbannerNonsecureController: page load started");
            vm.CurrentPage = $location.path();
            $log.log("TopbannerNonsecureController: page load end");
        })();
        //End:Events

        function Register() {
            $location.path('register');
        }

        function Login() {
            $location.path('login');
        }
    }

})();