/**GUIDLINES FOR FILTERS**
vm.columnsTotalVarData
	allVar - Variable name which will hold all the items(objects) of the current columns
	searchVar - Variable name which is the search model name
	form - Variable name which will hold the column related form value(helpful to disable or enable the apply filters button)
	mapValue - key name inside the item object that we create initially
	mapName - Readable name for actual column name
	filterItem - Variable name which will hold the filterItem(use to show or hide column dropdown)
	number - Variable name which will hold the number of items present for the current column
	selectAllVar - Variable name which will hold the flag value of select all checkbox


To Add a new filter column, follow these steps

In Controller File :
	1)Fill the values of the columns in 'vm.columnsTotalVarData' and 'vm.columnsList'
		(make sure key in columnsTotalVarData and value in columnsList are always the actual column key)
	2)prepareQuickFiltrDataNComboOptions Method
		Get the unique value of related column
		prepareRequired data objects just like others
	3)update code in 'ApplyFiltersForAll' method inorder to consider new column as well
In View File :
	1)Add the new column as a list item in Filter Dropdown
	2)Create a new dropdown using others and change the values related to new one
		i) Change the currentKey value to current column name
		ii)Change all the labels name and id everything to column specific or else dropdown will close on click of items
******************************/

(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('SubmittalsController', SubmittalsController);

    SubmittalsController.$inject = ['$location', '$rootScope', 'FlashService', 'SmartRegisterService', 'CompanyService', 'ProjectService', 'AddendumService', 'AuthenticationService',
                                    'ModalService', '$scope', '$routeParams', '$window', 'APIURL', '$linq', '$timeout', '$uibModal', 'MAINURL', '$route',
                                    'ProductDataService', 'ProcoreIntegrationService', 'BlueBeamIntegrationService', 'BIMIntegrationService', 'AconexIntegrationService', '$log', 'EventService',
                                    'RememberService', '$aside','ExportService', 'UtilService', 'EXPORT_INTEGRATION','GlobalPropertyService','PlanViewService', 'ProjectSightService'];
    function SubmittalsController($location, $rootScope, FlashService, SmartRegisterService, CompanyService, ProjectService, AddendumService, AuthenticationService,
                                    ModalService, $scope, $routeParams, $window, APIURL, $linq, $timeout, $uibModal, MAINURL, $route,
                                    ProductDataService, ProcoreIntegrationService, BlueBeamIntegrationService, BIMIntegrationService, AconexIntegrationService, $log, EventService,
                                    RememberService, $aside,ExportService, UtilService, EXPORT_INTEGRATION,GlobalPropertyService,PlanViewService, ProjectSightService) {

        var vm = this;
        vm.SpecNotification = SpecNotification;
        vm.GetNonSubmittalHeadings = GetNonSubmittalHeadings;
        vm.AddHeadingsToSmartRegister = AddHeadingsToSmartRegister;
        vm.GetProjectSummaryGroups = GetProjectSummaryGroups;
        vm.ModifySectionHeading = ModifySectionHeading;
        vm.StartNewProject = StartNewProject;
        vm.GetFile = GetFile;
        vm.Save = Save;
        vm.OpenNotification = OpenNotification;
        /*vm.RemoveFilterItem = RemoveFilterItem;*/
        vm.RemoveNotification = RemoveNotification;
        vm.ContactUs = ContactUs;
        vm.Upgrade = Upgrade;
        vm.Share = Share;
        vm.showUndoConfirmation = showUndoConfirmation;
        vm.validateAndDownload = validateAndDownload;
        vm.showUpgradetoSeePopup = showUpgradetoSeePopup;
        vm.NavigateToCompareVersion = NavigateToCompareVersion;
        vm.CheckIfSharingEnabled = CheckIfSharingEnabled;
        vm.ProductData = ProductData;
        vm.CheckAndNavigateToProducts = CheckAndNavigateToProducts;
        vm.NavigateToAconex = NavigateToAconex;
        vm.DownloadRequirementsMatrix = DownloadRequirementsMatrix;
        vm.ShowRequirementsOverviewDialog = ShowRequirementsOverviewDialog;
        vm.ShowCopySubmittalsPopup = ShowCopySubmittalsPopup;
        vm.SaveUserPreferenceColumns = SaveUserPreferenceColumns;
        vm.manageSmartRegisterColumns = manageSmartRegisterColumns;
        vm.saveCustomColumns = saveCustomColumns;
        vm.canShowAddEditSmartColumns = canShowAddEditSmartColumns;
        vm.NavigateToCreateAddendum = NavigateToCreateAddendum;
        vm.GoBackToPreviousStep = GoBackToPreviousStep;
        vm.GoToSpecView = GoToSpecView;
		vm.GoToPlanView = GoToPlanView;
		vm.openScheduleInPlanview = openScheduleInPlanview;
        vm.downloadType = ''; vm.FileType = -1;
        vm.RevisedLabel = '_revised_';
        vm.unsavedChangesTitle = 'Alert';
        vm.unsavedChangesMessage = 'You have made changes to Smart Register. Please save or undo the changes before proceeding.';
        vm.SmartRegisterChanged = false;
        vm.NavigateToScheduleTitles = NavigateToScheduleTitles;
        vm.NavigateToSpecsToSchedules = NavigateToSpecsToSchedules;
        vm.NavigateToSubmittalSchedule = NavigateToSubmittalSchedule;
        vm.refreshSNo = refreshSNo;
        vm.initiateMergeOp = initiateMergeOp;
        vm.GoToRiggingPlan = GoToRiggingPlan;
		vm.openRiggingPlanPopup = openRiggingPlanPopup;
		vm.openHistorySlide = openHistorySlide;

        vm.toggleAllDivisionFiltersSelection = toggleAllDivisionFiltersSelection;
        vm.toggleAllSpecSectionFiltersSelection = toggleAllSpecSectionFiltersSelection;
        vm.toggleAllCommonFiltersSelection = toggleAllCommonFiltersSelection;
        vm.restFilterDropdowns = restFilterDropdowns;
		vm.resetToDefaultFilter = resetToDefaultFilter;
        vm.removeFilterItem = removeFilterItem;
        vm.toggleFilterDropdown = toggleFilterDropdown;
		vm.checkAndShowDataShouldBeSavedMsg = checkAndShowDataShouldBeSavedMsg;

        /*vm.editFilter = editFilter;*/
        vm.saveLinkClicked = saveLinkClicked;
        vm.deleteFilter = deleteFilter;
        vm.changeCurrentFilter = changeCurrentFilter;
        vm.addToFilterClicked = addToFilterClicked;
        vm.onToolbarColumnsClick = onToolbarColumnsClick;
		vm.downloadDrawings = downloadDrawings;
        var items = {};

        $scope.hideAppliedFilters = false;
        $scope.filteredItemsList = [];
        $scope.visibleColumnsList = [];

        vm.columnsList = {division : 'divisionCode', specSection : 'specSection', submittalGroup : 'projectSummaryGroup', submittalType : 'specCategory', specCategoryGroup : 'specCategoryGroup', subContractor : 'subContractor'};

        vm.columnsTotalVarData = {
        		divisionCode : {allVar : 'allDivisions', searchVar : 'searchDivisionCodes', form : 'divisionFormDirty', mapValue : 'divisionCode', mapName : 'Division Code', filterItem : 'divisionFilterItem',  number : 'numberOfDivisions', selectAllVar : "divisionCodeSelectAll"},
        		specSection : {allVar : 'allSpecSections', searchVar : 'searchSpecSections', form : 'specSectionFormDirty', mapValue : 'specSection', mapName : 'Spec Section', filterItem : 'specSectionFilterItem',  number : 'numberOfSpecSections', selectAllVar : "specSectionSelectAll"},
        		projectSummaryGroup : {allVar : 'allProjectSummaryGroups', searchVar : 'searchSubmittalGroups', form : 'submittalGroupFormDirty', mapValue : 'value', mapName : 'Project Summary Group', filterItem : 'projectSummaryGroupsFilterItem',  number : 'numberOfSummaryGroups', selectAllVar : "projectSummaryGroupSelectAll"},
        		specCategory : {allVar : 'allSpecCategories', searchVar : 'searchSubmittalTypes', form : 'specCategoryFormDirty', mapValue : 'value', mapName : 'Submittal Type', filterItem : 'specCategoriesFilterItem',  number : 'numberOfSpecCategories', selectAllVar : "specCategorySelectAll"},
        		specCategoryGroup : {allVar : 'allSpecCategoryGroups', searchVar : 'searchSpecCategoryGroups', form : 'specCategoryGroupFormDirty', mapValue : 'value', mapName : 'Submittal Type Group', filterItem : 'specCategoryGroupFilterItem',  number : 'numberOfSpecCategoryGroups', selectAllVar : "specCategoryGroupSelectAll"},
            	subContractor : {allVar : 'allSubContractors', searchVar : 'searchSubContractors', form : 'subContractorFormDirty', mapValue : 'value', mapName : 'Subcontractor', filterItem : 'subContractorFilterItem',  number : 'numberOfSubContractor', selectAllVar : "subContractorSelectAll"}
        };

        var emptyValuesLabel = "(empty)";
        $scope.showHideFiltersBtn = false;
        var userTour = null;
        $scope.showHideOverflowLink = true;
        vm.displayShowMore = false;
        vm.excelString = "EXCEL";
        vm.csvString = "CSV";
//      vm.readonly = $rootScope.globals.userInfo.isReadonly;
        vm.readonly = false;

        $scope.myPopover = {

            isOpen: false,

            templateUrl: 'projectGroupFilterTemplate.html',

            open: function open() {
                $scope.myPopover.isOpen = true;
            },

            close: function close() {
                AuthenticationService.SetDonotShowProjectGroupFilterAlert($scope.myPopover.donotShowProjectGroupFilterAlert);
                $scope.myPopover.isOpen = false;
            }
        };


        (function initController() {
            LoadUserDetails();
            EmptyStackData();
			vm.initialLoadFlag = true;
            vm.DrawingSpecSections = ["Schedules", "Product Data", "Shop Drawings"];
            CheckShareButtonEnable();
            vm.submittalregisters = [];
            vm.MaxId = -1;

            vm.selectedItem = "PDF";
            vm.SubmittalsCategory = 'Submittals Register';
            vm.loaded = 0;
            $scope.notify = 'notifications';
            $scope.user = vm.user;
            getSelectedProject();
            GetCompanyName();
            //createTour();
            initializeAllFilterItems();
            vm.wrapTextFlag = AuthenticationService.getWrapTextFlag();
            GetGlobalUISettings();
        })();

		function LoadUserDetails() {
  			vm.user = AuthenticationService.GetUserInfo();
		}

        vm.setSmartGrid = function(g) {
        	vm.smartRegisterGrid = g;
        }

        vm.getSmartGrid = function() {
        	return vm.smartRegisterGrid;
        }

		function showTrialLimitPopup(data) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: MAINURL
						+ 'views/common/trialprojectpopupsmart.view.html?version=9.2',
                controller: 'TrialProjectSmartCtrl',
                backdrop: 'static',
                windowClass: 'alert-createclass',
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

		vm.navigateToCreateVersion = function() {
			AuthenticationService.SetLastRoute($location.path());
			$location.path('/uploadspecs');
		}

		function GetGlobalUISettings(){
			vm.globalUISettings = GlobalPropertyService.getGlobalUISettings();
			vm.scheduleSubmittalTypes = vm.globalUISettings['schedule-submittal-types'];
		}

		$scope.$on('checkAndUploadPlans', function(event, flag) {
			checkAndUploadPlans(flag);
		});

		function checkAndUploadPlans(isUploadPlans) {
			ProjectService.checkAndUploadPlans(isUploadPlans, vm.selectedProject, vm.selectedVersion, function(reloadRoute) {
				if(reloadRoute) {
					$rootScope.$broadcast('updateProjectInList');
					$route.reload();
				}
			});
		}

        function initializeAllFilterItems(){
        	$scope.divisionFilterItem = {selected:true};
            $scope.specSectionFilterItem = {selected:true};
            $scope.projectSummaryGroupsFilterItem = {selected:true};
            $scope.specCategoriesFilterItem = {selected:true};
            $scope.specCategoryGroupFilterItem = {selected:false};
            $scope.subContractorFilterItem = {selected:false};
        }

        function LogEvent(type, description, status, callback) {
            var logEvent = {};
            logEvent.moduleName = "Smart Register";
            logEvent.type = type;
            logEvent.description = description;
            logEvent.status = status;
            EventService.AddEvent(logEvent, vm.selectedProject.projectId, function (response) {
            	if(callback) callback();
            });
        }

        $scope.toggleFiltersCollapse = function(){
        	/*this.$parent.hideOverFlowingRows = !this.$parent.hideOverFlowingRows;*/
        	vm.displayShowMore = !vm.displayShowMore;
        }

		vm.wrapTextToogle = function(gridName) {
			vm.dataLoading = "Loading...Please wait";
			AuthenticationService.setWrapTextFlag(vm.wrapTextFlag);
			$timeout(function() {
				// the third parameter is passed to prevent grid reset, without which checkboxes does not retain
				// their selection
				$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData, undefined, true);
				$scope.$emit('searchedFromCtrl');
				vm.dataLoading = false;
			}, 250);
		}

		$scope.$on('searchInSRFromBox', function(event, searchText) {
            vm.searchBoxText = searchText;
        });

		$scope.$on('sendSearchRecordIndexes', function(event, data) {
			vm.searchedRecordsIndexes = data;
		});

        function createTour(){
        	try{
	        	userTour = new Tour({
	        		  storage: false,
	        		  orphan : true,
	        		  backdrop : true,
	            	  steps: [
	            	    {
	            	    	element: "",
	            	      	title: "Smart Register Tour",
	            	      	content: "Welcome to AutoSpecs! This guided tour will teach you the basics of working with the submittal register and exporting a submittal log.",
	            	    },
	            	    {
	            	    	element: "",
	            	      	title: "Smart Register Tour",
	            	      	content: "The Smart Register will display all of the project submittals, Division 1 requirements, QA/QC obligations, and test & inspections requirements for your project.",
	            	    },
	            	    {
	            	    	element: "#ddMBtnColumns",
	            	    	placement : "right",
	            	      	title: "Smart Register Tour",
	            	      	content: "To filter the display to include just the submittals, click “Add Filters,” select “Submittal Group,” and then select the filters you would like applied. This is typically Action and Informational, Closeout Submittals, and Mockups.",
	            	    },
	            	    {
	            	    	element: "#add-filters-container>.dropdown-menu",
	            	    	placement : "right",
	            	      	title: "Smart Register Tour",
	            	      	content: "You can also filter the display by Division, Spec Section, Submittal Type, Submittal Type Group, and Submittal Group using these buttons here. Multiple filters can be selected at the same time in order to narrow down the submittals displayed.",
	            	      	onNext : function(){
	            	      		var menu = $('#add-filters-container');
	            	      		if(menu.hasClass('open')){
	            	      			menu.removeClass('open');
	            	      		}
	            	      	},
	            	      	onPrev : function(){
	            	      		var menu = $('#add-filters-container');
	            	      		if(menu.hasClass('open')){
	            	      			menu.removeClass('open');
	            	      		}
	            	      	}
	            	    },
	            	    {
	            	    	element: ".filter-operations",
	            	    	placement : "auto",
	            	      	title: "Smart Register Tour",
	            	      	content: "To save your current view, click the 'Save' button. To go back to your last saved filter, click on the 'Last Saved' button. To clear all filters currently select, click on the 'Clear' button here."
	            	    },
	            	    {
	            	    	element: "#tb_submittalRegisterGrid_toolbar_item_w2ui-search",
	            	    	placement : "right",
	            	      	title: "Smart Register Tour",
	            	      	content: "To search through your submittals, use this search bar here and type in the text you would like to search for."
	            	    },
	            	    {
	            	    	element: "#tb_submittalRegisterGrid_toolbar_item_add",
	            	    	placement : "auto",
	            	      	title: "Smart Register Tour",
	            	      	content: "Use the Add button to create a new submittal."
	            	    },
	            	    {
	            	    	element: "#tb_submittalRegisterGrid_toolbar_item_delete",
	            	    	placement : "auto",
	            	      	title: "Smart Register Tour",
	            	      	content: "Delete button to remove one and/or multiple submittals from the Smart Register."
	            	    },
	            	    {
	            	    	element: "#tb_submittalRegisterGrid_toolbar_item_copy",
	            	    	placement : "auto",
	            	      	title: "Smart Register Tour",
	            	      	content: "You can make a single copy or multiple copies of a submittal with the Copy button."
	            	    },
	            	    {
	            	    	element: "#tb_submittalRegisterGrid_toolbar_item_bulkEdit",
	            	    	placement : "auto",
	            	      	title: "Smart Register Tour",
	            	      	content: "Bulk Update allows you to quickly modify the data associated with multiple submittals."
	            	    },
	            	    {
	            	    	element: ".actionsDropdown>.dropdown-menu",
	            	    	placement : "top",
	            	      	title: "Smart Register Tour",
	            	      	content: "Under Actions you can merge multiple submittals into a single item, reset the submittal numbers so that they are in sequential order, view the edit history for the project, download the specifications as a PDF document, or download the specifications as individual spec section PDFs."
	            	    },
	            	    {
	            	    	element: ".share-btn",
	            	    	placement : "auto",
	            	      	title: "Smart Register Tour",
	            	      	content: "To provide other project team members with access to this project, click on the Share button and enter in their email address(es). "
	            	    },
	            	    {
	            	    	element: "#spec-versions-btn-container>.dropdown-menu",
	            	    	placement : "top",
	            	      	title: "Smart Register Tour",
	            	      	content: "Under Spec Versions you can add a new version of the specs, replace a version of the specs, compare different versions of the specs, copy submittals from one version to another, and add an addendum to the current version."
	            	    },
	            	    {
	            	    	element: "#products-smart-link",
	            	    	placement : "auto",
	            	      	title: "Smart Register Tour",
	            	      	content : "You can view the product data contained in Part 2 of each spec section by clicking on the Products button here or here."
	            	    },
	            	    {
	            	    	element: "#exportLabel",
	            	    	placement : "left",
	            	      	title: "Smart Register Tour",
	            	      	content: "When you have completed editing the submittal register and are ready to export to a project management software, click on the Export button. Then in the drop-down list, select the required export format and follow the directions to successfully export."
	            	    }
	            	  ],
	            	  onNext: function (tour) { tour.isNext = true;},
	            	  onPrev: function (tour) { tour.isNext = false;},
	            	  onShow: function(tour) {
	            		    var cs = tour.getCurrentStep();
	            		    if((cs === 2 && tour.isNext) || (cs === 4 && tour.isNext === false)){
	            		    	$timeout(function() {
	            		    		var $menu = $('#add-filters-container');
									if(!$menu.hasClass('open')){
										$menu.addClass('open');
									}
								}, 100);
	            		    } else if ((cs === 9 && tour.isNext) || (cs === 11 && tour.isNext === false)) {
								$timeout(function() {
									var $actionsBtn = $('.actionsDropdown');
									if(!$actionsBtn.hasClass('open')){
										$actionsBtn.addClass('open');
									}
								}, 100);
	            		    } else if ((cs === 11 && tour.isNext) || (cs === 13 && tour.isNext === false)) {
								$timeout(function() {
									var $specVersionsBtn = $('#spec-versions-btn-container');
									if(!$specVersionsBtn.hasClass('open')){
										$specVersionsBtn.addClass('open');
									}
								}, 100);
		            		}
	            		  }
	            	});
	        	userTour.init(true);
        	} catch(ex){
        		console.log(ex);
        	}
        }

        $scope.startTour = function() {
        	try{
	        	if(userTour){
	        		if(!userTour._inited){
	        			userTour.init(true);
	        		}
	        	} else {
	        		createTour();
	        	}
	        	//Reset the step
	        	userTour.restart(true);
	        	userTour.goTo(0);
        	}catch(ex){
        		console.log(ex);
        	}
        };

        function saveLinkClicked(){
        	if(!vm.currentFilter){
        		vm.filterName = "";
        		vm.filterDescription = "";
        		vm.currentPreferenceId = -1;
        	} else {
        		vm.filterName = (vm.currentFilter.name.toUpperCase() === 'LASTAPPLIEDFILTER' || vm.currentFilter.name.toUpperCase() === 'DEFAULT') ? '' : vm.currentFilter.name;
        		vm.filterDescription = vm.currentFilter.description;
        		vm.currentPreferenceId = vm.currentFilter.preferenceId;
        	}
        	vm.filterPopoverIsOpen = true;
        }

        function addToFilterClicked() {
						vm.newFilterCreated = true;
	        	callSaveFilters();
	    		  vm.filterPopoverIsOpen = false;
        }

		function openHistorySlide() {
			if (vm.selectedProject) {
				ProductDataService.CheckHistoryFlag(vm.selectedProject.projectId,
					 function (response) {
						 if (response.success) {
							 checkHistoryEnable(response.data);
						 } else {
							 FlashService.Error(response.message);
						 }
					 });
			} else {
				goToHistoryPage();
			}
		}

		function openSpecSectionLogSlider(){

			var projectData = {projectId:vm.selectedProject.projectId,
							   versionId:vm.selectedVersion.versionId,
							   projectName: vm.selectedProject.name}

			var specSectionLogAside = $aside({
				scope: $scope,
				backdrop: "static",
				keyboard: false,
				templateUrl: MAINURL + 'views/smartregister/submittals/specsectionlog.view.html',
				controller: 'SpecSectionLogController',
				controllerAs: 'vm',
				placement: 'right',
				resolve: {
					projectData: function() {
						return projectData;
					}
				}
			});

			// Show when some event occurs (use $promise property to ensure the template has been loaded)
			specSectionLogAside.$promise.then(function () {
				specSectionLogAside.show();
			});
		}

		function goToHistoryPage() {
			var createHistoryClassAside;
			createHistoryClassAside = $aside({
					scope: $scope,
					backdrop: "static",
					keyboard: false,
					templateUrl: MAINURL + 'views/smartregister/submittals/smartregisterHistory.view.html',
					controller: 'SmartRegisterHistoryController',
					controllerAs: 'vm',
					placement: 'right',
					resolve: {
						historySerialNumber: function() {
							return vm.historySerialNumber;
						}
					}
			});

			// Show when some event occurs (use $promise property to ensure the template has been loaded)
			createHistoryClassAside.$promise.then(function () {
				createHistoryClassAside.show();
			});
		}

        function deleteFilter(filter){
        	if(filter){
	    				var message = "Are you sure you want to delete the filter named '" + filter.name + "'?";
	        		var title = "Confirm delete";
							ModalService.OpenConfirmModal(title, message, false)
	          	.result.then(function () {
	            	DeleteSpecificFilter(filter.preferenceId);
	          	}, function() {});
        	}
        }

        function downloadDrawings(fileId,fileType){
        	vm.dataLoading = "Downloading files... Please wait";
			PlanViewService.DownloadPlanLogFiles(vm.selectedProject.projectId,vm.selectedVersion.versionId,fileId,fileType,
					function(response) {
						if (response.success) {
							FlashService.Success(response.message);
							vm.dataLoading = false;
						} else {
							FlashService.Error(response.message);
							vm.dataLoading = false;
						}
			});
        }

        function DeleteSpecificFilter(filterId){
        	vm.dataLoading = "Deleting filter... Please wait...";
            AuthenticationService.DeleteFilterPreferences(vm.user.userId, filterId, function (response) {
                vm.dataLoading = false;
                if (response.success) {
                    FlashService.Success(response.message);
                    AuthenticationService.SetListOfFilters(response.data);
										var filtersListOriginal = response.data;
                    if(filterId === vm.currentFilter.preferenceId) {
											for(var i=0;i<filtersListOriginal.length;i++) {
												if(filtersListOriginal[i] && filtersListOriginal[i].name.toUpperCase() === "DEFAULT") {
													vm.defaultFilterFlag = true;
												}
											}
											if(vm.defaultFilterFlag) {
												resetToDefaultFilter();
											}
											else {
												restFilterDropdowns(function(){
	                    		getFiltersList();
	                    	});
											}
                    } else {
											AuthenticationService.SetCurrentFilterPreference(vm.currentFilter);
                    	getFiltersList();
                    }
                }
                else {
                    FlashService.Error(response.message);
                }
            });
        }

        function changeCurrentFilter(filter) {
        	vm.dataLoading = "Loading... Please wait...";
        	var parsedContent = "";
					vm.filterName = filter.name;
        	$timeout(function(){
        		if(filter && filter.preferenceContent){
            		AuthenticationService.SetCurrentFilterPreference(filter);
            		if(typeof filter.preferenceContent === "string"){
            			parsedContent = JSON.parse(filter.preferenceContent);
            		} else {
            			parsedContent = filter.preferenceContent;
            		}
            		getFilterRelatedValues(parsedContent);

                	getSelectedValuesBasedOnFilter();
                    setVisibleColumns();
                    updateColumnSelectedValuesFlags();
                    updateFilteredItemsList();

                    setAllFilterRelatedTempValues();

                    getFiltersList();

                    vm.dataLoading = "Applying filters... Please wait...";
										vm.showSavedTick = true;
                    applyFiltersForAll(vm.originalSubmittalRegisterRecords, true);

                    $scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);

                    $scope.filtersDirty = false;
                    AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
                    AuthenticationService.SetSmartRegisterFilter(parsedContent);
            	}
            	vm.dataLoading = false;
        	}, 0);
        }

				function callSaveFilters(normalApplyFilterFlag, fromChangeSavedFilter) {
						var currentPreferenceId = -1;
						var lastAppliedFilterPrefId = -1;
						var filtersListOriginal = AuthenticationService.GetListOfFilters();
						if(filtersListOriginal && filtersListOriginal.length > 0){
							for(var i=0;i<filtersListOriginal.length;i++) {
								if(vm.filterName) {
									if(filtersListOriginal[i].name.toUpperCase() === vm.filterName.toUpperCase()){
										currentPreferenceId = filtersListOriginal[i].preferenceId;
									}
								}
								if(filtersListOriginal[i].name.toUpperCase() === 'LASTAPPLIEDFILTER') {
									lastAppliedFilterPrefId = filtersListOriginal[i].preferenceId;
								}
							}
						}
						// Calling saveFilters function
						// Saving newly created filter in the list with some name.
						if(!normalApplyFilterFlag) {
							saveFilters(vm.filterName, vm.filterDescription, currentPreferenceId);
							vm.savedNewFilter = true;
						}
						// This is when switching filters in the list
						if(fromChangeSavedFilter) {
							saveFilters('lastAppliedFilter', '', lastAppliedFilterPrefId, true);
						}
						// This is the case for normal Applied Filter
						else {
							saveFilters('lastAppliedFilter', '', lastAppliedFilterPrefId, true, true);
						}
				}

        function saveFilters(name, description, preferenceId, saveAsLastUsedFlag, notFromChangeSavedFilter, callback) {
	        	var filters = AuthenticationService.GetSmartRegisterFilter();
						if(name.toUpperCase() === 'DEFAULT') {
							filters = [{"field":"divisionCode","value":[],"visibility":true},{"field":"specSection","value":[],"visibility":true},{"field":"projectSummaryGroup","value":["ACTION AND INFORMATIONAL","CLOSEOUT SUBMITTALS","MOCKUPS"],"visibility":true},{"field":"specCategory","value":[],"visibility":true},{"field":"specCategoryGroup","value":[],"visibility":false}];
						}
						if(!vm.initialLoadFlag && name.toUpperCase() !== 'DEFAULT' && name.toUpperCase() !== 'LASTAPPLIEDFILTER') {
							vm.dataLoading = "Saving filter preferences... Please wait...";
						}
						// Making description of Filter as '' in case of normal filter
						if(saveAsLastUsedFlag && notFromChangeSavedFilter && !vm.savedNewFilter) {
							description = '';
						}
						else if (!saveAsLastUsedFlag && !notFromChangeSavedFilter) {
							// No change in description required here
						}
						else {
							description = vm.filterName && (vm.filterName.toUpperCase() !== 'LASTAPPLIEDFILTER') ? vm.filterName : '';
							vm.savedNewFilter = false;
						}

            AuthenticationService.UpdateFilterPreferences(preferenceId, vm.user.userId, name, description, filters, function (response) {
                if (response.success) {
										AuthenticationService.SetListOfFilters(response.data);
										// When not creating new filter or selecting and filter from list
										// not saving lastappliedFilter filter in vm.currentFilter variable.
										if((vm.initialLoadFlag || vm.whenNoInitialLoad || saveAsLastUsedFlag || !notFromChangeSavedFilter) && name.toUpperCase() === 'LASTAPPLIEDFILTER') {
											vm.initialLoadFlag = false;
											vm.whenNoInitialLoad = false;
										}
										// When normal filter applied
										// saving lastappliedFilter filter in vm.currentFilter variable
                    if(response.data){
                    	var currentSavedFilter = response.data.filter(function(filter){
                    		if(filter.name.toUpperCase() === 'LASTAPPLIEDFILTER'){
                    			return filter;
                    		}
                    	});
											if(name.toUpperCase() !== "LASTAPPLIEDFILTER" && name.toUpperCase() !== 'DEFAULT') {
												FlashService.Success(response.message);
											}
                    	if(currentSavedFilter.length > 0){
												for(var i=0; i<response.data.length; i++) {
													if(response.data[i].name === currentSavedFilter[0].description) {
														vm.currentFilter = response.data[i];
													}
												}
                    	}
											loadUIIconsForFilters(saveAsLastUsedFlag, notFromChangeSavedFilter);
											AuthenticationService.SetCurrentFilterPreference(vm.currentFilter);
                    }
										getFiltersList();
										if(callback) {
											callback();
										}
                }
                else {
                    FlashService.Error(response.message);
										vm.dataLoading = false;
                }
            });
        }

				function loadUIIconsForFilters(saveAsLastUsedFlag, notFromChangeSavedFilter) {
						vm.dataLoading = false;
						if(!saveAsLastUsedFlag) {
							if(!notFromChangeSavedFilter) { vm.showSavedTick = true; }
							$scope.filtersDirty = false;
						}

						if(vm.currentFilter && vm.currentFilter.name.toUpperCase() === 'LASTAPPLIEDFILTER') {
							$scope.filtersDirty = true;
						}
						if((vm.currentFilter === "" && !vm.newFilterCreated) || (vm.currentFilter && (vm.currentFilter.name.toUpperCase() === 'LASTAPPLIEDFILTER' || vm.currentFilter.name.toUpperCase() === 'DEFAULT')) || vm.cameFromDashboard) {
							vm.showSavedTick = false;
						}
						AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
						vm.dataLoading = false;
						vm.initialLoadFlag = false;
						vm.whenNoInitialLoad = false;
				}

        function setVisibleColumns(){
        	for(var i=0;i<vm.searchDataTemp.length;i++){
        		$scope[vm.columnsTotalVarData[vm.searchDataTemp[i].field].filterItem]["selected"] = vm.searchDataTemp[i].visibility;
        	}
        }

        function getVisibleColumns(){
        	$scope.visibleColumnsList = [];
        	for(var key in vm.columnsTotalVarData){
        		if($scope[vm.columnsTotalVarData[key].filterItem].selected){
        			$scope.visibleColumnsList.push(key);
        		}
        	}
        }

        function initializeAllFiltersDirtyValues(){
        	for(var column in vm.columnsTotalVarData){
        		$scope[vm.columnsTotalVarData[column].form] = false;
        	}
        }

				function resetToDefaultFilter() {
						var filtersListOriginal = AuthenticationService.GetListOfFilters();
						var defaultFilterPresent;
						if(filtersListOriginal && filtersListOriginal.length > 0) {
							for(var i=0;i<filtersListOriginal.length;i++){
								if(filtersListOriginal[i] && filtersListOriginal[i].name.toUpperCase() === "DEFAULT"){
									filtersListOriginal[i].preferenceContent = [{"field":"divisionCode","value":[],"visibility":true},{"field":"specSection","value":[],"visibility":true},{"field":"projectSummaryGroup","value":["ACTION AND INFORMATIONAL","CLOSEOUT SUBMITTALS","MOCKUPS"],"visibility":true},{"field":"specCategory","value":[],"visibility":true},{"field":"specCategoryGroup","value":[],"visibility":false}];
									//saveFilters('Default', '', filtersListOriginal[i].preferenceId, true, true);
									changeCurrentFilter(filtersListOriginal[i]);
									defaultFilterPresent = true;
									break;
								}
							}
							if(!defaultFilterPresent) {
								initializeWithDefaultFilter();
							}
						}
						else {
							initializeWithDefaultFilter();
						}
				}

				function initializeWithDefaultFilter() {
					var defaultFilterInitData = {
						description: '',
						name: 'Default',
						preferenceContent: [{"field":"divisionCode","value":[],"visibility":true},{"field":"specSection","value":[],"visibility":true},{"field":"projectSummaryGroup","value":["ACTION AND INFORMATIONAL","CLOSEOUT SUBMITTALS","MOCKUPS"],"visibility":true},{"field":"specCategory","value":[],"visibility":true},{"field":"specCategoryGroup","value":[],"visibility":false}],
						preferenceId: -1,
						type: "SmartRegisterFilterPreference",
						userId: vm.user.userId
					}
					changeCurrentFilter(defaultFilterInitData);
				}

        function restFilterDropdowns(callback){

        	vm.dataLoading = "Reseting to Default Filter... Please wait..";
        	$timeout(function(){
            	$scope.$apply();

            	//Hide all dropdowns
            	//showOrHideAllFilterDropdowns(false, false);

            	//Select all the filters
                selectAllFilters();

                //Reset the temp values related to all filters
                resetAllFilterRelatedTempValues();

                //Update the values in each column related array of objects
                updateColumnSelectedValuesFlags();

                //Apply filter to get the final submittals
                applyFiltersForAll();
                $scope.filtersDirty = false;
                AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
                updateFilteredItemsList();

                //Rebuild the grid to see changes
                $scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
                initializeAllFiltersDirtyValues();
                resetAllFilterDataValues();
                updateSearchData();
                updateColumnSelectedValuesFlags(undefined, false);
                setAllFilterRelatedTempValues();

                vm.currentFilter = "";
                AuthenticationService.SetCurrentFilterPreference(vm.currentFilter);

                vm.dataLoading = false;

                if(callback) callback();
        	}, 0);
        }

        function showOrHideAllFilterDropdowns(show, ignoreDefault){
        	for(var key in vm.columnsTotalVarData){
        		$scope[vm.columnsTotalVarData[key].filterItem].selected = show;
        	}
        	if(ignoreDefault){
        		$scope[vm.columnsTotalVarData['projectSummaryGroup'].filterItem].selected = true;
        	}
        }

        function resetAllFilterRelatedTempValues(){
        	for(var key in vm.columnsTotalVarData){
        		vm[key + "SelectedItems"] = angular.copy(vm[key + "SelectedItemsTemp"]);
        		vm[vm.columnsTotalVarData[key].allVar] = angular.copy(vm[vm.columnsTotalVarData[key].allVar + "Temp"]);
        	}
        }

        function setAllFilterRelatedTempValues(){
        	for(var key in vm.columnsTotalVarData){
        		vm[key + "SelectedItemsTemp"] = angular.copy(vm[key + "SelectedItems"]);
        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = angular.copy(vm[vm.columnsTotalVarData[key].allVar]);
        	}
        }

        function initializeAllFilterRelatedValues(){
        	for(var key in vm.columnsTotalVarData){
        		vm[key + "SelectedItems"] = [];
        		vm[vm.columnsTotalVarData[key].allVar] = [];
        	}
        }

        function selectAllFilters(){
        	for(var key in vm.columnsTotalVarData){
        		if(key === vm.columnsList.division){
            		toggleAllDivisionFiltersSelection();
            	} else if(key === vm.columnsList.specSection){
            		toggleAllSpecSectionFiltersSelection();
            	} else {
            		toggleAllCommonFiltersSelection(key);
            	}
        	}
        }

		vm.toggleSourceModule = function(moduleType) {
			vm.dataLoading = "Applying Filters... Please wait..";
			vm['module' + moduleType].selected = !vm['module' + moduleType].selected;
			$timeout(function() {
				applyFiltersForAll();
				$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
				if(vm['module' + moduleType].selected) {
					vm.sessionSourceModule.push(moduleType.toLowerCase());
				} else {
					vm.sessionSourceModule = _.without(vm.sessionSourceModule, _.findWhere(vm.sessionSourceModule, moduleType.toLowerCase()));
				}
				AuthenticationService.setSRSourceModuleFilter(vm.sessionSourceModule);
				vm.dataLoading = false;
			}, 0);
		}

        function updateColumnsSelectedValuesConditionally(forceflag){
        	for(var key in vm.columnsTotalVarData){
        		for(var index = 0; index < vm[vm.columnsTotalVarData[key].allVar].length; index++){
        			if(vm[key + "SelectedItems"].length === vm[key + "SelectedItemsAll"].length || vm[key + "SelectedItems"].length === 0){
        				vm[vm.columnsTotalVarData[key].allVar][index].selected = forceflag;
        			} else {
        				if(vm[key + "SelectedItems"].indexOf(vm[vm.columnsTotalVarData[key].allVar][index][vm.columnsTotalVarData[key].mapValue]) !== -1){
                			vm[vm.columnsTotalVarData[key].allVar][index].selected = true;
                		} else {
                			vm[vm.columnsTotalVarData[key].allVar][index].selected = false;
                		}
        			}
        		}
        	}
        }

        function updateColumnSelectedValuesFlags(key, forceFlag){
        	var trueFlag = true;
			var falseFlag = false;

    		if(forceFlag == true || forceFlag == false){ //Set the value of all items to specific values forcefully
    			trueFlag = forceFlag;
    			falseFlag = forceFlag;
    		}
    		updateColumnsSelectedValues(key, trueFlag, falseFlag);
        }

        function updateColumnsSelectedValues(key, trueFlag, falseFlag){
        	if(!key){
            	for(var key in vm.columnsTotalVarData){
            		for(var index = 0; index < vm[vm.columnsTotalVarData[key].allVar].length; index++){
						var filterVal = vm[vm.columnsTotalVarData[key].allVar][index][vm.columnsTotalVarData[key].mapValue];
            			if(vm[key + "SelectedItems"].indexOf(filterVal) !== -1){
                			vm[vm.columnsTotalVarData[key].allVar][index].selected = trueFlag;
                		} else {
                			vm[vm.columnsTotalVarData[key].allVar][index].selected = falseFlag;
                		}
            		}
            	}
        	} else {
        		for(var index = 0; index < vm[vm.columnsTotalVarData[key].allVar].length; index++){
        			if(vm[key + "SelectedItems"].indexOf(vm[vm.columnsTotalVarData[key].allVar][index][vm.columnsTotalVarData[key].mapValue]) !== -1){
            			vm[vm.columnsTotalVarData[key].allVar][index].selected = trueFlag;
            		} else {
            			vm[vm.columnsTotalVarData[key].allVar][index].selected = falseFlag;
            		}
        		}
        	}
        }

        function removeFilterItem(filter){
        	vm.dataLoading = "Loading... Please wait...";
        	//Unselect the removed record from all variable
        	this[filter.columnVar + "Temp"] = this[filter.columnVar + "Temp"].filter(function(data){if(data.id === filter.item.id){data.selected = false;} return data;});

        	//Remove the item from selectedItems
        	var currentSelectedItems = this[filter.column + "SelectedItemsTemp"];
        	var index = currentSelectedItems.indexOf(filter.item[this.columnsTotalVarData[filter.column].mapValue]);
        	currentSelectedItems.splice(index, 1);

        	//Simulate the applied filters functionality as if user clicked on the respective dropdown applied filters
        	$scope.filtersApplied(filter.column);
        }

        function updateFilteredItemsList(){
        	$scope.filteredItemsList = [];
        	var obj = {};
        	for(var key in vm.columnsTotalVarData){
        		if(vm[key + "SelectedItems"].length === 0 || vm[key + "SelectedItems"].length === vm[vm.columnsTotalVarData[key].number]){
        			continue;
        		} else {
            		for(var index = 0; index < vm[vm.columnsTotalVarData[key].allVar].length; index++){
            			if(vm[vm.columnsTotalVarData[key].allVar][index].selected){
            				if(key === 'divisionCode'){
            					var divCode = vm[vm.columnsTotalVarData[key].allVar][index].divisionCode;
            					var divName = vm[vm.columnsTotalVarData[key].allVar][index].divisionName;
            					var div = divCode?divCode + (divName?' - ' + divName:'') : '';
            					obj = {item : vm[vm.columnsTotalVarData[key].allVar][index], columnVar : vm.columnsTotalVarData[key].allVar, column : key,
                    					displayName :  div };
            				} else if(key === 'specSection'){
            					var specNumber = vm[vm.columnsTotalVarData[key].allVar][index].specSection;
            					var specName = vm[vm.columnsTotalVarData[key].allVar][index].specName;
            					var spec = specNumber?specNumber + (specName?' - ' + specName:'') : '';
            					obj = {item : vm[vm.columnsTotalVarData[key].allVar][index], columnVar : vm.columnsTotalVarData[key].allVar, column : key,
                    					displayName :  spec};
            				} else {
            					obj = {item : vm[vm.columnsTotalVarData[key].allVar][index], columnVar : vm.columnsTotalVarData[key].allVar, column : key,
                    					displayName :  vm[vm.columnsTotalVarData[key].allVar][index][vm.columnsTotalVarData[key].mapValue]
                    			}
            				}
                			$scope.filteredItemsList.push(obj);
                		}
            		}
        		}
        	}
        }

        function toggleFilterDropdown(key){
        	var currentFilterItem = vm.columnsTotalVarData[key].filterItem, selectedFlag = $scope[currentFilterItem].selected;
        	//Check if currently column is visible or not - if it is visible that means we are going to hide it
        	if(selectedFlag){
        		var numberOfItems = vm[vm.columnsTotalVarData[key].number], currentSelectedItems = vm[key + "SelectedItems"];

        		if(currentSelectedItems.length !== 0 && currentSelectedItems.length !== numberOfItems){
        			selectAllAndApplyFilters(key);
        		}

        		$scope[currentFilterItem].selected = !selectedFlag;
    			updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, [], false);
    			updateSearchData();
            	if($scope.filtersDirty === false){
                	$scope.filtersDirty = true;
                	AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
                }

            	vm[vm.columnsTotalVarData[key].allVar + "Temp"] = vm[vm.columnsTotalVarData[key].allVar];
        	} else {
        		$scope[currentFilterItem].selected = !selectedFlag;
        		updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, [], true);
        		updateSearchData();
            	if($scope.filtersDirty === false) {
                	$scope.filtersDirty = true;
                	AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
                }
        	}
        }

        function selectAllAndApplyFilters(key){
        	if(key === vm.columnsList.division){
        		toggleAllDivisionFiltersSelection();
        	} else if(key === vm.columnsList.specSection){
        		toggleAllSpecSectionFiltersSelection();
        	} else {
        		toggleAllCommonFiltersSelection(key);
        	}

        	$scope.filtersApplied(key);
        }

        function convertAllValuesToLowerUpperCase(items, type) {
        	return UtilService.convertAllValuesToLowerUpperCase(items, type);
        }


        function applyFiltersForAll(submittalRegisters, fromChangeSavedFilter) {
						vm.newFilterCreated = false;
						vm.currentFilter = AuthenticationService.GetCurrentFilterPreference();
						vm.enableResetToDefaultFilter = (vm.currentFilter && (vm.currentFilter.name.toUpperCase() === "DEFAULT")) ? false : true;

            vm.submittalRegisters = submittalRegisters?submittalRegisters:vm.remainingData.concat(vm.filterSmartRegisteredData);
            if(vm.submittalRegisters && vm.submittalRegisters.length > 0) {
				var projectSummaryGroupSelectedItems = convertAllValuesToLowerUpperCase(vm.projectSummaryGroupSelectedItems, 'upper');
            	var specCategorySelectedItems = convertAllValuesToLowerUpperCase(vm.specCategorySelectedItems);
            	var specCategoryGroupSelectedItems = convertAllValuesToLowerUpperCase(vm.specCategoryGroupSelectedItems);
              var subContractorSelectedItems = convertAllValuesToLowerUpperCase(vm.subContractorSelectedItems);
            	var filteredData = [], remainingData = [];

            	vm.submittalRegisters.forEach(function(record) {
            		if(((record.divisionCode !== '' && $.inArray(record.divisionCode, vm.divisionCodeSelectedItems) !== -1)
        						|| (record.divisionCode === '' && vm.divisionCodeSelectedItems.indexOf(emptyValuesLabel) !== -1) || vm.divisionCodeSelectedItems.length === 0 ) &&
			    				((record.specNumber !== '' && $.inArray(record.specNumber, vm.specSectionSelectedItems) !== -1)
			    						|| (record.specNumber === '' && vm.specSectionSelectedItems.indexOf(emptyValuesLabel) !== -1) || vm.specSectionSelectedItems.length === 0) &&
			    				(($.inArray(record.projectSummaryGroup && record.projectSummaryGroup.toUpperCase(), projectSummaryGroupSelectedItems) !== -1)
			    						|| (record.projectSummaryGroup === "" && $.inArray(emptyValuesLabel, projectSummaryGroupSelectedItems) !== -1) || projectSummaryGroupSelectedItems.length === 0) &&
			    				((record.specCategory && specCategorySelectedItems.indexOf(record.specCategory.toLowerCase()) !== -1)
			    						|| (record.specCategory === "" && specCategorySelectedItems.indexOf(emptyValuesLabel) !== -1) || specCategorySelectedItems.length === 0) &&
			    				((record.specCategoryGroup && specCategoryGroupSelectedItems.indexOf(record.specCategoryGroup.toLowerCase()) !== -1)
			    						|| (record.specCategoryGroup === "" && specCategoryGroupSelectedItems.indexOf(emptyValuesLabel) !== -1) || specCategoryGroupSelectedItems.length === 0) &&
		              			((record.subContractor && subContractorSelectedItems.indexOf(record.subContractor.toLowerCase()) !== -1)
			    						|| (record.subContractor === "" && subContractorSelectedItems.indexOf(emptyValuesLabel) !== -1) || subContractorSelectedItems.length === 0) &&
								( ((!record.sourceModule || (record.sourceModule && ['plans', 'procurementlog'].indexOf(record.sourceModule.toLowerCase())===-1)) && (vm.moduleSpecs.selected || (!vm.moduleSpecs.selected && !vm.modulePlans.selected)))
									|| (record.sourceModule && ['plans', 'procurementlog'].indexOf(record.sourceModule.toLowerCase())>-1 && (vm.modulePlans.selected || (!vm.moduleSpecs.selected && !vm.modulePlans.selected))))
								) {
		            				filteredData.push(record);
		            			} else {
		            				remainingData.push(record);
		            			}
		    				});

								if((vm.initialLoadFlag || vm.whenNoInitialLoad) && !vm.cameFromDashboard) {
									loadUIIconsForFilters();
								}
								else {
									vm.dataLoading = false;
									callSaveFilters(true, fromChangeSavedFilter);
								}

	            	vm.filterSmartRegisteredData = filteredData;
	            	vm.remainingData = remainingData;
					if(!vm.filterSmartRegisteredData || vm.filterSmartRegisteredData.length===0) {
						var message = 'There is no submittal data to display due to your selected filters. Please edit the filter in order to see the submittals for your project.';
						FlashService.InfoWithTimeInterval(message, null, 8);
					}
	            }
          }

        $scope.filterDropdownToggled = function(open, key){
        	if(open === false){
        		vm[key + "SelectedItemsTemp"] = angular.copy(vm[key + "SelectedItems"]);

        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = angular.copy(vm[vm.columnsTotalVarData[key].allVar]);

        		vm[vm.columnsTotalVarData[key].searchVar] = "";

        		$scope[vm.columnsTotalVarData[key].form] = false;

        		vm[vm.columnsTotalVarData[key].selectAllVar] = false;
        	} else {
        		vm[vm.columnsTotalVarData[key].selectAllVar] = false;
        		vm.currentSearchResults = [];
        	}
        }

        $scope.itemClicked = function(item, index, key){
			item.selected = !item.selected;
        	if(item.selected){
				if(vm[key + "SelectedItemsAll"].length === vm[key + "SelectedItemsTemp"].length){
            		vm[key + "SelectedItemsTemp"] = [];
            	}
				if(vm[key + "SelectedItemsTemp"].indexOf(item[vm.columnsTotalVarData[key].mapValue]) <= -1) {
					vm[key + "SelectedItemsTemp"].splice(index, 0, item[vm.columnsTotalVarData[key].mapValue]);
				}
        	} else {
				if(vm[key + "SelectedItemsTemp"] && vm[key + "SelectedItemsTemp"].length === 0){
        			vm[key + "SelectedItemsTemp"] = angular.copy(vm[key + "SelectedItemsAll"]);
        		}
				if(vm[key + "SelectedItemsTemp"].indexOf(item[vm.columnsTotalVarData[key].mapValue]) > -1) {
					vm[key + "SelectedItemsTemp"].splice(vm[key + "SelectedItemsTemp"].indexOf(item[vm.columnsTotalVarData[key].mapValue]), 1);
				}
        	}
        	vm[vm.columnsTotalVarData[key].selectAllVar] = commonSelectAllChecked(key);
        	$scope[vm.columnsTotalVarData[key].form] = true;
        }

        $scope.filtersApplied = function(key){
        	vm.dataLoading = "Applying Filters... Please wait..";
        	var itemsSelectedStatus = "MIX"; //"NONE" , "MIX" , "ALL"

        	$timeout(function(){

        		//Check what is the selected items status currently
        		if(vm[key + "SelectedItemsTemp"].length === vm[key + "SelectedItemsAll"].length){
        			itemsSelectedStatus = "ALL";
        		} else if(vm[key + "SelectedItemsTemp"].length === 0){
        			itemsSelectedStatus = "NONE";
        		}

        		//If user selected no records, in that case we need to consider it as selectAll
        		if(itemsSelectedStatus === "NONE"){
        			vm[key + "SelectedItems"] = angular.copy(vm[key + "SelectedItemsAll"]);
        			updateColumnSelectedValuesFlags(key, true);
        		} else {
        			vm[key + "SelectedItems"] = angular.copy(vm[key + "SelectedItemsTemp"]);
            	vm[vm.columnsTotalVarData[key].allVar] = vm[vm.columnsTotalVarData[key].allVar + "Temp"];
        		}

							updateFilteredItemsList();
							updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItems"], true);
							updateSearchData();
            	applyFiltersForAll();

            	if($scope.filtersDirty === false){
                	$scope.filtersDirty = true;
                	AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
              }

                $scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);

                //After updating the submittals in grid, uncheck all items and selectAll checkbox to make them look unchecked
                if(itemsSelectedStatus === "NONE" || itemsSelectedStatus === "ALL"){
                	updateColumnSelectedValuesFlags(key, false);
        					vm[vm.columnsTotalVarData[key].selectAllVar] = false;
        				}
                $scope[vm.columnsTotalVarData[key].filterItem].isOpen = false;
                vm.dataLoading = false;
        	}, 0);
        };

		function toggleAllDivisionFiltersSelection() {
			if(!vm.searchDivisionCodes) {
                vm.divisionCodeSelectedItemsTemp = [];
				angular.forEach(vm.allDivisionsTemp, function (item) {
	                item.selected = vm.divisionCodeSelectAll;
	            });
			} else {
				angular.forEach(vm.allDivisionsTemp, function (item) {
					if(item.tempSelected) {
						item.selected = vm.divisionCodeSelectAll;
						if(item.selected) {
                            if(notExistIn(vm.divisionCodeSelectedItemsTemp, item.divisionCode)) {
                                vm.divisionCodeSelectedItemsTemp.push(item.divisionCode);
                            }
						} else {
                            if(!notExistIn(vm.divisionCodeSelectedItemsTemp, item.divisionCode)) {
                                vm.divisionCodeSelectedItemsTemp.splice(vm.divisionCodeSelectedItemsTemp.indexOf(item.divisionCode), 1);
                            }
                        }
					}
	            });
			}
        	$scope.divisionFormDirty = true;
        }

		function toggleAllSpecSectionFiltersSelection() {
			if(!vm.searchSpecSections) {
                vm.specSectionSelectedItemsTemp = [];
				angular.forEach(vm.allSpecSectionsTemp, function (item) {
	                item.selected = vm.specSectionSelectAll;
	            });
			} else {
				angular.forEach(vm.allSpecSectionsTemp, function (item) {
					if(item.tempSelected) {
						item.selected = vm.specSectionSelectAll;
						if(item.selected) {
                            if(notExistIn(vm.specSectionSelectedItemsTemp, item.specSection)) {
                                vm.specSectionSelectedItemsTemp.push(item.specSection);
                            }
						} else {
                            if(!notExistIn(vm.specSectionSelectedItemsTemp, item.specSection)) {
                                vm.specSectionSelectedItemsTemp.splice(vm.specSectionSelectedItemsTemp.indexOf(item.specSection), 1);
                            }
                        }
					}
	            });
			}
			$scope.specSectionFormDirty = true;
        }

		function toggleAllCommonFiltersSelection(key) {
		   if(!vm[vm.columnsTotalVarData[key].searchVar]) {
               vm[key + "SelectedItemsTemp"] = [];
			   angular.forEach(vm[vm.columnsTotalVarData[key].allVar + "Temp"], function (item) {
				   item.selected = vm[vm.columnsTotalVarData[key].selectAllVar];
			   });
		   } else {
			   angular.forEach(vm[vm.columnsTotalVarData[key].allVar + "Temp"], function (item) {
				   if(item.tempSelected) {
					   item.selected = vm[vm.columnsTotalVarData[key].selectAllVar];
					   if(item.selected) {
                           if(notExistIn(vm[key + "SelectedItemsTemp"], item.value)) {
                               vm[key + "SelectedItemsTemp"].push(item.value);
                           }
					   } else {
                           if(!notExistIn(vm[key + "SelectedItemsTemp"], item.value)) {
                               vm[key + "SelectedItemsTemp"].splice(vm[key + "SelectedItemsTemp"].indexOf(item.value), 1);
                           }
                       }
				   }
			   });
		   }
		   $scope[vm.columnsTotalVarData[key].form]  = true;
	   }

       function notExistIn(arr, value) {
           return arr.indexOf(value)<=-1;
       }

        function EmptyStackData() {
            $scope.$broadcast('EmptyStackData', true);
        }

        function NavigateToScheduleTitles() {
            $location.path('/scheduletitles');
        }

        function NavigateToSpecsToSchedules() {
            $location.path('/specstoscheduletitles');
        }

        function NavigateToSubmittalSchedule() {
        	LogEvent("Page visit", "User navigated to Submittal Schedule from smart register using Reports dropdown.", "SUCCESS");
			$location.path('/submittalschedule');
        }

        function GoToRiggingPlan() {
            $location.path('/riggingplan');
        }

		function openRiggingPlanPopup() {
				ModalService.RiggingPlanModal(vm.selectedProject, vm.selectedVersion)
				.result.then(function () {
					 $route.reload();
				});
		}

        /*Custom filter for spec section*/
        $scope.specSectionFilter = function (item) {
            if (vm.searchSpecSections == undefined || vm.searchSpecSections == '' || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1)
        		|| (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)){
            	//item.selected = true;
            	return true;
            }
            //item.selected = true;
            return false;
        }

        /*Custom filter for division code*/
        $scope.divisionCodeFilter = function (item) {
            if (!vm.searchDivisionCodes || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
        		|| (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1))
                return true;
            return false;
        }

        $scope.submittalTypeFilter = function (item) {
            if (!vm.searchDivisionCodes || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
            		|| (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1))
                    return true;
                return false;
            }

        $scope.commonFilter = function (key) {
        	return function(item) {
        		if (!vm[vm.columnsTotalVarData[key].searchVar]
        			|| (item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)){
        			return true;
        		}
        		return false;
            }

		}

        $scope.commonSearchValueChanged = function(key){
            vm[vm.columnsTotalVarData[key].selectAllVar] = false;
        	var currentAllVar = vm[vm.columnsTotalVarData[key].allVar + "Temp"], item = "";
        	vm.currentSearchResults = [];

        	if(key === "divisionCode"){
        		for(var i=0;i<currentAllVar.length;i++){
        			item = currentAllVar[i];
					item.tempSelected = false;
            		if (!vm.searchDivisionCodes || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
                    	|| (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)){
							if(vm[vm.columnsTotalVarData[key].selectAllVar]) {
								vm[key + "SelectedItemsTemp"].push(item.divisionCode);
		            			item.selected = true;
							}
							vm.currentSearchResults.push(item.divisionCode);
							item.tempSelected = true;
                    }
        		}
        	} else if(key === "specSection"){
        		for(var i=0;i<currentAllVar.length;i++){
        			item = currentAllVar[i];
					item.tempSelected = false;
	        		if (!vm.searchSpecSections || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1)
	                	|| (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)){
							if(vm[vm.columnsTotalVarData[key].selectAllVar]) {
			        			vm[key + "SelectedItemsTemp"].push(item.specSection);
			        			item.selected = true;
							}
							vm.currentSearchResults.push(item.specSection);
							item.tempSelected = true;
                    }
        		}
        	} else{
        		for(var i=0;i<currentAllVar.length;i++){
        			item = currentAllVar[i];
					item.tempSelected = false;
	        		if (!vm[vm.columnsTotalVarData[key].searchVar]
	        			|| (item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)){
							if(vm[vm.columnsTotalVarData[key].selectAllVar]) {
								vm[key + "SelectedItemsTemp"].push(item[vm.columnsTotalVarData[key].mapValue]);
			        			item.selected = true;
							}
							vm.currentSearchResults.push(item[vm.columnsTotalVarData[key].mapValue]);
							item.tempSelected = true;
	        		}
        		}
        	}
        	vm[vm.columnsTotalVarData[key].selectAllVar] = commonSelectAllChecked(key);
        	//$scope[vm.columnsTotalVarData[key].form] = true;
        }

        function commonSelectAllChecked(key){
        	if ((!vm[vm.columnsTotalVarData[key].searchVar] &&
        			vm[key + "SelectedItemsTemp"] && vm[vm.columnsTotalVarData[key].number] === vm[key + "SelectedItemsTemp"].length)
        		|| (vm[vm.columnsTotalVarData[key].searchVar] && vm[key + "SelectedItemsTemp"] && _.difference(vm.currentSearchResults, vm[key + "SelectedItemsTemp"]).length === 0)) {
					if(vm.currentSearchResults.length === 0 && !vm[vm.columnsTotalVarData[key].selectAllVar]) {
						return false;
					} else {
						return true;
					}
        	}
        	return false;
        }

        function getSelectedItemsInCurrentView(key){
        	var currentAllVar = vm[vm.columnsTotalVarData[key].allVar + "Temp"], selectedItems = [], item = {};
        	for(var i=0;i<currentAllVar.length;i++){
    			item = currentAllVar[i];
    			if(item.selected) selectedItems.push(item);
    		}
        	return selectedItems;
        }

        function GoBackToPreviousStep() {
            $scope.$broadcast("UndoPreviousStep", true);
        }


        $scope.setGridEvents = function (reloadEvent, getSelectedRecords) {
            $scope.gridReload = reloadEvent;
            $scope.getSelectedRecordsForExport = getSelectedRecords;
        };

        $scope.$watch('vm.columns', function (newCol, oldCol) {
            if (newCol) {
                AuthenticationService.SetSmartRegisterColumns(newCol);
            }
        }, true);

        vm.columnDropdownIsOpen = false;
        function onToolbarColumnsClick(e) {
        	// Disable the columns button and show our custom dropdown
        	$timeout(function() {
    			vm.columnDropdownIsOpen = !vm.columnDropdownIsOpen;
			},10);
        	return true;
        }

        function SaveUserPreferenceColumns() {
            vm.dataLoading = "Saving User Preferences... Please wait...";
            var preferenceColumns;
            preferenceColumns = JSON.stringify(vm.columns);
            AuthenticationService.UpdateUserPreferences(vm.user.userId, 'SmartRegisterColumnPreference', preferenceColumns, function (response) {
                vm.dataLoading = false;
                if (response.success) {
                    FlashService.Success(response.message);
                }
                else {
                    FlashService.Error(response.message);
                }
            });
        }

        function canShowAddEditSmartColumns() {
        	return !checkAndShowDataShouldBeSavedMsg();
        }

        function saveCustomColumns(columnSaveData) {
        	vm.dataLoading = "Saving...";
			vm.smartColumnsContainer = vm.smartColumnsContainer || {};
			vm.smartColumnsContainer.smartColumns = columnSaveData.smartColumnsRows;
			SmartRegisterService.saveSmartColumns(vm.selectedProject.projectId, vm.selectedVersion.versionId, vm.smartColumnsContainer, !!columnSaveData.saveAtProject, !!columnSaveData.saveAtCompany, function(response) {
				if(response.success) {
                    FlashService.Success(response.message);
					vm.dataLoading = response.message + "... Loading Smart register...";
					LoadSmartRegisterList(vm.selectedProject.projectId, vm.selectedVersion.versionId);
				}
				else {
                    FlashService.Error(response.message);
				}
			});
        }

		function manageSmartRegisterColumns() {

			if(checkAndShowDataShouldBeSavedMsg()){
				return;
			}
			var modalInstance = $uibModal.open({
				animation : true,
				templateUrl : MAINURL
						+ 'views/smartregister/submittals/smartregister.columns.view.html',
				controller : 'SmartRegisterColumnsController',
				backdrop : 'static',
				resolve : {
					smartColumns: function () { return vm.smartColumns; },
					smartRegisterRecords: function () { return vm.submittalregisters; }
				}
			});
			modalInstance.result.then(function(data) {
				saveCustomColumns(data);
			}, function() {
			});
		}

        function ProductData() {
             $location.path('/productdata/projects/' + $routeParams.id);
        }

        function GoToSpecView(record) {
            AuthenticationService.SetSpecViewData({ record: record });
            AuthenticationService.SetSpecViewView({ view: "SmartRegisterView" });
			vm.selectedProject = AuthenticationService.GetProject();
			if (vm.selectedProject) {
                ProductDataService.CheckSpecViewFlag(vm.selectedProject.projectId, function (response) {
                    if (response.success) {
                        checkSpecViewEnable(response.data);
                    } else {
                        FlashService.Error(response.message);
                    }
                });
            }
            else {
				AuthenticationService.setSmartViewType('specview');
                $location.path('/smartview/projects/' + $routeParams.id);
            }
        }

		function GoToPlanView(record, openInNewWindow) {
			AuthenticationService.SetPlanViewRecordData(record);
        	AuthenticationService.SetPlanViewSheetData({file : { sheettype_s: record.drawingSheetType}, page : {filename: record.drawingFileName, pagenumber_i : record.drawingPageNumber}});
			AuthenticationService.setSmartViewType('planview');
			AuthenticationService.SetPlanViewView(null);
			if(openInNewWindow) {
				ExportService.openNewWindow('smartview?openmode=openplanspdf', 630, 605);
			} else {
				$location.path('/smartview/projects/' + $routeParams.id);
			}
		}

		function openScheduleInPlanview(schedule) {
			AuthenticationService.SetPlanViewView(null);
			ExportService.openNewWindow('smartview?openmode=openplanspdf&schedule=' + encodeURIComponent(JSON.stringify(schedule)), 630, 605);
		}

        function checkHistoryEnable(flag) {
            if (flag === false) {
                if (vm.selectedProject.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    vm.UpgradeToSeeMsg = "<p>Please upgrade to see History feature.</p>";
                    var items = {};
                    items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                    items.popupTitle = "Project Upgrade";
                    items.popupButtonName = "Upgrade";
                    showEnableHistoryPopUp(vm.selectedProject, items);
                } else {
                    vm.UpgradeToSeeMsg = '<p class="m-b0 p-l30 text-left">History feature is not enabled. Please contact Pype support.</p>'+
                    '<p class="m-b0 p-l30 text-left"><b>Email:</b> <span class="p-l10">pypesupport@autodesk.com.</span></p>' +
	                '<p class="m-b0 p-l30 text-left"><b>Phone:</b> <span class="p-l5">1 (855)-910-7137</span></p>';
                    var items = {};
                    items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                    items.popupTitle = "Alert";
                    items.popupButtonName = "Contact Us";
                    showEnableHistoryPopUp(vm.selectedProject, items);
                }
            }
            else {
                LogEvent("SmartRegister to History", "User navigated to History from smart register using 'History' button", "SUCCESS", function () {
										goToHistoryPage();
                });
            }
        }

        function checkSpecViewEnable(flag) {
            if (flag === false) {
                if (vm.selectedProject.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    vm.UpgradeToSeeMsg = "Please upgrade to see SpecView feature.";
                    var items = {};
                    items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                    items.popupTitle = "Project Upgrade";
                    items.popupButtonName = "Upgrade";
                    showUpgradetoSeePopup(vm.selectedProject, items);
                } else {
                    vm.UpgradeToSeeMsg = '<p class="m-b0 p-l30 text-left">SpecView feature is not enabled. Please contact Pype support.</p>'+
                    '<p class="m-b0 p-l30 text-left"><b>Email:</b> <span class="p-l10">pypesupport@autodesk.com.</span></p>' +
	                '<p class="m-b0 p-l30 text-left"><b>Phone:</b> <span class="p-l5">1 (855)-910-7137</span></p>';
                    var items = {};
                    items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                    items.popupTitle = "Alert";
                    items.popupButtonName = "Contact Us";
                    showEnabledSpecViewPopUp(vm.selectedProject, items);
                }
            }
            else {
                var record = AuthenticationService.GetSpecViewData(), specNumber = "";
                if (record && record.record) {
                    specNumber = record.record.specNumber
                }
                LogEvent("SmartRegister to Specview", "User navigated to SpecView from smart register using 'open Spec View' button for Spec Section : '" + specNumber + "'", "SUCCESS", function () {
					AuthenticationService.setSmartViewType('specview');
                    $location.path('/smartview/projects/' + $routeParams.id);
                });
            }
        }

        function showEnabledSpecViewPopUp(project, items) {
			ModalService.showUpgradetoSeePopup(items)
            .result.then(function (data) {
                vm.modalTitle = 'Contact Us';
                EnableSpecView(project.name, 'SpecView');
            });
        }

        function EnableSpecView(projectName, feature) {
            $scope.user = vm.user;
            var items = PopulatingUserDetails(projectName);
            items.RequestType = "Enable SpecView for " + projectName;
            items.feature = feature;
            ModalService.contactUsByFeaturePopup(items);
        }

        function showEnableHistoryPopUp(project, items) {
			ModalService.showUpgradetoSeePopup(items)
            .result.then(function (data) {
				vm.modalTitle = "Contact Us";
                EnableHistoryView(project.name, 'History');
            });
        }

        function EnableHistoryView(projectName, feature) {
            $scope.user = vm.user;
            var items = PopulatingUserDetails(projectName);
            items.RequestType = "Enable History for " + projectName;
            items.feature = feature;
			ModalService.contactUsByFeaturePopup(items);
        }

		$scope.$on('openConfirmExportPopup', function(event, data) {
			openConfirmExportPopup(data.downloadType, data.types);
		});

        function openConfirmExportPopup(downloadType, types) {
            vm.downloadType = downloadType;
            if (downloadType.toUpperCase() === 'PROCORE') {
                CheckIfProcoreExportEnabled(downloadType, types);
            } else if(downloadType.toUpperCase() === 'PROJECTSIGHT') {
            	checkIfProjectSightExportEnabled(downloadType, types);
            } else if(downloadType.toUpperCase() === 'ACONEX') {
            	checkIfAconexExportEnabled(downloadType, types);
            } else if( (downloadType.toUpperCase() === 'BIM 360' || downloadType.toUpperCase() === 'BIM360')
				|| (downloadType.toUpperCase() === 'BUILD' || downloadType.toUpperCase() === 'ACC BUILD')) {
					if(downloadType.toUpperCase() === 'BIM360') { downloadType = 'BIM 360'; }
					if(downloadType.toUpperCase() === 'BUILD') { downloadType = 'ACC Build'; }
					ExportService.openExportToBIM360Options(downloadType, types, 'smartRegister');
            } else if (downloadType.toUpperCase() === 'BLUEBEAM STUDIO') {
                vm.domainId = types[0].domainid;
                ConnectToBlueBeam();
            } else {
               openExportOptionPopup(downloadType, types);
            }
        }

		$scope.$on('publishToBuild', function() {
			setUserAndFilterDetails();
			AuthenticationService.SetLastRoute($location.path());
            $location.path('/draftmappings');
		});

        function connectNewPageToexportFormatSpecificFile(domiainType, domainId) {
            var exportOption = {};
            exportOption.domainId = domainId;
            exportOption.domainName = domiainType;
            AuthenticationService.SetExportOptionInfo(exportOption);
			$location.path('/export/').search({sourcePage: 'smartRegister'});
        }

		function connectToProcoreExcelExport(domiainType, domainId) {
			var exportOption = { 'domainId': domainId, 'domainName': domiainType };
			AuthenticationService.SetExportOptionInfo(exportOption);
			var dontShowMappingPageFlag = AuthenticationService.GetDontShowProcoreMappingPage();
			if(!dontShowMappingPageFlag) {
				$location.path('/procoremapping/').search({ sourcePage: 'smartRegister', 'fromExcelExport': true, 'file': true });
			}
			else {
				$location.path('/excelexport/').search({sourcePage: 'smartRegister'});
			}
		}

		// Removing this event listener when scope of this file is destroyed.
		// It also frees the memory too.
	    $scope.$on('$destroy', function () {
	        window.removeEventListener('message', integrationsCallbackEvent, false);
	    });
		window.addEventListener('message', integrationsCallbackEvent, false);

		function integrationsCallbackEvent(externalWindowData) {
			if (externalWindowData.origin !== window.location.origin) // Compliant
    			return;

			if(externalWindowData.data.integrationType === EXPORT_INTEGRATION) {
	            vm.dataLoading = "Launching export wizard...";
	            var requiredData = {
                    userId :vm.user.userId,
                    projectId:vm.selectedProject.projectId,
                    versionId:vm.selectedVersion.versionId,
                    companyId:vm.user.company.companyId
                };
            	ExportService.processIntegration(requiredData, externalWindowData, 'smartregister', function(response){
                    vm.dataLoading = false;
                    if(!response.success){
                        FlashService.Error(response.message);
                    }
    			});
			}
		}

		$rootScope.$on('openExportOptionPopup', function(event, data) {
			openExportOptionPopup(data.downloadType, data.types);
		});

        function openExportOptionPopup(downloadType, types) {
        	var excelDomainID = UtilService.getDomainIDByTypeName(types, vm.excelString);
        	var csvDomainID = UtilService.getDomainIDByTypeName(types, vm.csvString);
        	if(csvDomainID === -1) {
        		vm.domainId = excelDomainID;
        		connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
        	} else if(excelDomainID === -1) {
        		vm.domainId = csvDomainID;
        		connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
        	} else {
        		var modalInstance2 = $uibModal.open({
                    animation: true,
                    templateUrl: MAINURL + 'views/smartregister/submittals/ExportAsCMIC.view.html?version=9.2',
                    controller: 'ExportAsCMICController',
                    backdrop: 'static',
                    resolve: {
                        items: { downloadType: downloadType }
                    }
                });
                modalInstance2.result.then(function (data) {
                    if (data.global.exportType.toUpperCase() === "EXPORTASEXCEL") {
                    	vm.domainId = excelDomainID;
                    } else {
                    	vm.domainId = csvDomainID;
                    }
                    connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
                });
        	}
        }

        function showConfirmationPopup(items, callback) {
            var modalInstance = $uibModal.open({
			    animation: true,
			    templateUrl: MAINURL
						+ 'views/support/support.enterpriseconfirmation.view.html?version=9.0',
			    controller: 'ConfirmUpgradeToEnterprise',
			    backdrop: 'static',
			    windowClass: 'smallwindow',
			    resolve: { items: items }
			});

            modalInstance.result.then(function (data) {
                callback(true);
            }, function () {
                callback(false);
            });
        }

        function CheckIfProcoreExportEnabled(downloadType, types) {
            ProjectService.CheckIfProcoreExportEnabled(vm.selectedProject.projectId, function (response) {
			    if (response.success) {
			        if (response.data) {
			            openProcorePopup(downloadType, types);
			        } else {
						openProcorePopup(downloadType, types, true);
			        }
			    } else {
					openProcorePopup(downloadType, types, true);
			        FlashService.Error(response.message);
			    }
			});
        }

        function openProcorePopup(downloadType, types, disabledApi) {
            var data = {};
            data.exportType = "";
			data.fromProcore = true;
			data.disabledApi = disabledApi;
			var ctrlName = 'ExportToProcoreController';
			ModalService.openExportTypeSelectionPopup(data, ctrlName)
	            .result.then(function (data) {
	                if (data.global.exportType.toUpperCase() === 'EXPORTTODOWNLOAD') {
	                	vm.domainId = UtilService.getDomainIDByTypeName(types, vm.excelString);
						connectToProcoreExcelExport(downloadType, vm.domainId);
	                } else {
	                    ConnectToProcore(data.global);
	                }
	        });
        }

		function ConnectToProcore(data) {
			setUserAndFilterDetails();
			ProcoreIntegrationService.GetProcoreCall(vm.user.userId, function(response) {
				if (response.success) {
					AuthenticationService.SetIntegrationType(EXPORT_INTEGRATION);
					var pWindow = ExportService.openNewWindow(response.data.api, 670, 540);
					if (!pWindow || pWindow.closed || typeof pWindow.closed == 'undefined') {
						var items = {};
						items.message = "Pop-ups should be enabled in your browser for AutoSpecs to continue with Procore Integration";
						ModalService.showPopupBlockerMessage(items);
					}
				} else {
					FlashService.Error(response.message || "Failed to connect to Procore Page");
				}
				vm.dataLoading = false;
			});
		}

	  /* ----------- ProjectSight Functions ----------- */
		function checkIfProjectSightExportEnabled(downloadType, types) {
			ProjectService.checkIfProjectSightExportEnabled(vm.selectedProject.projectId, function (response) {
			    if (response.success) {
			        if (response.data) {
			            openProjectSightPopup(downloadType, types);
			        } else {
						openProjectSightPopup(downloadType, types, true);
			        }
			    } else {
					openProjectSightPopup(downloadType, types, true);
			        FlashService.Error(response.message);
			    }
			});
		}

		function openProjectSightPopup(downloadType, types, disabledApi) {
            var data = {};
            data.exportType = "";
			data.fromProjectSight = true;
			data.disabledApi = disabledApi;
			var ctrlName = 'ExportToProjectSightController';
			ModalService.openExportTypeSelectionPopup(data, ctrlName)
	            .result.then(function (data) {
	                if (data.global.exportType.toUpperCase() === 'EXPORTTODOWNLOAD') {
	                	vm.domainId = UtilService.getDomainIDByTypeName(types, vm.excelString);
						connectToProjectSightExcelExport(downloadType, vm.domainId);
	                } else {
	                    connectToProjectSight(data.global);
	                }
	            });
        }

		function connectToProjectSightExcelExport(domiainType, domainId) {
			var exportOption = { 'domainId': domainId, 'domainName': domiainType };
			AuthenticationService.SetExportOptionInfo(exportOption);
			var dontShowMappingPageFlag = AuthenticationService.GetDontShowProjectSightMappingPage();
			if(!dontShowMappingPageFlag) {
				$location.path('/projectsightmapping/').search({ sourcePage: 'smartRegister', 'fromExcelExport': true, 'file': true });
			}
			else {
				$location.path('/excelexport/').search({sourcePage: 'smartRegister'});
			}
		}

		function connectToProjectSight(data) {
			vm.dataLoading = "Launching export wizard...";
			setUserAndFilterDetails();
			ProjectSightService.getProjectSightCall(vm.user.userId, function(response) {
				if (response.success) {
					AuthenticationService.SetIntegrationType(EXPORT_INTEGRATION);
					var pWindow = ExportService.openNewWindow(response.data.api, 670, 540);
					if (!pWindow || pWindow.closed || typeof pWindow.closed == 'undefined') {
						var items = {};
						items.message = "Pop-ups should be enabled in your browser for AutoSpecs to continue with ProjectSight Integration";
						ModalService.showPopupBlockerMessage(items);
					}
				} else {
					FlashService.Error(response.message || "Failed to connect to ProjectSight Page");
				}
				vm.dataLoading = false;
			});
		}
	  /* ----------- End of ProjectSight Functions ----------- */


		function prepareIntegrationUserDetails() {
			vm.pypeProjectID = vm.selectedProject.projectId;
	  		vm.pypeCompanyID = vm.user.company.companyId;
			vm.pypeProjectVersionID = vm.selectedVersion.versionId;
			vm.userDetailsObject = {
				  pypeUserId: vm.user.userId,
				  pypeUserName: vm.user.name,
				  pypeProjectId: vm.pypeProjectID,
				  pypeProjectName: vm.selectedProject.name,
				  pypeVersionId: vm.pypeProjectVersionID,
				  pypeVersionName: vm.selectedVersion.name,
				  pypeCompanyId: vm.pypeCompanyID,
				  pypeCompanyName: vm.companyName
			}
			$window.localStorage.setItem("userDetailsObject", JSON.stringify(vm.userDetailsObject));
			vm.userDetailsInString = JSON.stringify(vm.userDetailsObject);
			vm.userDetailsInString = encodeURIComponent(vm.userDetailsInString);
		}

		$rootScope.$on('dataLoading', function(event, message) {
			vm.dataLoading = message;
		});

		$rootScope.$on('setUserAndFilterDetails', function() {
			setUserAndFilterDetails();
		});

		function setUserAndFilterDetails() {
			var filteredItems = {
				divisionCodeSelectedItems: vm.divisionCodeSelectedItems,
				specSectionSelectedItems: vm.specSectionSelectedItems,
				projectSummaryGroupSelectedItems: convertAllValuesToLowerUpperCase(vm.projectSummaryGroupSelectedItems, 'upper'),
				specCategorySelectedItems: convertAllValuesToLowerUpperCase(vm.specCategorySelectedItems),
				specCategoryGroupSelectedItems: convertAllValuesToLowerUpperCase(vm.specCategoryGroupSelectedItems),
				subContractorSelectedItems: convertAllValuesToLowerUpperCase(vm.subContractorSelectedItems)
			}

			vm.pypeProjectID = vm.selectedProject.projectId;
            vm.pypeCompanyID = vm.user.company.companyId;
            vm.pypeProjectVersionID = vm.selectedVersion.versionId;
            vm.userDetailsObject = {
                pypeUserId: vm.user.userId,
                pypeUserName: vm.user.name,
                pypeProjectId: vm.pypeProjectID,
                pypeProjectName: vm.selectedProject.name,
                pypeVersionId: vm.pypeProjectVersionID,
                pypeVersionName: vm.selectedVersion.name,
                pypeCompanyId: vm.pypeCompanyID,
                pypeCompanyName: vm.companyName
            }

            $window.localStorage.setItem("userDetailsObject", JSON.stringify(vm.userDetailsObject));
			$window.localStorage.setItem("filteredItems", JSON.stringify(filteredItems));
		}

        function ConnectToBlueBeam() {
            prepareIntegrationUserDetails();
            BlueBeamIntegrationService.GetBlueBeamCall(vm.user.userId, vm.userDetailsInString, function (response) {
                if (response.success) {
					AuthenticationService.SetIntegrationType(EXPORT_INTEGRATION);
					var pWindow = ExportService.openNewWindow(response.data.api, 670, 540);
                    if (!pWindow || pWindow.closed || typeof pWindow.closed == 'undefined') {
			            var items = {};
			            items.message = "Pop-ups should be enabled in your browser for AutoSpecs to continue with Bluebeam Integration";
			            ModalService.showPopupBlockerMessage(items);
			        }
                } else {
                    FlashService.Error(response.message);
                }
				vm.dataLoading = false;
            });
        }

        function checkIfAconexExportEnabled(downloadType, types) {
            ProjectService.CheckIfAconexExportEnabled(vm.selectedProject.projectId,
				function (response) {
				    if (response.success) {
				        if (response.data) {
				            NavigateToAconex(downloadType, types);
				        } else {
				        	vm.domainId = UtilService.getDomainIDByTypeName(types, vm.excelString);
				            connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
				        }
				    } else {
				    	vm.domainId = UtilService.getDomainIDByTypeName(types, vm.excelString);
				        connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
				        vm.aconexExportEnabled = response.data;
				        FlashService.Error(response.message);
				    }
				});
        }


        function NavigateToAconex(downloadType, types) {
            OpenAconexPopup(downloadType, types);
        }
        function OpenAconexPopup(downloadType, types) {
            var data = {};
            data.exportType = "";
            var modalInstance2 = $uibModal.open({
                animation: true,
                templateUrl: MAINURL + 'views/smartregister/submittals/ExportToAconex.view.html?version=beta_9.1',
                controller: 'ExportToAconexController',
                backdrop: 'static',
                resolve: {
                    items: function () { return data; }
                }
            });
            modalInstance2.result.then(function (data) {
                if (data.global.exportType.toUpperCase() === 'EXPORTTODOWNLOAD') {
                	vm.domainId = UtilService.getDomainIDByTypeName(types, vm.excelString);
                    connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
                } else {
                    ConnectToAconex(data.global);
                }
            });
        }

        function ConnectToAconex(data) {
			setUserAndFilterDetails();
			AconexIntegrationService.GetAconexCall(function (response) {
			    if (response.success) {
					AuthenticationService.SetIntegrationType(EXPORT_INTEGRATION);
					var pWindow = ExportService.openNewWindow(response.data, 670, 540);
			        if (!pWindow || pWindow.closed || typeof pWindow.closed == 'undefined') {
			            var items = {};
			            items.message = "Pop-ups should be enabled in your browser for AutoSpecs to continue with Aconex Integration";
			            ModalService.showPopupBlockerMessage(items);
			        }
			    } else {
					FlashService.Error(response.message || "Failed to connect to Aconex");
			    }
			    vm.dataLoading = false;
			});
        }

        function NavigateToCreateVersion() {
            GetUpdatedProject(vm.selectedProject);
        }

		$scope.$on('checkAddSpecsAvailable', function() {
			checkAddSpecsAvailable();
		});

        function checkAddSpecsAvailable() {
            AddendumService.CheckAddSpecsAvailable(vm.selectedProject.projectId, function (response) {
                if (response.success) {
                    if (response.data) {
                        NavigateToCreateAddendum();
                    } else {
                        var items = {};
                        items.UpgradeToSeeMsg = "<p class='m-b0 p-l30 text-left'>The addendum feature is not enabled for the project '<b>" + vm.selectedProject.name + "'</b>." +
    					"<p class='m-b15 p-l30 text-left'>Contact us for more information about upgrading to access this feature.</p>" +
    					"<p class='m-b0 p-l30 text-left'><b>Email:</b> <span class='p-l10'>pypesupport@autodesk.com.</span></p>" +
    	                "<p class='m-b0 p-l30 text-left'><b>Phone:</b> <span class='p-l5'>1 (855)-910-7137</span></p>";
                        items.title = "Addendum feature not enabled";
                        showContactusToBuyFeature(vm.selectedProject, items, 'Add Specs');
                    }
                } else {
                    FlashService.error(response.message);
                }
            });
        }

        function NavigateToCreateAddendum() {
			ModalService.openCreateAddendumPopup(vm.selectedProject, vm.selectedVersion)
			.result.then(function(data) {
				createAddendum(data.version, vm.selectedProject.projectId, data.addendumName);
		    });
        }

        function createAddendum(version, projectId, addendumName) {
            AddendumService.CreateAddendum(version.versionId, projectId, addendumName, function (response) {
                if (response.success) {
                    if (response.data) {
                        vm.versionAddendum = response.data;
                        AuthenticationService.SetVersionAddendum(vm.versionAddendum);
						AuthenticationService.SetLastRoute($location.path());
						$location.path('/addendum');
                    }
                } else {
                    FlashService.Error(response.message);
                }
            });
        }

        function CheckNotStartedVersionsNumber(project) {
            var count = 0;
            for (var i = 0; i < project.versions.length; i++) {
                if (project.versions[i].status.toLowerCase() === 'completed') {
                    count++;
                }
            }
            if (count > 1)
                return true;
            return false;
        }

        function NavigateToCompareVersion() {
            if (vm.selectedProject.versions.length > 1) {
                if (CheckNotStartedVersionsNumber(vm.selectedProject)) {
                    //$('footer').show();
                    AuthenticationService.SetProject(vm.selectedProject);
                    $location.path('/compareversion');
                }
                else {
                    var items = {};
                    items.title = 'Alert';
                    items.message = "You can only compare, if there are at least two versions for which specs have been uploaded and run successfully";
                    ModalService.showAlertMessage(items);
                }
            }
            else {
                var items = {};
                items.title = 'Alert';
                items.message = "Comparison requires at least two versions of the specifications. Please upload another version to use the comparison feature.";
                ModalService.showAlertMessage(items);
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

        function getSelectedProject() {
            var project = AuthenticationService.GetProject();
			vm.selectedProject = angular.copy(project);
            AuthenticationService.SetProject(vm.selectedProject);

            var version = AuthenticationService.GetVersion();
            if (version) {
                if(vm.selectedProject.versions && vm.selectedProject.versions.length>0) {
                    vm.selectedVersion = vm.selectedProject.versions.filter(function (data) {
                        if (data.versionId === version.versionId) return data;
                    })[0];
                    AuthenticationService.SetVersion(vm.selectedVersion);
                }
            }
            else {
                vm.selectedVersion = vm.selectedProject.versions[0];
            }
			if(vm.selectedVersion && vm.selectedVersion.versionId) {
				validateAndLoad(vm.selectedProject, vm.selectedVersion);
			} else {
				vm.dataLoading = false;
			}
			LogEvent("Page Visit", "User visited SmartRegister page.", "SUCCESS");
        }

		function setSpecsPlansFilter() {
			if(vm.selectedProject.planViewFlag) {
				vm.sessionSourceModule = AuthenticationService.getSRSourceModuleFilter();
				if(!vm.sessionSourceModule || !vm.selectedProject.planViewFlag || !vm.plansSubmittalExist) {
					vm.sessionSourceModule = ['specs', 'plans'];
				}
			}
			vm.moduleSpecs = { selected: (!vm.sessionSourceModule || vm.sessionSourceModule.indexOf('specs') > -1) };
			vm.modulePlans = { selected: (!vm.sessionSourceModule || vm.sessionSourceModule.indexOf('plans') > -1) };
		}

		function getSpecSchedulesForSpecSections(){
			SmartRegisterService.getSpecSchedulesForSpecSections(vm.selectedProject.projectId, vm.selectedVersion.versionId, function(response) {
				vm.specSectionToSchedulesMap = {};
				if (response.success) {
					if(response.data) {
						var data = JSON.parse(response.data);
						data.specSectionToSchedulesMap.forEach(function(item) {
							vm.specSectionToSchedulesMap[item.specName.toLowerCase()] = item.schedules;
						});
					}
                }
			});
		}

        function ResetSmartRegisterFilter() {
            AuthenticationService.SetSmartRegisterFilter([]);
        }

        function undoChanges(callback) {
            EmptyStackData();

            var filterData = AuthenticationService.GetSmartRegisterFilter();
            getFilterRelatedValues(filterData);

            LoadSmartRegisterList(vm.selectedProject.projectId, vm.selectedVersion.versionId, callback);
            $rootScope.smartRegisterDataDirty = false;
            vm.SmartRegisterChanged = false;
        }

        $scope.$watch('smartRegisterDataDirty', function () {
            $scope.$broadcast('dirtyFlagChanged', $rootScope.smartRegisterDataDirty);
        });

        function showUndoConfirmation(message) {
			ModalService.OpenConfirmModal('Undo changes?', message)
			.result.then(function () {
				undoChanges();
            }, function() {});
        }

        function Upgrade(projectName) {
            $scope.user = vm.user;
			var upgradeItems = PopulatingUserDetails(projectName);
            ModalService.showContactUsPopup(upgradeItems);
        }

        function showUpgradetoSeePopup(project, items) {
			ModalService.showUpgradetoSeePopup(items)
            .result.then(function (data) {
                vm.modalTitle = 'Upgrade Project';
                Upgrade(project.name);
            });
        }

        function ShowRequirementsOverviewDialog() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: MAINURL + 'views/smartregister/submittals/requirements.overview.view.html',
                controller: 'RequirementOverviewController',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    project: function () {
                        return vm.selectedProject;
                    },
                    version: function () {
                        return vm.selectedVersion;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });
        }

        function ContactUs() {
            $location.path('/contactus');
        }

        $window.onbeforeunload = function (event) {
			if ($rootScope.smartRegisterDataDirty && AuthenticationService.getBearerToken()) {
                return true;
            }
        };


        function SetGridDefaults() {

            vm.search =
                [
					{ field: 'serialNumber', caption: 'S. No', type: 'text'},
                    { field: 'divisionCode', caption: 'Division', type: 'text', hidden: true },
                    { field: 'projectSummaryGroup', caption: 'Project Summary Group', type: 'text', hidden: true },
                    { field: 'specCategoryGroup', caption: 'Submittal Type Group', type: 'text' },
                    { field: 'specName', caption: 'Spec Name', type: 'text', hidden: true },
                    { field: 'specNumber', caption: 'Spec Section', type: 'text', hidden: true },
					{ field: 'drawingSheetNumber', caption: 'Sheet #', type: 'text', hidden: true },
                    { field: 'drawingSheetName', caption: 'Sheet Name', type: 'text', hidden: true },
                    { field: 'paraCode', caption: 'Spec sub section', type: 'text', hidden: true },
                    { field: 'specCategory', caption: 'Submittal Type', type: 'text' },
                    { field: 'submittalDescription', caption: 'Submittal Description', type: 'text', hidden: true },
                    { field: 'submittalsHeading', caption: 'Sub Section Heading', type: 'text'},
                    { field: 'subContractor', caption: 'Subcontractor', type: 'text' },
                    { field: 'userNotes', caption: 'User Notes', type: 'text' },
                    { field: 'source', caption: 'Source Version', type: 'text' },
                    { field: 'dateIssued', caption: 'Date Issued', type: 'text', hidden: true }
                ];
            var category = [
                           'Air Quality Permits', 'Allowances', 'Attic Stock', 'As-Builts', 'Basis of Design', 'Bill Of Materials', 'Calculations', 'Certificates', 'Certifications', 'Conference', 'Delegated-Design Submittal', 'Delivery Tickets', 'Design and Engineering', 'Diagrams', 'Network Diagram', 'Sprinkler Diagram', 'Wiring Diagram', 'Fabrication', 'Inventory', 'LEED Submittals', 'Manufacturers Instructions', 'Maintenance Data', 'Maintenance Service', 'Manufacturers Data', 'Manufacturers Warranty', 'Measurements', 'Meeting Minutes', 'Mix Design', 'Mockups', 'Numbering Scheme', 'O&M Training and Demonstration', 'O&M Manuals', 'Performance Data', 'Permits', 'Photometric Data', 'Photos', 'Plans', 'Product Data', 'Proposal', 'Qualification Data', 'Sample Warranty', 'Samples', 'Schedules', 'Keying Schedule', 'Product Schedule', 'Submittal Schedule', 'Shop Drawings', 'Coordination Drawings', 'Drawings', 'Templates', 'Tests and Inspections', 'Test Reports', 'Reports', 'Special Warranty', 'Valve Charts', 'Warranty', 'Waste Management Plan'
            ];
            var subHeading = [
                              'RECORD DOCUMENTS', 'RECORD DRAWINGS', 'SOFTWARE SERVICE AGREEMENT', 'WARRANTY, SERVICE, AND REPLACEMENT PARTS', 'SHOP DRAWING SUBMITTAL DATA', 'SHOP DRAWING AND SUBMITTAL DATA', 'SHOP DRAWINGS AND SUBMITTALS', 'SHOP DRAWINGS AND SUBMITTAL DATA', 'INFORMATIONAL', 'SHOP DRAWINGS', 'MAINTENANCE MATERIAL', 'MAINTENANCE MATERIALS', 'MAINTENANCE', 'GUARANTEE', 'LEED SUBMITTALS', 'MAINTENANCE MANUALS', 'MAINTENANCE SERVICE', 'INFORMATIONAL SUBMITTALS', 'SHOP DRAWINGS SUBMITTALS', 'MAINTENANCE MATERIAL SUBMITTALS', 'SUSTAINABLE DESIGN SUBMITTALS', 'QUALITY ASSURANCE', 'FIELD TESTING', 'FIELD INSPECTION', 'SYSTEM TESTING', 'FIELD QUALITY CONTROL', 'SITE QUALITY CONTROL', 'DELIVERY, STORAGE, AND HANDLING', 'DEMONSTRATION', 'EXTRA MATERIALS', 'WARRANTY', 'SUBMITTALS', 'ACTION SUBMITTALS', 'CLOSEOUT SUBMITTALS', 'OPERATION AND MAINTENANCE DATA', 'MOCK-UP'
            ];

            var specCatGrp = [
                               	'Others', 'Attic Stock', 'Certificates', 'Certifications', 'LEED', 'O&M Manuals', 'Maintenance Service', 'Product Data', 'Special Warranties', 'Mockups', 'Demonstrations', 'Sample Warranty', 'Samples', 'Schedules', 'Shop Drawings', 'Drawings', 'Tests and Inspections', 'Test Reports', 'Reports', 'General Warranties'
            ];
            var projSummaryGrp = [
'CLOSEOUT SUBMITTALS', 'DIVISION 01 REQUIREMENTS', 'MOCKUPS', 'ACTION AND INFORMATIONAL', 'QUALITY ASSURANCE', 'TESTS AND INSPECTIONS', 'QUALITY CONTROL', 'OTHERS'
            ];

            var smartRegisterColumns =
                [
                   { field: 'source', caption: 'Source version', tooltip: 'Source Version', size: UtilService.GetColumnWidthsInPixels(10), sortable: true, hidden: true, resizable: true, editable: false },//UtilService.GetColumnWidthsInPixels(7)
                   {
                         field: 'pdfPageNumber', caption: 'Spec PDF', sortable: true, size: UtilService.GetColumnWidthsInPixels(10), tooltip: 'Spec Section PDF', style: 'text-align:center;',
                         render: function (record) {
                        	 if(record.sourceModule && ['plans', 'procurementlog'].indexOf(record.sourceModule.toLowerCase()) > -1) {
								 return '<div class="pypeLink link-sr"><span class="plan-logo SpecSectionPDFicon" id="popover' +
                            	 record.recid + '" onclick=\'openSmartRegisterPopover("' + record.recid + ', ' + record.sourceModule + '");event.stopPropagation();\' aria-hidden="true"></span><span id="tooltip-'+record.recid+'"class="sr-tooltiptext">Click to open PlanView</span></div>';
							 } else {
								 return '<div class="pypeLink"><span class="spec-logo SpecSectionPDFicon" id="popover' +
								 record.recid + '" onclick=\'openSmartRegisterPopover("' + record.recid + ', ' + record.sourceModule + '");event.stopPropagation();\' aria-hidden="true"></span><span id="tooltip-'+record.recid+'" class="sr-tooltiptext">Click to open spec section</span></div>';
							 }
                         }, resizable: true, editable: false
                    },
					{
                          field: 'drawingPageNumber', caption: 'Links', sortable: false, size: UtilService.GetColumnWidthsInPixels(6), tooltip: 'Link to Schedules', style: 'text-align:center;',
                          render: function (record) {
							  if (record.specName && (!vm.scheduleSubmittalTypes || (vm.scheduleSubmittalTypes && vm.scheduleSubmittalTypes.indexOf(record.specCategory) !== -1)) &&
							  	   vm.specSectionToSchedulesMap && vm.specSectionToSchedulesMap[record.specName.toLowerCase()] ) {
                             	 		return '<div class="pypeLink spec-schedules-link"><i class="fa fa-link schedulesLinkPDFicon" id="linkPopover' +
                             	 				record.recid + '" onclick=\'openSchedulesPopover("' + record.recid + ', ' + record.specName + '");event.stopPropagation();\' aria-hidden="true"></i>' +
												'<span class="sr-tooltiptext w-220 m-l5">Click to open Spec Schedules Links</span></div>';
                              }
                          }, resizable: true, editable: false
                     },
                    { field: 'serialNumber', caption: 'S. no.', sortable: true, size: UtilService.GetColumnWidthsInPixels(8), resizable: true, editable: false, tooltip: 'Submittal Number' },
                    { field: 'divisionCode', caption: 'Division', hidden: true, sortable: true, size: UtilService.GetColumnWidthsInPixels(8), resizable: true, tooltip: 'Division', editable: vm.readonly ? false : { type: 'text' } },
                    {
                        field: 'specNumber', caption: 'Spec #', sortable: true, size: UtilService.GetColumnWidthsInPixels(10.5),
                        render: function (record, index, col_index) {
                            var updatedSpecNum = this.getCellValue(index, col_index);
                            if (record.changes && record.changes.specNumber !== undefined && record.changes.specNumber !== '') {
                                updatedSpecNum = record.changes.specNumber;
                            }
                            else if (record.specNumber && record.specNumber.toLowerCase().indexOf("unknown") >= 0)
                                updatedSpecNum = 'Enter the Spec Section Number';

                            else if (record.specNumber && record.specNumber.indexOf(vm.RevisedLabel) > -1) {
                                updatedSpecNum = record.specNumber.slice(0, record.specNumber.indexOf(vm.RevisedLabel));
                            }

                            return "<div title=\'" + updatedSpecNum + "\'>" + updatedSpecNum + "</div>";
                            //return record.specNumber;
                            //return "<div title=\'"+ this.getCellValue(index, col_index) + "\'>" + this.getCellValue(index, col_index)+ "</div>";
                        },
                        resizable: true, editable: vm.readonly ? false : { type: 'combo' }, tooltip: 'Spec Section',
                    },
                    { field: 'specName', caption: 'Spec name', sortable: true, size: UtilService.GetColumnWidthsInPixels(12), resizable: true, tooltip: 'Spec Name', editable: vm.readonly ? false : { type: 'combo' } },
					{ field: 'drawingSheetNumber', caption: 'Sheet #', sortable: true, size: UtilService.GetColumnWidthsInPixels(8), resizable: true, editable: false, tooltip: 'Doc Number' },
					{ field: 'drawingSheetName', caption: 'Sheet name', sortable: true, size: UtilService.GetColumnWidthsInPixels(11), resizable: true, editable: false, tooltip: 'Doc Name' },
                    { field: 'paraCode', caption: 'Spec sub section', tooltip: 'Spec sub section', sortable: true, size: UtilService.GetColumnWidthsInPixels(8), resizable: true, editable: vm.readonly ? false : { type: 'text' } },
                    { field: 'submittalsHeading', caption: 'Sub section heading', sortable: true, size:UtilService.GetColumnWidthsInPixels(18), hidden: false, tooltip: 'Sub Section Heading', resizable: true, editable: vm.readonly ? false : { type: 'combo', items: subHeading, showAll: true } },
                    {
                        field: 'specCategory', caption: 'Submittal type', sortable: true, size: UtilService.GetColumnWidthsInPixels(16), resizable: true, tooltip: 'Submittal Type', editable: vm.readonly ? false : { type: 'combo' },
						render: function (record, index, col_index) {

                        var html = '';
                        var specNumber = record.specNumber, submittalType = this.getCellValue(index, col_index);
                        if (record.divisionCode !== '01') {
                            if (record.specNumber && record.specNumber.indexOf(vm.RevisedLabel) > -1)
                                specNumber = record.specNumber.slice(0, record.specNumber.indexOf(vm.RevisedLabel));

                            if (record.productFlag && record.specCategory.toLowerCase() === 'product data' && vm.selectedVersion.name === record.source) {
                                html = "<a href='#' class='handCursor' title='View products for the spec section - " + record.specNumber + "' onclick='GotoProducts(" + JSON.stringify(specNumber) + ',' + JSON.stringify(record.paraCode) + ")'>&nbsp;" + this.getCellValue(index, col_index) + "</a>";
                            }else if(record.sourceModule && (record.sourceModule === 'procurementlog' || record.sourceModule === 'plans')){
                            	return "<div title=\'" + submittalType + "\'>" + submittalType + "</div>";
                            }
                            else if (record.specCategory && record.specCategory.toLowerCase() === 'product data' && vm.selectedVersion.name === record.source) {
                                html = "<a href='#' class='handCursor' title='View products for the spec section - " + record.specNumber + "' onclick='GotoProducts(" + JSON.stringify(specNumber) + ")'>&nbsp;" + this.getCellValue(index, col_index) + "</a>";
                            }
                            else {
                                return "<div title=\'" + submittalType + "\'>" + submittalType + "</div>";
                            }
                        }
                        else {
                            return "<div title=\'" + submittalType + "\'>" + submittalType + "</div>";
                        }
                        return html;
                    }
                    },
                    { field: 'submittalDescription', caption: 'Submittal description', sortable: true, size: UtilService.GetColumnWidthsInPixels(30), resizable: true, tooltip: 'Submittal Description', editable: vm.readonly ? false : { type: 'textarea' },
						render: function(record, index, col_index) {
							var updatedDescription = this.getCellValue(index, col_index);
							if(record.sourceModule && record.sourceModule.toLowerCase()==="procurementlog") {
	                            return "<div class='pypeLink pull-left added-plgrid'><img src='images/pl-tabimg.png' title='Added from Procurement Log' class='al-addedpl w-16 pos-r2'><span class='al-addedpldescr' title=\'" + UtilService.showTitleForNoWrapText(updatedDescription, vm.wrapTextFlag) + "'\>" + updatedDescription + "</span></div>";
	                        } else {
	                            return "<div class='pypeLink pull-left added-plgrid'><span class='al-addedpldescr' title=\'" + UtilService.showTitleForNoWrapText(updatedDescription, vm.wrapTextFlag) + "'\>" + updatedDescription + "</span></div>";
	                        }
						}
				 	},
                    { field: 'targetDate', caption: 'Target date', sortable: true, size: UtilService.GetColumnWidthsInPixels(10), render : 'date:mm/dd/yyyy',
                    	resizable: true, tooltip: 'Target Date', editable: vm.readonly ? false : { type: 'date' }
                    },
                    { field: 'userNotes', caption: 'User notes', sortable: true, size: UtilService.GetColumnWidthsInPixels(10), resizable: true, hidden: true, tooltip: 'User Notes', editable: vm.readonly ? false : { type: 'textarea' } },
                    { field: 'subContractor', caption: 'Subcontractor', sortable: true, size: UtilService.GetColumnWidthsInPixels(10), resizable: true, tooltip: 'Subcontractor', editable: vm.readonly ? false : { type: 'combo' } },
                    { field: 'specCategoryGroup', caption: 'Submittal type group', hidden: true, sortable: true, size: UtilService.GetColumnWidthsInPixels(12), tooltip: 'Submittal Type Group', resizable: true, editable: vm.readonly ? false : { type: 'combo', items: specCatGrp, showAll: true } },
                    { field: 'projectSummaryGroup', caption: 'Submittal group', hidden: true, sortable: true, size: UtilService.GetColumnWidthsInPixels(12), tooltip: 'Submittal Group', resizable: true, editable: vm.readonly ? false : { type: 'combo', items: projSummaryGrp, showAll: true } },
                    { field: 'dateIssued', caption: 'Date issued', hidden: true, sortable: true, size: UtilService.GetColumnWidthsInPixels(10), tooltip: 'Date Issued', resizable: true, editable: false },
                ];

				if(!vm.selectedProject.planViewFlag || !vm.plan || (vm.plan && vm.plan.status.toLowerCase() !== 'completed') || !vm.specSectionToSchedulesMap || (vm.specSectionToSchedulesMap && angular.equals({}, vm.specSectionToSchedulesMap))) {
					smartRegisterColumns = removeLinkSchedulesColumn(smartRegisterColumns);
				}
				if(!vm.selectedProject.planViewFlag || !vm.plansSubmittalExist) {
					smartRegisterColumns = removePlansColumns(smartRegisterColumns);
				}

            SmartRegisterService.initSmartColumns(vm.smartColumns, smartRegisterColumns);
            //var columns;
            var columns = AuthenticationService.GetSmartRegisterColumns();

            if (columns) {
				updateStoredColumnsWithLinkSchedulesColumns(columns, smartRegisterColumns);
				updateStoredColumnsWithPlansColumns(columns, smartRegisterColumns);
            	SmartRegisterService.updateStoredColumns(columns, smartRegisterColumns);
                var specPDFRender = '', linksRender = '', specNumberRender = '', specCategoryRender = '', drawingsPDFRender = '', targetDateRender = '',
					subDescRender = '';
                smartRegisterColumns.forEach(function (data) {
                    if (data.field === 'pdfPageNumber') {
						specPDFRender = data.render;
					} else if (data.field === 'drawingPageNumber') {
						linksRender = data.render;
					} else if (data.field === 'specNumber') {
						specNumberRender = data.render;
					} else if (data.field === 'specCategory') {
                        specCategoryRender = data.render;
                    } else if (data.field === 'targetDate') {
                    	targetDateRender = data.render;
                    } else if(data.field === 'submittalDescription') {
						subDescRender = data.render;
					}
                });
                for (var i = 0; i < columns.length; i++) {
                    if (columns[i].field === 'pdfPageNumber') {
                        columns[i].render = angular.copy(specPDFRender);
                    }
					else if (columns[i].field === 'drawingPageNumber') {
                        columns[i].render = angular.copy(linksRender);
                    }
                    else if (columns[i].field === 'specNumber') {
                        columns[i].render = angular.copy(specNumberRender);
                    }
                    else if (columns[i].field === 'specCategory') {
                        columns[i].render = angular.copy(specCategoryRender);
                    }
                    else if (columns[i].field === 'targetDate') {
                        columns[i].render = angular.copy(targetDateRender);
                    }
					else if (columns[i].field === 'submittalDescription') {
                        columns[i].render = angular.copy(subDescRender);
                    }
                }
                vm.columns = columns;
            }
            else {
                vm.columns = smartRegisterColumns;
            }

            getFiltersList();

            if(vm.currentFilter){
            	var filterContent = vm.currentFilter.preferenceContent;
            	if(typeof filterContent === "string"){
            		filterContent = JSON.parse(filterContent);
            	}
            	var filterData = filterContent;
            } else {
            	var filterData = AuthenticationService.GetSmartRegisterFilter();
            }

        	$scope.filtersDirty = AuthenticationService.GetShowSaveSmartRegisterFilter();
            getFilterRelatedValues(filterData);

            var filteredString = "source";
            showFilteredColumn(filteredString);

            vm.sortData = AuthenticationService.GetSortData();
            if (!vm.sortData) {
                vm.sortData = [];
            }
        }

		function removePlansColumns(columns) {
			return columns.filter(function(item) {
				return item.field !== 'drawingSheetNumber' && item.field !== 'drawingSheetName';
			});
		}

		function removeLinkSchedulesColumn(columns) {
			return columns.filter(function(item) {
				return item.field !== 'drawingPageNumber';
			});
		}

		function updateStoredColumnsWithPlansColumns(columns, smartRegisterColumns) {
			if(vm.plansSubmittalExist) {
				var planColumnExist = false;
				for(var i=0; i<columns.length; i++) {
					if(columns[i].field === 'drawingSheetNumber') {
						planColumnExist = true;
						break;
					}
				}
				if(!planColumnExist) {
					smartRegisterColumns.forEach(function(item, index) {
						if(item.field === 'drawingSheetNumber' || item.field === 'drawingSheetName') {
							columns.splice(index, 0, item);
						}
					});
				}
			}
			// else {
			// 	columns = removePlansColumns(columns);
			// }
		}

		function updateStoredColumnsWithLinkSchedulesColumns(columns, smartRegisterColumns) {
			if(vm.plan && vm.plan.status.toLowerCase() === 'completed') {
				var linkColumnExist = false;
				for(var i=0; i<columns.length; i++) {
					if(columns[i].field === 'drawingPageNumber') {
						linkColumnExist = true;
						break;
					}
				}
				if(!linkColumnExist) {
					smartRegisterColumns.forEach(function(item, index) {
						if(item.field === 'drawingPageNumber') {
							columns.splice(index, 0, item);
						}
					});
				}
			}
			// else {
			// 	columns = removeLinkSchedulesColumn(columns);
			// }
		}

		function updateStoredColumns(columns, smartRegisterColumns) {
			if (!columns) {
				return;
			}
			// check if columns from storage is different from existing columns
			var newCols = angular.copy(smartRegisterColumns);
			for (var i = 0; i < columns.length; i++) {
				var storedCol = columns[i];
				var exists = false;
				for (var j = 0; j < smartRegisterColumns.length && !exists; j++) {
					// compare properties of stored column with smart register
					// columns and custom columns
					var smartCol = smartRegisterColumns[j];
					if (smartCol.field !== storedCol.field) {
						continue;
					}
					exists = true;
					newCols[j].exists = true;
					var reset = smartCol.field !== storedCol.field
							|| smartCol.caption !== storedCol.caption
							|| (smartCol.editable !== storedCol.editable && smartCol.editable.type !== storedCol.editable.type)
							|| smartCol.tooltip !== storedCol.tooltip;
					if (reset) {
						console.log('resetting col', columns[i]);
						columns[i] = smartCol;
					}
				}
				if (!exists) {
					console.log('removing col', columns[i], columns);
					columns.splice(i, 1);
					i--;
				}
			}
			for(var j = 0; j < newCols.length; j++) {
				if (!newCols[j].exists) {
					console.log('adding col', newCols[j]);
					columns.push(newCols[j]);
				}
			}

		}

        function getFiltersList() {
	        	var filtersListOriginal = AuthenticationService.GetListOfFilters();
						vm.filtersList = [];
						for(var i=0;i<filtersListOriginal.length;i++){
	        		if(filtersListOriginal[i] && filtersListOriginal[i].name.toUpperCase() !== "DEFAULT" &&
								filtersListOriginal[i].name.toUpperCase() !== "LASTAPPLIEDFILTER") {
	              vm.filtersList.push(filtersListOriginal[i]);
	        		}
	        	}
					 	vm.currentFilter = AuthenticationService.GetCurrentFilterPreference();
        }

        function getFilterRelatedValues(filterData){
			vm.searchDataTemp = [];
			if(filterData) {
				if (filterData.length === 0) {
					$scope.visibleColumnsList = [];
					vm.searchDataTemp = [];
				} else {
					vm.searchDataTemp = filterData;
				}
			}
        }

        // code is to display version column when version filter applied
        function showFilteredColumn(columnString) {
            var sourceColumnIndex;
            for (var sourceIndex = 0; sourceIndex < vm.columns.length; sourceIndex++) {
                if (vm.columns[sourceIndex].field == columnString)
                    sourceColumnIndex = sourceIndex;

            }
            if (vm.searchDataTemp && vm.searchDataTemp.length >= 0) {
                for (var index = 0; index < vm.searchDataTemp.length; index++) {
                    if (vm.searchDataTemp[index] && vm.searchDataTemp[index].field === columnString
 							&& sourceColumnIndex != undefined)
                        vm.columns[sourceColumnIndex].hidden = false;
                }
            }
            else {
                if (sourceColumnIndex != undefined)
                    vm.columns[sourceColumnIndex].hidden = true;
            }
        }

        $scope.$on('DataChanged', function (event, data) {
        	dataChanged();
        });

        function dataChanged(){
            vm.SmartRegisterChanged = true;
            $timeout(function () {
                $scope.$apply(function () {
                    $rootScope.smartRegisterDataDirty = true;
                });
            });
			var message = 'You have made changes to the Smart Register. Please click on the save button provided below to save changes.';
			if(!vm.toasterMsg) {
				FlashService.WarningWithTimeInterval(message, null, 8);
			}
			vm.toasterMsg = true;
        }

        $scope.$on('DataReset', function (event, data) {
            vm.SmartRegisterChanged = false;
            $timeout(function () {
                $scope.$apply(function () {
                    $rootScope.smartRegisterDataDirty = false;
                });
            });
        });


        $scope.$on('CheckIsDataDirty', function (event, data) {
            checkAndShowDataShouldBeSavedMsg();
            if ($rootScope.smartRegisterDataDirty)
                event.preventDefault();
        });


        $scope.$on('FilteredData', function (event, data) {
            vm.searchType = data.searchType;
            vm.isDrillDown = data.isDrillDown;
            if (!$scope.$$phase) {
                $scope.$apply(function () {
                    if (vm.searchType == "multi") {
                        for (var i = 0; i < data.searchData.length; i++) {
                            data.searchData[i].caption = getCaption(data.searchData[i], vm.columns);
                        }
                        vm.searchData = data.searchData;
                    } else if (vm.searchType === "regular" && data.searchData && data.searchData.length > 0) {
                        vm.searchData = [];
                    }
                    updateSearchData();
                });
            }
        });

        $scope.$on('SortCompleted', function (event, data) {
            $timeout(function () {
                $scope.$apply(function () {
                    vm.sortData = data;
                    if (typeof $scope.firstTime == "undefined" || $scope.firstTime == true) {
                        FlashService.Info("To order records on multiple columns, press CTRL key and click on each column.");
                        $scope.firstTime = false;
                    }
                });
            });
        });

        function getCaption(dataItem, columns) {
            return columns.filter(function (column) {
                return column.field == dataItem.field;
            })[0].caption;
        }

        function CheckShareButtonEnable() {
            $scope.disableShareFlag = false;
            var userEmailDomain;
            var userEmailParts = vm.user.email.split("@");
            if (userEmailParts[1]) {
                userEmailDomain = userEmailParts[1];
            }
            var companyEmailDomain = vm.user.company.emailDomain;
            if (companyEmailDomain) {
                if (userEmailDomain.toLowerCase() === companyEmailDomain.toLowerCase()) {
                    $scope.disableShareFlag = true;
                }
            }
        }

        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

		function Save(saveCallback) {
            EmptyStackData();
            vm.dataLoading = "Saving Smart Register... Please wait...";
            vm.submittalregisters = vm.remainingData.concat(vm.filterSmartRegisteredData);
            var sortDataFields = UtilService.getSortDataFieldNames(vm.sortData);
            var changes = [], updatedSubmittals = [], record, rec, addedRecords = [], updatedRecords = [], deletedRecords = [], copiedRecords = [], tempRecordChanges = '';
            var addedLabel = "Added", updatedLabel = "Update", deletedLabel = "Deleted", mergeDeletedLabel = "MergeDeleted", copiedLabel = "Copied";
            for (var index = 0; index < vm.submittalregisters.length ; index++) {
                record = angular.copy(vm.submittalregisters[index]);
                record.origSubmittalDescription = record.submittalDescription;
                if (record.changes) {
                    for (var change in record.changes) {
                        if (change == "specNumber") {
                            record[change] = record.changes[change];
                            record["divisionCode"] = record.changes[change].substring(0, 2);
                        }
                        else {
                            record[change] = record.changes[change];
						}
                        if (sortDataFields.indexOf(change) > -1) { //If the changed data is related to any column which is currently sorted then
                            UtilService.removeSortDataColumn(vm.sortData, change); //Remove the sorting for that specific column to make sure that it will not go to some other place
                        }
                    }
                    record.changes.action = updatedLabel;
                }
                else {
                    record.changes = {};
                    record.changes.recid = record.recid;
                }

                if (record.isNewRecord) {
                    if (record.changes && record.changes.sourceRecId) {
                        record.changes.action = copiedLabel;
                    } else {
                    	record.specName = record.specName?record.specName.toUpperCase():"";
                        record.changes.action = addedLabel;
                    }
                }

                if (record.isDeletedRecord) {
                    record.changes.action = deletedLabel;
                }

                if (record.isMergeDeletedRecord) {
                    record.changes.action = mergeDeletedLabel;
                }

                if ([updatedLabel, addedLabel, deletedLabel, mergeDeletedLabel, copiedLabel].indexOf(record.changes.action) > -1) {
                    rec = {};
					rec.oldRecord = vm.originalSubmittalRegisterRecords.filter(function (item) { return (item.recid == record.recid) || (record.changes.action === 'Copied' && (item.recid === record.changes.sourceRecId)); })[0];
					if(!rec.oldRecord && record.changes.action === 'Copied') {
						rec.oldRecord = angular.copy(w2ui['submittalRegisterGrid'].get(record.changes.sourceRecId));
					}
                    SmartRegisterService.setSmartColumnValuesOnRecord(vm.smartColumns, rec.oldRecord, rec.oldRecord, true, true);
                    rec.newRecord = angular.copy(record);
                    SmartRegisterService.setSmartColumnValuesOnRecord(vm.smartColumns, rec.newRecord, rec.newRecord, true, true);
                    rec.action = record.changes.action;

                    delete rec.newRecord.changes;
                    if (record.changes.action == deletedLabel) delete rec.newRecord;
					if(record.changes.action == copiedLabel) {
						rec.sourceRecordSerialNumber = rec.oldRecord.serialNumber;
						delete rec.oldRecord;
					}

					if (record.changes.action == mergeDeletedLabel) {
						rec.newRecord = vm.submittalregisters.filter(function (item) { return item.serialNumber == record.targetSerialNumber; })[0];
						record.changes.action = deletedLabel;
					}

					if(!record.isDeletedRecord || (record.isDeletedRecord && record.recid <= vm.MaxId)) {
						changes.push(rec);
					}

                    tempRecordChanges = angular.copy(record.changes.action);
                    if (tempRecordChanges === addedLabel) {
                        addedRecords.push(record);
                    } else if (tempRecordChanges === copiedLabel) {
                        copiedRecords.push(record);
                    } else if (tempRecordChanges === updatedLabel) {
                        updatedRecords.push(record);
                    } else if (tempRecordChanges === mergeDeletedLabel || tempRecordChanges === deletedLabel) {
						if(tempRecordChanges !== deletedLabel || ((tempRecordChanges === deletedLabel)  && record.recid <= vm.MaxId)) {
							deletedRecords.push(record);
						}
                    }
                }

                updatedSubmittals.push(angular.copy(record));
            }

            AuthenticationService.SetSortData(vm.sortData);

			var srColumns = ['companyName','divisionCode','divisionName','origPDFStartPageNumber','origSpecCategory','origSubmittalDescription','paraCode','pdfEndPageNumber','pdfLineNumber','pdfPageNumber','pdfURL','projectName','projectNumber','projectSummaryGroup','recid','serialNumber','source','sourceModule','sourceId','specCategory','specCategoryGroup','specName','specNumber','subContractor','submittalDescription','submittalsHeading','submtitalTargetGroup','targetDate','targetGroup','userNotes','dateIssued', 'drawingSheetNumber', 'drawingSheetName','drawingFileName','drawingPageNumber', 'uploadedToProcore', 'uploadedToProjectSight', 'uploadedToBIM360','uploadedToACC', 'uploadedToAconex', 'aconexExportedData', 'bim360ProjectAndSubmittalID','accProjectAndSubmittalID', 'procoreProjectAndSubmittalID', 'projectSightProjectAndSubmittalRegID'];
            addedRecords = getFilteredRecordObject(addedRecords, srColumns);
            copiedRecords = getFilteredRecordObject(copiedRecords, srColumns);
            updatedRecords = getFilteredRecordObject(updatedRecords, srColumns);
            deletedRecords = getFilteredRecordObject(deletedRecords, srColumns);

            var notificationsModified = angular.copy(vm.notifications);
            notificationsModified.filter(function (data1) {
                var notifications = data1.notifications.filter(function (data) {
                    delete data.url;
                    return data;
                });
                return data1;
            });

            SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SmartRegister",
            		addedRecords, copiedRecords, updatedRecords, deletedRecords, notificationsModified, changes, function (response) {
            		    if (response.success) {
            		        $scope.$broadcast("SavedSuccess", true);
							vm.submittalregisters = response.data.smartRegisterRecords;
            		        var highest = 0;
            		        $.each(vm.submittalregisters, function (key, submittalregister) {
            		            if (submittalregister.recid > highest) highest = submittalregister.recid;
            		        });
            		        vm.MaxId = highest;

							// This is for updating custom columns values after refresh
							SmartRegisterService.prepareAndSetSmartColumns(vm, vm.submittalregisters, response.data.smartColumnsContainer);
							// This apply filter is for setting vm.filterSmartRegisteredData
							prepareQuickFiltrDataNComboOptions(vm.submittalregisters);
							applyFiltersForAll(vm.submittalregisters);

            		        vm.originalSubmittalRegisterRecords = angular.copy(vm.submittalregisters);
            		        LogEvent("Update Smart Register", "Updated Smart Register Successfully", "SUCCESS");

							$timeout(function() {
								$scope.$broadcast("RebuildGridWithNewRecid", { submittals: vm.filterSmartRegisteredData, recid: vm.MaxId });
								$rootScope.smartRegisterDataDirty = false;
								vm.SmartRegisterChanged = false;
								vm.dataLoading = false;

								$scope.$apply(function () {
									FlashService.Success(response.message);
								});
							});
            		    } else {
            		        FlashService.Error(response.message);
							vm.dataLoading = false;
            		        LogEvent("Update Smart Register", response.message, "FAILED");
            		    }
						$scope.$emit('updatedSRMaxRecId', vm.MaxId);
            		    if(saveCallback){
            		    	saveCallback();
            		    }
            });
        }

        function updateTargetDate_Value(records){
        	for(var i=0;i<records.length;i++){
        		if(records[i].targetDate_){
                	records[i].targetDate_ = new Date(records[i].targetDate);
                }
        	}
        	return records;
        }

        function removeDeletedData(data) {
            data = data.filter(function (record) {
                //Ignoring the deleted and merged records
                if (!record.isDeletedRecord && !record.isMergeDeletedRecord) {
                    if (record.isNewRecord) {
                        record.isNewRecord = false;
                    }
                    return record;
                }
            });
            return data;
        }

		function getFilteredRecordObject(array, srColumns) {
			return SmartRegisterService.getFilteredRecordObject(array, srColumns, vm.smartColumns);
		}

        $scope.$on('GetSelectedRecords', function (event, data) {
            vm.SelectedRecords = data;
        });

        function GetFile(fileType, isValidationRequired) {
        	checkAndShowDataShouldBeSavedMsg();
        	if(!$rootScope.smartRegisterDataDirty){
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
        }

        function DownloadRequirementsMatrix() {
            if (vm.selectedProject.subscriptionStatus.toUpperCase() == 'PAID' || vm.user.isSuperAdmin) {
                vm.dataLoading = 'Exporting Requirements Matrix, please wait...';
                SmartRegisterService.DownLoadRequirementsMatrix(
                        vm.selectedProject.projectId, vm.selectedVersion.versionId, function (response) {
                            if (response.success) {
                                FlashService.Success(response.message);
                            } else {
                                FlashService.Error(response.message);
                            }
							vm.dataLoading = false;
                        });
            }
            else {
                vm.UpgradeToSeeMsg = "Please upgrade to download Requirements Overview";
                var items = {};
                items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                items.popupTitle = "Project Upgrade";
                items.popupButtonName = "Upgrade";
                showUpgradetoSeePopup(vm.selectedProject, items);
            }
        }


		vm.getSpecSectionLog = function() {
            if (vm.selectedProject.subscriptionStatus.toUpperCase() == 'PAID' || vm.user.isSuperAdmin) {
            	openSpecSectionLogSlider();
            }
            else {
                vm.UpgradeToSeeMsg = "Please upgrade to download spec section log";
                var items = {};
                items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                items.popupTitle = "Downloading spec section log";
                items.popupButtonName = "Upgrade";
                showUpgradetoSeePopup(vm.selectedProject, items);
            }
        }

		$scope.$on('checkAndShowDataShouldBeSavedMsg', function() {
			checkAndShowDataShouldBeSavedMsg();
		});

        function checkAndShowDataShouldBeSavedMsg() {
            if ($rootScope.smartRegisterDataDirty) {
                items.title = vm.unsavedChangesTitle;
                items.message = vm.unsavedChangesMessage;
                ModalService.showAlertMessage(items);
                return true;
            }
            return false;
        }

        function validateAndDownload(fileType, isValdationRequired) {
            if (vm.selectedProject.subscriptionStatus.toUpperCase() == 'PAID' || vm.user.isSuperAdmin) {
                GetFile(fileType, isValdationRequired);
            }
            else {
                if (fileType === 4) {
                    vm.UpgradeToSeeMsg = "Please upgrade to download Submittals Schedule";
                }
                else if (fileType === 19) {
                    vm.UpgradeToSeeMsg = "Please upgrade to download Spec Section PDFs";
                }
                var items = {};
                items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                items.popupTitle = "Project Upgrade";
                items.popupButtonName = "Upgrade";
                showUpgradetoSeePopup(vm.selectedProject, items);
            }
        }

        function refreshSNo() {
            if (!checkAndShowDataShouldBeSavedMsg()) {
                var items = { title: 'Alert', message: 'Resetting the submittal number (S.no) will renumber your Smart Register starting from one. Would you like to continue?' };
                showConfirmationPopup(items, function (goAhead) {
                    if (goAhead) {
                        vm.dataLoading = "Loading... Please wait...";
                        SmartRegisterService.RefreshSerialNumber(vm.selectedProject.projectId, vm.selectedVersion.versionId, function (response) {
                            if (response) {
                                if (response.success) {
                                    FlashService.Success(response.message);
                                    vm.sortData = []; //Reset the sorting order to show the records as it is

                                    var filterData = AuthenticationService.GetSmartRegisterFilter();
                                    getFilterRelatedValues(filterData);

                                    LoadSmartRegisterList(vm.selectedProject.projectId, vm.selectedVersion.versionId);
                                }
                            } else {
                                FlashService.Error(response.message);
                                vm.dataLoading = false;
                            }
                        });
                    }
                });
            }
        }

        function initiateMergeOp(gridName) {
            $scope.$broadcast("startMergeOperation", gridName);
        }

				vm.BulkEdit = function(gridName) {
						$scope.$broadcast("startBulkUpdate", gridName);
				}

        function validateAndLoad(project, version) {
            if (vm.selectedProject.isExpired && !vm.user.isSuperAdmin) {
                vm.dataLoading = false;
                vm.Selectedexpired = true;
                if (project.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    showUpgradePopup(project);
                } else if (project.subscriptionStatus.toUpperCase() !== 'TRIAL') {
                    showRenewPopup(project);
                }
            } else {
			/* ---- COMMENTED AS ITS PRODUCT FLAG ENABLE CHECK NOT REQUIRED IN ACC ---- */
                //AddOrRemoveProductsColumn();
                if (AuthenticationService.GetDonotShowProjectGroupFilterAlert() != "true")
                    $scope.myPopover.open();

                if(version.status.toLowerCase() === 'failed' || version.status.toLowerCase() === 'in progress')
                	return;
                LoadSmartRegisterList(project.projectId, version.versionId);
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

        function showUpgradePopup(project) {
			ModalService.showUpgradePopup(project)
            .result.then(function(data) {
                vm.modalTitle = 'Upgrade Project';
                Upgrade(project.name);
            });
        }

        function RemoveNotification(item) {
        	var undoRecords = {};
            vm.notifications[0].notifications = vm.notifications[0].notifications.filter(function (data, index) {
                if (data.specSectionNumber !== item.specSectionNumber){
                	return data;
                } else {
                	undoRecords.records = [data];
                	undoRecords.lastSelectionIndex = index;
                }
            });
            dataChanged();
            undoRecords.operation = "Delete_Notification";
            $scope.$broadcast("NotificationRemoved", undoRecords);
        }

        $scope.$on('undoDeleteNotification', function(event, data){
        	event.currentScope.vm.notifications[0].notifications.splice(data.lastIndex, 0, data.record);
        	$timeout(function() {
                angular.element(document.getElementById('notifications-button')).trigger('click');
                $scope.notify = 'notifications';
            });
        });

        function StartNewProject() {
            $location.path('/project');
        }

        function updateSearchDataVariable(fieldName, caption, values, visibility) {
            var found = -1;
            if (values && values.length >= 0) {
            	if(vm[fieldName+ "SelectedItemsAll"].length === values.length){
            		values = []; //Make values to empty to say that all the values are selected
            	}
                if (vm.searchDataTemp.length > 0) {
                	found = getSearchDataIndex(fieldName);
                    if (found == -1) {
                        vm.searchDataTemp.push({ field: fieldName, caption: caption, value: values, visibility : visibility });
                    } else {
                    	vm.searchDataTemp[found].value = values;
                    	vm.searchDataTemp[found].visibility = visibility;
                    }
                }
                else {
                    vm.searchDataTemp.push({ field: fieldName, caption: caption, value: values, visibility : visibility });
                }
            }
        }

        function getSearchDataIndex(fieldName){
        	var found = -1;
        	if(vm.searchDataTemp && vm.searchDataTemp.length > 0){
            	for (var i = 0; i < vm.searchDataTemp.length; i++) {
                    if (vm.searchDataTemp[i].field == fieldName) {
                        found = i;
                    }
                }
        	}
        	return found;
        }

        function updateSearchData() {
        	var updatedSearchData = vm.searchDataTemp;
        	AuthenticationService.SetSmartRegisterFilter(updatedSearchData);
        }

        $scope.GetFirstLetterOfEachWord = function (str) {
            var matches = str.match(/\b(\w)/g);
            return matches.join('');
        }

        function LoadSmartRegisterList(projectId, versionId, callback) {
            vm.dataLoading = "Loading Smart Register... Please wait..";
            SmartRegisterService.GetByProjectId(projectId, versionId, function (response) {
                if (response.success) {
                    vm.MaxId = 0;
					var project = AuthenticationService.GetProject();
					if(project.subscriptionStatus.toUpperCase() === 'TRIAL' && !vm.user.isSuperAdmin) {
						var item = {};
						item.title = 'Alert';
						item.message = '<p class="m-b0 p-l30 text-left">This project is currently set to trial-mode, which limits the number of features and submittals accessible.</p>' +
						'<p class="m-b15 p-l30 text-left">In order to access the full log, please contact Pype support.</p>' +
						'<p class="m-b0 p-l30 text-left"><b>Email:</b> <span class="p-l10">pypesupport@autodesk.com.</span></p>' +
		                '<p class="m-b0 p-l30 text-left"><b>Phone:</b> <span class="p-l5">1 (855)-910-7137</span></p>';
						$timeout(function() {
							if(!AuthenticationService.GetTrialProjectPopupFlag()) {
								showTrialLimitPopup(item);
								AuthenticationService.SetTrialProjectPopupFlag(true);
							}
						}, 750);
					}
                    if (response.data) {
                        if (response.data.searchData)
                            vm.searchDataTemp = response.data.searchData;
                        if (response.data.notifications) {
                            vm.notifications = response.data.notifications;
                            vm.notifications = setNotificationObject(vm.notifications);
                        }
                        vm.submittalregisters = response.data.smartRegisterRecords;
                        if (vm.submittalregisters.length > 0) {
                            vm.MaxId = calculateAndSetMaxRecID(vm.submittalregisters);
							if(vm.selectedProject.planViewFlag) {
                                vm.plansSubmittalExist = SmartRegisterService.getPlansSubmittalExist(vm.submittalregisters);
							} else {
								vm.submittalregisters = vm.submittalregisters.filter(function(item) {
									return !item.sourceModule || item.sourceModule.toLowerCase() !== 'plans';
								});
							}
                            SmartRegisterService.prepareAndSetSmartColumns(vm, vm.submittalregisters, response.data.smartColumnsContainer);
                        }
                        else {
                            vm.MaxId = 0;
                            vm.submittalregisters = [];
                        }
                    }
                    else {
                        vm.MaxId = 0;
                        vm.submittalregisters = [];
                    }
					setSpecsPlansFilter();
					SetGridDefaults();
					prepareQuickFiltrDataNComboOptions(vm.submittalregisters);
					// Load Last Used filter mandatorily on Initial Load.
					if(!vm.initialLoadFlag) {
						vm.whenNoInitialLoad = true;
					}
					getLastUsedFilter();
					vm.originalSubmittalRegisterRecords = angular.copy(vm.submittalregisters);
                } else {
                	vm.MaxId = 0;
                    //FlashService.Error(response.message);
                }

                vm.dataLoading = false;
				if(callback) callback();
				$scope.$emit('updatedSRMaxRecId', vm.MaxId);
            });
        }

				function getLastUsedFilter() {
					if($routeParams && $routeParams.param === 'home') {
							vm.cameFromDashboard = true;
							vm.defaultFilterFlag = true;
							runCommonFunctionsOnInitialLoad();
							$location.search({});
					}
					else {
							var filtersListOriginal = AuthenticationService.GetListOfFilters();
							vm.filterName = '';
							vm.cameFromDashboard = false;
							vm.filtersList = [];
							if(filtersListOriginal.length > 0) {
								AuthenticationService.SetListOfFilters(filtersListOriginal);
								for(var i=0; i<filtersListOriginal.length; i++) {
			        		if(filtersListOriginal[i] && filtersListOriginal[i].name.toUpperCase() !== "DEFAULT" &&
										filtersListOriginal[i].name.toUpperCase() !== "LASTAPPLIEDFILTER") {
			              vm.filtersList.push(filtersListOriginal[i]);
			        		}
									if(filtersListOriginal[i] && filtersListOriginal[i].name.toUpperCase() === "DEFAULT") {
										vm.defaultFilterFlag = true;
									}
									if(filtersListOriginal[i] && filtersListOriginal[i].name.toUpperCase() === "LASTAPPLIEDFILTER") {
										vm.lastAppliedFilterFlag = true;
										vm.currentFilter = filtersListOriginal[i];
									}
			        	}
								var filtersDescription = vm.currentFilter.description;
								if(!vm.defaultFilterFlag) {
									// Save Default Filter if not present
									vm.defaultFilterFlag = true;
									saveFilters('Default', '', -1, true, true);
								}

								if(!vm.lastAppliedFilterFlag) {
									// Setting LastAppliedFilter as Default and reset to default filter
									resetToDefaultFilter();
								}
								else {
									for(var i=0;i<filtersListOriginal.length;i++) {
										if(filtersListOriginal[i] && filtersListOriginal[i].name === filtersDescription) {
											vm.currentFilter = filtersListOriginal[i];
											vm.showSavedTick = true;
											vm.filterName = filtersListOriginal[i].name;
											break;
										}
									}
									if(!vm.filterName) {
										vm.filterName = '';
									}
									// For Existing Project Override their default filters
									if(filtersDescription && filtersDescription.toUpperCase() === 'DEFAULT') {
										vm.currentFilter = {
											description: '',
											name: 'Default',
											preferenceContent: [{"field":"divisionCode","value":[],"visibility":true},{"field":"specSection","value":[],"visibility":true},{"field":"projectSummaryGroup","value":["ACTION AND INFORMATIONAL","CLOSEOUT SUBMITTALS","MOCKUPS"],"visibility":true},{"field":"specCategory","value":[],"visibility":true},{"field":"specCategoryGroup","value":[],"visibility":false}],
											preferenceId: -1,
											type: "SmartRegisterFilterPreference",
											userId: vm.user.userId
										}
									}
									if(!vm.currentFilter) {
										vm.currentFilter = AuthenticationService.GetCurrentFilterPreference();
									}
									var parsedContent;
									if(typeof vm.currentFilter.preferenceContent === "string"){
	            			parsedContent = JSON.parse(vm.currentFilter.preferenceContent);
	            		} else {
	            			parsedContent = vm.currentFilter.preferenceContent;
	            		}
						AuthenticationService.SetSmartRegisterFilter(parsedContent);
	            		getFilterRelatedValues(parsedContent);

	                runCommonFunctionsOnInitialLoad();
								}
							}
							else {
								// Save Default Filter if not present
								vm.defaultFilterFlag = true;
								saveFilters('Default', '', -1, true, true, function() {
									// Setting LastAppliedFilter as Default and reset to default filter
									resetToDefaultFilter();
								});
							}
					}
				}

				function runCommonFunctionsOnInitialLoad() {
						getSelectedValuesBasedOnFilter();
						setVisibleColumns();
						updateColumnSelectedValuesFlags();
						updateFilteredItemsList();
						setAllFilterRelatedTempValues();

						//getFiltersList();
						AuthenticationService.SetCurrentFilterPreference(vm.currentFilter);
						applyFiltersForAll(vm.submittalregisters);
						$timeout(function() {
								$scope.$broadcast("RebuildGridWithNewRecid", { submittals: vm.filterSmartRegisteredData, recid: vm.MaxId });
								var additionalFilters = AuthenticationService.GetAdditionalFilters();
								if(additionalFilters && !Array.isArray(additionalFilters) && !angular.equals(additionalFilters, {})){
									// added function to update search value in searchbox and do search
									$scope.$emit('doSearchInBox', additionalFilters);
									AuthenticationService.SetAdditionalFilters({});
								}
						}, 100);
				}

        function setNotificationObject(notifications) {
            for (var grpindex = 0; grpindex < notifications.length ; grpindex++) {
                for (var index = 0; index < notifications[grpindex].notifications.length; index++) {
                    var notification = notifications[grpindex].notifications[index];
                    var noteText = angular.copy(notification.notificationText);
                    if (notification.notificationText.indexOf(vm.RevisedLabel) > -1) {
                        noteText = notification.notificationText.slice(0, notification.notificationText.indexOf(vm.RevisedLabel));
                    }
                    notification.notificationText = noteText;
                }
            }
            return notifications;
        }

        function prepareQuickFiltrDataNComboOptions(submittalRecords) {
            if (submittalRecords.length > 0) {
                //Division codes filter related code
                var divisions = [], record;
                var uniqueDivisionResult = getUniqueDivisions(submittalRecords);

                vm.uniqueDivisions = uniqueDivisionResult.uniqueDivisionRecords;

                angular.forEach(vm.uniqueDivisions, function (item, index) {
                    record = { id: index, divisionCode: item.divisionCode, divisionName: item.divisionName, selected: true };
                    divisions.push(record);
                });
                vm.allDivisions = divisions;
                vm.divisionCodeSelectedItems = uniqueDivisionResult.uniqueDivisionCodes;
                vm.divisionCodeSelectedItemsAll = uniqueDivisionResult.uniqueDivisionCodes;

                //Spec sections filter related code
                var specSections = [], record;
                var uniqueSpecSectionResult = getUniqueSpecSections(submittalRecords);

                vm.uniqueSpecSections = uniqueSpecSectionResult.uniqueSpecSectionRecords;

                angular.forEach(vm.uniqueSpecSections, function (item, index) {
                    record = { id: index, specSection: item.specSection, specName: item.specName, selected: true };
                    specSections.push(record);
                });

                vm.allSpecSections = specSections;

                vm.specSectionSelectedItems = uniqueSpecSectionResult.uniqueSpecSections;
                vm.specSectionSelectedItemsAll = uniqueSpecSectionResult.uniqueSpecSections;

                vm.uniqueSpecNumberUnchanged = angular.copy(uniqueSpecSectionResult.uniqueSpecSections);

                vm.numberOfSpecSections = angular.copy(vm.specSectionSelectedItems.length);
                vm.numberOfDivisions = angular.copy(vm.divisionCodeSelectedItems.length);

                var uniqueSpecNames = getDistinctValuesByProperty(submittalRecords, "specName");

                var uniqueSpecCategory = getDistinctValuesByProperty(submittalRecords, "specCategory", false , true);

                var uniqueSubContractor = getDistinctValuesByProperty(submittalRecords, "subContractor", false, true);

                var uniqueSpecCategoryGroup = getDistinctValuesByProperty(submittalRecords, "specCategoryGroup", false, true);

                var uniqueSubmittalGroup = getDistinctValuesByProperty(submittalRecords, "submittalsHeading", false, true);

                var uniqueProjectSummaryGroup = getDistinctValuesByProperty(submittalRecords, "projectSummaryGroup", false, true);

                var uniqueVersions = getDistinctValuesByProperty(submittalRecords, "source", false, true);
                vm.sourceSelectedItemsAll = uniqueVersions;

                uniqueProjectSummaryGroup.sort();

                var projectSummaryGroups = [], specCategories = [], versions = [], specCategoryGroups = [], subContractors = [];

				uniqueProjectSummaryGroup = uniqueProjectSummaryGroup.map(function(item) { return item.toUpperCase(); });
                vm.projectSummaryGroupSelectedItems = uniqueProjectSummaryGroup;
                vm.projectSummaryGroupSelectedItemsAll = uniqueProjectSummaryGroup;
                vm.numberOfSummaryGroups = angular.copy(uniqueProjectSummaryGroup.length);
                angular.forEach(uniqueProjectSummaryGroup, function (item, index) {
                    projectSummaryGroups.push({ id: index, value: item, selected : true });
                });
                vm.allProjectSummaryGroups = projectSummaryGroups;

                vm.specCategorySelectedItems = uniqueSpecCategory;
                vm.specCategorySelectedItemsAll = uniqueSpecCategory;
                vm.numberOfSpecCategories = angular.copy(uniqueSpecCategory.length);
                angular.forEach(uniqueSpecCategory, function (item, index) {
                	specCategories.push({ id: index, value: item, selected : true });
                });
                vm.allSpecCategories = specCategories;

                /*vm.versionSelectedItems = uniqueVersions;
                vm.numberOfVersions = angular.copy(uniqueVersions.length);
                angular.forEach(uniqueVersions, function (item, index) {
                	versions.push({ id: index, value: item, selected : true });
                });
                vm.allVersions = versions;
                */

                vm.specCategoryGroupSelectedItems = uniqueSpecCategoryGroup;
                vm.specCategoryGroupSelectedItemsAll = uniqueSpecCategoryGroup;
                vm.numberOfSpecCategoryGroups = angular.copy(uniqueSpecCategoryGroup.length);
                angular.forEach(uniqueSpecCategoryGroup, function (item, index) {
                	specCategoryGroups.push({ id: index, value: item, selected : true });
                });
                vm.allSpecCategoryGroups = specCategoryGroups;

                vm.subContractorSelectedItems = uniqueSubContractor;
                vm.subContractorSelectedItemsAll = uniqueSubContractor;
                vm.numberOfSubContractor = angular.copy(uniqueSubContractor.length);
                angular.forEach(uniqueSubContractor, function (item, index) {
                	subContractors.push({ id: index, value: item, selected : true });
                });
                vm.allSubContractors = subContractors;

								if(!vm.initialLoadFlag) {
									getSelectedValuesBasedOnFilter();
	                setVisibleColumns();
	                updateColumnSelectedValuesFlags();
	                updateFilteredItemsList();
								}
            }
            else {
                initializeAllFilterRelatedValues();
            }

            setAllFilterRelatedTempValues();

            for (var i = 0; i < vm.columns.length; i++) {
                switch (vm.columns[i].field) {
                    case "specNumber": {
                        vm.columns[i].editable = vm.readonly ? false : { type: 'combo', showAll: true, items: vm.uniqueSpecNumberUnchanged };
                        break;
                    } case "specName": {
                        vm.columns[i].editable = vm.readonly ? false : { type: 'combo', showAll: true, items: uniqueSpecNames };
                        break;
                    } case "specCategory": {
                        vm.columns[i].editable = vm.readonly ? false : { type: 'combo', showAll: true, items: uniqueSpecCategory };
                        break;
                    } case "subContractor": {
                        vm.columns[i].editable = vm.readonly ? false : { type: 'combo', showAll: true, items: uniqueSubContractor };
                        break;
                    } case "specCategoryGroup": {
                        vm.columns[i].editable = vm.readonly ? false : { type: 'combo', showAll: true, items: uniqueSpecCategoryGroup };
                        break;
                    } case "submittalsHeading": {
                        vm.columns[i].editable = vm.readonly ? false : { type: 'combo', showAll: true, items: uniqueSubmittalGroup };
                        break;
                    } case "projectSummaryGroup": {
                        vm.columns[i].editable = vm.readonly ? false : { type: 'combo', showAll: true, items: uniqueProjectSummaryGroup };
                    } default:
                        //do nothing
                }
            }

        }

        function resetAllFilterDataValues(){
        	var tempSearch = [], tempValues = [], i, finalList = [];
            vm.searchDataTemp.filter(function (data) {
            	finalList = [];
            	data.value = finalList;
            	vm[data.field + "SelectedItems"] = angular.copy(finalList);
            	tempSearch.push(data);
            });

            vm.searchDataTemp = tempSearch;
        }

        function getSelectedValuesBasedOnFilter(){
        	var tempSearch = [], tempValues = [], i, finalList = [];
        	$scope.visibleColumnsList = [];
			vm.searchDataTemp.filter(function (data) {
				if(data.visibility){
	          		$scope.visibleColumnsList.push(data.field);
	          	}
	          	if(data.value && data.value.length > 0){
	          		tempValues = data.value;
	              	finalList = [];
	              	for(i=0;i<tempValues.length;i++){
	              		if(vm[data.field + "SelectedItemsAll"] && vm[data.field + "SelectedItemsAll"].indexOf(tempValues[i]) > -1){
	              			finalList.push(tempValues[i]);
	              		}
	              	}
	          	} else {
	          		data.value = [];
	          		finalList = [];
	          	}
				vm[data.field + "SelectedItems"] = angular.copy(finalList);
	          	tempSearch.push(data);
          });
          vm.searchDataTemp = tempSearch;
        }

        function getUniqueDivisions(submittals) {
            var uniqueDivisions = [], uniqueDivsionCodes = [];
            var record = {};
            for (var i = 0; i < submittals.length; i++) {
                if (submittals[i].divisionCode != null) {

                	if(submittals[i].divisionCode !== '' && uniqueDivsionCodes.indexOf(submittals[i].divisionCode) === -1){
                		record = { divisionCode: submittals[i].divisionCode, divisionName: submittals[i].divisionName };

                        uniqueDivisions.push(angular.copy(record));
                        uniqueDivsionCodes.push(submittals[i].divisionCode);
                	} else if(submittals[i].divisionCode === '' && uniqueDivsionCodes.indexOf(emptyValuesLabel) === -1){
                		record = { divisionCode: emptyValuesLabel, divisionName: submittals[i].divisionName };

                        uniqueDivisions.push(angular.copy(record));
                        uniqueDivsionCodes.push(emptyValuesLabel);
                	}

                }
            }
            return { uniqueDivisionRecords: uniqueDivisions, uniqueDivisionCodes: uniqueDivsionCodes };
        }

        function getUniqueSpecSections(submittals) {
            var uniqueSpecSectionRecords = [], uniqueSpecSections = [];
            var record = {};
            for (var i = 0; i < submittals.length; i++) {
                if (submittals[i].specNumber !== null) {
                	if(submittals[i].specNumber !== '' && uniqueSpecSections.indexOf(submittals[i].specNumber) === -1){
                		record = { specSection: submittals[i].specNumber, specName: submittals[i].specName };

                        uniqueSpecSectionRecords.push(angular.copy(record));
                        uniqueSpecSections.push(submittals[i].specNumber);
                	} else if(submittals[i].specNumber === '' && uniqueSpecSections.indexOf(emptyValuesLabel) === -1) {
                		record = { specSection: emptyValuesLabel, specName: submittals[i].specName };

                        uniqueSpecSectionRecords.push(angular.copy(record));
                        uniqueSpecSections.push(emptyValuesLabel);
                	}
                }
            }
            return { uniqueSpecSectionRecords: uniqueSpecSectionRecords, uniqueSpecSections: uniqueSpecSections };
        }

        function OpenNotification(notification) {
			AuthenticationService.SetGenericRecordData({ record: notification });
			ExportService.openNewWindow('loadspecpdf?notification=yes', 630, 605);
        }

        function AddHeadingsToSmartRegister(name) {
            vm.dataLoading = "Adding Records To Smart Register...Please Wait..";
            var length = vm.NonSubHeadings;
            var grpName = vm.selectedProGrp[name];
            SmartRegisterService.AddNonSubmittalHeadingsToSmartRegister(vm.selectedProject.projectId, vm.selectedVersion.versionId, name, grpName, function (response) {
                if (response.success) {
                	applyFiltersForAll(response.data[0]);
                    vm.NonSubHeadings = response.data[1].sectionHeadingLists;

                    var filterData = AuthenticationService.GetSmartRegisterFilter();
                    getFilterRelatedValues(filterData);

                    vm.submittalregisters = angular.copy(response.data[0]);
                    if (vm.submittalregisters.length > 0) {
                        vm.MaxId = calculateAndSetMaxRecID(vm.submittalregisters);
                    }
                    else {
                        vm.MaxId = 0;
                        vm.submittalregisters = [];
                    }

                    prepareQuickFiltrDataNComboOptions(vm.submittalregisters);
                    applyFiltersForAll(vm.submittalregisters);

                    vm.originalSubmittalRegisterRecords = angular.copy(response.data[0]);
                    $scope.$broadcast("RebuildGridWithNewRecid", { submittals: vm.filterSmartRegisteredData, recid: vm.MaxId });
                }
				vm.dataLoading = false;
            });
        }

        function calculateAndSetMaxRecID(submittals) {
            var highest = 0;
            $.each(submittals, function (key, submittalregister) {
                if (submittalregister.recid > highest) highest = submittalregister.recid;
            });
            return highest;
        }


        function SpecNotification() {
            $scope.notify = 'notifications';
            vm.NonSubHeadings = null;
        }
        function GetNonSubmittalHeadings() {
            vm.notificationLoader = true;
						$scope.notify = 'headings';
            GetProjectSummaryGroups();
            SmartRegisterService.GetNonSubmittalHeadingsByProjectId(vm.selectedProject.projectId, vm.selectedVersion.versionId, function (response) {
                if (response.success) {
                    vm.NonSubHeadings = response.data;
                    vm.notificationLoader = false;
                } else {
                    vm.notificationLoader = false;
                }
            });
        }


        function GetProjectSummaryGroups() {
            SmartRegisterService.GetProjectSummaryGroups(vm.selectedProject.projectId, vm.selectedVersion.versionId, function (response) {
                if (response.success) {

                    vm.listOfGroups = response.data;
                } else {
                }
            });
        }
        function ModifySectionHeading(name, group, type, action) {
            vm.dataLoading = "Loading Modified Section Headings...Please Wait..";
            SmartRegisterService.ModifySectionHeading(
        			vm.selectedProject.projectId, vm.selectedVersion.versionId,
        			name, group, type, action, function (response) {
        			    if (response.success) {
        			        vm.NonSubHeadings = response.data.sectionHeadingLists;
        			        vm.dataLoading = false;
        			    } else {
        			        vm.dataLoading = false;
        			    }
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

        function CheckIfSharingEnabled(project) {
            ProjectService.CheckIfShareEnabled(project.projectId, function (response) {
			    if (response.success) {
			        vm.sharingEnabled = response.data;
			        ShareProject(project);
			    } else {
			        FlashService.Error(response.message);
			        vm.sharingEnabled = response.data;
			    }
			});
        }

        function Share(project) {
            CheckIfSharingEnabled(project);
        }

        function EnableVersioning(projectName, feature) {
            $scope.user = vm.user;
            var items = PopulatingUserDetails(projectName);
            if (feature == 'Version')
                items.RequestType = "Enable Versioning for " + projectName;
            else if (feature == 'Share')
                items.RequestType = "Enable Sharing for " + projectName;
            items.feature = feature;
			ModalService.contactUsByFeaturePopup(items);
        }

        function showContactusToBuyFeature(project, items, feature) {
			ModalService.showContactusToBuyFeaturePopup(items)
            .result.then(function (data) {
                EnableVersioning(project.name, feature);
            });
        }

        function ShareProject(project) {
            if (project.isExpired && !vm.user.isSuperAdmin) {
                if (project.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    showUpgradePopup(project);
                } else if (project.subscriptionStatus.toUpperCase() !== 'TRIAL') {
                    showRenewPopup(project);
                }
            } else if (!vm.user.isSuperAdmin && !vm.sharingEnabled) {
                var items = {};
                items.UpgradeToSeeMsg = '<p class="m-b0 p-l30 text-left">Sharing feature is not enabled. Please contact Pype support.</p>'+
                '<p class="m-b0 p-l30 text-left"><b>Email:</b> <span class="p-l10">pypesupport@autodesk.com.</span></p>' +
                '<p class="m-b0 p-l30 text-left"><b>Phone:</b> <span class="p-l5">1 (855)-910-7137</span></p>';
                items.title = "Sharing Feature Not Enabled";
                showContactusToBuyFeature(project, items, 'Share');
            } else {
				ModalService.shareProjectPopup(project)
                .result.then(function() {
					returnUpdatedProject(vm.selectedProject.projectId, function (data) {
                        vm.selectedProject = angular.copy(data);
                        if (!vm.selectedProject) {
                            $log.error("Unable to get the selected project with name : " + project.name);
                            return;
                        }
                        AuthenticationService.SetProject(vm.selectedProject);
                    });
                });
            }
        }

        function CheckAndNavigateToProducts(SpecNumber, Para) {
            ProductDataService.GetProductsEnabledFlag(vm.selectedProject.projectId, function (response) {
                if (response.success) {
                    var isProductsEnabled = response.data;
                    NavigateToProducts(isProductsEnabled, SpecNumber, Para);
                } else {
                    console.log(response);
                }
            });
        }

        function AddOrRemoveProductsColumn() {
            ProductDataService.GetProductsEnabledFlag(vm.selectedProject.projectId, function (response) {
                if (response.success) {
                    vm.isProductsEnabled = response.data;
                    if (response.data === false) {
                        if (vm.columns && vm.columns[8].caption === 'productFlag')
                            vm.columns.splice(8, 1);
                    }
                } else {
                    console.log(response);
                }
            });

        }

        function EnableProducts(projectName, feature) {
            $scope.user = vm.user;
            var items = PopulatingUserDetails(projectName);
            items.RequestType = "Enable Produts for " + projectName;
            items.feature = feature;
			ModalService.contactUsByFeaturePopup(items);
        }

        function NavigateToProducts(isProductsEnabled, SpecNumber, Para) {
            if (isProductsEnabled) {
                var productsSearchData = [];
                if (Para) {
                    productsSearchData = [
	                     { field: 'specNumber', caption: 'Spec Section', value: SpecNumber, operator: 'is', type: 'text' },
	                     { field: 'paraCode', caption: 'Spec sub section', value: Para, operator: 'contains', type: 'text' }
                    ];
                } else {
                    productsSearchData = [
	                    { field: 'specNumber', caption: 'Spec Section', value: SpecNumber, operator: 'is', type: 'text' }
                    ];
                }
                AuthenticationService.SetProductDataFilter(productsSearchData);
                LogEvent("Smart Register to Product Data", "User clicked on Product Data link with Spec Number : " + SpecNumber, "SUCCESS", function () {
                    ProductData();
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            }
            else {
                if (vm.selectedProject.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    vm.UpgradeToSeeMsg = "Please upgrade the project to see Product data";
                    var items = {};
                    items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                    items.popupTitle = "Project Upgrade";
                    items.popupButtonName = "Upgrade";
                    showUpgradetoSeePopup(vm.selectedProject, items);
                }
                else {
                    vm.modalTitle = "Contact Us";
                    EnableProducts(vm.selectedProject.name, 'Products');
                }
            }
        }

        $scope.showOptionOne = function () {
            return localStorage && localStorage.showOptionOne && (localStorage.showOptionOne == true || localStorage.showOptionOne == "true");
        }

        $scope.showOptionTwo = function () {
            return localStorage && localStorage.showOptionTwo && (localStorage.showOptionTwo == true || localStorage.showOptionTwo == "true");
        }

        $scope.showOptionThree = function () {
            return localStorage && localStorage.showOptionThree && (localStorage.showOptionThree == true || localStorage.showOptionThree == "true");
        }

        $scope.showOptionFour = function () {
            return localStorage && localStorage.showOptionFour && (localStorage.showOptionFour == true || localStorage.showOptionFour == "true");
        }

        function ShowCopySubmittalsPopup() {
			if ($rootScope.smartRegisterDataDirty) {
				var message = 'You have unsaved changes that will be lost if you decide to continue. <br> <b> Are you sure you want to leave this page? </b>';
				ModalService.OpenConfirmModal('Confirm navigation', message)
				.result.then(function () {
	                undoChanges(function() {
						doCrossVersionCopy();
					});
				}, function() {});
			} else {
				doCrossVersionCopy();
			}
        }

		function doCrossVersionCopy() {
			if (vm.selectedProject.versions.length > 1) {
				var modalInstance2 = $uibModal.open({
					animation: true,
					size: 'xl',
					templateUrl: MAINURL + 'views/smartregister/submittals/copy.submittals.view.html',
					controller: 'CopySubmittalsController',
					backdrop: 'static',
					controllerAs: 'vm',
					bindToController: true,
					keyboard: false,
					resolve: {}
				});
				modalInstance2.result.then(function (data) {
					if (data == "Refresh") {
						$route.reload();
					}
				}, function() {});
			} else {
				var items = {};
				items.title = 'Alert';
				items.message = "Project should have at least two versions to copy submittals.";
				ModalService.showAlertMessage(items);
			}
		}

		$scope.$on('SelectUpdate', function(event, data) {
			vm.actionDropdownIsOpen = false;
			vm.historySerialNumber = data.length === 1 ? '#' + data[0].serialNumber : null;
		});

    }
})();

function GotoProducts(SpecNumber, Para) {
    var modifiedParaCode;
    if (Para && Para.indexOf('_') >= -1) {
        modifiedParaCode = Para.slice(0, Para.length - 2);
    }
    else {
        modifiedParaCode = Para;
    }
    angular.element(document.getElementById('element')).scope().vm.CheckAndNavigateToProducts(SpecNumber, modifiedParaCode);
}

var previousRecordId = 0;
function openSmartRegisterPDF(recid) {
    $("#wrapper").click();
    $('#grid_submittalRegisterGrid_rec_' + previousRecordId).removeClass('w2ui-selected');
    $('#grid_submittalRegisterGrid_rec_' + recid).addClass('w2ui-selected');
    previousRecordId = recid;
    var injector = angular.element(document).injector();
	var downloadService = injector.get('DownloadService');
    var scope = angular.element("#page-content-wrapper").scope();
    var record = scope.vm.filterSmartRegisteredData.filter(function (item) { return item.recid == recid; })[0];

	if(record.sourceModule && ['plans', 'procurementlog'].indexOf(record.sourceModule.toLowerCase()) > -1) {
		angular.element("#page-content-wrapper").scope().vm.GoToPlanView(record, true);
	} else {
		downloadService.openSpecPdf(record);
	}
}

function openSmartViewFromSmartRegister(recid) {
    $("#wrapper").click();
    var record = angular.element("#page-content-wrapper").scope().vm.filterSmartRegisteredData.filter(function (item) { return item.recid == recid; })[0];
	if(record.sourceModule && ['plans', 'procurementlog'].indexOf(record.sourceModule.toLowerCase()) > -1) {
		angular.element("#page-content-wrapper").scope().vm.GoToPlanView(record);
	} else {
		angular.element("#page-content-wrapper").scope().vm.GoToSpecView(record);
	}
}

function openPlanviewSchedules(schedule) {
    var scope = angular.element("#page-content-wrapper").scope();
	scope.vm.openScheduleInPlanview(schedule);
	scope.$apply();
}


function openSmartRegisterPopover(csvParam) {
	var arrayParam = csvParam.split(', ');
	var recid = arrayParam[0];
	var sourceModule = arrayParam[1];
    var scope = angular.element("#page-content-wrapper").scope();
    var injector = angular.element(document).injector();
    var projectService = injector.get("ProjectService");
    var planIndex =  projectService.getPlanVersionIndex(scope.vm.selectedProject, scope.vm.selectedVersion);
    if(planIndex!==-1) {
        var planVersion = scope.vm.selectedProject.planVersions[planIndex];
		var planId = planVersion.id ;
	}
    var record = angular.element("#page-content-wrapper").scope().vm.filterSmartRegisteredData.filter(function (item) { return item.recid == recid; })[0];
    if(record.sourceId && ['plans'].indexOf(record.sourceModule.toLowerCase())>-1 && (!planId || record.sourceId !== 'P'+planId)) {
    	var disableLinks = true;
    }

    scope.$apply();
    $("#popover" + recid).popover({
        html: true,
        content: (sourceModule && ['plans', 'procurementlog'].indexOf(sourceModule.toLowerCase()) > -1) ?
        		 (disableLinks ? '<div><a class=\'btn btn-link disable-element\'>Open PlanView</a> <a class=\'btn btn-link disable-element\'>Open PDF</a></div>' :
			 	 '<div class="text-left"><a class=\'btn btn-link\' onclick=\'openSmartViewFromSmartRegister(' + JSON.stringify(recid) + ')\'>Open PlanView</a></br> <a class=\'btn btn-link\' onclick=\'openSmartRegisterPDF(' + JSON.stringify(recid) + ')\'>Open PDF</a></div>') :
				 '<div class="text-left"><a class=\'btn btn-link\' onclick=\'openSmartViewFromSmartRegister(' + JSON.stringify(recid) + ')\'>Open Spec View</a></br> <a class=\'btn btn-link\' onclick=\'openSmartRegisterPDF(' + JSON.stringify(recid) + ')\'>Open PDF</a></div>',
        placement: 'right',
        trigger: 'manual'
    }).click(function (e) {
        e.preventDefault();
    }).click(function (e) {
        $(this).popover('show');
    });
    $("#popover" + recid).popover('show');
    $(".SpecSectionPDFicon:not(#popover" + recid + ")").popover('hide');
	$(".schedulesLinkPDFicon").popover('hide');
	var recordToolTip = "#tooltip-"+recid;
	$(recordToolTip).hide();
	var tooltipList = $("[id^=tooltip]");
	if(tooltipList && tooltipList.length > 0) {
		for(var i = 0; i < tooltipList.length; i++) {
			var id = tooltipList[i].id;
				if(recordToolTip != '#'+ id)
					$('#'+tooltipList[i].id).removeAttr("style");
		}
	}
}

function openSchedulesPopover(csvParam) {
	var arrayParam = csvParam.split(', ');
	var recid = arrayParam[0];
	var specName = '';
	for(var i=1; i<arrayParam.length; i++) {
		if(specName) {
			specName = specName + ', ' + arrayParam[i].toLowerCase();
		} else {
			specName = arrayParam[i].toLowerCase();
		}
	}
    var scope = angular.element("#page-content-wrapper").scope();
	var injector = angular.element(document).injector();
	var planViewService = injector.get("PlanViewService");
	var specSchedules = scope.vm.specSectionToSchedulesMap[specName];
	var schedulesDS = planViewService.getSchedulesDS(specSchedules);

	var html = getHtmlTemplate(schedulesDS);

    $("#linkPopover" + recid).popover({
        html: true,
        content: $('<div>' + html + '</div>').click(function(event) {
			if(event.target.id && event.target.id === 'schedulesClose') {
				$(".schedulesLinkPDFicon").popover('hide');
			}
			event.stopPropagation();
		}),
        placement: 'right',
        trigger: 'manual',
		container: '#wrapper',
    })
	.data('bs.popover').tip().addClass('spec-schedules-link')
	.click(function (e) {
        $(this).popover('show');
		e.stopPropagation();
    });
    $("#linkPopover" + recid).popover('show');
    $(".schedulesLinkPDFicon:not(#linkPopover" + recid + ")").popover('hide');
	$(".SpecSectionPDFicon").popover('hide');


	// Code for Schedules Search
	$("#schedulesSearch").on("keyup", function() {
		var searchText = $(this).val().toLowerCase();
		filterSchedules('#schedules ul li', searchText);
	});
}

// Code for closing schedules popover when clicking anywhere outside, even on topbanner or left nav
$(document).click(function() {
  $(".schedulesLinkPDFicon").popover('hide');
});

function filterSchedules(scheduleLists, searchText) {
	var scheduleCounts = 0;
	$(scheduleLists).filter(function() {
		$(this).toggle($(this).text().toLowerCase().indexOf(searchText) > -1)
	});
}

function getHtmlTemplate(schedulesDS) {
	var html = '<div class="schedules-links p-l0 p-r0 p-t10">' +
					'<div class="input-group col-sm-8 p-l10 m-b10">' +
						'<input type="text" id="schedulesSearch" class="form-control cursorPointer" placeholder="Search" autofocus>' +
						'<span class="input-group-addon">' +
							'<span class="glyphicon glyphicon-search"></span>' +
						'</span>'+
						'<span class="close-icon">' +
							'<image id="schedulesClose" src="images/spec-view/close.png"></image>' +
						'</span>' +
					'</div>' +
					'<div class="col-sm-12 p-l0 p-r0">' +
						'<p class="brd-top">Schedules</p><span class="w-50p pull-left schedule-name-container">Schedule Name</span><span class="w-50p pull-left schedule-name-container brd-r0">Sheet Label</span>' +
					'</div>' +
				'</div>';
	html = html + '<div class="outer-container col-sm-12 p-l0 p-r0">';
	if(schedulesDS.length > 0){
		html=html+'<div id="schedules" class="col-sm-12 p-l0 p-r0"><ul class="list-group">';
		for(var i=0; i<schedulesDS.length; i++) {
			var src = getSpecsToScheduleSources(schedulesDS[i]);
			html = html + '<li class="list-group-item"><a class=\'btn btn-link schedules-link pull-left\' title=\'' + schedulesDS[i].scheduletitle + src + '\' onclick=\'openPlanviewSchedules(' + JSON.stringify(schedulesDS[i]) + ')\'>' +
			schedulesDS[i].scheduletitle.toLowerCase() +
			'</a><a class=\'btn btn-link schedules-link pull-left\' title=\'' + schedulesDS[i].sheetDetail + '\' onclick=\'openPlanviewSchedules(' + JSON.stringify(schedulesDS[i]) + ')\'>' +
			schedulesDS[i].sheetDetail +
			'</a></li>';
		}
		html = html+'</ul></div>';
	}
	html = html + '</div>';
	return html;
}

function getSpecsToScheduleSources(schedule) {

	// Temp tooltip till we get a mockup.
	var src = '(Generated by: ';
	if (schedule.sources && schedule.sources.length > 0
			&& schedule.sources.indexOf('PROCUREMENT_LOG') > -1) {
		for (var j = 0; j < schedule.sources.length; j++) {
			var source = schedule.sources[j];
			switch (source) {
			case 'PROCUREMENT_LOG':
				src += 'Procurement Log';
				break;
			case 'AUTO_GENERATED':
				src += 'Pype-AI';
				break;
			case 'USER_DEFINED':
				src += 'User';
				break;
			}
			if (j < schedule.sources.length - 1) {
				src += ',';
			}
		}
	}
	else {
//		src += 'Pype-AI';
		return '';
	}
	src += ')';
	return src;
}
