(function() {

  angular.module("EventsApp").controller("AconexCallbackController", AconexCallbackController);
  AconexCallbackController.$inject = ["MAINURL", "$window", "$routeParams", "AuthenticationService"];
  function AconexCallbackController(MAINURL, $window, $routeParams, AuthenticationService) {
	    (function initController() {
          var messageObj = {};
          messageObj.code = $routeParams.code;
          messageObj.integrationType = AuthenticationService.GetIntegrationType();
	        $window.opener.postMessage(messageObj, MAINURL);
	        $window.close();
	    })();
	  }
})();
