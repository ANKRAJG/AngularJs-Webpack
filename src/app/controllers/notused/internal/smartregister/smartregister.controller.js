(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('SmartRegisterController', SmartRegisterController);

    SmartRegisterController.$inject = ['$scope', '$rootScope', '$log', 'SmartRegisterService', 'ProjectService', 'AuthenticationService', 'FlashService', 'CompanyService', 'ExportService',
									   'UtilService', 'EventService', 'ModalService', '$location', '$route', '$routeParams','AccService', 'UserService'];
    function SmartRegisterController($scope, $rootScope, $log, SmartRegisterService, ProjectService, AuthenticationService, FlashService, CompanyService, ExportService,
									   UtilService, EventService, ModalService, $location, $route, $routeParams, AccService, UserService) {

        var vm = this;
//		vm.readonly = $rootScope.globals.userInfo.isReadonly;
        vm.readonly = false;
		vm.importTab = 'specs';
		vm.MaxSRRecId = -1;
        vm.MaxPLRecId = -1;
		vm.availableExcelSystems = [];
        vm.accUserRoles = [];

        // FUNCTIONS
        vm.getPlanVersionIndex = getPlanVersionIndex;
        // END OF FUNCTIONS
        vm.openPublishSpecsPopup = openPublishSpecsPopup;

		(function initController() {
            var accProjectId = $routeParams.id;
            var versionQueryParam = $location.search().version;
            vm.dataLoading = "Loading Smart Register, Please Wait...";
            AccService.initialiseACCDetails(accProjectId, function(){
	            var project = AuthenticationService.GetProject();
                vm.user = AuthenticationService.GetUserInfo();
                vm.companyName = AuthenticationService.GetCompanyName();
                vm.sideNavTools = AuthenticationService.getSideNavTools();
                vm.docsEnabled = vm.sideNavTools.filter(function(tool){return tool.name == 'Files'}).length > 0;

                if (project) {
                  GetAvailableSystems();
                }

                getSelectedProject(versionQueryParam, function() {
                   getTypeOfSmartRegisterView();
                   vm.dataLoading = false;
               });
               vm.accProject = AuthenticationService.GetACCProject();
               vm.buildEnabled = vm.accProject.products.filter(function(p) { return p.name.toLowerCase() === 'build'; }).length>0;
               getUserRoles();
            });
        })();

		$scope.$on('updatedSRMaxRecId', function(event, data) {
			vm.MaxSRRecId = data;
		});

        $scope.$on('updatedPLMaxRecId', function(event, data) {
			vm.MaxPLRecId = data;
		});

        $scope.$on('searchedFromCtrl', function() {
            $scope.$broadcast('searchedFromParent');
        });

        $scope.$on('doSearchInBox', function(event, data) {
            $scope.$broadcast('doSearchInBoxFromParent', data);
        });

        $scope.$on('searchInBox', function(event, searchText) {
            $scope.$broadcast('searchInSRFromBox', searchText);
        });

        vm.getTooltipMsg = function() {
            if(!vm.buildEnabled) {
                return '<div class="build-tooltip"><p>Build must be enabled</p></div>';
            } else {
                return '<div class="build-tooltip"><p><b>Must be a submittal manager</b><br>To publish submittals to Build you must be a submittal manager for this project.</p></div>';
            }
        }

        vm.publishToBuild = function() {
	       if(!vm.buildEnabled || vm.accUserRoles.indexOf('1')<=-1){
		      return;
	       }
            $scope.$broadcast('publishToBuild');
        }


        function openPublishSpecsPopup(){
	          if(!vm.docsEnabled){
		         return;
	          }
              if ($rootScope.smartRegisterDataDirty || $rootScope.plDataDirty) {
                  vm.checkAndShowDataShouldBeSavedMsg();
              } else {
                  ModalService.publishSpecsToDocsPopup().result.then(function (data) {});
              }
         }

        function getUserRoles() {
            UserService.getAccUserRoles(vm.accProject.id, function(response) {
                if(response && response.roles) {
                    vm.accUserRoles = response.roles;
                }
            });
        }

        function getPlanVersionIndex() {
            if(vm.selectedProject.planVersions) {
                return UtilService.findWithAttr(vm.selectedProject.planVersions, 'versionId', vm.selectedVersion.versionId);
            }
            return -1;
        }

        function getTypeOfSmartRegisterView() {
            var view = AuthenticationService.getSmartRegisterType();
            var planVersionIdx = ProjectService.getPlanVersionIndex(vm.selectedProject, vm.selectedVersion);
            if(planVersionIdx!==-1) {
                var planStatus = vm.selectedProject.planVersions[planVersionIdx].status.toLowerCase();
            }
            vm.smartRegisterType = (vm.selectedProject && vm.selectedProject.planViewFlag &&
                                    (vm.selectedVersion.status.toLowerCase()==='completed') &&
                                    (planStatus==='completed') && view) ? view : 'submittals';
        }

		vm.setSelectedView = function(selectedView) {
            if ($rootScope.smartRegisterDataDirty || $rootScope.plDataDirty) {
                showNavigateConfirmation(selectedView, null);
            } else {
                vm.smartRegisterType = selectedView;
                AuthenticationService.setSmartRegisterType(selectedView);
            }
		}

        function showNavigateConfirmation(selectedView, next) {
            var message = 'You have unsaved changes that will be lost if you decide to continue. <br> <b> Are you sure you want to leave this page? </b>';
			ModalService.OpenConfirmModal('Confirm navigation', message)
			.result.then(function () {
                $rootScope.smartRegisterDataDirty = false;
                $rootScope.plDataDirty = false;
                if(selectedView) {
                    vm.smartRegisterType = selectedView;
                    AuthenticationService.setSmartRegisterType(selectedView);
                } else if(next) {
	                var next_array = next.split('/');
                    var index = next_array.lastIndexOf("autospecs");
                    var next_location = next_array.slice(index + 1).join("/");
                    $location.path(next_location);
                }
            }, function() {});
        }

        $scope.$on('$locationChangeStart', function (event, next, current) {
            if (($rootScope.smartRegisterDataDirty || $rootScope.plDataDirty)) {
                event.preventDefault();
                showNavigateConfirmation(null, next);
            }
        });

        vm.navigateToCreateVersion = function() {
            AuthenticationService.SetLastRoute($location.path());
            $location.path('/uploadspecs');
		}

		vm.checkAddSpecsAvailable = function() {
			$scope.$broadcast('checkAddSpecsAvailable');
		}

		vm.checkAndUploadPlans = function(isUploadPlans) {
			$scope.$broadcast('checkAndUploadPlans', isUploadPlans);
		}

		vm.checkAndShowDataShouldBeSavedMsg = function() {
			$scope.$broadcast('checkAndShowDataShouldBeSavedMsg');
		}

		$scope.dismissPopOver = function (event) {
			$('.SpecSectionPDFicon').popover('hide');
			$('.schedulesLinkPDFicon').popover('hide');
		}

		vm.isExportOptionEnabled = function(optionName) {
			optionName = optionName ? optionName.toUpperCase() : optionName;
			return !(vm.readonly && (optionName === "BIM 360" || optionName === "BLUEBEAM STUDIO"));
		}

		vm.openConfirmExportPopup = function(downloadType, types) {
			var dataObj = { downloadType: downloadType, types: types };
			$scope.$broadcast('openConfirmExportPopup', dataObj);
		}

		vm.download = function(gridName) {
			var fileName = vm.selectedProject.name.replace(/['"]+/g, '') + "_" + vm.selectedVersion.name.replace(/['"]+/g, '') + "_";
			fileName = fileName.replace(/\s/g, '');
			var item = {};
			item.fileName = fileName;
			item.gridName = gridName;
			$scope.$broadcast("DownloadPDF", item);
            var moduleName = (vm.smartRegisterType === 'submittals') ? 'Smart Register' : 'Procurement Log';
			LogEvent(moduleName, "DownloadFile", "All Fields Exported Successfully.", "SUCCESS");
            FlashService.Success('Smart Register exported successfully.');
		}

		function LogEvent(moduleName, type, description, status, callback) {
			var logEvent = {};
			logEvent.moduleName = moduleName;
			logEvent.type = type;
			logEvent.description = description;
			logEvent.status = status;
			EventService.AddEvent(logEvent, vm.selectedProject.projectId, function (response) {
				if (callback) { callback(); }
			});
		}

		function getSelectedProject(versionQueryParam, callback) {
            var project = AuthenticationService.GetProject();
            if (project) {
                var version = AuthenticationService.GetVersion();
                returnUpdatedProject(project.projectId, function (data) {
                    vm.selectedProject = angular.copy(data);
                    if (!vm.selectedProject) {
                        $log.error("Unable to get the selected project with name : " + project.name);
                        return;
                    }
                    AuthenticationService.SetProject(vm.selectedProject);
                    // if version exists in query parameter
                    if(versionQueryParam) {
                    	 if(vm.selectedProject.versions && vm.selectedProject.versions.length>0) {
                            vm.selectedVersion = vm.selectedProject.versions.filter(function (data) {
                                if (data.versionId === parseInt(versionQueryParam))
                                    return data;
                            })[0];
                            AuthenticationService.SetVersion(vm.selectedVersion);
                            $location.search('version', null)
                        }
                    }
                    else if (version) {
                        if(vm.selectedProject.versions && vm.selectedProject.versions.length>0) {
							var selectedVersionIndex = data.versions.findIndex(function (data) {
	                         if (data.versionId === version.versionId)
	                                return data;
	                        });

							if(selectedVersionIndex != -1) {
								vm.selectedVersion = vm.selectedProject.versions[selectedVersionIndex];
							} else {
								vm.selectedVersion = vm.selectedProject.versions[0];
							}
                            AuthenticationService.SetVersion(vm.selectedVersion);
                        }
                    }
                    else {
                        vm.selectedVersion = vm.selectedProject.versions[0];
                    }

					// This is Just for checking whether Plan entry is created or not
					// In future, we need to put a check whether plans uploaded or not
//					checkForPlanExistence();
                    if(callback) callback();
                });
            }
        }

        function returnUpdatedProject(projectId, callback) {
            SmartRegisterService.GetProjectById(projectId, function (response) {
                if (response.success) {
                    callback(response.data);
                } else {
                    FlashService.Error(response.message);
                }
            });
        }

		function GetAvailableSystems() {
            CompanyService.GetAvailableSystems(function (response) {
                if (response.success) {
                    var systems = response.data;
                    var project = AuthenticationService.GetProject();
                    if (project.bluebeamFlag !== undefined && project.bluebeamFlag == 1) {
                        //Todo - Need to add this in the Database
                        var bluebeam = {};
                        bluebeam.value3 = 'excel';
                        bluebeam.domainName = 'Integration_System';
                        bluebeam.key1 = "Public_System";
                        bluebeam.value1 = "Bluebeam Studio";
                        bluebeam.value3 = vm.excelString;
                        bluebeam.domainId = 300;
                        systems.push(bluebeam);
                    }
    				if (project.aconexFlag !== undefined && project.aconexFlag == 1) {
                        //Todo - Need to add this in the Database
                        var aconex = {};
                        aconex.value3 = 'excel';
                        aconex.domainName = 'Integration_System';
                        aconex.key1 = "Public_System";
                        aconex.value1 = "Aconex";
                        aconex.value3 = vm.excelString;
                        aconex.domainId = 300;
                        systems.push(aconex);
    				}
                    formatExportSystemObject(systems);
                } else {
                    FlashService.Error(response.message);
                }
            });
        }

        function formatExportSystemObject(systems){
        	var index = -1;
        	angular.forEach(systems, function (value, key) {
                index = UtilService.findWithAttr(vm.availableExcelSystems, 'value1', value.value1);
                if (index <= -1) {
                	value.types = [{"domainid" : value.domainid, "value3" : value.value3, "value2" : value.value2}];
                	delete value.domainid;
                	delete value.value3;
                	delete value.value2;
					if(value.value1.toLowerCase() === 'pype') {
						vm.pypeExcelExport = angular.copy(value);
					} else {
						vm.availableExcelSystems.push(value);
					}
                }
                else {
                	vm.availableExcelSystems[index].types.push({"domainid" : value.domainid, "value3" : value.value3, "value2" : value.value2});
                }
            });
        }

		vm.GetExportLogos = function(exportType) {
			return ExportService.GetExportLogos(exportType);
		}

    }
})();

(function () {
    'use strict';

    angular.module('EventsApp').controller('AlertMessageController',
			AlertMessageController);

    AlertMessageController.$inject = ['$scope', '$rootScope', '$uibModalInstance',
			'items'];
    function AlertMessageController($scope, $rootScope, $uibModalInstance, items) {
        $scope.items = items;
        $scope.Close = function () {
            $uibModalInstance.close('cancel');
        };
    }
})();

(function () {
    'use strict';

    angular.module('EventsApp').controller(
			'ExportAsCMICController',
			ExportAsCMICController);

    ExportAsCMICController.$inject = ['$scope',
			'$uibModalInstance', 'items'];
    function ExportAsCMICController($scope, $uibModalInstance, items) {
        var vm = this;
        (function () {
            $scope.global = angular.copy(items);
        })();

        $scope.Submit = function (exportType) {
            $scope.global.exportType = exportType;
            $uibModalInstance.close({ global: $scope.global });
        };

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();

(function () {
    'use strict';

    angular.module('EventsApp').controller(
			'ExportToAconexController',
			ExportToAconexController);

    ExportToAconexController.$inject = ['$scope',
			'$uibModalInstance', 'items'];
    function ExportToAconexController($scope, $uibModalInstance, items) {
        var vm = this;
        (function () {
            $scope.global = angular.copy(items);
        })();

        $scope.Submit = function (exportType) {
            $scope.global.exportType = exportType;
            $uibModalInstance.close({ global: $scope.global });
        };

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
