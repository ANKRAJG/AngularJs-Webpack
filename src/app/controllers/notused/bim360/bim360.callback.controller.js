(function() {
  function Bim360CallbackController(MAINURL, $scope, $window, $routeParams, $location, $uibModal, AuthenticationService, BIMIntegrationService, FlashService) {
    function initController() {
	    var state = $routeParams.state;
        var code = $routeParams.code;
    	var externalUserInfo = AuthenticationService.GetExternalUserInfo();
	    if (!state) {
	    	redirect("We did not get a valid response from BIM 360.");
	    } else if (!code) {
	    	redirect("You have to allow AutoSpecs access to BIM 360 in order to proceed.", state);
	    } else if(state.startsWith("login")) {
			loginUser(code);
	    } else {
			redirect(null, state, code);
	    }
    }

    function redirect(msg, state, code){
    	if(!state || state.startsWith("login")) {
			FlashService.Error(msg, true);
			$location.path("/login");
		} else if($window.opener){
            var messageObj = {};
            messageObj.code = code;
            messageObj.message = msg;
            messageObj.integrationType = AuthenticationService.GetIntegrationType();
            $window.opener.postMessage(messageObj, MAINURL + '/bim360Export');
			$window.close();
		} else {
			FlashService.Error(msg, true);
			var projectId = AuthenticationService.getACCEntitlementProjectId();
			$location.path('/smartregister/projects/' + projectId)
		}
    }

    function loginUser(code){
    	BIMIntegrationService.GetUserProfile(code, function(responseWrapper) {
			var response = responseWrapper.userInfo ? responseWrapper.userInfo : responseWrapper;
			if(response.success){
				initUser(responseWrapper);
			}
			else if (response.data) {
				var user = response.data;
				var inboundIntegrationData = AuthenticationService.GetExternalUserInfo();
				if(!user.company){
					user.company  = {name:inboundIntegrationData.companyName};
				}
				openMissingDetailsPopup(user, response.authToken);
			} else {
				redirect(response.message?response.message:"We could not log you in to AutoSpecs.", "login");
			}
		});
    }

    function registerUser(user) {
		AuthenticationService.RegisterAndLoginBIMUser(user, function(response) {
			if(response.success){
				initUser(response);
			} else {
				FlashService.Error(response.message?response.message:"We could not register and log you in to AutoSpecs.", true);
			}
		});
    }

    function initUser(response){
    	var externalUserInfo = AuthenticationService.GetExternalUserInfo();
		externalUserInfo.state = null;
		externalUserInfo.stateUid = null;
		AuthenticationService.SetExternalUserInfo(externalUserInfo);
        var projectId = AuthenticationService.getACCEntitlementProjectId();
		AuthenticationService.InitUser(response.userInfo, response.userInfo.data.email, null, function(){
			$location.path('/home/project/' + projectId).search({
				external: true
			});
		});
    }

	function openMissingDetailsPopup(user, token) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: MAINURL + 'views/common/missingdetails.view.html',
			controller: 'MissingDetailsController',
			backdrop: 'static',
			keyboard :false,
			resolve: {
				user: function() {
					return user;
				}
			}
		});
		modalInstance.result.then(function (data) {
			var userRegData = {};
			userRegData.token = token;
			userRegData.name = data.user.name;
			userRegData.email = data.user.email;
			userRegData.companyName = data.user.company.name;
			userRegData.phoneNumber = data.user.mobileNumber;
			registerUser(userRegData);
		}, function () {
			$location.path('/login');
		});
	}

    initController();
  }
  angular.module("EventsApp").controller("Bim360CallbackController", Bim360CallbackController);
  Bim360CallbackController.$inject = ['MAINURL', '$scope', '$window', '$routeParams', '$location', '$uibModal', 'AuthenticationService', 'BIMIntegrationService', 'FlashService'];
})();
