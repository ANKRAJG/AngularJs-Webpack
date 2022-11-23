(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('CheckEmailController', CheckEmailController);

    CheckEmailController.$inject = ['$log', 'PageService', 'AuthenticationService', '$location', '$sce', 'ImageURL'];
    function CheckEmailController($log, PageService, AuthenticationService, $location, $sce, ImageURL) {

        var vm = this;
        vm.Login = Login;
        vm.Register = Register;
        (function initController() {
            $log.log("CheckEmail: page load started");
            vm.pageDetails = PageService.GetPage();

            if (vm.pageDetails.previousPage.indexOf('/register') >= 0) {
                vm.user = AuthenticationService.GetRegisteredUserDetails();
                vm.BoxHeader = "Registration Successful";
                vm.imageUrl = ImageURL + 'checkmark.png';
                vm.Message = " A confirmation email has been sent to <strong>" + vm.user.email + "</strong> with a link to set your password.";
                vm.Header = vm.user.name;
                vm.displayLoginButton = true;
                vm.activationMessage = "";
                vm.hideFooter = true;
            } else if (vm.pageDetails.previousPage.indexOf('/forgotpassword') >= 0) {
                vm.user = AuthenticationService.GetRegisteredUserDetails();
                vm.BoxHeader = "Password reset email sent";
                vm.imageUrl = ImageURL + 'password-reset.png';
                vm.Header = vm.user.name;
                vm.Message = $sce.trustAsHtml("An email has been sent to your email address, <b class='black'>" + vm.user.email + "</b><br>with the reset link, if the user exists.");
                vm.displayLoginButton = true;
                vm.activationMessage = "";
                vm.hideFooter = true;
                vm.showsignupfooter = true;
            } else if (vm.pageDetails.previousPage.indexOf('/setpassword') >= 0) {
                vm.BoxHeader = "Password confirmation";
                vm.imageUrl = ImageURL + 'checkmark.png';
                vm.Header = "";
                vm.Message = "Your password has been set";
                vm.displayLoginButton = true;
                vm.activationMessage = "";
                vm.hideFooter = true;
            } else if (vm.pageDetails.previousPage.indexOf('/resetpassword') >= 0) {
                vm.BoxHeader = "Password has been reset";
                vm.imageUrl = ImageURL + 'checkmark.png';
                vm.Header = "";
                vm.Message = "Your password has been reset successfully! Please sign in again.";
                vm.displayLoginButton = true;
                vm.activationMessage = "";
                vm.hideFooter = true;
            } else if (vm.pageDetails.previousPage.indexOf('/contactus') >= 0) {
                vm.BoxHeader = "Confirmation";
                vm.imageUrl = null;
                vm.Header = "Thanks for Contacting Support";
                vm.Message = "We’re confirming that your message has been recieved. A support associate will be with you shortly. Thank you for your patience.";
                vm.displayLoginButton = true;
                vm.activationMessage = "";
            } else {
            	Login();
            }
            $log.log("CheckEmail: page load end");
        })();

        function Login() {
            $location.path('/login');
        }

        function Register() {
            $location.path('/register');
        }
    }

})();
