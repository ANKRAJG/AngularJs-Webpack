(function() {
	'use strict';

	angular.module('EventsApp').controller('CompanySearchManagementController',
			CompanySearchManagementController);

	CompanySearchManagementController.$inject = ['AuthenticationService', 'ModalService',
			'FlashService', '$scope', 'ProjectService', 'UserService', '$uibModal', 'MAINURL',
			'SmartRegisterService', 'CompanyService', 'SubscriptionService' ,'SearchFilterService','CompanyAdminService', '$rootScope', '$window','$location'];
	function CompanySearchManagementController(AuthenticationService, ModalService, FlashService,
			$scope, ProjectService, UserService, $uibModal, MAINURL, SmartRegisterService,
			CompanyService, SubscriptionService, SearchFilterService, CompanyAdminService, $rootScope, $window, $location) {

		var vm = this;
		vm.checkAndDeleteProject = checkAndDeleteProject;
		vm.checkAndDeleteVersion = checkAndDeleteVersion;
		vm.download = download;
		vm.RemoveFilterItem = RemoveFilterItem;
		vm.EditFlagClicked = EditFlagClicked;
		vm.EditForceOcrFlagClicked = EditForceOcrFlagClicked;
		vm.ChangeProjectOwnerShip = ChangeProjectOwnerShip;
		vm.SwitchToUsers = SwitchToUsers;
		vm.SwitchToSearch = SwitchToSearch ;
		vm.StartNewProject = StartNewProject;
		vm.SwitchToUsers = SwitchToUsers ;
		vm.SwitchToProjects = SwitchToProjects ;
		vm.user = AuthenticationService.GetUserInfo();
		vm.DeleteSearchFilter = DeleteSearchFilter ;
		vm.EditClicked =  EditClicked ;
		vm.AddSearch = AddSearch ;
		vm.PromoteClicked = PromoteClicked ;
		vm.SwitchToAPI = SwitchToAPI;

		(function initController() {
			$rootScope.hideSmartLinks = true;
			GetCompanyName();
			BindSearchMngmntGridDefaults();
			GetRecords();
			GetCompanyInfo();
			InitVariables();
		})();

		function SwitchToProjects() {
			$location.path('companyprojectsmanagement');
		}

		function SwitchToUsers() {
			$location.path('companyusersmanagement');
		}

		function SwitchToAPI() {
			$location.path("/companyapidetails");
		}


		function InitVariables(){
				$scope.createprjctMsg = [
			'Trial projects expired for this account. Please contact Pype Support for further assistance.',
			'Please click Ok to create your trial project.',
			'Your company has reached its project limit and no additional projects can be created at this time. To extend your project limit ' +
				'or get more information, please contact support at pypesupport@autodesk.com.',
			'HELLO!!!You can’t create more projects as you have reached max limit for projects. Please contact support for further assistance.',
			' Due to the selected settings for your company, at this time only Company Admins are able to create new projects. Please contact your ' +
			' internal Pype AutoSpecs administrator for assistance with creating a new project.'];
		}

		function GetCompanyInfo() {
			vm.companyInfo = AuthenticationService.GetCompanyInfo();
		}

		function PromoteClicked() {
			if (GetSelectedRecord()) {
				ShowPromoteSearchPopUp(vm.selectedRecord);
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select one record to Promote";
				ModalService.showAlertMessage(items);
			}
		}

		function ShowPromoteSearchPopUp(global){
			var modalInstance2 = $uibModal.open({
				animation : true,
				templateUrl : MAINURL
						+ 'views/companyadminmanagement/searchmanagement.promote.view.html',
				controller : 'PromoteSearchController',
				backdrop : 'static',
				resolve : {
					items : function() {
						return global;
					}
				}
			});
			modalInstance2.result.then(function(data) {
				SearchFilterService.PromoteSearchFilter(data,global,function(response){
					if (response.success) {
						GetRecords();
						FlashService.Success(response.message);
					} else {
						FlashService.Error(response.message);
					}
				});
			}, function() {
			});
		}


		function AddSearch(){
			var modalInstance2 = $uibModal.open({
				animation : true,
				templateUrl : MAINURL
						+ 'views/companyadminmanagement/addsearch.view.html',
				controller : 'EditSearchController',
				backdrop : 'static',
				resolve : {
					items : function() {
						return ;
					}
				}
			});
			modalInstance2.result.then(function(data) {
				SearchFilterService.AddSearchFilter(data ,function(response){
					if (response.success) {
						GetRecords();
						FlashService.Success(response.message);
					} else {
						FlashService.Error(response.message);
					}
				});
			}, function() {
			});
		}

		function EditClicked() {
			if (GetSelectedRecord()) {
				ShowEditSearchPopup(vm.selectedRecord);
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select one record to Edit Search";
				ModalService.showAlertMessage(items);
			}
		}

		function ShowEditSearchPopup(global) {
			var modalInstance2 = $uibModal.open({
				animation : true,
				templateUrl : MAINURL
						+ 'views/companyadminmanagement/editsearch.view.html',
				controller : 'EditSearchController',
				backdrop : 'static',
				resolve : {
					items : function() {
						return global ;
					}
				}
			});
			modalInstance2.result.then(function(filter) {
				SearchFilterService.UpdateSearchFilter(filter,function(response){
					if (response.success) {
						GetRecords();
						FlashService.Success(response.message);
					} else {
						FlashService.Error(response.message);
					}
				});
			}, function() {
			});
		}


		function StartNewProject() {
				UserService.CheckProjectCreation(
					vm.user.userId,
					function (response) {
							if (response.success) {
									if (response.data.limitCode === 0) {
											ProjectService.ShowCreateProjectPopup(1, null, true);
									} else {
											var items = {};
											items.title = "Alert";
											items.message = $scope.createprjctMsg[response.data.limitCode - 1];
											if (response.data.limitCode == 2)
													ProjectService.showContinueCreatingTrialProject(items.message, true);
											else if(response.data.limitCode == 5){
												ModalService.showAlertMessage(items);
											}
											else{
												showTrialLimitPopup(items);
											}
									}
							} else {
									FlashService.Error(response.message);
							}
					});
		}

		function showTrialLimitPopup(data) {
				var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: MAINURL
				+ 'views/project/project.trialLimitExpired.view.html?version=9.0',
						controller: 'TrialLimitExpiredController',
						backdrop: 'static',
						resolve: {
								items: function () {
										return data
								}
						}
				});

				modalInstance.result.then(function (data) {
						vm.modalTitle = "Contact Form";
						vm.RequestType = "contact support";
						var userDetails = PopulatingUserDetails();
						showContactUsPopup(userDetails);
				}, function () {
				});
		}

		function PopulatingUserDetails(projectName) {
				var upgradeItems = {};
				upgradeItems.user = vm.user;
				upgradeItems.user.companyName = angular.copy(vm.user.company.name);
				upgradeItems.modalTitle = vm.modalTitle;

				if (projectName) {
						upgradeItems.projectName = projectName;
						upgradeItems.RequestType = "Upgrade Request for " + projectName;
				} else {
						upgradeItems.RequestType = vm.RequestType;
				}
				return upgradeItems;
		}

		function showContactUsPopup(upgradeItems) {
				var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: MAINURL
				+ 'views/contactus/contactus.upgrade.view.html',
						controller: 'ContactUsUpgradeController',
						backdrop: 'static',
						resolve: {
								items: function () {
										return upgradeItems
								}
						}
				});

				modalInstance.result.then(function (data) {
				}, function () {
				});
		}

		$scope.setGridEvents = function(event,selectionEvent, selectAll) {
			$scope.gridReload = event;
			$scope.selectedGridValue = selectionEvent;
			$scope.selectAll = selectAll;
		};
		$scope.$on('$locationChangeStart', function (event, next, current) {
			$rootScope.hideSmartLinks = false;
        });

		$window.onbeforeunload = function (event) {
			$rootScope.hideSmartLinks = false;
        };

		function GetCompanyName() {
			vm.companyName = AuthenticationService.GetCompanyName();
		}

		function BindSearchMngmntGridDefaults() {
			vm.prjectColumnsData = [
					{
						field : 'projectId',
						caption : 'Project ID',
						sortable : true,
						hidden : true,
						size : '5%',
						tooltip : 'Project ID',
						resizable : true,
						editable : false
					},
					{
						field : 'projectName',
						caption : 'Project Name',
						sortable : true,
						size : '12%',
						tooltip : 'Project Name',
						resizable : true,
						editable : false
					},
					{
						field : 'label',
						caption : 'Label',
						sortable : true,
						size : '12%',
						tooltip : 'Label',
						resizable : true,
						editable : false
					},
					{
						field : 'searchCount',
						caption : 'SearchCount',
						sortable : true,
						size : '12%',
						tooltip : 'Count',
						resizable : true,
						editable : false
					},
					{
						field : 'terms',
						caption : 'Terms',
						sortable : true,
						size : '8%',
						tooltip : 'Term',
						resizable : true,
						editable : false
					},
					{
						field : 'createdBy',
						caption : 'Created By',
						sortable : true,
						size : '5%',
						tooltip : 'Created By',
						resizable : true,
						editable : false
					},
					{
						field : 'createdOn',
						caption : 'Created On',
						sortable : true,
						size : '5%',
						resizable : true,
						tooltip : 'Created On',
						editable : false
					},
					{
						field : 'active',
						caption : 'active',
						sortable : true,
						size : '8%',
						tooltip : 'Active',
						resizable : true,
						editable : false
					}];
			vm.searchData = [ {
				field : 'projectId',
				caption : 'Project ID',
				type : 'text',
				hidden : true
			}, {
				field : 'projectName',
				caption : 'Project Name',
				type : 'text'
			},
			{
				field : 'label',
				caption : 'Label',
				type : 'text',

			},
			{
				field : 'searchCount',
				caption : 'SearchCount',
				type : 'int'
			}, {
				field : 'term',
				caption : 'Term',
				type : 'int'

			}, {
				field : 'createdOn',
				caption : 'Created On',
				type : 'date',
				hidden : true
			}, {
				field : 'createdBy',
				caption : 'Created By',
				type : 'text',
				hidden : true
			}, {
				field : 'active',
				caption : 'active',
				type : 'text',
				hidden : true
			}
			 ];

			vm.sortData = [ {
				field : 'recid',
				direction : 'desc'
			} ];

		}

		function SwitchToUsers() {
			$location.path("/companyusersmanagement");
		}

		function SwitchToSearch() {
			$location.path('companysearchmanagement');
		}

		function checkAndDeleteProject(gridName) {
			if (GetSelectedRecord()) {
				ShowDeleteProjectConfirmPopup(vm.selectedRecord);
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select any record to delete.";
				ModalService.showAlertMessage(items);
			}
		}

		function checkAndDeleteVersion(gridName) {
			if (GetSelectedRecord()) {
				var project = vm.selectedRecord;
				if (project.versions.length > 1) {
					var modalInstance2 = $uibModal
							.open({
								animation : true,
								templateUrl : MAINURL
										+ 'views/project/project.deleteversion.view.html?version=9.0',
								controller : 'OverrideVersionController',
								backdrop : 'static',
								resolve : {
									items : function() {
										return project
									}
								}
							});
					modalInstance2.result.then(function(data) {
						ShowDeleteVersionConfirmPopup(project, data.version);
					}, function() {
					});
				} else {
					showRestrictDeleteVersionPopup();
				}
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select any record to delete.";
				ModalService.showAlertMessage(items);
			}
		}
		function EditFlagClicked() {
			if (GetSelectedRecord()) {
				if (vm.selectedRecord.expanded !== undefined)
					delete vm.selectedRecord.expanded;
				OpenUpdatePopup(vm.selectedRecord);
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select one record to Edit Optimized OCR Flag";
				ModalService.showAlertMessage(items);
			}
		}
		function OpenUpdatePopup(global) {
			var modalInstance2 = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/projectmanagement/projectmanagement.editocrflag.view.html',
						controller : 'ProjectManagementEditOCRController',
						backdrop : 'static',
						resolve : {
							items : function() {
								return global
							}
						}
					});
			modalInstance2.result.then(function(data) {

				UpdatePropValue(data.global);
			}, function() {
			});
		}
		function UpdatePropValue(data) {
			SubscriptionService.UpdateProjectOCRSubscriptionSettings(
					data.projectId, data.isOCREnabled, function(response) {

						if (response.success) {
							GetRecords();
							FlashService.Success(response.message);
						} else {
							FlashService.Error(response.message);
						}
					});
		}

		///////////////////////////////////



		function EditForceOcrFlagClicked() {
			if (GetSelectedRecord()) {
				if (vm.selectedRecord.expanded !== undefined)
					delete vm.selectedRecord.expanded;
				OpenUpdateForceOCRPopup(vm.selectedRecord);
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select one record to Edit Forced OCR Flag";
				ModalService.showAlertMessage(items);
			}
		}

		function OpenUpdateForceOCRPopup(global) {
			var modalInstance2 = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/projectmanagement/projectmanagement.editforceocrflag.view.html',
						controller : 'ProjectManagementEditOCRController',
						backdrop : 'static',
						resolve : {
							items : function() {
								return global
							}
						}
					});
				modalInstance2.result.then(function(data) {
				UpdateForceValue(data.global);
			}, function() {
			});
		}
		function UpdateForceValue(data) {
			SubscriptionService.UpdateProjectForceOCRSubscriptionSettings(
				data.projectId, data.isForceOCREnabled, function(response) {
					if (response.success) {
						GetRecords();
						FlashService.Success(response.message);
					} else {
						FlashService.Error(response.message);
					}
				});
		}
		//////////////////////////////////////

		function showRestrictDeleteVersionPopup() {
			var modalInstance = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/project/project.restrictsingleversiondeletion.view.html',
						controller : 'DeleteVersionController',
						backdrop : 'static',
						resolve : {
							items : function() {
								return {}
							}
						}
					});

			modalInstance.result.then(function(data) {
			}, function() {
			});
		}

		$scope.exportData = function(gridName) {
			$scope.$broadcast("ExportProjectData", {
				gridName : gridName,
				fileName : 'SearchManagement_' + Date.now()
			});
		};

		$scope.$on('showSelectedRecord', function(event, data) {
			vm.selectedRecord = data[0]; // Change this accordingly if we are
			// allowing the user to make multi
			// select
		});

		function ShowDeleteVersionConfirmPopup(project, version) {
			var modalInstance2 = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/project/project.deleteversionconfirmation.view.html?version=9.0',
						controller : 'DeleteVersionController',
						backdrop : 'static',
						resolve : {
							items : function() {
								return version
							}
						}
					});
			modalInstance2.result.then(function(data) {
				DeleteVersion(project, version);
			}, function() {
			});
		}

		function DeleteVersion(project, version) {
			ProjectService.DeleteVersion(project.projectId, version.versionId,
					function(response) {
						if (response.success) {
							GetRecords();
							FlashService.Success(response.message);
						} else {
							FlashService.Error(response.message);
						}
					});
		}

		function ShowDeleteProjectConfirmPopup(project) {
			var modalInstance2 = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/project/project.deleteprojectconfirmation.view.html',
						controller : 'DeleteVersionController',
						backdrop : 'static',
						resolve : {
							items : function() {
								return project
							}
						}
					});
			modalInstance2.result.then(function(data) {
				DeleteProject(project);
			}, function() {
			});
		}

		function DeleteProject(project) {
			ProjectService.Delete(project.projectId, function(response) {
				if (response.success) {
					GetRecords();
					FlashService.Success(response.message);
				} else {
					FlashService.Error(response.message);
				}
			});
		}

		function GetRecords() {

			vm.dataLoading = "Loading Projects... Please wait...";
			SearchFilterService.GetAllSearchFilters(function(response) {
				if (response.success) {
					vm.records = response.data;
					vm.records.map(function(item){
						item.recid=item.id;
						}
			     );
					GetCompany();
					vm.dataLoading = false;
				} else {
					vm.dataLoading = false;
				}
			});
		}

		$rootScope.$on('projectCreated', function() {
			GetRecords();
		});

		function GetCompany() {
			vm.dataLoading = "Loading Projects... Please wait...";
			SearchFilterService.GetCompanyDetails().then(function(response) {
				response = response.data;
				if (response.success) {
					vm.company = response.data;
					UpdateAndBindRecords(vm.records);
					vm.dataLoading = false;
				} else {
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}
			}).catch(function (error) {
				error = error.data;
				FlashService.Error(error.message);
				vm.dataLoading = false;
            });
		}

		function UpdateAndBindRecords(recordsdata) {
			if (recordsdata && recordsdata.length > 0) {
				vm.recordsData = recordsdata
						.filter(function(data) {
							if (data.isExpired) {
								data.style = 'background-color : #fdf6de !important;color:#FFF;';
							}
							data.isExpired = data.isExpired === 1 ? 'Expired'
									: 'Not Expired';
							data.versionsNumber = data.versions ? data.versions.length
									: 0;
							data.daysToExpire = data.daysToExpire > 0 ? data.daysToExpire
									: 0;

							data.company = vm.company.name;
							data.companyFolderId = vm.company.folderId;
							return data;
						});
				$scope.gridReload(vm.recordsData, vm.prjectColumnsData);
			}
		}

		function GetSelectedRecord(recid){
			if(recid === undefined){
				vm.selectedIndexList = $scope.selectedGridValue();
				if(vm.selectedIndexList.length > 0){
					for(var i=0;i<vm.records.length;i++){
						if(vm.records[i].recid === vm.selectedIndexList[0]){//This is only when there is single select option is there
							vm.selectedRecord = vm.records[i];
							return 1;
						}

					}
				}
			}
			else{
				vm.selectedRecord = vm.records.filter(function(data){
					if(data.recid === recid) return data;
				})[0];
				return 1;
			}
			return 0;
		}

		function DeleteSearchFilter() {
			if (GetSelectedRecord()) {
				SearchFilterService.DeleteSearchFilter(vm.selectedRecord.projectId ,vm.selectedRecord.versionId ,vm.selectedRecord.id,function(response){
					if (response.success) {
						GetRecords();
						FlashService.Success(response.message);
					} else {
						FlashService.Error(response.message);
					}
				});
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select a search item to delete.";
				ModalService.showAlertMessage(items);
			}
		}

		function download(gridName, fileType) {
			if (GetSelectedRecord()) {
				var project =  vm.selectedRecord;
				var modalInstance2 = $uibModal
						.open({
							animation : true,
							templateUrl : MAINURL
									+ 'views/projectmanagement/projectmanagement.versionselection.view.html',
							controller : 'OverrideVersionController',
							backdrop : 'static',
							resolve : {
								items : function() {
									return project
								}
							}
						});
				modalInstance2.result.then(function(data) {
					DownloadPDF(project, data.version, fileType);
				}, function() {
				});
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select one record to download specs.";
				ModalService.showAlertMessage(items);
			}
		}

		function DownloadPDF(project, version, fileType) {
			vm.dataLoading = 'Downloading... Please wait';
			SmartRegisterService.DownLoadFile(project.projectId,
					version.versionId, fileType, function(response) {
						if (response.success) {
							FlashService.Success(response.message);
							vm.dataLoading = false;
						} else {
							FlashService.Error(response.message);
							vm.dataLoading = false;
						}
					}, false, true);
		}

		$scope.$on('FilteredData', function(event, data) {
			vm.searchType = data.searchType;
			if (!$scope.$$phase) {
				$scope.$apply(function() {
					if (vm.searchType == "multi") {
						for (var i = 0; i < data.searchData.length; i++) {
							data.searchData[i].caption = getCaption(
									data.searchData[i], vm.prjectColumnsData);
						}
						vm.searchData = data.searchData;
					}
				});
			}
		});

		function getCaption(dataItem, columns) {
			return columns.filter(function(column) {
				return column.field == dataItem.field;
			})[0].caption;
		}

		function RemoveFilterItem(index) {
			vm.searchData.splice(index, 1);
			$scope.$broadcast('search', vm.searchData);
		}

		//Change Ownership of Project
		function ChangeProjectOwnerShip() {
			if (GetSelectedRecord()) {
				if (vm.selectedRecord.expanded !== undefined)
					delete vm.selectedRecord.expanded;
				OpenChangeProjectOwnerShipPopup(vm.selectedRecord);
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Please select a project to change project ownership";
				ModalService.showAlertMessage(items);
			}
    	}

		function OpenChangeProjectOwnerShipPopup(project) {
			var modalInstance2 = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/companyadminmanagement/changeprojectowner.view.html?version=9.0',
						controller : 'ChangeProjectOwnershipController',
						backdrop : 'static',
						size: 'md',
						resolve : {
							items : function() {
								return project
							}
						}
					});
			modalInstance2.result.then(function(data) {
				ChangeOwnership(project,data.currentProjectOwner.userId,data.selectedOwner);
			}, function() {
			});

		}
		 function ChangeOwnership(project,ownerId,selectedUserId) {
			 CompanyAdminService.ChangeProjectOwnerShip(project.projectId, ownerId, selectedUserId, function(response){
				         if (response.success) {
							FlashService.Success(response.message);
							GetRecords();
							vm.dataLoading = false;
						} else {
							FlashService.Error(response.message);
							vm.dataLoading = false;
						}
	        	})


		 }

       }

})();

