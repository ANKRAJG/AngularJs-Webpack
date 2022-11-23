(function() {
	'use strict';

	angular.module('EventsApp').controller('CompanyUsersManagementController',
			CompanyUsersManagementController);

	CompanyUsersManagementController.$inject = [ 'AuthenticationService', 'UserService','CompanyAdminService', 'FlashService',
			'$scope', '$uibModal', 'CompanyService', 'MAINURL', '$rootScope', '$window' ,'$location', 'ModalService'];
	function CompanyUsersManagementController(AuthenticationService, UserService, CompanyAdminService, FlashService,
			$scope, $uibModal, CompanyService, MAINURL, $rootScope, $window, $location, ModalService) {

		var vm = this;
		vm.EditRole = EditRole;
		vm.RemoveFilterItem = RemoveFilterItem;
		vm.DeleteUser = DeleteUser;
		vm.DisableUser = DisableUser;
		vm.InviteUser = InviteUser;
		vm.EnableDisableUser = EnableDisableUser;
		vm.SwitchToProjects = SwitchToProjects;
		vm.SwitchToSearch = SwitchToSearch ;
		vm.SwitchToAPI = SwitchToAPI;
		(function initController() {
			LoadUserDetails();
			$rootScope.hideSmartLinks = true;
			GetCompanyInfo();
			GetCompanyName();
			GetUsers();
			SetGridDefaults();
		})();

		vm.companyUsageReports = function() {
			AuthenticationService.setAdminType('companyadminreports');
			$location.path('/companyusage');
		}

		function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

		function SwitchToAPI() {
			$location.path('companyapidetails');
		}

		function SwitchToProjects() {
			$location.path('companyprojectsmanagement');
		}

		function SwitchToSearch() {
			$location.path('companysearchmanagement');
		}

		$scope.setGridEvents = function(event, selectionEvent) {
			$scope.gridReload = event;
			$scope.selectedGridValue = selectionEvent;
		};

		$scope.$on('$locationChangeStart', function (event, next, current) {
			$rootScope.hideSmartLinks = false;
        });

		$window.onbeforeunload = function (event) {
			$rootScope.hideSmartLinks = false;
        };

		function SetGridDefaults() {
			vm.users = [];
			vm.searchData = [  {
				field : 'name',
				caption : 'Name',
				type : 'text'
			}, {
				field : 'email',
				caption : 'Email',
				type : 'text'
			},
			{
				field : 'rolesAssigned',
				caption : 'Current Roles',
				type : 'text',
				hidden : false
			},
			{
				field : 'mobileNumber',
				caption : 'Mobile Number',
				type : 'text',
				hidden : true

			},
			{
				field : 'officePhone',
				caption : 'Office',
				type : 'text',
				hidden : true
			},
			{
				field : 'state',
				caption : 'State',
				type : 'text',
				hidden : true
			}, {
				field : 'createTime',
				caption : 'Registration Date',
				type : 'date',
				render:'date|yyyy/mm/dd',
				hidden : true
			}

			];
			vm.sortData = [ {
				field : 'userid',
				direction : 'desc'
			} ];

			vm.columnsData = [
            {
				field : 'name',
				caption : 'Name',
				sortable : true,
				size : '10%',
				tooltip : 'Name',
				resizable : true,
				editable : false
			}, {
				field : 'email',
				caption : 'Email',
				sortable : true,
				size : '15%',
				tooltip : 'Email',
				resizable : true,
				editable : false
			},
			{
				field : 'rolesAssigned',
				caption : 'Current Roles',
				sortable : true,
				size : '18%',
				tooltip : 'Current Roles',
				resizable : true,
				editable : false
			},
			{
				field : 'officePhone',
				caption : 'Office',
				type : 'text',
			    size : '10%',
				tooltip : 'Office Phone',
				resizable : true,
				editable : false, hidden : true
			},
			{
				field : 'state',
				caption : 'State',
				sortable : true,
				size : '8%',
				tooltip : 'State',
				resizable : true,
				editable : false, hidden : true
			}, {
				field : 'mobileNumber',
				caption : 'Mobile Number',
				sortable : true,
				size : '10%',
				tooltip : 'Mobile Number',
				resizable : true,
				editable : false
			},
			{
				field : 'projectCreated',
				caption : 'Projects Created',
				sortable : true,
				size : '10%',
				tooltip : 'Projects created by user',
				resizable : true,
				editable : false
			},
			{
				field : 'active',
				caption : 'Active',
				sortable : true,
				size : '8%',
				resizable : true,
				tooltip : 'Active User',
				editable : false,
				render: function (record, index, col_index) {
	                var html = '';
	                if(record.active == "YES")
	                	html = '<div class="text-center"><i class="fa fa-check-circle lblgreen  fontWeightXLarge" title="Active User"></i></div>';
	                else
	                	html = 	'<div class="text-center orangeColor"><i class="fa fa-times-circle fontWeightXLarge" title="Inactive User"></i></div>';
	                return html;
				}
			},{
				field : 'createTime',
				caption : 'Registration Date',
				type : 'date',
				sortable : true,
				size : '8%',
				tooltip : 'Registration Date',
				resizable : true,
				editable : false
			},

			];
		}
		$scope.$on('FilteredData', function(event, data) {
			vm.searchType = data.searchType;
			if (!$scope.$$phase) {
				$scope.$apply(function() {
					if (vm.searchType == "multi") {
						for (var i = 0; i < data.searchData.length; i++) {
							data.searchData[i].caption = getCaption(
									data.searchData[i], vm.columnsData);
						}
						vm.searchData = data.searchData;
					}
				});
			}
		});

		function getCaption(dataItem, columns) {
			console.log(columns.filter(function(column) {
				return column.field == dataItem.field;
			})[0]);
			return columns.filter(function(column) {
				return column.field == dataItem.field;
			})[0].caption;
		}

		function RemoveFilterItem(index) {
			vm.searchData.splice(index, 1);
			$scope.$broadcast('search', vm.searchData);
		}
		$scope.exportData = function(gridName) {
			$scope.$broadcast("ExportData", {
				gridName : gridName,
				fileName : 'UserManagement_' + Date.now()
			});
		};
		function RefreshGrid(data) {
			$scope.gridReload(data, vm.columnsData);
		}
		function GetSelectedRecord() {
			vm.selectedIndexList = $scope.selectedGridValue();
			if (vm.selectedIndexList.length > 0) {
				for (var i = 0; i < vm.recordsData.length; i++) {
					if (vm.recordsData[i].recid === vm.selectedIndexList[0]) {
						// This is only when there is signle select option
						vm.selectedRecord = vm.recordsData[i];
						return 1;
					}
				}
			}
			return 0;
		}

		function DeleteUser() {
			if (GetSelectedRecord()) {
				if (vm.selectedRecord.userId == AuthenticationService.GetUserInfo().userId) {
					var items = {};
					items.title = 'Alert';
					items.message = "You can't delete yourself.";
					ModalService.showAlertMessage(items);
				} else {
					DeleteConfirmationPopUp(vm.selectedRecord);
				}
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select a user to delete.";
				ModalService.showAlertMessage(items);
			}

		}
		function DeleteConfirmationPopUp(data) {
			data.companyName = vm.companyName;
			var modalInstance = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/usermanagement/user.deleteuser.confirmation.view.html?version=9.1',
						controller : 'DeleteConfirmationController',
						backdrop : 'static',
						resolve : {
							items : data
						}
					});

			modalInstance.result.then(function(data) {
				OpenDeletePopup(data);
			});

		}
		function OpenDeletePopup(data) {
			UserService.DeleteInvalidUser(data.userId, function(response) {
				if (response.success === true) {
					FlashService.Success(response.message, true);
					GetUsers();
					$scope.dataLoading = false;
				} else {
					$scope.dataLoading = false;
					showFaiedToDeleteUserPopupWindow(response.message);

				}
			});
		}

		function showFaiedToDeleteUserPopupWindow(responseMessage) {
			var items = {};
			items.title = "Alert";
			items.message = responseMessage;
			showFaiedToDeleteUserPopup(items);

		}
		function showFaiedToDeleteUserPopup(items) {
			$uibModal.open({
				animation : true,
				templateUrl : MAINURL + 'views/companyadminmanagement/unabletodeleteuser.view.html?version=9.0',
				controller : 'UnableToDeleteUserMessageController',
				backdrop : 'static',
				resolve : {
					items : function() {
						return items
					}
				}
			});
		}


		function EditRole() {
			if (GetSelectedRecord()) {
				if (vm.selectedRecord.userId == AuthenticationService.GetUserInfo().userId) {
					var items = {};
					items.title = 'Alert';
					items.message = "You can't edit your own roles.";
					ModalService.showAlertMessage(items);
				} else {
					OpenEditRolePopUp(vm.selectedRecord);
				}
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select a user to edit roles.";
				ModalService.showAlertMessage(items);
			}
		}

		function OpenEditRolePopUp(global) {
			var modalInstance2 = $uibModal.open({
				animation : true,
				templateUrl : MAINURL
						+ 'views/usermanagement/edit.role.view.html?version=9.2',
				controller : 'EditRoleController',
				backdrop : 'static',
				resolve : {
					items : function() {
						return global;
					}
				}
			});
			modalInstance2.result.then(function(data) {
				UpdateRoles(data.data, data.userId);
			});
		}

		function UpdateRoles(data, userId) {
			UserService.UpdateRolesById(userId, data, function(response) {
				if (response.success) {
					$scope.dataLoading = false;
					GetUsers();
					FlashService.Success(response.message);
				} else {
					FlashService.Error(response.message);
					$scope.dataLoading = false;
				}
			});
		}

		function GetCompanyName() {
			vm.companyName = AuthenticationService.GetCompanyName();
		}
		function GetCompanyInfo() {
			vm.companyInfo = AuthenticationService.GetCompanyInfo();
		}

		function GetUsers() {
			vm.dataLoading = "Loading Users... Please wait...";
			CompanyAdminService.GetAllUsers(vm.companyInfo.companyId, function(response) {
				if (response.success) {
					UpdateDataWithCompanyName(response.data);
					vm.recordsData = vm.users;
					RefreshGrid(vm.users);
				} else {
					FlashService.Error(response.message);
				}
				vm.dataLoading = false;
			});
		}


        function UpdateDataWithCompanyName(users) {
			for (var index = 0; index < users.length; index++) {
				users[index].active = users[index].active === 1 ? 'YES' : 'NO';
			}
			vm.users = users;
		}

        function EnableDisableUser(recid) {
			var selectedUser = vm.users.filter(function(data){
				if(data.recid === recid)
					return data;
			});

			if(selectedUser && selectedUser.length > 0){
				if (selectedUser[0].active === 'YES') {
					selectedUser[0].active = 0;
				} else {
					selectedUser[0].active = 1;
				}
				UpdateDisableUser(selectedUser[0]);
			}
		}

		  function DisableUser() {
	        	if(GetSelectedRecord()){
	        		if (vm.selectedRecord.userId == AuthenticationService.GetUserInfo().userId) {
						var items = {};
						items.title = 'Alert';
						items.message = "You can't Activate/Deactivate yourself.";
						ModalService.showAlertMessage(items);
					} else {
						OpenDisableUserPopup(vm.selectedRecord);
					}
	        	}
	        	else {
					var items = {};
					items.title = 'Alert';
					items.message = "Please select one record to Activate/Deactivate user";
					ModalService.showAlertMessage(items);
				}
			}

	        function OpenDisableUserPopup(global) {
				var modalInstance2 = $uibModal
						.open({
							animation : true,
							templateUrl : MAINURL
									+ 'views/usermanagement/usermanagement.editactive.view.html?version=9.0',
							controller : 'UserManagementEditActiveFlag',
							backdrop : 'static',
							resolve : {
								items : function() {
									return global
								}
							}
						});
				modalInstance2.result.then(function(data) {
					UpdateDisableUser(data.global);
				});
			}


		function InviteUser() {
			var modalInstance2 = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/usermanagement/invite.user.view.html?version=9.0',
						controller : 'UserManagementInviteUser',
						backdrop : 'static',
						controllerAs: 'vm',
						bindToController: true,
						resolve : {
							items : function() {
								//return global
							}
						}
					});
			modalInstance2.result.then(function(data) {
				sendInvitationToUsers(data.data);
			});
		}

		function sendInvitationToUsers(data) {
			UserService.SendInvitationToUsers(data, function(response) {
				if (response.success) {
					FlashService.Success(response.message);
				} else {
					FlashService.Error(response.message);
				}
			});
		}

	   function UpdateDisableUser(data) {
			UserService.UpdateIsActiveFlag(data.userId, data.active, function(
					response) {
				if (response.success) {
					FlashService.Success(response.message);
					GetUsers();
				} else {
					FlashService.Error(response.message);
				}
			});
		}

	}

})();

