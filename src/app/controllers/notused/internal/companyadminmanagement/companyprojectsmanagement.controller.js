(function() {
	'use strict';

	angular.module('EventsApp').controller('CompanyProjectsManagementController',
			CompanyProjectsManagementController);

	CompanyProjectsManagementController.$inject = ['AuthenticationService', 'FlashService', '$scope', 'ProjectService',
			'UserService', '$uibModal', 'MAINURL', 'SmartRegisterService', 'CompanyService', 'SubscriptionService', 'CompanyAdminService',
			'$rootScope', '$window','$location', 'ModalService'];
	function CompanyProjectsManagementController(AuthenticationService, FlashService, $scope, ProjectService,
			UserService, $uibModal, MAINURL, SmartRegisterService, CompanyService, SubscriptionService, CompanyAdminService,
			$rootScope, $window, $location, ModalService) {

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
		vm.SwitchToAPI = SwitchToAPI;
		vm.StartNewProject = StartNewProject;
		vm.user = AuthenticationService.GetUserInfo();

		(function initController() {
			$rootScope.hideSmartLinks = true;
			GetCompanyName();
			BindProjectMngmntGridDefaults();
			GetRecords();
			GetCompanyInfo();
			InitVariables();
		})();

		vm.companyUsageReports = function() {
			AuthenticationService.setAdminType('companyadminreports');
			$location.path('/companyusage');
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
						templateUrl: MAINURL + 'views/project/project.trialLimitExpired.view.html?version=9.0',
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
					ModalService.showContactUsPopup(userDetails);
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

		function BindProjectMngmntGridDefaults() {
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
						field : 'name',
						caption : 'Project Name',
						sortable : true,
						size : '12%',
						tooltip : 'Project Name',
						resizable : true,
						editable : false
					},
					{
						field : 'projectNumber',
						caption : 'Project Number',
						sortable : true,
						size : '8%',
						tooltip : 'Project Number',
						resizable : true,
						editable : false
					},
					{
						field : 'projectType',
						caption : 'Project Type',
						sortable : true,
						size : '8%',
						tooltip : 'Project Type',
						resizable : true,
						editable : false
					},
					{
						field : 'subscriptionStatus',
						caption : 'Subscription',
						sortable : true,
						size : '6%',
						tooltip : 'Subscription type of project',
						resizable : true,
						editable : false
					},
					{
						field : 'description',
						caption : 'Description',
						sortable : true,
						size : '12%',
						tooltip : 'Description of project',
						resizable : true,
						editable : false
					},
					{
						field : 'isExpired',
						caption : 'Subscription Status',
						sortable : true,
						size : '5%',
						tooltip : 'Project expired / not expired',
						resizable : true,
						editable : false
					},
					{
						field : 'daysToExpire',
						caption : 'Expires In (days)',
						sortable : true,
						size : '5%',
						resizable : true,
						tooltip : 'Project Expires In(days)',
						editable : false
					},
					{
						field : 'targetEndDate',
						caption : 'Project Completion Date',
		                render : function(record) {
		                	return w2utils.formatDate(record.targetEndDate,'yyyy/mm/dd');
		                },
						sortable : true,
						size : '5%',
						resizable : true,
						tooltip : 'Project Completion Date',
						editable : false
					},
					{
						field : 'createTime',
						caption : 'Created Date',
		                render : function(record) {
		                	return w2utils.formatDate(record.createTime,'yyyy/mm/dd');
		                },
						sortable : true,
						size : '5%',
						resizable : true,
						tooltip : 'Project created date',
						editable : false
					},
					{
						field : 'features',
						caption : 'Features',
						sortable : true,
						size : '5%',
						tooltip : 'Features enable for the project',
						resizable : true,
						editable : false,
						hidden : true
					},
					{
						field : 'ownerName',
						caption : 'Owner Name',
						sortable : true,
						size : '8%',
						tooltip : 'Project Owner Name',
						resizable : true,
						editable : false
					},
					{
						field : 'versionsNumber',
						caption : 'Number of Versions',
						sortable : true,
						size : '5%',
						tooltip : 'Number of Versions',
						resizable : true,
						editable : false
					}];
			vm.searchData = [ {
				field : 'projectId',
				caption : 'Project ID',
				type : 'text',
				hidden : true
			}, {
				field : 'name',
				caption : 'Project Name',
				type : 'text'
			},
			/* { field: 'status', caption: 'Status', type: 'text' }, */
			{
				field : 'subscriptionStatus',
				caption : 'Subscription',
				type : 'text',

			},
			{
				field : 'isExpired',
				caption : 'Subscription Status',
				type : 'text'
			}, {
				field : 'daysToExpire',
				caption : 'Expires In (days)',
				type : 'int'

			}, {
				field : 'createTime',
				caption : 'Created Date',
				type : 'date',
				hidden : true
			}, {
				field : 'versionsNumber',
				caption : 'Number of Versions',
				type : 'text',
				hidden : true
			}, {
				field : 'isOCREnabled',
				caption : 'Optimized OCR Flag Enabled',
				type : 'text',
				hidden : true
			},{
				field : 'isForceOCREnabled',
				caption : 'Forced OCR Flag Enabled',
				type : 'text',
				hidden : true
			},
			/* { field: 'versionFlag', caption: 'Versioning', type: 'text' }, */
			{
				field : 'ownerName',
				caption : 'Owner Name',
				type : 'text'
			},
			{
				field : 'targetStartDate',
				caption : 'Target Start Date',
				type : 'date',
				hidden : true
			},
			{
				field : 'targetEndDate',
				caption : 'Target End Date',
				type : 'date',
				hidden : true
			},
			{
				field : 'company',
				caption : 'Company Name',
				type : 'text',
				hidden : true
			} ];

			vm.sortData = [ {
				field : 'recid',
				direction : 'desc'
			} ];

		}

		function SwitchToUsers() {
			$location.path("/companyusersmanagement");
		}

		function SwitchToAPI() {
			$location.path("/companyapidetails");
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
					var modalInstance2 = $uibModal.open({
						animation : true,
						templateUrl : MAINURL + 'views/project/project.deleteversion.view.html?version=9.0',
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
			var modalInstance2 = $uibModal.open({
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
			$uibModal.open({
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
		}

		$scope.exportData = function(gridName) {
			$scope.$broadcast("ExportProjectData", {
				gridName : gridName,
				fileName : 'ProjectManagement_' + Date.now()
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
			CompanyAdminService.GetAllProjects(function(response) {
				if (response.success) {
					vm.records = response.data;
					GetCompany();
				}
				vm.dataLoading = false;
			});
		}

		$rootScope.$on('projectCreated', function() {
			GetRecords();
		});

		function GetCompany() {
			vm.dataLoading = "Loading Projects... Please wait...";
			CompanyService.getCompanyDetails().then(function(response) {
				response = response.data;
				if (response.success) {
					vm.company = response.data;
					UpdateAndBindRecords(vm.records);
				} else {
					FlashService.Error(response.message);
				}
				vm.dataLoading = false;
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
			SmartRegisterService.downLoadFile(project.projectId,
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
			//GetProjectOwner(data.ownerId);
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
			});

		}
		 function ChangeOwnership(project,ownerId,selectedUserId) {
			 CompanyAdminService.ChangeProjectOwnerShip(project.projectId, ownerId, selectedUserId, function(response){
			        if (response.success) {
						FlashService.Success(response.message);
						GetRecords();
					} else {
						FlashService.Error(response.message);
					}
					vm.dataLoading = false;
	        	});
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