(function() {
	'use strict';

	angular.module('EventsApp').controller(
			'ProjectManagementEditOCRController',
			ProjectManagementEditOCRController);

	ProjectManagementEditOCRController.$inject = [ '$scope',
			'$uibModalInstance', 'items' ];
	function ProjectManagementEditOCRController($scope, $uibModalInstance,
			items) {
		var vm = this;
		(function() {
			$scope.global = angular.copy(items);
			if ($scope.global)
				$scope.global.isOCREnabled = items.isOCREnabled === 1 ? true
						: false;
				$scope.global.isForceOCREnabled = items.isForceOCREnabled === 1 ? true
					: false;
		})();

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.Update = function() {
			$scope.global.isOCREnabled = $scope.global.isOCREnabled === true ? 1
					: 0;
			$scope.global.isForceOCREnabled = $scope.global.isForceOCREnabled === true ? 1
					: 0;
			$uibModalInstance.close({
				global : $scope.global
			});
		};

	}
})();
(function () {
    'use strict';

    angular.module('EventsApp').controller('ChangeProjectOwnershipController',
    		ChangeProjectOwnershipController);

    ChangeProjectOwnershipController.$inject = ['$scope', '$uibModalInstance',
			'items', 'FlashService','AuthenticationService','CompanyAdminService', 'CompanyService'];
    function ChangeProjectOwnershipController($scope, $uibModalInstance, items,
			FlashService, AuthenticationService, CompanyAdminService, CompanyService) {
        (function () {
        	$scope.totalUsersofCompany = [];
        	GetCompanyInfo();
        	$scope.items = items;
        	GetOwnerOfTheProject(items.ownerId);

        })();

        function GetCompanyInfo() {
        	$scope.companyInfo = AuthenticationService.GetCompanyInfo();
        }
        $scope.onSelectEmail = function($item) {
					$scope.SelectedUserId = $item.userId;
					$scope.SelectedUserName = $item.name;
					$scope.selectedEmail = $item.email;
				};
        function GetAllUsersOfCompany() {
					CompanyService.GetCompanyUsers($scope.companyInfo.companyId, true, function(response) {
						if (response.success == true) {
							$scope.totalUsersofCompany = response.data;
						} else {
							FlashService.Error(response.message);
							$scope.dataLoading = false;
						}
					});
				}

        function GetOwnerOfTheProject(ownerId) {
        	CompanyAdminService.GetUserById(ownerId,
					function(response) {
						if (response.success == true) {
							$scope.projectOwner = response.data;
							GetAllUsersOfCompany();
						} else {
							FlashService.Error(response.message);
							$scope.dataLoading = false;
						}
					});
        }
        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.Submit = function () {
            $uibModalInstance.close({
                    currentProjectOwner: $scope.projectOwner,
                    selectedOwner : $scope.SelectedUserId
                });

        };
    }
})();
(function () {
    'use strict';

    angular.module('EventsApp').controller('ChangeProjectOwnershipController',
    		ChangeProjectOwnershipController);

    ChangeProjectOwnershipController.$inject = ['$scope', '$uibModalInstance',
			'items', 'FlashService','AuthenticationService','CompanyAdminService', 'CompanyService'];
    function ChangeProjectOwnershipController($scope, $uibModalInstance, items,
			FlashService, AuthenticationService, CompanyAdminService, CompanyService) {
        (function () {
        	$scope.totalUsersofCompany = [];
        	GetCompanyInfo();
        	$scope.items = items;
        	GetOwnerOfTheProject(items.ownerId);

        })();

        function GetCompanyInfo() {
        	$scope.companyInfo = AuthenticationService.GetCompanyInfo();
        }
        $scope.onSelectEmail = function($item) {
					$scope.SelectedUserId = $item.userId;
					$scope.SelectedUserName = $item.name;
					$scope.selectedEmail = $item.email;
				};
        function GetAllUsersOfCompany() {
					CompanyService.GetCompanyUsers($scope.companyInfo.companyId, true, function(response) {
						if (response.success == true) {
							$scope.totalUsersofCompany = response.data;
						} else {
							FlashService.Error(response.message);
							$scope.dataLoading = false;
						}
					});
				}

        function GetOwnerOfTheProject(ownerId) {
        	CompanyAdminService.GetUserById(ownerId,
					function(response) {
						if (response.success == true) {
							$scope.projectOwner = response.data;
							GetAllUsersOfCompany();
						} else {
							FlashService.Error(response.message);
							$scope.dataLoading = false;
						}
					});
        }
        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.Submit = function () {
            $uibModalInstance.close({
                    currentProjectOwner: $scope.projectOwner,
                    selectedOwner : $scope.SelectedUserId
                });

        };
    }
})();
(function () {
    'use strict';

    angular.module('EventsApp').controller('ChangeProjectOwnershipController',
    		ChangeProjectOwnershipController);

    ChangeProjectOwnershipController.$inject = ['$scope', '$uibModalInstance',
			'items', 'FlashService','AuthenticationService','CompanyAdminService', 'CompanyService'];
    function ChangeProjectOwnershipController($scope, $uibModalInstance, items,
			FlashService, AuthenticationService, CompanyAdminService, CompanyService) {
        (function () {
        	$scope.totalUsersofCompany = [];
        	GetCompanyInfo();
        	$scope.items = items;
        	GetOwnerOfTheProject(items.ownerId);

        })();

        function GetCompanyInfo() {
        	$scope.companyInfo = AuthenticationService.GetCompanyInfo();
        }
        $scope.onSelectEmail = function($item) {
					$scope.SelectedUserId = $item.userId;
					$scope.SelectedUserName = $item.name;
					$scope.selectedEmail = $item.email;
				};
        function GetAllUsersOfCompany() {
					CompanyService.GetCompanyUsers($scope.companyInfo.companyId, true, function(response) {
						if (response.success == true) {
							$scope.totalUsersofCompany = response.data;
						} else {
							FlashService.Error(response.message);
							$scope.dataLoading = false;
						}
					});
				}

        function GetOwnerOfTheProject(ownerId) {
        	CompanyAdminService.GetUserById(ownerId,
					function(response) {
						if (response.success == true) {
							$scope.projectOwner = response.data;
							GetAllUsersOfCompany();
						} else {
							FlashService.Error(response.message);
							$scope.dataLoading = false;
						}
					});
        }
        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.Submit = function () {
            $uibModalInstance.close({
                    currentProjectOwner: $scope.projectOwner,
                    selectedOwner : $scope.SelectedUserId
                });

        };
    }
})();
(function () {
    'use strict';

    angular.module('EventsApp').controller('EditSearchController',
    		EditSearchController);

    EditSearchController.$inject = ['$scope', '$uibModalInstance',
			'items', 'FlashService','AuthenticationService','CompanyAdminService', 'CompanyService','SearchFilterService'];
    function EditSearchController($scope, $uibModalInstance, items,
			FlashService, AuthenticationService, CompanyAdminService, CompanyService, SearchFilterService) {

    	(function() {
			$scope.filter = angular.copy(items);
		})();

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.Save = function() {
			$scope.dataLoading = true;
			delete $scope.filter.expanded;
			$uibModalInstance.close($scope.filter);
		}

    }
})();

(function () {
    'use strict';

    angular.module('EventsApp').controller('PromoteSearchController',
    		PromoteSearchController);

    PromoteSearchController.$inject = ['$scope', '$uibModalInstance',
			'items', 'FlashService','AuthenticationService','CompanyAdminService', 'CompanyService','SearchFilterService'];
    function PromoteSearchController($scope, $uibModalInstance, items,
			FlashService, AuthenticationService, CompanyAdminService, CompanyService , SearchFilterService ) {

    	(function() {
			$scope.promotionLevel = angular.copy(items);
		})();

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.Update = function() {
			$scope.dataLoading = true;
			delete $scope.promotionLevel.expanded;
			$uibModalInstance.close($scope.promotionLevel);
		}

    }
})();
