(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('ExcelExportController', ExcelExportController);

    ExcelExportController.$inject = ['$log', '$location', 'AuthenticationService', 'FlashService', '$scope', '$rootScope', 'SmartRegisterService',
        '$timeout', 'EventService', 'RememberService','ModalService', '$routeParams', 'ProcoreIntegrationService', 'ProjectSightService',
        'BIMIntegrationService', 'ExportService', 'ImageURL', 'ACCBuildService'];
    function ExcelExportController($log, $location, AuthenticationService, FlashService, $scope, $rootScope, SmartRegisterService,
            $timeout, EventService, RememberService, ModalService, $routeParams, ProcoreIntegrationService, ProjectSightService,
            BIMIntegrationService, ExportService, ImageURL, ACCBuildService) {

        var vm = this;
        vm.DownloadFormatExcel = DownloadFormatExcel;
        vm.selectAllExportFeature = selectAllExportFeature;
        vm.unselectAllExportFeature = unselectAllExportFeature;
        vm.basicProjectGroupFilterPopover  = basicProjectGroupFilterPopover;
        vm.basicHandleClick = basicHandleClick;
        vm.advancedHandleClick = advancedHandleClick;

        vm.toggleAllDivisionFiltersSelection = toggleAllDivisionFiltersSelection;
        vm.toggleAllSpecSectionFiltersSelection = toggleAllSpecSectionFiltersSelection;
        vm.toggleAllCommonFiltersSelection = toggleAllCommonFiltersSelection;
        vm.restFilterDropdowns = restFilterDropdowns;
        vm.removeFilterItem = removeFilterItem;
        vm.toggleFilterDropdown = toggleFilterDropdown;
        vm.loadLastFiltered = loadLastFiltered;

        vm.changeCurrentFilter = changeCurrentFilter;
        vm.saveLinkClicked = saveLinkClicked;
        vm.deleteFilter = deleteFilter;
        vm.addToFilterClicked = addToFilterClicked;
        vm.resetToDefaultFilter = resetToDefaultFilter;

        vm.routeParams = angular.copy($routeParams);
        $location.search({});

        $scope.hideAppliedFilters = false;
        //$scope.filteredItemsList = [];
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

        function initController() {
            $rootScope.hideSmartLinks = true;
            vm.initialPageLoad = true;
            $scope.filterType = "Basic";
          	var project = AuthenticationService.GetProject();
          	GetSelectedExportOption();
          	prepareImageObject();
  			vm.submittalregisters = [];
  			vm.MaxId = -1;
            vm.step = 1;

          	GetSmartRegister(function(){
      				PrepareSmartRegisterColumns();
      				initializeAllFilterItems();
      				LoadUserDetails();
          	});
            GetCompanyName();
        }
        initController();

        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        $scope.$on('$locationChangeStart', function () {
            $rootScope.hideSmartLinks = false;
        });

        vm.GoToPreviewPage = function() {
            vm.dataLoading = 'Loading ' + vm.exportDomain + ' Excel Preview...';
            var selectedRecords = $scope.getCheckedSelectedRecords('exportSubmittalGrid');
            if(selectedRecords.length <= 0) {
				selectedRecords = $scope.getSelectedRecordsForExport();
			}
            vm.step1SelectedRecords = angular.copy(selectedRecords);
            populatePreviewData(selectedRecords, function(response) {
                if(response.success) {
                    vm.step = 2;
                    vm.recordsData = processDataForPreview(response.data[Object.keys(response.data)[0]]);
                    preparePreviewColumns(vm.recordsData);
                    $scope.reinitializeGrid(false, false, false, vm.recordsData.length);
                    $scope.gridReload(vm.recordsData, vm.columnsData);
                } else {
                    FlashService.Error('Unable to get Preview.');
                }
                vm.dataLoading = false;
            });
        }

        function populatePreviewData(selectedRecords, callback) {
            var projectId = vm.selectedProject.projectId;
            var versionId = vm.selectedProjectVersion.versionId;
            if(vm.exportDomain.toUpperCase() === 'PROCORE') {
                ProcoreIntegrationService.GetPreviewExcelData(projectId, versionId, selectedRecords, function(response) {
                    if(callback) { callback(response); }
                });
            }
            else if(vm.exportDomain.toUpperCase() === 'PROJECTSIGHT') {
                ProjectSightService.getPreviewExcelData(projectId, versionId, selectedRecords, function(response) {
                    if(callback) { callback(response); }
                });
            }
            else if(vm.exportDomain.toUpperCase() === 'BIM 360') {
                BIMIntegrationService.getPreviewExcelData(projectId, versionId, selectedRecords, function(response) {
                    if(callback) { callback(response); }
                });
            }
            else if(vm.exportDomain.toUpperCase() === 'ACC BUILD') {
                ACCBuildService.getPreviewExcelData(projectId, versionId, selectedRecords, function(response) {
                    if(callback) { callback(response); }
                });
            }
        }


        function processDataForPreview(data) {
            var preparedJsonArray = [];
            data.forEach(function(item) {
                var tempObj = {};
                for(var key in item) {
                  tempObj[key] = item[key]['targetDataValue'];
                }
                preparedJsonArray.push(tempObj);
            });
            return preparedJsonArray;
        }

        function preparePreviewColumns(data) {
            var ifBimOrAccBuild = vm.exportDomain.toUpperCase() === 'BIM 360' || vm.exportDomain.toUpperCase() === 'ACC BUILD';
            var colWidths = ifBimOrAccBuild ? '130px' : '100px';
            vm.columnsData = [];
            for(var key in data[0]) {
                var tempObject = {};
                var size = (key.toLowerCase() === 'description') ? '350px' : colWidths;
                tempObject = { field: key, caption: key, size: size, tooltip: key, resizable: true, editable: false};
                vm.columnsData.push(tempObject);
            }
        }

        function basicHandleClick(event) {
          $scope.filterType = "Basic";
          initializeQuickFilterVaraiables();
          GetSmartRegister();
          event.preventDefault();
        }

        function advancedHandleClick(event) {
    			$scope.filterType = "Advanced";
    			initializeQuickFilterVaraiables();
    			GetSmartRegister();
    			event.preventDefault();
    		}

        function selectAllExportFeature() {
          angular.forEach(vm.basicProjectSummaryGroups, function (item){
            item.selected = true;
          });
        }
        function unselectAllExportFeature() {
          angular.forEach(vm.basicProjectSummaryGroups, function (item){
            item.selected = false;
          });
        }

        vm.GoOneStepBack = function() {
          if(vm.step === 2) {
              vm.dataLoading = 'Loading Smart Register...';
              vm.step = 1;
              PrepareSmartRegisterColumns();
              vm.recordsData = vm.filterSmartRegisteredData;
              $timeout(function() {
                $scope.reinitializeGrid(true, true, true, vm.recordsData.length);
                $scope.gridReload(vm.recordsData, vm.columnsData);
                vm.dataLoading = false;
              }, 1);
          } else {
              if(vm.exportDomain.toUpperCase() === 'PROCORE') {
                  var dontShowMappingPageFlag = AuthenticationService.GetDontShowProcoreMappingPage();
              }
              else if(vm.exportDomain.toUpperCase() === 'PROJECTSIGHT') {
                  var dontShowMappingPageFlag = AuthenticationService.GetDontShowProjectSightMappingPage();
              }
              else if(vm.exportDomain.toUpperCase() === 'BIM 360') {
                  var dontShowMappingPageFlag = AuthenticationService.GetDontShowBimMappingPage();
              }
              else if(vm.exportDomain.toUpperCase() === 'ACC BUILD') {
                  var dontShowMappingPageFlag = AuthenticationService.GetDontShowAccBuildMappingPage();
              }
        	  if(dontShowMappingPageFlag) {
        		  NavigateToSmartRegisterOrSpecview();
        	  }
        	  else {
        		  var sourcePage;
        		  if(vm.routeParams && vm.routeParams.sourcePage ==='specview') {
        			  sourcePage = 'specview';
        		  } else {
        			  sourcePage = 'smartregister';
        		  }
                  var route = '/' + vm.exportDomain.replace(/\s/g, '').toLowerCase() + 'mapping/';
        		  $location.path(route).search({sourcePage: sourcePage, 'fromExcelExport': true, 'file': true});
        	  }
          }
        }

        function NavigateToSmartRegisterOrSpecview () {
        	//Go back to previous page
          var accProject = AuthenticationService.GetACCProject();
          if(vm.routeParams && vm.routeParams.sourcePage === 'specview') {
              AuthenticationService.setSmartViewType('specview');
              $location.path('/smartview/projects/' + accProject.id);
          } else {
             $location.path('/smartregister/projects/' + accProject.id);
          }
        }

        function DownloadFormatExcel() {
        	GetFormatSpecificFile(vm.exportId);
        }

        function GetFormatSpecificFile(domainId) {
            vm.dataLoading = 'Downloading... Please wait';
            var selectedRecords = vm.step1SelectedRecords;
			var records = SmartRegisterService.getFilteredRecordObject(selectedRecords, vm.srExportColumns);
            SmartRegisterService.DownLoadFormatSpecificFile(vm.selectedProject.projectId, vm.selectedProjectVersion.versionId, domainId, records, function (response) {
                if (response.success) {
                    showConfirmPopup();
                } else {
                    FlashService.Error('Failed to download Excel. Please try again');
                }
                vm.dataLoading = false;
            });
        }

        function showConfirmPopup() {
            var backNavigationPage = '/smartregister';
            if(vm.routeParams && vm.routeParams.sourcePage === 'specview') {
                AuthenticationService.setSmartViewType('specview');
                backNavigationPage = '/smartview';
            }
            var buttonText = backNavigationPage==='/smartview' ? 'Go to SpecView' : 'Go to Smart Register';
            var items = { buttonText: buttonText };
            ModalService.ConfirmProcoreDownloadModal(items)
              .result.then(function() {
                $location.path(backNavigationPage);
              });
        }

        function LogEvent(moduleName, type, description, status, callback) {
            var logEvent = {};
            logEvent.moduleName = moduleName;
            logEvent.type = type;
            logEvent.description = description;
            logEvent.status = status;
            EventService.AddEvent(logEvent, vm.selectedProject.projectId, function (response) {
            	if(callback){callback();}
            });
        }

        function GetSelectedExportOption() {
        	var exportOptions = AuthenticationService.GetExportOptionInfo();
        	vm.exportId = exportOptions.domainId;
        	vm.exportDomain = exportOptions.domainName;
        }

        function prepareImageObject() {
            vm.imageObj = {};
            if(vm.exportDomain.toUpperCase() === 'PROCORE') {
                vm.imageObj.url = ImageURL + 'procore/procore-logo.png';
                vm.imageObj.style = { 'margin-top': '3px' };
            }
            else if(vm.exportDomain.toUpperCase() === 'PROJECTSIGHT') {
                vm.imageObj.url = ImageURL + 'exports/project-sight-logo2.png';
                vm.imageObj.style = { 'width': '25px', 'margin-top': '3px' };
            }
            else if(vm.exportDomain.toUpperCase() === 'BIM 360') {
                vm.imageObj.url = ImageURL + 'logos/bim360-logo-small.png';
                vm.imageObj.style = { 'width': '20px', 'margin-top': '3px' };
            }
            else if(vm.exportDomain.toUpperCase() === 'ACC BUILD') {
                vm.imageObj.url = ImageURL + 'exports/acc-build.svg';
                vm.imageObj.style = { 'width': '22px', 'height': '22px', 'margin-top': '1px' };
            }
        }

        $scope.setGridEvents = function (reloadEvent, getSelectedRecords, getCheckedSelectedRecords, selectAll, reinitializeGrid) {
            $scope.gridReload = reloadEvent;
            $scope.getSelectedRecordsForExport = getSelectedRecords;
            $scope.getCheckedSelectedRecords = getCheckedSelectedRecords;
            $scope.selectAllRecords = selectAll;
            $scope.reinitializeGrid = reinitializeGrid;
        };

		// Filters related code starts here

		 function initializeQuickFilterVaraiables(){
	        	//Quick filter related variables
	        $scope.myForm = {};
	        $scope.myForm.$invalid = false;
	    		$scope.divisionCodeForm = {};
	    		$scope.divisionCodeForm.$invalid = false;
	    		$scope.specSectionsForm = {};
	    		$scope.specSectionsForm.$invalid = false;
          $scope.submittalTypeForm = {};
          $scope.submittalTypeForm.$invalid = false;

	    		$scope.filterSectionsRange = 10;
	    		$scope.sectionsStart = 0;
	    		$scope.sectionsLimit = $scope.filterSectionsRange;

	    		$scope.filterDivisionsRange = 10;
	    		$scope.divisionsStart = 0;
	    		$scope.divisionsLimit = $scope.filterDivisionsRange;

          $scope.filterSubmittalTypeRange = 10;
	    		$scope.submittalTypeStart = 0;
	    		$scope.submittalTypeLimit = $scope.filterSubmittalTypeRange;
	    }

	        // Filter related codes end here

		function PrepareSmartRegisterColumns() {

			vm.columnsData = [
			{
				field : 'projectSummaryGroup',
				caption : 'Submittals group',
				hidden : false,
				sortable : true,
				size : '20%',
				tooltip : 'Submittals group',
				resizable : true,
				editable : false
			}, {
				field : 'divisionCode',
				caption : 'Division',
				hidden : true,
				sortable : true,
				size : '7%',
				resizable : true,
				tooltip : 'Division',
				editable : false
			}, {
				field : 'specNumber',
				caption : 'Spec section',
				sortable : true,
				size : '8%',
				resizable : true,
				editable : false,
				tooltip : 'Spec section'
			}, {
				field : 'specName',
				caption : 'Spec name',
				sortable : true,
				size : '19%',
				resizable : true,
				tooltip : 'Spec name',
				editable : false
			}, {
				field : 'paraCode',
				caption : 'Spec sub section',
				tooltip : 'Spec sub section',
				sortable : true,
				size : '7%',
				resizable : true,
				editable : false
			}, {
				field : 'submittalsHeading',
				caption : 'Sub section heading',
				hidden : true,
				sortable : true,
				size : '8%',
				tooltip : 'Sub section heading',
				resizable : true,
				editable : false
			}, {
				field : 'specCategory',
				caption : 'Submittal type',
				sortable : true,
				size : '17%',
				resizable : true,
				tooltip : 'Submittal type',
				editable : false
			}, {
				field : 'submittalDescription',
				caption : 'Submittal description',
				sortable : true,
				size : '34%',
				resizable : true,
				tooltip : 'Submittal description',
				editable : false
			}, {
				field : 'userNotes',
				caption : 'User Notes',
				sortable : true,
				size : '8%',
				resizable : true,
				hidden : true,
				tooltip : 'User Notes',
				editable : false
			}, {
				field : 'targetDate',
				caption : 'Target Date',
				sortable : true,
				size : '8%',
				resizable : true,
				tooltip : 'Target Date',
				editable : false
			}, {
				field : 'subContractor',
				caption : 'Subcontractor',
				sortable : true,
				size : '8%',
				resizable : true,
				tooltip : 'Subcontractor',
				editable : false
			}

			];

            vm.srExportColumns = ['projectName', 'companyName', 'divisionCode', 'divisionName', 'origPDFStartPageNumber', 'origSpecCategory', 'origSubmittalDescription', 'paraCode', 'pdfEndPageNumber', 'pdfLineNumber', 'pdfPageNumber', 'pdfURL', 'productFlag', 'projectNumber', 'projectSummaryGroup', 'recid', 'serialNumber', 'specCategory', 'specCategoryGroup', 'specName', 'specNumber', 'subContractor', 'submittalDescription', 'submittalsHeading', 'submtitalTargetGroup', 'targetDate', 'targetGroup', 'userNotes', 'dateIssued'];

			var plansSubmittalExist = SmartRegisterService.getPlansSubmittalExist(vm.submittalregisters);
			if(plansSubmittalExist) {
				var plansColumns = [
					{
						field : 'drawingSheetNumber',
						caption : 'Sheet Number',
						sortable : true,
						size : '8%',
						resizable : true,
						editable : false,
						tooltip : 'Sheet Number',
						hidden : true
					}, {
						field : 'drawingSheetName',
						caption : 'Sheet Name',
						sortable : true,
						size : '19%',
						resizable : true,
						tooltip : 'Sheet Name',
						editable : false,
						hidden : true
					}
				]
				vm.columnsData.splice(4, 0, plansColumns[0], plansColumns[1]);
				vm.srExportColumns.push('drawingSheetNumber');
				vm.srExportColumns.push('drawingSheetName');
			}

			SmartRegisterService.initSmartColumns(vm.smartColumns, vm.columnsData, true, true);

			/*NAMED FILTERS RELATED CODE BLOCK*/
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
            /*NAMED FILTERS RELATED CODE BLOCK*/

			$scope.filtersDirty = AuthenticationService.GetShowSaveSmartRegisterFilter();

			getFilterRelatedValues(filterData);
		}

		//Filters related code starts here

		$scope.projectGroupFilterPopover = {

	            isOpen: false,

	            templateUrl: 'confirmPopoverTemplate.html',

	            open: function open() {

	                $scope.projectGroupFilterPopover.isOpen = true;
	                $scope.projectGroupFilterPopover.data = 'Hello!';
	            },
	            selectAll: function selectAll() {
	                angular.forEach(vm.projectSummaryGroups, function (item, index) {
	                    item.selected = true;
	                });
	            },
	            unSelectAll: function unSelectAll() {
	                angular.forEach(vm.projectSummaryGroups, function (item, index) {
	                    item.selected = false;
	                });
	            },

	            close: function close() {
	            	$scope.myForm.$invalid = true;
	            	vm.applyingFilters = true;
	                //$scope.projectGroupFilterPopover.isOpen = false;
	                //waitingDialog.show('Applying Filters...Please Wait...');
	            	// intentional delay of 10 milli seconds to make sure loader will appear
	                setTimeout(ApplyFilters,10);
	            },

	            dismiss: function dismiss(event) {
	                if (!event || event.target.className.indexOf("popover") <= -1) {
	                	//$scope.projectGroupFilterPopover.data = 'Hello!';
	                    $scope.projectGroupFilterPopover.isOpen = false;
				       for (var index = 0; index < vm.projectSummaryGroups.length; index++) {
							if (vm.projectSummaryGroupsSelectedItems
									.indexOf(vm.projectSummaryGroups[index].value) !== -1) {

								vm.projectSummaryGroups[index].selected = true;
							} else

								vm.projectSummaryGroups[index].selected = false;
						}
	               }
	            }
	        };


		 function basicProjectGroupFilterPopover() {
			vm.dataLoading = "Applying Filters... Please wait...";
			$timeout(function(){
				vm.basicprojectSummaryGroupsSelectedItems = [];
				angular.forEach(vm.basicProjectSummaryGroups,
						function(item, index) {
							if (item.selected == true)
								vm.basicprojectSummaryGroupsSelectedItems
										.push(item.value);
						});
				vm.basicFilterSmartRegisteredData = vm.submittalregisters
						.filter(function(record) {
							return $.inArray(record.projectSummaryGroup,
									vm.basicprojectSummaryGroupsSelectedItems) != -1;
						});
				$scope.$broadcast("RebuildGrid", vm.basicFilterSmartRegisteredData);
				vm.dataLoading = false;
			}, 0);
		}

		 function ApplyFilters() {
			    vm.projectSummaryGroupsSelectedItems = [];
				angular.forEach(vm.projectSummaryGroups, function(item, index) {
					if (item.selected == true)
						vm.projectSummaryGroupsSelectedItems.push(item.value);
				});
				vm.submittalregisters = vm.remainingData.concat(vm.filterSmartRegisteredData);

				vm.filterSmartRegisteredData = vm.submittalregisters.filter(function(record) {
					return $.inArray(record.divisionCode, vm.divisionCodeSelectedItems) != -1 &&
					$.inArray(record.specNumber, vm.specSectionSelectedItems) != -1 &&
					$.inArray(record.projectSummaryGroup && record.projectSummaryGroup.toUpperCase(), vm.projectSummaryGroupsSelectedItems) != -1 &&
          ((record.specCategory && vm.submittalTypeSelectedItems.indexOf(record.specCategory.toLowerCase()) !== -1) ||
					((record.specCategory === '' || record.specCategory === null) && vm.submittalTypeSelectedItems.indexOf(emptyValuesLabel) !== -1));

				});
				vm.remainingData = vm.submittalregisters.filter(function(record) {
					return $.inArray(record.divisionCode, vm.divisionCodeSelectedItems) == -1 ||
					$.inArray(record.specNumber, vm.specSectionSelectedItems) == -1 ||
					$.inArray(record.projectSummaryGroup && record.projectSummaryGroup.toUpperCase(), vm.projectSummaryGroupsSelectedItems) == -1 ||
          ((record.specCategory && vm.submittalTypeSelectedItems.indexOf(record.specCategory.toLowerCase()) === -1) ||
					((record.specCategory === '' || record.specCategory === null) && vm.submittalTypeSelectedItems.indexOf(emptyValuesLabel) === -1));

				});
				$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
				$scope.myForm.$invalid = false;
				$scope.projectGroupFilterPopover.isOpen = false;
				vm.applyingFilters = false;
				$scope.$apply();
				//addOrCreateFilter('projectSummaryGroup', 'Project Summary Group', vm.projectSummaryGroupsSelectedItems);

				//updateSearchData();
			}

		 $scope.divisionCodeFilterPopover = {
		            isOpen: false,
		            templateUrl: 'confirmPopoverTemplate.html',
		            open: function open() {
		                $scope.divisionCodeFilterPopover.isOpen = true;
		            },
		            selectAll: function selectAll() {
		            	//Selecting only the result of search records
		                angular.forEach(vm.allDivisions, function (item, index) {
		                	if(!vm.searchDivisionCodes || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1) ||
		                			(item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)){
		                		item.selected = true;
		                	}
		                });
		            },
		            unSelectAll: function unSelectAll() {
		            	//Unselecting only the result of search records
		                angular.forEach(vm.allDivisions, function (item, index) {
		                	if(!vm.searchDivisionCodes || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1) ||
		                			(item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)){
		                		item.selected = false;
		                	}
		                });
		            },

		            close: function close() {
		            	$scope.divisionCodeForm.$invalid = true;
		            	vm.applyingDivsionFilters = true;
		            	$scope.divisionsLimit = $scope.filterDivisionsRange; //Resetting the filter divisions range to default
		            	// intentional delay of 10 milli seconds to make sure loader will appear
		                setTimeout(ApplyDivisionFilters,10);
		            },

		            dismiss: function dismiss(event) {
		                if (!event || event.target.className.indexOf("divisionsPopOver") <= -1) {
		                	vm.searchDivisionCodes = '';
		                	$scope.divisionsLimit = $scope.filterDivisionsRange; //Resetting the filter divisions range to default
		                    $scope.divisionCodeFilterPopover.isOpen = false;
					       for (var index = 0; index < vm.allDivisions.length; index++) {
								if (vm.divisionCodeSelectedItems.indexOf(vm.allDivisions[index].divisionCode) !== -1) {
									vm.allDivisions[index].selected = true;
								} else{
									vm.allDivisions[index].selected = false;
								}
							}
		               }
		            }
		        };

			function ApplyDivisionFilters() {
				vm.divisionCodeSelectedItems = [];
				angular.forEach(vm.allDivisions, function(item, index) {
					if (item.selected == true)
						vm.divisionCodeSelectedItems.push(item.divisionCode);
				});
				applyFiltersForAll();
				$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);

				vm.searchDivisionCodes = '';
				$scope.divisionCodeForm.$invalid = false;
				vm.applyingDivsionFilters = false;
				$scope.divisionCodeFilterPopover.isOpen = false;
				$scope.$apply();
			}

			$scope.specSectionFilterPopover = {
		            isOpen: false,
		            templateUrl: 'confirmPopoverTemplate.html',
		            open: function open() {
		                $scope.specSectionFilterPopover.isOpen = true;
		            },
		            selectAll: function selectAll() {
		            	//Selecting only the result of search records
		            	angular.forEach(vm.allSpecSections, function (item, index) {
		                	if(!vm.searchSpecSections || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1) ||
		                				(item.specSection && item.specSection.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1)){
		                		item.selected = true;
		                	}
		                });
		            },
		            unSelectAll: function unSelectAll() {
		            	//Unselecting only the result of search records
		                angular.forEach(vm.allSpecSections, function (item, index) {
		                    if(!vm.searchSpecSections || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1) ||
		                    		(item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)){
		                    	item.selected = false;
		                    }
		                });
		            },

		            close: function close() {
		            	$scope.specSectionsForm.$invalid = true;
		            	vm.applyingSpecSectionFilters = true;
		            	$scope.sectionsLimit = $scope.filterSectionsRange; //Resetting the filter sections range to default
		            	// intentional delay of 10 milli seconds to make sure loader will appear
		                setTimeout(ApplySpecSectionFilters,10);
		            },
		            dismiss: function dismiss(event) {
		            	if (!event || event.target.className.indexOf("specSectionsPopOver") <= -1) {
		     	          $scope.specSectionFilterPopover.isOpen = false;
		     	          vm.searchSpecSections = '';
		     	          $scope.sectionsLimit = $scope.filterSectionsRange; //Resetting the filter sections range to default
		     		       for (var index = 0; index < vm.allSpecSections.length; index++) {
		     					if (vm.specSectionSelectedItems.indexOf(vm.allSpecSections[index].specSection) !== -1) {
		     						vm.allSpecSections[index].selected = true;
		     					} else{
		     						vm.allSpecSections[index].selected = false;
		     					}
		     				}
		     	       }
		            }
		        };

			function ApplySpecSectionFilters() {
				vm.specSectionSelectedItems = [];
				angular.forEach(vm.allSpecSections, function(item, index) {
					if (item.selected == true)
						vm.specSectionSelectedItems.push(item.specSection);
				});
				applyFiltersForAll();
				$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);

				vm.searchSpecSections = '';
				$scope.specSectionsForm.$invalid = false;
				//addOrCreateFilter('specNumber','Spec Section', vm.specSectionSelectedItems);
				//updateSearchData();
				vm.applyingSpecSectionFilters = false;
				$scope.specSectionFilterPopover.isOpen = false;
				$scope.$apply();
			}

			$scope.dismissPopOver = function(event){
				if (!event || event.target.className.indexOf("submittalGroupsPopOver") <= -1) {
	               $scope.projectGroupFilterPopover.isOpen = false;
	               //addOrCreateFilter('projectSummaryGroup', vm.projectSummaryGroupsSelectedItems);
	               for (var index = 0; index < vm.projectSummaryGroups.length; index++) {
	            	   if (vm.projectSummaryGroupsSelectedItems.indexOf(vm.projectSummaryGroups[index].value) !== -1) {
	            		   vm.projectSummaryGroups[index].selected = true;
	            	   } else{
	            		   vm.projectSummaryGroups[index].selected = false;
	            	   }
	               }
		        }
	        	if (!event || event.target.className.indexOf("divisionsPopOver") <= -1) {
		           $scope.divisionCodeFilterPopover.isOpen = false;
		           vm.searchDivisionCodes = '';
		           //addOrCreateFilter('divisionCode', vm.divisionCodeSelectedItems);
		           $scope.divisionsLimit = $scope.filterDivisionsRange; //Resetting the filter divisions range to default
			       for (var index = 0; index < vm.allDivisions.length; index++) {
						if (vm.divisionCodeSelectedItems.indexOf(vm.allDivisions[index].divisionCode) !== -1) {
							vm.allDivisions[index].selected = true;
						} else{
							vm.allDivisions[index].selected = false;
						}
					}
		       }
		    	if (!event || event.target.className.indexOf("specSectionsPopOver") <= -1) {
		           $scope.specSectionFilterPopover.isOpen = false;
		           vm.searchSpecSections = '';
		           $scope.sectionsLimit = $scope.filterSectionsRange; //Resetting the filter sections range to default
			       for (var index = 0; index < vm.allSpecSections.length; index++) {
						if (vm.specSectionSelectedItems.indexOf(vm.allSpecSections[index].specSection) !== -1) {
							vm.allSpecSections[index].selected = true;
						} else{
							vm.allSpecSections[index].selected = false;
						}
					}
		       }
			}

     // submittal type filters
     $scope.submittalTypeFilterPopover = {
               isOpen: false,
               open: function open() {
                   $scope.submittalTypeFilterPopover.isOpen = true;
               },
               selectAll : function selectAll() {
            	   vm.submittalTypeSelectedItems = [];
	                for(var i=0; i<vm.uniqueSubmittalTypes.length; i++) {
	                 if (!vm.searchSubmittalType
	                   || (vm.uniqueSubmittalTypes[i] && vm.uniqueSubmittalTypes[i].toLowerCase().indexOf(vm.searchSubmittalType.toLowerCase())) > -1) {
	                  vm.submittalTypeSelectedItems.push(vm.uniqueSubmittalTypes[i]);
	                 }
	                }
	               },
	               unSelectAll : function unSelectAll() {
	                vm.submittalTypeSelectedItems = vm.uniqueSubmittalTypes.filter(function(data){
	                 if (!vm.searchSubmittalType || (data && data.toLowerCase().indexOf(vm.searchSubmittalType.toLowerCase())) > -1) {
	                  //Ignore
	                 } else {
	                  return data;
	                 }
	                });
	               },

               select: function select(item) {
                 var index = vm.submittalTypeSelectedItems.indexOf(item);
                 if (index === -1){
                   vm.submittalTypeSelectedItems.push(item);
                 }
                 else {
                   vm.submittalTypeSelectedItems.splice(index, 1);
                 }
               },
               close: function close() {
                 $scope.submittalTypeForm.$invalid = true;
                 vm.applyingSubmittalTypeFilters = true;
                 setTimeout(ApplySubmittalTypeFilters,10);
               },
               dismiss: function dismiss(event) {
                 if (!event || event.target.className.indexOf("submittalTypePopOver") <= -1) {
                   $scope.submittalTypeFilterPopover.isOpen = false;
                   vm.searchSubmittalType = '';
                   vm.submittalTypeSelectedItems = angular.copy(vm.submittalTypeSelectedItemsFinal);
                }
               }
           };

           $scope.dismissPopOver = function(event){
             if (!event || event.target.className.indexOf("submittalGroupsPopOver") <= -1) {
                      $scope.projectGroupFilterPopover.isOpen = false;
                      for (var index = 0; index < vm.projectSummaryGroups.length; index++) {
                        if (vm.projectSummaryGroupsSelectedItems.indexOf(vm.projectSummaryGroups[index].value) !== -1) {
                          vm.projectSummaryGroups[index].selected = true;
                        } else{
                          vm.projectSummaryGroups[index].selected = false;
                        }
                      }
                 }
                 if (!event || event.target.className.indexOf("divisionsPopOver") <= -1) {
              $scope.divisionCodeFilterPopover.isOpen = false;
              vm.searchDivisionCodes = '';
              $scope.divisionsLimit = $scope.filterDivisionsRange; //Resetting the filter divisions range to default
            for (var index = 0; index < vm.allDivisions.length; index++) {
           if (vm.divisionCodeSelectedItems.indexOf(vm.allDivisions[index].divisionCode) !== -1) {
             vm.allDivisions[index].selected = true;
           } else{
             vm.allDivisions[index].selected = false;
           }
         }
          }
         if (!event || event.target.className.indexOf("specSectionsPopOver") <= -1) {
              $scope.specSectionFilterPopover.isOpen = false;
              vm.searchSpecSections = '';
              $scope.sectionsLimit = $scope.filterSectionsRange; //Resetting the filter sections range to default
            for (var index = 0; index < vm.allSpecSections.length; index++) {
           if (vm.specSectionSelectedItems.indexOf(vm.allSpecSections[index].specSection) !== -1) {
             vm.allSpecSections[index].selected = true;
           } else{
             vm.allSpecSections[index].selected = false;
           }
         }
          }

          if (!event || event.target.className.indexOf("submittalTypePopOver") <= -1) {
              $scope.submittalTypeFilterPopover.isOpen = false;
              vm.searchSubmittalType = '';
              vm.submittalTypeSelectedItems = angular.copy(vm.submittalTypeSelectedItemsFinal);
          }
     }

     function ApplySubmittalTypeFilters() {
       applyFiltersForAll();
       $scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);

       vm.searchSubmittalType = '';
       vm.submittalTypeSelectedItemsFinal = angular.copy(vm.submittalTypeSelectedItems);
       $scope.submittalTypeForm.$invalid = false;
       vm.applyingSubmittalTypeFilters = false;
       $scope.submittalTypeFilterPopover.isOpen = false;
       $scope.$apply();
     }

     function getUniqueSubmittalTypes(submittals) {
			var uniqueSubmittalTypes = [], uniqueSubmittalTypesRecords = [];
			var record = {};
			for (var i = 0; i < submittals.length; i++) {
				if (submittals[i].specCategory != null
						&& submittals[i].specCategory != ''
						&& uniqueSubmittalTypesRecords.indexOf(submittals[i].specCategory.toLowerCase()) === -1) {
					uniqueSubmittalTypesRecords.push(angular
							.copy(submittals[i].specCategory.toLowerCase()));
				} else if ((submittals[i].specCategory == '' || submittals[i].specCategory == null)
						&& uniqueSubmittalTypesRecords
								.indexOf(emptyValuesLabel) === -1) {
					uniqueSubmittalTypesRecords.push(emptyValuesLabel);

				}
			}
			return uniqueSubmittalTypesRecords.sort();
		}

			function getUniqueDivisions(submittals){
				var uniqueDivisions = [], uniqueDivsionCodes = [];
				var record = {};
				for(var i=0;i<submittals.length;i++){
					if(submittals[i].divisionCode != null && submittals[i].divisionCode != '' && uniqueDivsionCodes.indexOf(submittals[i].divisionCode) === -1){
						record = {divisionCode : submittals[i].divisionCode, divisionName : submittals[i].divisionName};
                        uniqueDivisions.push(angular.copy(record));
						uniqueDivsionCodes.push(submittals[i].divisionCode);
					}
				}
				return {uniqueDivisionRecords : uniqueDivisions, uniqueDivisionCodes : uniqueDivsionCodes};
			}

	        function getUniqueSpecSections(submittals){
				var uniqueSpecSectionRecords = [], uniqueSpecSections = [];
				var record = {};
				for(var i=0;i<submittals.length;i++){
					if(submittals[i].specNumber != null && submittals[i].specNumber != '' && uniqueSpecSections.indexOf(submittals[i].specNumber) === -1){

						record = {specSection : submittals[i].specNumber, specName : submittals[i].specName};

						uniqueSpecSectionRecords.push(angular.copy(record));
						uniqueSpecSections.push(submittals[i].specNumber);
					}
				}
				return { uniqueSpecSectionRecords : uniqueSpecSectionRecords, uniqueSpecSections : uniqueSpecSections};
			}

        function GetSmartRegister(callback) {

        	vm.selectedProject = AuthenticationService.GetProject();
        	vm.selectedProjectVersion = AuthenticationService.GetVersion();
			vm.dataLoading = "Loading Smart Register...";
			SmartRegisterService.GetByProjectId(vm.selectedProject.projectId, vm.selectedProjectVersion.versionId,  function(response) {
				if (response.success) {
					vm.MaxId = 0;
                    vm.submittalregisters = response.data.smartRegisterRecords;
					vm.recordsData = vm.submittalregisters;
                    if (vm.recordsData.length > 0) {
                    	SmartRegisterService.prepareAndSetSmartColumns(vm, vm.recordsData, response.data.smartColumnsContainer);
                    }
                    if (callback) {
                    	callback();
                    }

					prepareQuickFilterData(vm.submittalregisters);
		            applyFiltersForAll(vm.submittalregisters);
                    $scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData, vm.columnsData);
					$scope.smartRegisterFlag = true;
				} else {
					response.message="Fail to Load Smart Register Data";
					FlashService.Error(response.message);
				}
                vm.dataLoading = false;
			});
		}

        /*MODERN FILTERS RELATED CODE STARTS HERE*/

        function initializeAllFilterItems(){
        	$scope.divisionFilterItem = {selected:true};
            $scope.specSectionFilterItem = {selected:true};
            $scope.projectSummaryGroupsFilterItem = {selected:true};
            $scope.specCategoriesFilterItem = {selected:true};
            $scope.specCategoryGroupFilterItem = {selected:false};
            $scope.subContractorFilterItem = {selected:false};
        }

        function prepareQuickFilterData(submittalRecords) {
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

                var uniqueSpecCategory = getDistinctValuesByProperty(submittalRecords, "specCategory", false , true);

                var uniqueSubContractor = getDistinctValuesByProperty(submittalRecords, "subContractor", false, true);

                var uniqueSpecCategoryGroup = getDistinctValuesByProperty(submittalRecords, "specCategoryGroup", false, true);

                var uniqueSubmittalGroup = getDistinctValuesByProperty(submittalRecords, "submittalsHeading", false, true);

                var uniqueProjectSummaryGroup = getDistinctValuesByProperty(submittalRecords, "projectSummaryGroup", false, true);

                uniqueProjectSummaryGroup.sort();

                var projectSummaryGroups = [], specCategories = [], versions = [], specCategoryGroups = [], subContractors = [];

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

                getSelectedValuesBasedOnFilter();
                setVisibleColumns();
                updateColumnSelectedValuesFlags();
                //updateFilteredItemsList();
            }
            else {
                initializeAllFilterRelatedValues();
            }

            setAllFilterRelatedTempValues();
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

        function updateSearchData() {
        	var updatedSearchData = vm.searchDataTemp;
        	AuthenticationService.SetSmartRegisterFilter(updatedSearchData);
        }

        function getFilterRelatedValues(filterData){
        	if (filterData.length === 0) {
				$scope.visibleColumnsList = [];
				vm.searchDataTemp = [];
			} else {
				vm.searchDataTemp = filterData;
			}
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
                		if(vm[data.field + "SelectedItemsAll"].indexOf(tempValues[i]) > -1){
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

        function setVisibleColumns(){
        	for(var i=0;i<vm.searchDataTemp.length;i++){
        		$scope[vm.columnsTotalVarData[vm.searchDataTemp[i].field].filterItem]["selected"] = vm.searchDataTemp[i].visibility;
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
            			if(vm[key + "SelectedItems"].indexOf(vm[vm.columnsTotalVarData[key].allVar][index][vm.columnsTotalVarData[key].mapValue]) !== -1){
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

        function convertAllValuesToLowerCase(items){
        	var result = [];
        	for(var i=0;i<items.length;i++){
        		if(items[i]){
        			result.push(items[i].toLowerCase());
        		}
        	}
        	return result;
        }

		function applyFiltersForAll(submittalRegisters, changefromsavedlist, fromResetToDefault){
        if(vm.currentFilter && vm.currentFilter.name.toUpperCase() === 'DEFAULT') {
          vm.hideResetToDefaultFilter = true;
          vm.showSavedTick = false;
          vm.currentFilter = '';
        } else {
          vm.hideResetToDefaultFilter = false;
        }
        if(changefromsavedlist && !fromResetToDefault) {
          vm.showSavedTick = true;
        } else if(vm.initialPageLoad) {
          vm.initialPageLoad = false;
        } else {
          vm.showSavedTick = false;
          vm.currentFilter = '';
        }

        vm.submittalRegisters = submittalRegisters?submittalRegisters:vm.remainingData.concat(vm.filterSmartRegisteredData);
        if(vm.submittalRegisters && vm.submittalRegisters.length > 0){
        	var specCategorySelectedItems = convertAllValuesToLowerCase(vm.specCategorySelectedItems);
        	var specCategoryGroupSelectedItems = convertAllValuesToLowerCase(vm.specCategoryGroupSelectedItems);
          var subContractorSelectedItems = convertAllValuesToLowerCase(vm.subContractorSelectedItems);
        	var filteredData = [], remainingData = [];

        	vm.filterSmartRegisteredData = vm.submittalRegisters.filter(function(record) {
        		if(((record.divisionCode !== '' && $.inArray(record.divisionCode, vm.divisionCodeSelectedItems) !== -1)
    						|| (record.divisionCode === '' && vm.divisionCodeSelectedItems.indexOf(emptyValuesLabel) !== -1) || vm.divisionCodeSelectedItems.length === 0 ) &&
  				((record.specNumber !== '' && $.inArray(record.specNumber, vm.specSectionSelectedItems) !== -1)
  						|| (record.specNumber === '' && vm.specSectionSelectedItems.indexOf(emptyValuesLabel) !== -1) || vm.specSectionSelectedItems.length === 0) &&
  				(($.inArray(record.projectSummaryGroup && record.projectSummaryGroup.toUpperCase(), vm.projectSummaryGroupSelectedItems) !== -1)
  						|| (record.projectSummaryGroup === "" && $.inArray(emptyValuesLabel, vm.projectSummaryGroupSelectedItems) !== -1) || vm.projectSummaryGroupSelectedItems.length === 0) &&
  				((record.specCategory && specCategorySelectedItems.indexOf(record.specCategory.toLowerCase()) !== -1)
  						|| (record.specCategory === "" && specCategorySelectedItems.indexOf(emptyValuesLabel) !== -1) || specCategorySelectedItems.length === 0) &&
  				((record.specCategoryGroup && specCategoryGroupSelectedItems.indexOf(record.specCategoryGroup.toLowerCase()) !== -1)
  						|| (record.specCategoryGroup === "" && specCategoryGroupSelectedItems.indexOf(emptyValuesLabel) !== -1) || specCategoryGroupSelectedItems.length === 0) &&
          ((record.subContractor && subContractorSelectedItems.indexOf(record.subContractor.toLowerCase()) !== -1)
  						|| (record.subContractor === "" && subContractorSelectedItems.indexOf(emptyValuesLabel) !== -1) || subContractorSelectedItems.length === 0)){
        				filteredData.push(record);
        			} else {
        				remainingData.push(record);
        			}
				});

        	vm.filterSmartRegisteredData = filteredData;
        	vm.remainingData = remainingData;
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
        		//vm[vm.columnsTotalVarData[key].selectAllVar] = vm[key + "SelectedItems"].length === vm[key + "SelectedItemsAll"].length;//commonSelectAllChecked(key);

        		vm[vm.columnsTotalVarData[key].selectAllVar] = false;
        		vm.currentSearchResults = [];
        	}
        }

        $scope.itemClicked = function(item, index, key){
        	if(item.selected === true){
        		if(vm[key + "SelectedItemsTemp"] && vm[key + "SelectedItemsTemp"].length === 0){
        			vm[key + "SelectedItemsTemp"] = angular.copy(vm[key + "SelectedItemsAll"]);
        		}
        		vm[key + "SelectedItemsTemp"].splice(vm[key + "SelectedItemsTemp"].indexOf(item[vm.columnsTotalVarData[key].mapValue]), 1);
        	} else {
        		if(vm[key + "SelectedItemsAll"].length === vm[key + "SelectedItemsTemp"].length){
            		vm[key + "SelectedItemsTemp"] = [];
            	}
        		vm[key + "SelectedItemsTemp"].splice(index, 0, item[vm.columnsTotalVarData[key].mapValue]);
        	}
        	item.selected = !item.selected;

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

            	applyFiltersForAll();

            	//updateFilteredItemsList();
            	if($scope.filtersDirty === false){
                	$scope.filtersDirty = true;
                	//AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
              }

                $scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
                updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItems"], true);
                updateSearchData();

                //After updating the submittals in grid, uncheck all items and selectAll checkbox to make them look unchecked
                if(itemsSelectedStatus === "NONE" || itemsSelectedStatus === "ALL"){
                	updateColumnSelectedValuesFlags(key, false);
        			vm[vm.columnsTotalVarData[key].selectAllVar] = false;
        		}

                $scope[vm.columnsTotalVarData[key].filterItem].isOpen = false;

                vm.dataLoading = false;
        	}, 0);
        };

        function toggleAllDivisionFiltersSelection(forceSelectAll) {
        	if(!forceSelectAll && vm.divisionCodeSelectAll){
                vm.allDivisionsTemp = vm.allDivisionsTemp.filter(function(item){
                	if (!vm.searchDivisionCodes || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1) ||
                            (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)) {
                        item.selected = false;
                    }
                	return item;
                });
                vm.divisionCodeSelectAll = false;
                vm.divisionCodeSelectedItemsTemp = [];
        	} else {
        		vm.divisionCodeSelectedItemsTemp = [];
                vm.allDivisionsTemp = vm.allDivisionsTemp.filter(function(item){
                	if (!vm.searchDivisionCodes || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1) ||
                            (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)) {
                        item.selected = true;
                    }
                	return item;
                });
                vm.divisionCodeSelectAll = true;
        	}
        	$scope.divisionFormDirty = true;
        }

        function toggleAllSpecSectionFiltersSelection(forceSelectAll) {
        	if(!forceSelectAll && vm.specSectionSelectAll){
                vm.allSpecSectionsTemp = vm.allSpecSectionsTemp.filter(function(item){
                	if (!vm.searchSpecSections || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1) ||
                            (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)) {
                        item.selected = false;
                    }
                	return item;
                });
                vm.specSectionSelectAll = false;
                vm.specSectionSelectedItemsTemp = [];
        	} else {
        		vm.specSectionSelectedItemsTemp = [];
                vm.allSpecSectionsTemp = vm.allSpecSectionsTemp.filter(function(item){
                	if (!vm.searchSpecSections || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1) ||
                            (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)) {
                		item.selected = true;
                	}
                	return item;
                });
                vm.specSectionSelectAll = true;
        	}
        	$scope.specSectionFormDirty = true;
        }

        function toggleAllCommonFiltersSelection(key, forceSelectAll) {
        	if(!forceSelectAll && vm[vm.columnsTotalVarData[key].selectAllVar]){
        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = vm[vm.columnsTotalVarData[key].allVar + "Temp"].filter(function(item){
        			if (vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == ''
            			|| (item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)) {
        				item.selected = false;
        			}
                	return item;
                });
        		vm[vm.columnsTotalVarData[key].selectAllVar] = false;
            	vm[key + "SelectedItemsTemp"] = [];
            }
            else{
            	vm[key + "SelectedItemsTemp"] = [];
            	vm[vm.columnsTotalVarData[key].allVar + "Temp"] = vm[vm.columnsTotalVarData[key].allVar + "Temp"].filter(function(item){
            		if (vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == ''
            			|| (item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)) {
            			item.selected = true;
            		}
                	return item;
                });
            	vm[vm.columnsTotalVarData[key].selectAllVar] = true;
            }
        	$scope[vm.columnsTotalVarData[key].form]  = true;
        }

        function resetToDefaultFilter() {
						var filtersListOriginal = AuthenticationService.GetListOfFilters();
						var defaultFilterPresent;
						if(filtersListOriginal && filtersListOriginal.length > 0) {
							for(var i=0;i<filtersListOriginal.length;i++){
								if(filtersListOriginal[i] && filtersListOriginal[i].name.toUpperCase() === "DEFAULT"){
									filtersListOriginal[i].preferenceContent = [{"field":"divisionCode","value":[],"visibility":true},{"field":"specSection","value":[],"visibility":true},{"field":"projectSummaryGroup","value":["ACTION AND INFORMATIONAL","CLOSEOUT SUBMITTALS","MOCKUPS"],"visibility":true},{"field":"specCategory","value":[],"visibility":true},{"field":"specCategoryGroup","value":[],"visibility":false}];
                  saveFilters('Default', '', filtersListOriginal[i].preferenceId);
									changeCurrentFilter(filtersListOriginal[i], true);
									defaultFilterPresent = true;
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
					changeCurrentFilter(defaultFilterInitData, true);
				}

        function restFilterDropdowns(callback){

        	vm.dataLoading = "Clearing Filters... Please wait..";
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
                if($scope.filtersDirty === false){
                	$scope.filtersDirty = true;
                	AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
                }

                //updateFilteredItemsList();

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

        function selectAllFilters(){
        	for(var key in vm.columnsTotalVarData){
        		if(key === vm.columnsList.division){
            		toggleAllDivisionFiltersSelection(true);
            	} else if(key === vm.columnsList.specSection){
            		toggleAllSpecSectionFiltersSelection(true);
            	} else {
            		toggleAllCommonFiltersSelection(key, true);
            	}
        	}
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
            	if($scope.filtersDirty === false){
                	$scope.filtersDirty = true;
                	AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
                }
        	}
        }

        function ResetSelectedItemsValues(){
        	for(var key in vm.columnsTotalVarData){
    			vm[key + "SelectedItems"] = vm[key + "SelectedItemsAll"];
    		}
        }

        function loadLastFiltered(){
        	vm.dataLoading = "Reloading last saved filter preferences... Please wait..";
        	AuthenticationService.GetUserPreferences(vm.user.userId, function(response){
        		if(response){
        			if(response.success && response.data){
        				AuthenticationService.UpdateUserPreferencesLocally(response.data);
        				var filterData = AuthenticationService.GetSmartRegisterFilter();

        				getFilterRelatedValues(filterData);

        				setVisibleColumns();

        				//Make sure you set the selectedItems value to all before changing its values according to search data(because select all is default)
        				ResetSelectedItemsValues();

        				getSelectedValuesBasedOnFilter();

        				updateColumnSelectedValuesFlags();

                        //updateFilteredItemsList();

                        setAllFilterRelatedTempValues();

        				$scope.filtersDirty = false;
        				AuthenticationService.SetShowSaveSmartRegisterFilter(false);

                        applyFiltersForAll(vm.submittalregisters);

                        vm.originalSubmittalRegisterRecords = angular.copy(vm.submittalregisters);
                        $scope.$broadcast("RebuildGridWithNewRecid", { submittals: vm.filterSmartRegisteredData, recid: vm.MaxId });

                        updateColumnsSelectedValuesConditionally(false);

                        $timeout(function(){
                        	vm.dataLoading = false;
                        }, 0);

        			} else {
        				FlashService.Error(response.message);
            			$log.info(response);
            			vm.dataLoading = false;
        			}
        		} else {
        			FlashService.Error("Empty response from server");
        			$log.info(response);
        			vm.dataLoading = false;
        		}
        		//vm.dataLoading = false;
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
            if (vm.searchDivisionCodes == undefined || vm.searchDivisionCodes == '' || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
        		|| (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1))
                return true;
            return false;
        }

        $scope.submittalTypeFilter = function (item) {
            if (vm.searchDivisionCodes == undefined || vm.searchDivisionCodes == '' || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
            		|| (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1))
                    return true;
                return false;
            }

        $scope.commonFilter = function (key) {
        	return function(item) {
        		if (vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == ''
        			|| (item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)){
        			//vm[key + "SelectedItemsTemp"].push(item);
        			return true;
        		}
        		return false;
            }

		}

        $scope.commonSearchValueChanged = function(key){
        	vm[key + "SelectedItemsTemp"] = [];

        	var currentAllVar = vm[vm.columnsTotalVarData[key].allVar + "Temp"], item = "";
        	vm.currentSearchResults = [];

        	if(key === "divisionCode"){
        		for(var i=0;i<currentAllVar.length;i++){
        			item = currentAllVar[i];
            		if (vm.searchDivisionCodes == undefined || vm.searchDivisionCodes == '' || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
                    		|| (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)){
            			vm[key + "SelectedItemsTemp"].push(item.divisionCode);
            			vm.currentSearchResults.push(item.divisionCode);
            			item.selected = true;
                    } else {
                    	item.selected = false;
                    }
        		}
        	} else if(key === "specSection"){
        		for(var i=0;i<currentAllVar.length;i++){
        			item = currentAllVar[i];
	        		if (vm.searchSpecSections == undefined || vm.searchSpecSections == '' || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1)
	                		|| (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)){
	        			vm[key + "SelectedItemsTemp"].push(item.specSection);
	        			vm.currentSearchResults.push(item.specSection);
	        			item.selected = true;
                    } else {
                    	item.selected = false;
                    }
        		}
        	} else{
        		for(var i=0;i<currentAllVar.length;i++){
        			item = currentAllVar[i];
	        		if (vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == ''
	        				|| (item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)){
	        			vm[key + "SelectedItemsTemp"].push(item[vm.columnsTotalVarData[key].mapValue]);
	        			vm.currentSearchResults.push(item[vm.columnsTotalVarData[key].mapValue]);
	        			item.selected = true;
	        		} else {
	        			item.selected = false;
	        		}
        		}
        	}
        	vm[vm.columnsTotalVarData[key].selectAllVar] = commonSelectAllChecked(key);
        	$scope[vm.columnsTotalVarData[key].form] = true;
        }

        function commonSelectAllChecked(key){
        	if (((vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == '') &&
        			vm[key + "SelectedItemsTemp"] && vm[vm.columnsTotalVarData[key].number] === vm[key + "SelectedItemsTemp"].length)
        		|| (vm[vm.columnsTotalVarData[key].searchVar] && vm[key + "SelectedItemsTemp"].length && vm[key + "SelectedItemsTemp"].length === vm.currentSearchResults.length)){
        		return true;
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

        function initializeAllFiltersDirtyValues(){
        	for(var column in vm.columnsTotalVarData){
        		$scope[vm.columnsTotalVarData[column].form] = false;
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

        function selectAllAndApplyFilters(key){
        	if(key === vm.columnsList.division){
        		toggleAllDivisionFiltersSelection(true);
        	} else if(key === vm.columnsList.specSection){
        		toggleAllSpecSectionFiltersSelection(true);
        	} else {
        		toggleAllCommonFiltersSelection(key, true);
        	}

        	$scope.filtersApplied(key);
        }

        /*NAMED FILTERS RELATED CODE STARTS HERE*/

        function getFiltersList(){
          var filtersListOriginal = AuthenticationService.GetListOfFilters();
          var currentFilter = AuthenticationService.GetCurrentFilterPreference();
          vm.filtersList = [];
          for(var i=0;i<filtersListOriginal.length;i++){
            if(filtersListOriginal[i].name.toUpperCase() !== "DEFAULT" && filtersListOriginal[i].name.toUpperCase() !== "LASTAPPLIEDFILTER") {
              vm.filtersList.push(filtersListOriginal[i]);
            }
          }
          if(currentFilter) {
            for(var i=0;i<vm.filtersList.length;i++){
              if(vm.filtersList[i].preferenceId === currentFilter.preferenceId) {
                vm.showSavedTick = true;
                vm.currentFilter = currentFilter;
                break;
              } else {
                vm.showSavedTick = false;
              }
            }
            if(currentFilter.name.toUpperCase() === "DEFAULT") {
              vm.currentFilter = currentFilter;
            }
          } else {
            vm.showSavedTick = false;
          }
        }

        function changeCurrentFilter(filter, defaultFilterFlag){
        	vm.dataLoading = "Loading... Please wait...";
        	var parsedContent = "";
        	$timeout(function(){
        		if(filter && filter.preferenceContent){
            		AuthenticationService.SetCurrentFilterPreference(filter);
            		RememberService.SetCookieObj('selectedfilter', filter);

            		if(typeof filter.preferenceContent === "string"){
            			parsedContent = JSON.parse(filter.preferenceContent);
            		} else {
            			parsedContent = filter.preferenceContent;
            		}
            		getFilterRelatedValues(parsedContent);

                	getSelectedValuesBasedOnFilter();
                    setVisibleColumns();
                    updateColumnSelectedValuesFlags();
                    //updateFilteredItemsList();

                    setAllFilterRelatedTempValues();

                    getFiltersList();

                    vm.dataLoading = "Applying filters... Please wait...";
                    if(defaultFilterFlag) {
                      vm.hideResetToDefaultFilter = true;
                      vm.showSavedTick = false;
                      applyFiltersForAll(vm.submittalRegisters, true, true);
                    }
                    else {
                      vm.hideResetToDefaultFilter = false;
                      vm.showSavedTick = true;
                      applyFiltersForAll(vm.submittalRegisters, true);
                    }

                    $scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);

                    $scope.filtersDirty = false;
                    AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);

                    vm.dataLoading = false;
            	} else {
            		vm.dataLoading = false;
            	}
        	}, 0);
        }

        function saveFilters(name, description, preferenceId){
        	var filters = AuthenticationService.GetSmartRegisterFilter();
        	vm.dataLoading = "Saving filter preferences... Please wait...";
            AuthenticationService.UpdateFilterPreferences(preferenceId, vm.user.userId, name, description, filters, function (response) {
                vm.dataLoading = false;
                if (response.success) {
                    if(name.toUpperCase() !== "LASTAPPLIEDFILTER" && name.toUpperCase() !== 'DEFAULT') {
                      FlashService.Success(response.message);
                    }
                    $scope.filtersDirty = false;
                    AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
                    AuthenticationService.SetListOfFilters(response.data);
                    if(response.data){
                    	var currentSavedFilter = response.data.filter(function(filter){
                    		if(filter.name === name){
                    			return filter;
                    		}
                    	});
                    	if(currentSavedFilter.length > 0){
                    		vm.currentFilter = currentSavedFilter[0];
                    	}
                    }
                    AuthenticationService.SetCurrentFilterPreference(vm.currentFilter);
                    getFiltersList();
                }
                else {
                    FlashService.Error(response.message);
                }
            });
        }

        function saveLinkClicked(){
        	if(!vm.currentFilter){
        		vm.filterName = "";
        		vm.filterDescription = "";
        		vm.currentPreferenceId = -1;
        	} else {
        		vm.filterName = vm.currentFilter.name;
        		vm.filterDescription = vm.currentFilter.description;
        		vm.currentPreferenceId = vm.currentFilter.preferenceId;
        	}
        	vm.filterPopoverIsOpen = true;
        }

        function addToFilterClicked(){
        	vm.currentPreferenceId = -1;
        	if(vm.filtersList && vm.filtersList.length > 0){
        		for(var i=0;i<vm.filtersList.length;i++){
        			if(vm.filtersList[i].name == vm.filterName){
        				vm.currentPreferenceId = vm.filtersList[i].preferenceId;
        				break;
        			}
        		}
        	}
        	saveFilters(vm.filterName, vm.filterDescription, vm.currentPreferenceId);
    		  vm.filterPopoverIsOpen = false;
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

        function DeleteSpecificFilter(filterId){
        	vm.dataLoading = "Deleting filter... Please wait...";
            AuthenticationService.DeleteFilterPreferences(vm.user.userId, filterId, function (response) {
                vm.dataLoading = false;
                if (response.success) {
                    FlashService.Success(response.message);
                    AuthenticationService.SetListOfFilters(response.data);
                    if(filterId === vm.currentFilter.preferenceId){
                    	restFilterDropdowns(function(){
                    		getFiltersList();
                    	});
                    } else {
                    	getFiltersList();
                    }
                }
                else {
                    FlashService.Error(response.message);
                }
            });
        }

        /*NAMED FILTERS RELATED CODE ENDS HERE*/

        /*MODERN FILTERS RELATED CODE ENDS HERE*/

        // $("#exportSubmittalGrid").height((window.innerHeight - 271) + "px");
        // $(".export-page .smart-table").height((window.innerHeight - 170) + "px");
    }

})();