function rowClicked(recid) {
	console.log("enable/Disable button clicked");
	console.log("recid is " + recid);
	angular.element(document.getElementById('usermanagementgrid')).scope().vm.EnableDisableUser(recid);
}
(function () {
    'use strict';

    angular.module('EventsApp').controller('UnableToDeleteUserMessageController',
    		UnableToDeleteUserMessageController);

    UnableToDeleteUserMessageController.$inject = ['$scope', '$uibModalInstance',
			'items','$location'];
    function UnableToDeleteUserMessageController($scope, $uibModalInstance, items, $location) {
        $scope.items = items;

        $scope.NavigateToProjectsPage = function() {
        	$location.path("/companyprojectsmanagement");
        }

        $scope.Close = function () {
            $uibModalInstance.close({});
        };
    }
})();


(function() {
	'use strict';

	angular.module('EventsApp').controller('UserManagementEditActiveFlag',
			UserManagementEditActiveFlag);

	UserManagementEditActiveFlag.$inject = [ '$scope', '$uibModalInstance',
			'items' ];
	function UserManagementEditActiveFlag($scope, $uibModalInstance, items) {
		var vm = this;
		(function() {
			$scope.global = angular.copy(items);
			$scope.global.active = $scope.global.active == "YES" ? 1 : 0;
			$scope.active = $scope.global.active.toString();
			$scope.isActive = [ {
				name : "YES",
				value : 1
			}, {
				name : "NO",
				value : 0
			} ];

		})();

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.Update = function() {
			$scope.global.active = $scope.active == "1" ? 1 : 0;

			$uibModalInstance.close({
				global : $scope.global
			});
		};

	}
})();

