(function () {
    'use strict';

    angular.module('EventsApp').controller(
			'SSOCallbackController', SSOCallbackController);

    SSOCallbackController.$inject = ['$scope', 'AuthenticationService', 'MAINURL', '$uibModal', '$location', 'FlashService', '$log', 'GlobalPropertyService'];
    function SSOCallbackController($scope, AuthenticationService, MAINURL, $uibModal, $location, FlashService, $log, GlobalPropertyService) {
    	var vm = this;

    	var currentUserID = -1;

        (function () {
        	GetUserInfo();
        })();

        function GetUserInfo(){
        	vm.dataLoading = "Loading... Please wait...";
        	AuthenticationService.GetSSOUserInfo(function(response){
        		response = { success: response.success, userInfo: response, message: response.message};
        		if(response.success){
        			vm.dataLoading = false;
        			if(response.userInfo && response.userInfo.data){
        				try{
        					var user = JSON.parse(response.userInfo.data);
        				}catch(ex){
        					console.log(ex);
        					var user = {};
        				}
        				response.userInfo.data = user;
        				if(response.userInfo.isregcomplete){
        					postLoginOperations(response);
        				} else {
        					openMissingDetailsPopup(user);
        				}
        			} else {
        				//Looks like AuthFailure Condition... Just send user back to login page to start the whole flow again
        				FlashService.Error(response.message, true);
        				$location.path('/login');
        			}
        		} else {
        			FlashService.Error(response.message, true);
        			console.log(response);
        			vm.dataLoading = false;
        			$location.path('/login');
        		}
        	});
        }

        function openMissingDetailsPopup(userObj) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: MAINURL + 'views/common/missingdetails.view.html',
                controller: 'MissingDetailsController',
                backdrop: 'static',
                keyboard :false,
                resolve: {
                	user : function(){
                		return userObj;
                	}
                }
            });

            modalInstance.result.then(function (data) {
            	LoginUser(data);
            }, function () {
            	//Never allow user to come here
            	$location.path('/login');
            });
        }

        function LoginUser(user){
        	vm.dataLoading = "Logging in... Please wait...";
        	AuthenticationService.LoginNewADUser(user, function (response) {
                if (response.success) {
                	postLoginOperations(response);
                } else {
                    FlashService.Error(response.message);
                    vm.emailpassnotvalidmsg = true;
                    vm.dataLoading = false;
                }
            });
        }

        function postLoginOperations(response){
            AuthenticationService.SetCredentials(response.userInfo.data.email, "", response.userInfo);
            AuthenticationService.GetFilterPreferences(response.userInfo.data.userId, ParseAndStoreFilterPreferencesInLocal);
            AuthenticationService.GetUserPreferences(response.userInfo.data.userId, ParseAndStorePreferencesInLocal);
            currentUserID = response.userInfo.data.userId;

            AuthenticationService.SetADUserFlag(true);
			GlobalPropertyService.loadGlobalUISettings(AuthenticationService.parseGlobalUISettings);
        }

        function ParseAndStorePreferencesInLocal(response) {
    			if(response.success && response.data){
    				if(response.data !== null && response.data.length > 0){
    					AuthenticationService.UpdateUserPreferencesLocally(response.data);
    				} else {
    					var defaultFilterData = AuthenticationService.UpdateFilterDataAccordingToFormat([]);
    					AuthenticationService.SetSmartRegisterFilter(defaultFilterData);
    					AuthenticationService.SetShowSaveSmartRegisterFilter(false);
    				}
    			}
    			else{
    				$log.error("Response not proper:" + response.message);
    			}
    			vm.dataLoading = false;
    			$location.path('/project');
		    }

        function ParseAndStoreFilterPreferencesInLocal(response) {
          if(response.success && response.data){
            if(response.data !== null && response.data.length > 0){
              AuthenticationService.SetListOfFilters(response.data);
            }
          }
          else{
            $log.error("Response not proper:" + response.message);
          }
        }

    }
})();
