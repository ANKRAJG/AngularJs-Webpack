(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('CompanyManagementController', CompanyManagementController);

    CompanyManagementController.$inject = ['AuthenticationService', 'CompanyService', 'FlashService', '$scope', 'UserService', '$uibModal', 'MAINURL', '$timeout', '$location', 'ModalService'];
    function CompanyManagementController(AuthenticationService, CompanyService, FlashService, $scope, UserService, $uibModal, MAINURL, $timeout, $location, ModalService) {

        var vm = this;
        vm.RemoveFilterItem = RemoveFilterItem;
        vm.ShowCreateCompanyPopup = ShowCreateCompanyPopup;
        vm.EditFlagClicked = EditFlagClicked;
        vm.DeleteCompany = DeleteCompany;
        vm.DisableCompany = DisableCompany;
        vm.updateSSOSettings = updateSSOSettings;
        vm.UpdateRegionFlag = UpdateRegionFlag;
        vm.UpdateDefaultRole = UpdateDefaultRole;
        vm.AddMultiDomain = AddMultiDomain;
        (function initController() {
            GetAllCompanies();
        	SetGridDefaults();
            GetCompanyName();
            LoadUserDetails();
        })();

        function UpdateRegionFlag() {
        	getSelectedCompanyWithCallback(function(selectedRecord) {
        		var companyId = selectedRecord.companyId;
				    var modalInstance2 = $uibModal.open({
      					animation : true,
      					templateUrl : MAINURL
      							+ 'views/companymanagement/companymanagement.updateregion.html',
      					controller : 'UpdateCompanyRegionController',
      					backdrop : 'static',
      					resolve : {
      						items : function() {
      							return selectedRecord
      						}
      					}
				    });

    				modalInstance2.result.then(function(data) {
    					CompanyService.UpdateRegionFlag(companyId, data.region, function(response) {
    						if (response.success) {
    							if(companyId === vm.user.company.companyId){
    								FlashService.Success(response.message + " Please login again.", true);
    								Logout();
    							} else {
    								GetAllCompanies();
    								FlashService.Success(response.message);
    							}
    						} else {
    							FlashService.Error(response.message);
    						}
    					});
    				}, function() {
    				});
			    });
		    }

        function UpdateDefaultRole() {
        	getSelectedCompanyWithCallback(function(selectedRecord) {
        		var companyId = selectedRecord.companyId;
				    var modalInstance2 = $uibModal.open({
      					animation : true,
      					templateUrl : MAINURL
      							+ 'views/companymanagement/companymanagement.updateDefaultRole.html',
      					controller : 'UpdateDefaultRoleController',
      					backdrop : 'static',
      					resolve : {
      						items : function() {
      							return selectedRecord
      						}
      					}
				    });

    				modalInstance2.result.then(function(data) {
              UserService.UpdateDefaultRole(companyId, data.defaultRoleId)
                .success(function(res) {
                  if(companyId === vm.user.company.companyId) {
    								FlashService.Success(res.message + " Please login again.", true);
    								Logout();
    							} else {
    								GetAllCompanies();
    								FlashService.Success(res.message);
    							}
                })
                .error(function(err) {
                  FlashService.Error(err.message);
                });
    				}, function() {
    				});
			    });
		    }

        function AddMultiDomain() {
          getSelectedCompanyWithCallback(function(selectedRecord) {
            CompanyService.OpenMultiDomainPopup(selectedRecord);
			    });
        }


        $scope.setGridEvents = function (event) {
            $scope.gridReload = event;
        };

        function LoadUserDetails() {
			vm.user = AuthenticationService.GetUserInfo();
		}

        function ShowCreateCompanyPopup(){
			var modalInstance = $uibModal
			.open({
			    animation: true,
			    templateUrl: MAINURL + 'views/companymanagement/createcompany.view.html',
			    controller: 'CreateCompanyController',
			    backdrop: 'static',
			    controllerAs: 'vm',
                bindToController: true,
                size : 'lg',
			    resolve: {
			    }
			});

			modalInstance.result.then(function (data) {
				if(data && data.company){
					createCompany(data.company, data.notifyToUser);
				} else {
					FlashService.Error("Unable to get the data. Please try again.");
				}
			}, function () {
		    });
        }

        function createCompany(company, notifyToUser){
        	vm.dataLoading = "Creating Company... Please wait...";
        	CompanyService.Create(company, null, notifyToUser, function(response) {
				if (response.success) {
					vm.dataLoading = false;
					FlashService.Success(response.message + " Please login again.", true);
					Logout();
				} else {
					vm.dataLoading = false;
					FlashService.Error(response.message);
				}
			});
        }

        function Logout() {
			AuthenticationService.Logout(vm.user.userId);
			AuthenticationService.clearStorageData();
			$location.path('/login');
		}

        function updateSSOSettings(){
        	getSelectedCompanyWithCallback(function(record){
        		if(record.enterpriseFlag){
        			var modalInstance = $uibModal
        			.open({
        			    animation: true,
        			    templateUrl: MAINURL + 'views/companymanagement/ssosettings.view.html',
        			    controller: 'SSOSettingsController',
        			    backdrop: 'static',
        			    controllerAs: 'vm',
                        bindToController: true,
        			    resolve: {
        			        items: record
        			    }
        			});

        			modalInstance.result.then(function (data) {
        				GetAllCompanies();
        		    }, function () {
        		    });
        		} else {
					var items = {};
					items.title = 'Alert';
					items.message = "Company selected is not an Enterprise Company. SSO settings is only applicable to Enterprise Companies.";
					ModalService.showAlertMessage(items);
        		}
        	});
        }

        function getSelectedCompanyWithCallback(callback){
        	$timeout(function() {
				var gridName = 'companymanagementgrid';
				$scope.$broadcast("getSelectedRecord", gridName);
	        	if(vm.selectedRecords.length === 1){
	        		callback(vm.selectedRecords[0]);
	        	}
	        	else{
					var items = {};
					items.title = 'Alert';
					items.message = "Please select only one record to proceed";
					ModalService.showAlertMessage(items);
				}
			}, 500);
        }

        function SetGridDefaults() {
        	vm.events=[];
        	var statuses = [
                            'SUCCESS', 'FAILED', 'STARTED', 'INPROGRESS'
             ];
        	vm.searchData = [
                    { field: 'companyId', caption: 'Company Id', type: 'text' },
                    { field: 'name', caption: 'Name', type: 'text' },
                    { field: 'user', caption: 'User Name', type: 'text' },
                    { field: 'active', caption: 'Active', type: 'text' },
                    { field: 'description', caption: 'Description', type: 'text' },
                    { field: 'isIgnoredFlag', caption: 'IsIgnoredFlag', type: 'combo', items: statuses},
                    { field: 'createTime', caption: 'CreateTime', type: 'text' },
                    { field: 'ssoEnabledFlag', caption: 'SSO Flag', type: 'text' }
                ];

        	vm.sortData = [{ field: 'companyId', direction: 'desc' }];

            vm.columnsData =
                [
                    { field: 'companyId', caption: 'Company Id', sortable: true, size: '8%', tooltip: 'Company Id' , resizable: true, editable: false },
                    { field: 'name', caption: 'Company Name', sortable: true, size: '10%', tooltip: 'Company Name', resizable: true, editable:false },
                    { field: 'user', caption: 'User Name', sortable: true, tooltip: 'Owner Name', size: '10%', resizable: true, editable:false },
                    { field: 'active', caption: 'Company Active', sortable: true, size: '8%', resizable: true, tooltip: 'Company Active', editable: false, fieldType: 'boolean',
                      render: function(record) {
                    	  var formatedActive = (record.active === 1) ? 'YES' : 'NO';
                    	  return '<span title="' + formatedActive + '">' + formatedActive + '</span>';
                      }
                    },
                    { field: 'description', caption: 'Description', sortable: true, size: '17%', tooltip: 'Description', resizable: true, editable: false},
                    { field: 'isIgnoredFlag', caption: 'IgnoredFlag', sortable: true, size: '10%', tooltip: 'IgnoredFlag', resizable: true, editable: false, fieldType: 'boolean',
                      render: function(record) {
                    	  var formatedIgnored = (record.isIgnoredFlag === 1) ? 'YES' : 'NO';
                    	  return '<span title="' + formatedIgnored + '">' + formatedIgnored + '</span>';
                      }
        			},
                    { field: 'createTime', caption: 'Created Time', sortable: true, size: '10%', tooltip: 'Created Time', resizable: true, editable:false,
                      render: function(record) {
                    	  if(record.createTime) {
                    		  var formatedCreateTime = moment(record.createTime).format("YYYY/MM/DD");
                    		  return '<span title="' + formatedCreateTime + '">' + formatedCreateTime + '</span>';
                    	  }
                      }
                    },
                    { field: 'emailDomain', caption: 'Email Domain', sortable: true, size: '10%', tooltip: 'Email Domain', resizable: true, editable:false },
                    { field: 'ssoEnabledFlag', caption: 'SSO Flag', sortable: true, size: '8%', tooltip: 'SSO Enabled Flag', resizable: true, editable:false},
                    { field: 'region', caption: 'Region', sortable: true, size: '5%', tooltip: 'Region of the company', resizable: true, editable:false, fieldType: 'region' },
                    { field: 'defaultUserRole', caption: 'Role', sortable: true, size: '8%', tooltip: 'Default User Role', resizable: true, editable:false, fieldType: 'role' },
                    { field: 'accountExecutive', caption: 'Account Executive', sortable: true, size: '10%', tooltip: 'Account Executive', resizable: true,  editable:false, fieldType: 'text' },
                    { field: 'csManager', caption: 'CS Manager', sortable: true, size: '10%', tooltip: 'CS Manager', resizable: true, editable:false, fieldType: 'text' },
                    { field: 'accountExecutiveEmail', caption: 'Account Executive Email', sortable: true, size: '10%', tooltip: 'Account Executive Email', resizable: true, editable:false, fieldType: 'text' },
                    { field: 'csManagerEmail', caption: 'CS Manager Email', sortable: true, size: '10%', tooltip: 'CS Manager Email', resizable: true,  editable:false, fieldType: 'email' },
                ];
        }
        $scope.$on('showSelectedRecord', function(event, data) {
          /* Change this accordingly if we are allowing the user to make multi select */
    			//vm.selectedRecords = data[0];
          vm.selectedRecords = data;
    		});

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
				fileName : 'CompanyManagement_' + Date.now()
			});
		};
        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

        function GetAllCompanies() {
        	vm.dataLoading = "Loading Companies... Please wait...";
            CompanyService.GetAll(function (response) {
                if (response.success) {
                    vm.records = response.data;
                    GetCompanyOwners();
                    vm.dataLoading = false;
                } else {
                    FlashService.Error(response.message);
                    vm.dataLoading = false;
                }

            });
        }

        function GetCompanyOwners() {
			CompanyService.GetCompanyOwners(function(response) {
				if (response.success) {
					vm.users = response.data;
					UpdateAndBindRecords(vm.records);
				} else {
					FlashService.Error(response.message);
				}
			});
		}

        function UpdateAndBindRecords(recordsdata) {
			if (recordsdata && recordsdata.length > 0) {
				vm.recordsData = recordsdata.filter(function(data) {
							for (var i = 0; i < vm.users.length; i++) {
								if (vm.users[i].userId === data.ownerId) {
									data.user = vm.users[i].name;
									break;
								}
							}
							return data;
						});
				setTimeout(function() {
					$scope.gridReload(vm.recordsData, vm.columnsData);
				}, 300);
			}
		}

    function DeleteCompany(){
        getSelectedCompanyWithCallback(function(record){
          DeleteConfirmationPopUp(record);
        });
		}

    function selectOnlyOneRecordAlert() {
      var items = {};
      items.title = 'Alert';
      items.message = "Please select only company to do this operation";
      ModalService.showAlertMessage(items);
    }

        function DeleteConfirmationPopUp(data){
			var modalInstance = $uibModal
			.open({
			    animation: true,
			    templateUrl: MAINURL + 'views/companymanagement/company.deletecompany.confirmation.view.html',
			    controller: 'DeleteCompanyConfirmationController',
			    backdrop: 'static',
			    resolve: {
			        items: data
			    }
			});

			modalInstance.result.then(function (data) {
				OpenDeletePopup(data);
		    }, function () {
		    });
         }
		function OpenDeletePopup(data){
			CompanyService.DeleteCompany(data.companyId, function(response) {
				if (response.success === true) {
					FlashService.Success(response.message, true);
					GetAllCompanies();
					$scope.dataLoading = false;
				} else {
					FlashService.Error(response.message, true);
					GetAllCompanies();
					$scope.dataLoading = false;
				}
			});
		}

    vm.BulkUpdate = function() {
      $timeout(function() {
        var gridName = 'companymanagementgrid';
        $scope.$broadcast("getSelectedRecord", gridName);
        if(vm.selectedRecords.length >= 1){
          openBulkUpdatePopup(vm.selectedRecords);
        }
        else {
          var items = {};
          items.title = 'Alert';
          items.message = "Please select at least one record to proceed";
          ModalService.showAlertMessage(items);
        }
      }, 500);
    }

    function openBulkUpdatePopup(records) {
      var gridName = 'companymanagementgrid';
      var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: MAINURL + 'views/companymanagement/companyBulkEditModal.html',
          controller: 'CompanyBulkEditModalCtrl',
          size: 'lg',
          backdrop: 'static',
          resolve: {
              columnsData: function () { return vm.columnsData },
              recordData: function ()  { return records },
          }
      });

      modalInstance.result.then(function(data) {
        $(data.recordData).each(function (recIndex, record) {
            $(data.columnsData).each(function (index, item) {
                if(item.bulkEditFlag) {
                  if(item.fieldType === 'text' || item.fieldType === 'email') {
                    data.recordData[recIndex][item.field] = item.value ? item.value : '';
                  }
                }
            });
        });
        $(data.recordData).each(function (key, item) {
            w2ui[gridName].set(item.recid, item);
        });

        w2ui[gridName].refresh();
      });
    }

        function EditFlagClicked() {
            getSelectedCompanyWithCallback(function(record) {
                OpenUpdatePopup(record);
            });
		}

        function OpenUpdatePopup(global) {
			var modalInstance2 = $uibModal.open({
				animation : true,
				templateUrl : MAINURL + 'views/companymanagement/companymanagement.editignoredflag.view.html',
				controller : 'CompanyManagementEditIgnoredFlag',
				backdrop : 'static',
				resolve : {
					items : function() { return global; }
				}
			});
			modalInstance2.result.then(function(data) {
				UpdateIsIgnoredFlag(data.global);
			});
		}

		function UpdateIsIgnoredFlag(data) {
	        CompanyService.UpdateIsIgnoredFlagCompanySettings(data.companyId, data.isIgnoredFlag,
                function(response) {
						if (response.success) {
							GetAllCompanies();
							FlashService.Success(response.message);
						} else {
							FlashService.Error(response.message);
						}
			});
		}

    function DisableCompany() {
      getSelectedCompanyWithCallback(function(record) {
        OpenDisableCompanyPopup(record);
      });
    }
        function OpenDisableCompanyPopup(global) {
			var modalInstance2 = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/companymanagement/company.disablecompany.view.html',
						controller : 'CompanyManagementDisableCompanyController',
						backdrop : 'static',
						resolve : {
							items : function() {
								return global
							}
						}
					});
			modalInstance2.result.then(function(data) {

				UpdateIsActiveFlagOfCompany(data.global);
			}, function() {
			});
		}
		function UpdateIsActiveFlagOfCompany(data) {
	        CompanyService.DisableCompanyEditActiveFlag(
					data.companyId, data.active, function(response) {
						if (response.success) {
							GetAllCompanies();
							FlashService.Success(response.message);
						} else {
							FlashService.Error(response.message);
						}
					});
		}


    }

})();
(function() {
	'use strict';

	angular.module('EventsApp').controller(
			'CompanyManagementEditIgnoredFlag',
			CompanyManagementEditIgnoredFlag);

	CompanyManagementEditIgnoredFlag.$inject = [ '$scope',
			'$uibModalInstance', 'items' ];
	function CompanyManagementEditIgnoredFlag($scope, $uibModalInstance,
			items) {
		var vm = this;
		(function() {

			$scope.global = angular.copy(items);


			$scope.IsIgnoredFlag = $scope.global.isIgnoredFlag.toString();
			$scope.IgnoredFlag = [ {
				name : "YES",
				value : 1
			}, {
				name : "NO",
				value : 0
			} ];


			/*if ($scope.global)
				$scope.global.isOCREnabled = items.isOCREnabled === 1 ? true
						: false;*/
		})();

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.Update = function() {
			$scope.global.isIgnoredFlag = $scope.IsIgnoredFlag == "1" ? 1 :0;


			$uibModalInstance.close({
				global : $scope.global
			});
		};

	}
})();
(function() {
	'use strict';

	angular.module('EventsApp').controller('CompanyManagementDisableCompanyController',
			CompanyManagementDisableCompanyController);

	CompanyManagementDisableCompanyController.$inject = [ '$scope', '$uibModalInstance',
			'items' ];
	function CompanyManagementDisableCompanyController($scope, $uibModalInstance, items) {
		var vm = this;
		(function() {
			$scope.global = angular.copy(items);
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

	angular.module('EventsApp').controller('DeleteCompanyConfirmationController',
			DeleteCompanyConfirmationController);

	DeleteCompanyConfirmationController.$inject = [ '$scope', '$uibModalInstance',
			'items' ];
	function DeleteCompanyConfirmationController($scope, $uibModalInstance, items) {
		$scope.items = items;
		$scope.No = function() {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.Yes = function() {
	    $uibModalInstance.close($scope.items);
		};
	}
})();

(function () {
    'use strict';

    angular.module('EventsApp').controller('UpdateCompanyRegionController',
    		UpdateCompanyRegionController);

    UpdateCompanyRegionController.$inject = ['$scope', '$uibModalInstance',
			'items', 'FlashService', 'UtilService'];
    function UpdateCompanyRegionController($scope, $uibModalInstance, items,
			FlashService, UtilService) {
        (function () {
            $scope.company = items;
            $scope.selectedCompanyRegion = $scope.company.region;
            getRegions();
        })();

		function getRegions(){
			$scope.dataLoading = "Fetching Regions... Please wait...";
			UtilService.GetRegions(function(response) {
				if (response.success) {
					$scope.companyRegionList = response.data.regions;
					$scope.dataLoading = false;
				} else {
					FlashService.Error(response.message);
					$scope.dataLoading = false;
				}
			});
		}

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.Update = function () {
            $uibModalInstance.close({
                region : $scope.selectedCompanyRegion
            });
        };
    }
})();

(function () {
    'use strict';

    angular.module('EventsApp').controller('UpdateDefaultRoleController',
    		UpdateDefaultRoleController);

    UpdateDefaultRoleController.$inject = ['$scope', '$uibModalInstance',
			'items', 'FlashService', 'UserService'];
    function UpdateDefaultRoleController($scope, $uibModalInstance, items,
			FlashService, UserService) {
        (function () {
            $scope.company = items;
            $scope.selectedDefaultRole = items.defaultUserRoleId.toString();
            getDefaultRoleList($scope.company.companyId);
        })();

    		function getDefaultRoleList(companyId){
      			$scope.dataLoading = "Fetching Default Role... Please wait...";
            UserService.GetDefaultRoleList(companyId)
        			.success(function(res) {
        				$scope.defaultRoleList = res.data;
                $scope.dataLoading = false;
        			})
        			.error(function(err) {
                FlashService.Error(err.message);
                $scope.dataLoading = false;
        			});
    		}

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.Update = function () {
            $uibModalInstance.close({
                defaultRoleId : $scope.selectedDefaultRole
            });
        };
    }
})();