(function() {
	'use strict';

	angular.module('EventsApp').controller('UserManagementInviteUser',
			UserManagementInviteUser);

	UserManagementInviteUser.$inject = [ '$scope', '$uibModalInstance',
			'items','AuthenticationService', 'UtilService', 'SubscriptionService', 'FlashService', 'CompanyService'];
	function UserManagementInviteUser($scope, $uibModalInstance, items, AuthenticationService, UtilService, SubscriptionService, FlashService, CompanyService) {
		var vm = this;
		vm.InviteUserRegister = InviteUserRegister;
		vm.CancelInvite = CancelInvite;
		vm.checkInBlackListedDomains = checkInBlackListedDomains;
		(function() {
			loadBlackListedEmailDomains();
			vm.Currentcompany = AuthenticationService.GetCompanyInfo();

		})();

		 $scope.validateEmail = function ($tag) {
	            var loggedUserEmail = AuthenticationService.GetUserInfo();
	            if (loggedUserEmail.email == $tag.email) {
	                $scope.error = "You can't send invitation to yourself";
	                return false;
	            }
	             else {
	                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/;
	                var isValid = re.test($tag.email);
	                $scope.error = isValid ? "" : "Invalid email";
	                return isValid;
	            }
	        };

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};

		$scope.InviteUser = function() {
			$uibModalInstance.close({
				data : $scope.newUsers
			});
		};

		function CancelInvite() {
			$uibModalInstance.dismiss();
		}

		function loadBlackListedEmailDomains() {
			UtilService.GetBlackListedEmailDomains(function(response) {
				if (response.success) {
					vm.blackListedEmailDomains = response.data;
				}
			})
		}

		function checkInBlackListedDomains(){
			var email = angular.copy(vm.inviteUser.email);
			var emailDomain = email.split('@')[1];
			CompanyService.GetComapnyByEmailDomain(emailDomain, function(response) {
				if (response.success) {
					var inviteeUserCompany = response.data;
					if (vm.Currentcompany.emailDomain == inviteeUserCompany.emailDomain || vm.Currentcompany.companyId == inviteeUserCompany.companyId) {
						vm.validateEmailMessage = false;
					} else {
						vm.validateEmailMessage = "User email domain does not match with company's email domain";
					}
				} else {
					vm.validateEmailMessage = response.message;
				}
			})
		}

		// Enabling Basic User Subscription Settings
		vm.inviteUser = {
			shareFlag: true,
			productDataFlag: true,
			specViewFlag: true,
			historyFlag: true,
			versionFlag: true,
			versionLimit: 10,
			searchViewFlag: true,
			pypeAIFlag: true
		};

		function InviteUserRegister() {
	          vm.dataLoading = "Sending Invitation to the user ... Please wait...";

	          vm.inviteUser.companyName = vm.Currentcompany.name;
	          vm.inviteUser.projectLimit = 0;
	          vm.inviteUser.projectPeriod = 0;
	          vm.inviteUser.versionFlag = vm.inviteUser.versionFlag == true ? 1 : 0;
	          vm.inviteUser.shareFlag = vm.inviteUser.shareFlag == true ? 1 : 0;
	          vm.inviteUser.productDataFlag = vm.inviteUser.productDataFlag == true ? 1 : 0;
	          vm.inviteUser.procoreExportFlag = vm.inviteUser.procoreExportFlag == true ? 1 : 0;
	          vm.inviteUser.bim360Flag = vm.inviteUser.bim360Flag == true ? 1 : 0;
	          vm.inviteUser.bluebeamFlag = vm.inviteUser.bluebeamFlag == true ? 1 : 0;
	          vm.inviteUser.aconexFlag = vm.inviteUser.aconexFlag == true ? 1 : 0;
	          vm.inviteUser.specViewFlag = vm.inviteUser.specViewFlag == true ? 1 : 0;
	          vm.inviteUser.drawingsFlag = vm.inviteUser.drawingsFlag == true ? 1 : 0;
	          vm.inviteUser.riggingPlanFlag = vm.inviteUser.riggingPlanFlag == true ? 1 : 0;
	          vm.inviteUser.riggingPlanName = vm.inviteUser.riggingPlanFlag ? vm.inviteUser.riggingPlanName : null;
	          vm.inviteUser.historyFlag = vm.inviteUser.historyFlag == true ? 1 : 0;
			  vm.inviteUser.searchViewFlag = vm.inviteUser.searchViewFlag == true ? 1 : 0;
  			  vm.inviteUser.pypeAIFlag = vm.inviteUser.pypeAIFlag == true ? 1 : 0;

			SubscriptionService.SendUserInvitation(vm.inviteUser, function(response) {
				if (response.success) {
					FlashService.Success(response.message);
					$uibModalInstance.close();
				} else {
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}

			});
	        }
	}
})();
