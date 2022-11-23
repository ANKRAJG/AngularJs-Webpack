(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$location', 'ProjectService', 'AuthenticationService', 'SmartRegisterService',
        'FlashService', '$route', '$scope', 'EventService', '$timeout', 'ModalService', 'UserService', 'AccService',
        '$routeParams', '$rootScope', 'PendoService'];
    function DashboardController($location, ProjectService, AuthenticationService, SmartRegisterService,
            FlashService, $route, $scope, EventService, $timeout, ModalService, UserService, AccService,
            $routeParams, $rootScope, PendoService) {
        var vm = this;

        vm.StartNewProject = StartNewProject;
		vm.GoToRequirementsOverview = GoToRequirementsOverview;
		vm.prepareSearchDataAndNavigateToSmartRegister = prepareSearchDataAndNavigateToSmartRegister;
		vm.otherReqItemClicked = otherReqItemClicked;
        vm.Renew = Renew;
        vm.Upgrade = Upgrade;
        vm.ContactUs = ContactUs;
        vm.goToPreconDasboard = goToPreconDasboard;
		vm.goToContructionDasboard = goToContructionDasboard;
		vm.searchVersionNames = searchVersionNames;
		vm.clearSearchText = clearSearchText;
        vm.getFile = getFile;

		var categoriesMap = {"ActionInfoSubmittals" : "ACTION AND INFORMATIONAL", "CloseoutSubmittals" : "CLOSEOUT SUBMITTALS"};
		vm.toggleMoreActions = toggleMoreActions;
		vm.dropdownMenuOpened = dropdownMenuOpened;
        (function initController() {
              var accProjectId = $routeParams.id;
              vm.dataLoading = "Loading Dashboard, Please Wait...";
              AccService.initialiseACCDetails(accProjectId, function(){
                  getAccProjectDetails(accProjectId);
                  AuthenticationService.cleanUpWebStorages(localStorage);
                  AuthenticationService.cleanUpWebStorages(sessionStorage);
              //   getCompanyName();
                 loadDashboardData();
                 vm.loaded = 0;
                 vm.colorsMap = getColorsMap();
                 $scope.isOpen = false;
             });
        })();

        vm.gotoSuperAdmin = function() {
            window.open('/autospecs/superadmin', '_blank');
        }

        function dropdownMenuOpened() {
       		$scope.status = {};
        }

        function toggleMoreActions(version, versions) {
        	if($scope.status && $scope.status[version.versionId] && $scope.status[version.versionId]["isOpen"]) {
        		$scope.status[version.versionId]['isOpen'] = false;
        		return;
        	}
        	$scope.status = {};
        	for(var i = 0; i < versions.length; i++) {
        		$scope.status[versions[i].versionId] = {};
        		$scope.status[versions[i].versionId]["isOpen"] = false;
        	}
        	$scope.status[version.versionId]['isOpen'] = true;
        }

        function ContactUs() {
            $location.path('/contactus');
        }


		function getAccProjectDetails(accProjectId) {
            AccService.getProjectDetails(accProjectId).then(function (response) {
               vm.accProjectDetails = response.data;
               AuthenticationService.setAccProjectDetails(vm.accProjectDetails);
            });
		}

        function getFile(fileType, isValidationRequired) {
            vm.dataLoading = 'Downloading... Please wait';
            SmartRegisterService.downLoadFile(vm.selectedProject.projectId, vm.selectedVersion.versionId, fileType, function (response) {
                if (response.success) {
                    FlashService.Success(response.message);
                    vm.dataLoading = false;
                } else {
                    FlashService.Error(response.message);
                    vm.dataLoading = false;
                }
            }, false, isValidationRequired);
        }


        function getColorsMap() {
        	var colorsMap = [
    			{label: "Product Data", values: ["productdata"], color: "#4EDA65"},
    			{label: "Samples", values: ["samples"], color: "#D0E954"},
    			{label: "Certificates", values: ["certificates"], color: "#236B79"},
    			{label: "Performance Data", values: ["performancedata"], color: "#79E7C2"},
    			{label: "LEED", values: ["leed"], color: "#35AA96"},
    			{label: "Qualification Data", values: ["qualificationdata"], color: "#7EE04C"},
    			{label: "Manufacturer Instructions", values: ["manufacturerinstructions", "mfg.instructions"], color: "#3BBDA8"},

    			{label: "Shop Drawings", values: ["shopdrawings"], color: "#E1E154"},
    			{label: "Drawings", values: ["drawings"], color: "#2F9976"},
    			{label: "Certifications", values: ["certifications"], color: "#298080"},
    			{label: "Calculations", values: ["calculations"], color: "#1D5186"},

    			{label: "Reports", values: ["reports"], color: "#98E770"},
    			{label: "Test Reports", values: ["testreports"], color: "#F1F15A"},
    			{label: "TAB Reports", values: ["tabreports"], color: "#F9F9A5"},

    			{label: "As-Builts", values: ["as-builts"], color: "#C85252"},
    			{label: "Attic Stock", values: ["atticstock"], color: "#CE6854"},
    			{label: "Demonstrations", values: ["demonstrations"], color: "#D47F54"},
    			{label: "O&M Manuals", values: ["o&mmanuals"], color: "#E0AF4B"},
    			{label: "General Warranties", values: ["generalwarranties"], color: "#DA9652"},
    			{label: "Special Warranties", values: ["specialwarranties"], color: "#F1F15A"},
    			{label: "Maintenance Data", values: ["maintenancedata"], color: "#E1E154"},
    			{label: "Tests and Inspections", values: ["testsandinspections"], color: "#F9F9A5"},

    			{label: "Meetings / Conferences", values: ["meetings/conferences"], color: "#35B073"},
    			{label: "Delegated-Design", values: ["delegateddesign"], color: "#2F9393"},
    			{label: "Schedules", values: ["schedules"], color: "#E0F380"},

    			{label : "Other", values: ["other", "others"], color: "#3BCD53"}
            ];
        	return colorsMap;
        }

        function Upgrade(projectName) {
            var upgradeItems = PopulatingUserDetails(projectName);
            ModalService.showContactUsPopup(upgradeItems);
        }

        function LogEvent(type, description, status, callback) {
            var logEvent = {};
            logEvent.moduleName = "Home Page";
            logEvent.type = type;
            logEvent.description = description;
            logEvent.status = status;
            EventService.AddEvent(logEvent, vm.selectedProject.projectId, function (response) {
            	if(callback) callback();
            });
        }


        function getCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

        function loadUserDetails() {
			//vm.user = AuthenticationService.GetUserInfo();
            UserService.getUserDetails(function(response) {
                if (response.success) {
                    AuthenticationService.SetUserInfo(response.data);
                    vm.user = AuthenticationService.GetUserInfo();
                } else {
                    FlashService.Error(response.message);
                }
            });
		}

        function StartNewProject() {
            $location.path('/project');
        }

        function showUpgradetoSeePopup(project, items) {
			ModalService.showUpgradetoSeePopup(items)
            .result.then(function (data) {
                vm.modalTitle = 'Upgrade Project';
                Upgrade(project.name);
            });
        }

        function prepareSearchDataAndNavigateToSmartRegister(summary, category, sourceType){
        	if (vm.selectedProject.subscriptionStatus.toUpperCase() !== 'PAID' && !vm.user.isSuperAdmin) {
        		vm.UpgradeToSeeMsg = "Please upgrade to see more details";
                var items = {};
                items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                items.popupTitle = "Project Upgrade";
            	items.popupButtonName = "Upgrade";
                showUpgradetoSeePopup(vm.selectedProject, items);
                return ;
            }

        	var searchData = [];
        	if (summary == "ProjectSubmittals") {
        		if(typeof category === "string"){
        			searchData = [
                        { field: 'projectSummaryGroup', caption: 'Project Summary Group', value: [category.toUpperCase()]}
                    ];
        		} else if(category instanceof Array) {
        			try{
        				category = category.map(function(x){ return x.toUpperCase() });
        			}catch(ex){
        				console.log(ex);
        			}
        			searchData = [
                        { field: 'projectSummaryGroup', caption: 'Project Summary Group', value: category}
                    ];
        		} else {
        			searchData = [
                        { field: 'projectSummaryGroup', caption: 'Project Summary Group', value: [category]}
                    ];
        		}
            } else if (summary == "CloseoutSubmittals") {
                searchData = [
                    { field: 'projectSummaryGroup', caption: 'Project Summary Group', value: ["Closeout Submittals".toUpperCase()]},
                    { field: 'specCategoryGroup', caption: 'Spec Category Group', value: [category]}
                ];
            }
            else if(summary === "ActionInfoSubmittals"){
                searchData = [
                    { field: 'projectSummaryGroup', caption: 'Project Summary Group', value: ["Action And Informational".toUpperCase()]},
                    { field: 'specCategoryGroup', caption: 'Spec Category Group', value: [category]}
                ];
            }

        	var defaultFilterData = AuthenticationService.UpdateFilterDataAccordingToFormat([]);
        	var existingFilter = AuthenticationService.UpdateFilterDataWithNewValuesAndVisibility(defaultFilterData, searchData);
            if(sourceType) {
                AuthenticationService.setSRSourceModuleFilter([sourceType]);
            } else {
                AuthenticationService.setSRSourceModuleFilter(['specs', 'plans']);
            }

        	AuthenticationService.SetSmartRegisterFilter(existingFilter);
        	AuthenticationService.SetShowSaveSmartRegisterFilter(true);
            AuthenticationService.setSmartRegisterType('submittals');
        	//Logging navigation event
        	LogEvent("Category Clicked", "User clicked on category : " + category, "SUCCESS", function(){
        		$location.path('/smartregister/projects/' + $routeParams.id).search({param: 'home'});
              	$timeout(function(){
              		$scope.$apply();
              	}, 0);
        	});
        }


       function loadDashboardData() {
             var project = AuthenticationService.GetProject();
             if(project && project.projectId) {
                 loadUserDetails();
                 LoadProjects();
	         }
         }



        function formatVersionDateInProject(project) {
            if(project.targetEndDate && !moment(project.targetEndDate, 'D MMM YYYY HH:mm', true).isValid()) {
                project.targetEndDate = moment(project.targetEndDate).format('D MMM YYYY HH:mm');
            }
            if(project.versions && project.versions.length>0) {
                project.versions.forEach(function(version) {
                    if(version.runStartDate && !moment(version.runStartDate, 'D MMM YYYY HH:MM', true).isValid()) {
                        version.runStartDate = moment(version.runStartDate).format('D MMM YYYY HH:mm');
                    }
                });
            }
        }

        $scope.getUpdateTime = function(version) {
                    return moment(version.updateTime).format('D MMM YYYY HH:mm');
                }

        function LoadProjects(callback) {
            vm.accProject = AuthenticationService.GetACCProject();
        	var projects = AuthenticationService.GetUserProjects();
            if (projects.length == 0) {
                vm.NoProjects = true;
                vm.dataLoading = false;
            } else {
                vm.NoProjects = false;
                GetSelectedProject();
            }
        }

        vm.editDeleteVersion = function(version) {
            if (vm.selectedProject.isExpired && !vm.user.isSuperAdmin) {
                openSubscriptionEnablingPopups(vm.selectedProject);
            } else {
                ModalService.editVersionPopup(vm.selectedProject, version, 'versionEdit')
                .result.then(function() {
                    returnUpdatedProject(vm.selectedProject.projectId, function(project) {
                        AuthenticationService.SetProject(project);
                    });
                }, function() {});
            }
        }

        function openSubscriptionEnablingPopups(project) {
            if (project.subscriptionStatus.toUpperCase() === 'TRIAL') {
                showUpgradePopup(project);
            } else if (project.subscriptionStatus.toUpperCase() !== 'TRIAL') {
                showRenewPopup(project);
            }
        }

        function showUpgradetoSeePopup(project, items) {
            ModalService.showUpgradetoSeePopup(items)
            .result.then(function (data) {
                vm.modalTitle = 'Upgrade Project';
                Upgrade(project.name);
            });
        }

        function showUpgradePopup(project) {
            ModalService.showUpgradePopup(project)
            .result.then(function (data) {
                vm.modalTitle = 'Upgrade Project';
                Upgrade(project.name);
            });
        }

        function validateAndLoad() {
        	if(vm.selectedProject.isExpired && !vm.user.isSuperAdmin){
                vm.Selectedexpired = true;
        		if (vm.selectedProject.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    showUpgradePopup(vm.selectedProject);
                } else {
                	showRenewPopup(vm.selectedProject);
                }
                vm.dataLoading = false;
        	} else {
	            if(vm.selectedVersion && vm.selectedVersion.status.toLowerCase() === 'completed') {
		            LoadDashboardInfo(vm.selectedProject.projectId,vm.selectedVersion.versionId);
                    loadRequirementsOverViewData(vm.selectedProject.projectId,vm.selectedVersion.versionId);
	            } else {
		            vm.OtherRequirementsData = [];
                    vm.closeoutSubmittalsData = [];
                    vm.actionInfoSubmittalsData = [];
                    vm.NoData = true;
                    vm.dataLoading = false;
	          }
            }
        }

        function showRenewPopup(project) {
            ModalService.showRenewPopup(project)
            .result.then(function(data) {
                vm.modalTitle = 'Renew Project';
                Renew(project.name);
            });
        }

        function Renew(projectName) {
            $scope.user = vm.user;
            var renewItems = PopulatingUserDetails(projectName);
            renewItems.RequestType = "Renew project for " + projectName;
            ModalService.showRenewProjectPopup(renewItems);
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

        vm.navigateToCreateVersion = function() {
            AuthenticationService.SetLastRoute($location.path());
            $location.path('/uploadspecs');
        }

        function GetSelectedProject() {
            var project = AuthenticationService.GetProject();
            if (project) {
                var version = AuthenticationService.GetVersion();
                returnUpdatedProject(project.projectId, function (data) {
                    vm.selectedProject = angular.copy(data);
                    formatVersionDateInProject(vm.selectedProject);
                    if (!vm.selectedProject) {
                        $log.error("Unable to get the selected project with name : " + project.name);
                        return;
                    }
                    AuthenticationService.SetProject(vm.selectedProject);
                    vm.userSearchedVersionList = vm.selectedProject.versions;
                    if (version) {
						var selectedVersionIndex = data.versions.findIndex(function (data) {
	                       if (data.versionId === version.versionId)
	                                return data;
	                    });

						if(selectedVersionIndex != -1) {
							vm.selectedVersion = vm.selectedProject.versions[selectedVersionIndex];
						} else {
							vm.selectedVersion = vm.selectedProject.versions[0];
						}


                    } else {
                          var currentVersionArray = vm.selectedProject.versions.filter(function(v){return v.currentVersion === true});
                         if(currentVersionArray && currentVersionArray.length > 0){
	                           vm.selectedVersion = currentVersionArray[0];
	                       }else{
		                     vm.selectedVersion = vm.selectedProject.versions[0];
	                      }
                    }
                    if(vm.selectedVersion) {
                        AuthenticationService.SetVersion(vm.selectedVersion);
                    }
                    vm.showPreconDashboardTab =  vm.selectedProject.preconDashBoardFlag && (vm.user.isPreconAdmin || vm.user.isPreconUser) ;
                    checkIfPlansExist();
                    validateAndLoad();
                    vm.loadNoResultStates = true;
                    LogEvent("Page Visit", "User visited Home page.", "SUCCESS");
                });
            }
        }

       function searchVersionNames(searchText){
	      vm.userSearchedVersionList = [];
	      vm.selectedProject.versions.forEach(function(item){
		        if(item.name.toUpperCase().indexOf(searchText.toUpperCase()) > -1){
			       vm.userSearchedVersionList.push(item);
		     }
	      });
        }

        function clearSearchText(){
	       vm.searchText = "";
	       vm.userSearchedVersionList = vm.selectedProject.versions;
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

        function checkIfPlansExist() {
            var planVersionIdx = ProjectService.getPlanVersionIndex(vm.selectedProject, vm.selectedVersion);
            vm.ifPlansExist = vm.selectedProject.planViewFlag && planVersionIdx!==-1;
        }

        function LoadDashboardInfo(projectId,versionId) {
            ProjectService.GetSummary(projectId,versionId, function (response) {
                if (response.success) {
                    vm.colours = ['#827DB3', '#0072BC', '#99C8B7', '#0D84DF', '#000AF3', '#949FB1', '#F42053'];
                    vm.chartOptions = {
                        responsive: true,
                        //animation: false,
                        elements: {
                            arc: { borderWidth: 0 }
                        },
                        legend: {
                          display: false,
                        },
                        title: {
                          display: false,
                          text: '' //Chart.js Doughnut Chart
                        },
                    };

                    vm.closeoutSubmittals = response.data.charts[0];
                    vm.closeoutSubmittalsData = vm.closeoutSubmittals.data;
                    vm.closeoutColours = getColorsByLabel(vm.closeoutSubmittals.labels);

                    var OtherRequirements = response.data.charts[1];
                    reduceOtherReqDataAndLabels(OtherRequirements.labels, OtherRequirements.data);
                    vm.OtherRequirements = prepareOtherRequirementsData(vm.OtherRequirementsLabels, vm.OtherRequirementsData);
                    vm.OtherRequirementsCount = vm.OtherRequirementsData.reduce(function (pv, cv) { return pv + cv; }, 0);

                    vm.actionInfoSubmittals = response.data.charts[2];
                    vm.actionInfoSubmittalsData = vm.actionInfoSubmittals.data;
                    vm.actionInfoColours = getColorsByLabel(vm.actionInfoSubmittals.labels);

                    vm.NoData = !(vm.NoProjects || vm.actionInfoSubmittalsData.length || vm.OtherRequirementsData.length || vm.closeoutSubmittalsData.length);
                } else {
                    vm.OtherRequirementsData = [];
                    vm.closeoutSubmittalsData = [];
                    vm.actionInfoSubmittalsData = [];
                    vm.NoData = true;
                }
                vm.dataLoading = false;
            });
            function getColorsByLabel(labels) {
            	var extraColors = [ '#2F9976', '#A9EDA9', '#8f7184', '#b97575', '#a3ac79', '#587394', '#b895ab', '#e19292', '#c6d096', '#899bb0', '#d8bfcf', '#f6b0b0' ];
            	var colors = [], tempVal, backupIndex = 0, gotColor;
            	for (var ind = 0; ind < labels.length; ind++) {
            		tempVal = labels[ind], gotColor = false;
            		if (tempVal) {
            			tempVal = tempVal.replace(/\s/g, "").toLowerCase();
            			for (var mapIndex = 0; mapIndex < vm.colorsMap.length; mapIndex++) {
            				if (vm.colorsMap[mapIndex] && vm.colorsMap[mapIndex].values.indexOf(tempVal) > -1) {
            					colors.push(vm.colorsMap[mapIndex].color);
            					gotColor = true;
            					break;
            				}
            			}
            			if (!gotColor) {
            				colors.push(extraColors[backupIndex++]);
            			}
            		}
            	}
            	if (colors && colors.length > 0) {
            		return colors;
            	}
            	return extraColors;
            }
            function reduceOtherReqDataAndLabels(labels, data){
            	var ignoreList = ["ACTION AND INFORMATIONAL", "CLOSEOUT SUBMITTALS"], newLabelList = [], newDataList = [];
            	for(var i=0;i<labels.length;i++){
            		if(ignoreList.indexOf(labels[i].toUpperCase()) === -1){
            			newLabelList.push(labels[i]);
            			newDataList.push(data[i]);
            		}
            	}
            	vm.OtherRequirementsLabels = newLabelList;
            	vm.OtherRequirementsData = newDataList;
            }

            function prepareOtherRequirementsData(labelList, dataList){
            	var newList = [];
            	try{
	            	for(var i=0;i<labelList.length;i++){
	            		newList.push({label : labelList[i], data : dataList[i]});
	            	}
	            }catch(ex){
	            	console.log(ex);
	            }
            	return newList;
            }
        }

        function loadRequirementsOverViewData(projectId,versionId){
            SmartRegisterService.GetRequirementsMatrixData(projectId, versionId, function (response) {
                if(response.success && response.data) {
                    var data = response.data;
                    var requirementsData = [];
                    for (var i = 0; i < data.length; i++) {
                    	var requirementDataObject = {};
                    	var label = "Division " + data[i].divisionCode + (data[i].divisionName ? ' - ' + data[i].divisionName : '');
                    	requirementDataObject['label'] = label;
                    	requirementsData.push(requirementDataObject);
                    }
                    vm.requirementsOverViewData = requirementsData;
                }
            });
        }
        function GoToRequirementsOverview(label) {
            $location.path('/requirementsoverview/projects/' + $routeParams.id).search({label: label});
        }

        function otherReqItemClicked(category){
        	var summary = "ProjectSubmittals";
        	prepareSearchDataAndNavigateToSmartRegister(summary, category);
        }

        function goToPreconDasboard() {
        	AuthenticationService.setDashboardViewType('precon');
			$location.path('precondashboard');
		}

		function goToContructionDasboard() {
			AuthenticationService.setDashboardViewType('home');
			$location.path('home');
		}

        vm.changeVersion = function(version) {
            vm.selectedVersion = version;
            AuthenticationService.SetVersion(version);
            $route.reload();
        }

        vm.deleteConfirmation = function(version) {
            ModalService.deleteVersionConfirmPopup(version, 'versionEdit').result.then(function() {
                checkAndDeleteVersion(version);
            });
        }

        vm.updateCurrentVersion = function(version){
	      if(version.currentVersion){
		     return;
	      }
	      var project = vm.selectedProject;
	      AccService.updateCurrentVersionOfProject(project.projectId, version.versionId).then(function(response){
		        if(response.data && response.data.success){
			        vm.selectedProject.versions.forEach(function(item){
			                                                 if(item.currentVersion){
			                                                    item.currentVersion = false;
		                                                     }
                                                              if(item.versionId === version.versionId){
	                                                            item.currentVersion = true;
                                                             }
                                                    });
                     vm.userSearchedVersionList = vm.selectedProject.versions;
                     vm.changeVersion(version);
	             }
             }).catch(function(error) {
                 FlashService.Error('Failed to update current version');
              });
          }

        function checkAndDeleteVersion(version) {
            var project = vm.selectedProject;
            if (project.versions.length > 1) {
               if (version.status.toLowerCase() !== 'in progress') {
                    deleteVersion(project.projectId, version.versionId);
               } else {
                   FlashService.ErrorWithTimeInterval('In progress project versions cannot be deleted. Try again after the process is complete.', null, 5);
               }
            } else {
                FlashService.ErrorWithTimeInterval('You can not delete the version as its the only version of the project.', null, 5);
            }
        }

        function deleteVersion(projectId, versionId) {
            vm.dataLoading = "Deleting Version... Please wait...";
            ProjectService.DeleteVersion(projectId, versionId, function (response) {
               if (response.success) {
                   returnUpdatedProject(projectId, function(project) {
                       AuthenticationService.SetVersion(project.versions[0]);
                       FlashService.SuccessWithTimeInterval('Version deleted successfully.', true, 0.5);
                       $route.reload();
                   });
               } else {
                   FlashService.Error(response.message);
               }
               vm.dataLoading = false;
           });
        }

    }
})();
