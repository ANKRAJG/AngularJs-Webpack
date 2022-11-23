(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('SpecViewController', SpecViewController);

    SpecViewController.$inject = ['$location', 'ProjectService', 'AuthenticationService', 'FlashService', 'MAINURL', '$uibModal', '$scope', '$sce', 'SmartRegisterService',
                                    'PDFJSURL', 'APIURL', '$rootScope', 'ProductDataService', 'CompanyService', '$window', 'ProcoreIntegrationService', 'BlueBeamIntegrationService',
                                    'BIMIntegrationService', 'EventService', '$timeout', 'PypeRegexObj', 'RememberService', 'ModalService','ExportService', 'AconexIntegrationService', 'EXPORT_INTEGRATION',
                                    'UtilService','GlobalPropertyService', 'RecommendedSubmittalsService','PypeSearchService', 'PlanViewService', 'DownloadService','SanitizationService','ProjectSightService', 'UserService'];
    function SpecViewController($location, ProjectService, AuthenticationService, FlashService, MAINURL, $uibModal, $scope, $sce, SmartRegisterService,
                                PDFJSURL, APIURL, $rootScope, ProductDataService, CompanyService, $window, ProcoreIntegrationService, BlueBeamIntegrationService, BIMIntegrationService,
                                EventService, $timeout, PypeRegexObj, RememberService, ModalService,ExportService,AconexIntegrationService, EXPORT_INTEGRATION, UtilService,
                                GlobalPropertyService, RecommendedSubmittalsService, PypeSearchService, PlanViewService, DownloadService,SanitizationService,ProjectSightService, UserService) {

        var vm = this;

        vm.StartNewProject = StartNewProject;
        vm.Upgrade = Upgrade;
        vm.loadSpecPDF = loadSpecPDF;
        vm.ExpandAll = ExpandAll;
        vm.CollapseAll = CollapseAll;
        vm.Previous = Previous;
        vm.Next = Next;
        vm.DeleteRecord = DeleteRecord;
        vm.CopyRecord = CopyRecord;
        vm.DeleteProductDataRecord = DeleteProductDataRecord;
        vm.GetFile = GetFile;
        vm.validateAndDownload = validateAndDownload;
        vm.DownloadRequirementsMatrix = DownloadRequirementsMatrix;;
        vm.Share = Share;
        vm.EnableVersioning = EnableVersioning;
        vm.openConfirmExportPopup = openConfirmExportPopup;
        vm.download = download;
        vm.SwitchSmartRegisterView = SwitchSmartRegisterView;
        vm.SwitchProductDataView = SwitchProductDataView;
        vm.addtoSmartReg = addtoSmartReg;
        vm.addToSmartRegister = addToSmartRegister;
        vm.deleteMultipleSubmittals = deleteMultipleSubmittals;
        vm.deleteMultipleProductData = deleteMultipleProductData;
        vm.hovered = hovered;
        vm.CopyProductDataRecord = CopyProductDataRecord;
        vm.CopyMultipleRecords = CopyMultipleRecords;
        vm.CopyMultipleRecordsProductData = CopyMultipleRecordsProductData;
        vm.showNTimesPopup = showNTimesPopup;
        vm.ShowSubmittalCreated = ShowSubmittalCreated;
        vm.initiateMergeOp = initiateMergeOp;
        vm.SwitchTextView = SwitchTextView;
        vm.SwitchPDFView = SwitchPDFView;
        vm.isExportOptionEnabled = isExportOptionEnabled;
        vm.loadSubSpecSectionPDF = loadSubSpecSectionPDF;
        var partHeadingRegex  = PypeRegexObj.PARTREGEX;
        var paraSubHeadingRegex  = PypeRegexObj.PARASUBHEADINGREGEX;
        var subParaCodeRegex = PypeRegexObj.SUBPARACODEREGEX;
        var submittalTypeRegex = PypeRegexObj.SUBMITTALTYPEREGEX;
        $scope.currentHeadingObj = {};
        $scope.isAllCollapsed = false;
//      vm.readonly = $rootScope.globals.userInfo.isReadonly;
        vm.readonly = false;
        vm.switchRecommendedSubmittals = switchRecommendedSubmittals;
        vm.addRecommendedSubmittals = addRecommendedSubmittals;
        vm.addRecommendedSubmittalsToRegister = addRecommendedSubmittalsToRegister;
        vm.pypeAIBtnClicked = pypeAIBtnClicked;
        vm.addEditSubmittal = addEditSubmittal;
        vm.addEditProduct = addEditProduct;
        vm.editSpecSection = editSpecSection;
        vm.deleteSpecSection = deleteSpecSection;

        vm.noRecommendedSubmittals = true;
        vm.excelString = "EXCEL";
        vm.csvString = "CSV";

        vm.highlightSubs = true;
        vm.highlightRecommended = true;
        vm.recommendedSubmittals = [];
        vm.specviewRightBarHidden = false;

        vm.initialLoad = true;


		var startEve, endEve;
		var targetDiv;
		$scope.selectionStarted = false;
		var htmlLoaderSelector = "dir";
		var htmlRegionSelector = "html-region-selector";
		var htmlRowSelector = "html-row";
		var invalidSubmittalTypeKeywords = ["submit", "following", "list", "refer", "section"];
		var defaultSubmittalType = "General";
		var createSubmittalToolTip = $('.create-submittal-tooltip-container');

		vm.toggleAllCommonFiltersSelection = toggleAllCommonFiltersSelection;
		vm.clearFilter = clearFilter;

		vm.columnsList = {submittalGroup : 'projectSummaryGroup'};
		vm.columnsTotalVarData = {
        		projectSummaryGroup : {allVar : 'allProjectSummaryGroups', form : 'submittalGroupFormDirty', mapValue : 'value', mapName : 'Project Summary Group', filterItem : 'projectSummaryGroupsFilterItem',  number : 'numberOfSummaryGroups', selectAllVar : "projectSummaryGroupSelectAll"},
        };
		$scope.visibleColumnsList = [];

		vm.deleteConfirmedSubmittal = deleteConfirmedSubmittal;
	    vm.deleteRecommendedSubmittal = deleteRecommendedSubmittal;
        vm.exportPypeAISubmittals = exportPypeAISubmittals;


		// PypeSearch Related Code
		vm.toggleSpecViewPypeSearch = toggleSpecViewPypeSearch;
		vm.pypeSearchStart = pypeSearchStart;
		vm.specviewSideBarHidden = true;
		vm.toggleSpecViewLeftBar = toggleSpecViewLeftBar;
		vm.toggleSpecViewRightBar = toggleSpecViewRightBar;
		vm.getRecordHeading = getRecordHeading;
		vm.getRecordDescription = getRecordDescription;

		// functions related to consolidated view starts here
		vm.switchConsolidatedView = switchConsolidatedView;
		vm.smartRegisterSubmittalClicked = smartRegisterSubmittalClicked;

		// functions related to consolidated view ends here

		$scope.collapsedGroups = {};
		$scope.isCollapsedGroups = false;
		vm.pdfRendered = false;
		vm.setPdfRendered = setPdfRendered;

		vm.openPublishSpecsPopup = openPublishSpecsPopup;
        (function initController() {
            $("body").css("background-color", "#FFF");
            $rootScope.hideSmartLinks = true;
            localStorage.specViewLoaded = true;

            LoadUserDetails();
            GetCompanyName();
            vm.loaded = 0;
            $scope.projectSummaryGroups = ['CLOSEOUT SUBMITTALS', 'DIVISION 01 REQUIREMENTS', 'MOCKUPS', 'ACTION AND INFORMATIONAL', 'QUALITY ASSURANCE', 'TESTS AND INSPECTIONS', 'QUALITY CONTROL', 'OTHERS'];

            var view = AuthenticationService.GetSpecViewView();

            // RecommendedSubmittalsView is available only for super admins.
            // If view exists and if its RecommendedSubmittalsView, then set this value only if the user is admin
            // else set this to the default SmartRegisterView.
            if (view && view.view && (view.view !== "RecommendedSubmittalsView" || vm.user.isSuperAdmin)) {
                vm.View = view.view;
            } else {
              vm.View = "SmartRegisterView";
            }
            vm.selectedProject = AuthenticationService.GetProject();
            vm.selectedVersion = AuthenticationService.GetVersion();
            LoadSpecView();
            vm.SpecView = "PDFView";
            vm.highlightAllSubmittals = AuthenticationService.GetHighlightAllInPDFFlag();
            initializeAllFilterItems();
            toggleSpecViewLeftBar();
            GetGlobalUISettings();
            vm.accProject = AuthenticationService.GetACCProject();
            vm.sideNavTools = AuthenticationService.getSideNavTools();
            vm.docsEnabled = vm.sideNavTools.filter(function(tool){return tool.name == 'Files'}).length > 0;
            getUserRoles();
        })();

        vm.navigateToCreateVersion = function() {
            AuthenticationService.SetLastRoute($location.path());
            $location.path('/uploadspecs');
        }
		vm.getTooltipMsg = function() {
		            if(!vm.buildEnabled) {
		               return '<div class="build-tooltip"><p><b>Suggested submittals</b></p><p>See suggestion for submittals that might be missing from your project specifications.</p></div>';
		           }
		        }
        function getUserRoles() {
            UserService.getAccUserRoles(vm.accProject.id, function(response) {
                if(response && response.roles) {
                    vm.accUserRoles = response.roles;
                }
            });
        }

        function openPublishSpecsPopup(){
	          if(!vm.docsEnabled){
		         return;
	          }
	          ModalService.publishSpecsToDocsPopup().result.then(function (data) {});
         }


        // PYPE SEARCH CODE STARTS HERE

        function setPdfRendered() {
        	$timeout(function(){
               vm.pdfRendered = true;
            }, 0);
        }

        function toggleSpecViewLeftBar() {
        	$timeout(function(){
                vm.specviewSideBarHidden = !vm.specviewSideBarHidden;
        		$rootScope.toggleClass = angular.copy(vm.specviewSideBarHidden);
            }, 0);
        }

        function toggleSpecViewRightBar() {
        	$timeout(function(){
                vm.specviewRightBarHidden = !vm.specviewRightBarHidden;
                if(!vm.specviewRightBarHidden && !vm.specviewSideBarHidden) {
                    $rootScope.collapseSidebar = true;
                }
            }, 0);
         }

		function GetGlobalUISettings(){
			vm.globalUISettings = GlobalPropertyService.getGlobalUISettings();
			vm.scheduleSubmittalTypes = vm.globalUISettings['schedule-submittal-types']
		}

        vm.publishToBuild = function() {
	        if(vm.accUserRoles.indexOf('1')<=-1 || vm.selectedVersion.status.toLowerCase()!=='completed'){
		      return;
	       }
            setUserAndFilterDetails();
			AuthenticationService.SetLastRoute($location.path());
            $location.path('/draftmappings');
        }

        function pypeSearchStart() {
        	$rootScope.enablePypeSearch = "MAX";
        	$rootScope.searchClicked = true;
        	$rootScope.$broadcast("EnablePypeSearch", $rootScope.enablePypeSearch);
        	$rootScope.toggleClass = false;
        	if(!vm.user.isSuperAdmin)
        		vm.SpecView = 'PDFView';
        }

        $rootScope.$on('EnablePypeSearch', function (event, data) {
        	$rootScope.enablePypeSearch = data;
        	if(data == false) {
        		vm.specviewSideBarHidden = true;
        		vm.specviewRightBarHidden = false;
        	} else if(data == 'MIN') {
        		vm.specviewRightBarHidden = false;
        	}
        });

        $rootScope.$on('HighlightSpecPdf', function (event, data) {
        	callSearchSpecPDF();
		});


        function toggleSpecViewPypeSearch(search) {
           $timeout(function() {
        	if(search === 'MAX') {
        		$rootScope.enablePypeSearch = 'MIN';
        		vm.specviewRightBarHidden = false;
        	}
        	else if(search === 'MIN') {
        		$rootScope.enablePypeSearch = 'MAX';
        		vm.specviewRightBarHidden = true;
        	}
        	$rootScope.$broadcast($rootScope.enablePypeSearch);
          }, 0);
        }

        // PYPE SEARCH CODE ENDS HERE


        /*NEW FILTER RELATED CODE STARTS HERE*/

        function initializeAllFilterItems(){
            $scope.projectSummaryGroupsFilterItem = {selected:true};
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

        $scope.filterDropdownToggled = function(open, key){
        	if(open === false){
        		vm[key + "SelectedItemsTemp"] = angular.copy(vm[key + "SelectedItems"]);

        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = angular.copy(vm[vm.columnsTotalVarData[key].allVar]);

        		vm[vm.columnsTotalVarData[key].searchVar] = "";

        		$scope[vm.columnsTotalVarData[key].form] = false;

        		vm[vm.columnsTotalVarData[key].selectAllVar] = false;
        	} else {
                vm.highlightRecommendedTemp = vm.highlightRecommended;
        		vm[vm.columnsTotalVarData[key].selectAllVar] = false;
        		vm.currentSearchResults = [];
        	}
        }

        vm.togglePSGForm = function(key) {
            $scope[vm.columnsTotalVarData[key].form] = true;
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

        		// Check what is the selected items status currently
        		if(vm[key + "SelectedItemsTemp"].length === vm[key + "SelectedItemsAll"].length){
        			itemsSelectedStatus = "ALL";
        		} else if(vm[key + "SelectedItemsTemp"].length === 0){
        			itemsSelectedStatus = "NONE";
        		}

        		// If user selected no records, in that case we need to consider it as selectAll
        		if(itemsSelectedStatus === "NONE"){
        			vm[key + "SelectedItems"] = angular.copy(vm[key + "SelectedItemsAll"]);
        			updateColumnSelectedValuesFlags(key, true);
        		} else {
        			vm[key + "SelectedItems"] = angular.copy(vm[key + "SelectedItemsTemp"]);
            		vm.allProjectSummaryGroups = vm.allProjectSummaryGroupsTemp;
        		}

            	if($scope.filtersDirty === false){
                	$scope.filtersDirty = true;
                	AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
                }

                updateSearchDataVariable(key, 'Project Summary Group', vm[key + "SelectedItems"], true);
                updateSearchData();

                // Update Last Used Filter with current filter
                updateLastUsedFilter();

                // After updating the submittals in grid, uncheck all items and selectAll checkbox to make them look unchecked
                if(itemsSelectedStatus === "NONE" || itemsSelectedStatus === "ALL"){
                	updateColumnSelectedValuesFlags(key, false);
        			vm[vm.columnsTotalVarData[key].selectAllVar] = false;
        		}

                if(vm.highlightRecommendedTemp !== vm.highlightRecommended) {
                    vm.highlightRecommended = vm.highlightRecommendedTemp;
                    vm.loadSubmittalsInList();
                }

                $scope[vm.columnsTotalVarData[key].filterItem].isOpen = false;
                vm.noFilterFound = getNoFilterFound();
                vm.dataLoading = false;
        	}, 0);
        };

        function getNoFilterFound() {
            if(vm.projectSummaryGroupSelectedItems.length===0) return false;
            for (var key in vm.groupedByProjectSummaryGroup) {
                if (vm.groupedByProjectSummaryGroup.hasOwnProperty(key) && vm.projectSummaryGroupSelectedItems.indexOf(key)>-1) {
                    return false;
                }
            }
            return true;
        }

        function updateLastUsedFilter() {
            // AuthenticationService.GetFilterPreferences(vm.user.userId, function(response) {
            //   if(response && response.success && response.data) {

            var filtersListOriginal = AuthenticationService.GetListOfFilters();;
            var lastUsedFilterPrefId = -1;
            for(var i=0;i<filtersListOriginal.length;i++){
              if(filtersListOriginal[i].name.toUpperCase() === "LASTAPPLIEDFILTER") {
                lastUsedFilterPrefId = filtersListOriginal[i].preferenceId;
              }
            }
            saveFilters(lastUsedFilterPrefId, 'lastAppliedFilter', '');
            //   }
            // });
        }

        function isExportOptionEnabled(optionName) {
        	optionName = optionName.toUpperCase();
        	return !(vm.readonly && (optionName === "BIM 360" || optionName === "BLUEBEAM STUDIO"));
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

        function initializeAllFiltersDirtyValues(){
        	for(var column in vm.columnsTotalVarData){
        		$scope[vm.columnsTotalVarData[column].form] = false;
        	}
        }

        function getFilterRelatedValues(filterData){
        	if (filterData.length === 0) {
				$scope.visibleColumnsList = [];
				vm.searchDataTemp = [];
			} else {
				vm.searchDataTemp = filterData;
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

        function pypeAIBtnClicked() {
            var dontShowIntroScreen = AuthenticationService.GetDontShowPypeAIIntroScreen();
            showGeneratePypeAIPopup(dontShowIntroScreen, true, function(data){
                if (data.dontShowFlag){
                    AuthenticationService.SetDontShowPypeAIIntroScreen(data.dontShowFlag);
                }
                if (data.proceed){
                    if (data.newSubsCount > 0){
                        //new Pype AI Submittals found... So just check the Pype AI checkbox, uncheck submittals checkbox and collapse all results
                        //vm.highlightSubs = false;
                        vm.highlightRecommended = true;
                    } else {
                        //No new Pype AI Submittals found... Check both the checkboxes and collapse all results
                        //Check both the checkboxes
                        vm.highlightSubs = true;
                        vm.highlightRecommended = true;
                    }

                    if (data.cancelClick) return;
                    postPypeAIGet(data);

                    if (data.newSubsCount > 0){
                        //Make sure that we add highlight class for particular checkbox to highlight it once user view side bar
                        vm.highlightConfirmedPostAIGen = false;
                        vm.highlightRecommendedPostAIGen = true;
                    } else {
                        //Make sure that we add highlight class for particular checkbox to highlight it once user view side bar
                        vm.highlightConfirmedPostAIGen = true;
                        vm.highlightRecommendedPostAIGen = true;
                    }
                    vm.showSideBarBackdrop = true;

                    $timeout(function(){
                        //Following block of code will add click event listener to whole document body and it will execute only once and it will automatically remove once used
                        document.getElementsByTagName('body')[0].addEventListener('click', function(event){
                            vm.showSideBarBackdrop = false;
                            vm.highlightConfirmedPostAIGen = false;
                            vm.highlightRecommendedPostAIGen = false;
                            $scope.$apply();
                        }, {once : true});
                    }, 0);
                }
            });
        }

        function postPypeAIGet(data) {
            vm.recommendedSubmittals = data.submittals;
            vm.specviewSideBarHidden = false;
            if(data.selectedSpecSection) {
                vm.recSubsFetched = true;
                loadByDivandSpec(data.selectedSpecSection.divCode, data.selectedSpecSection.specCode, data.selectedSpecSection.specName);
                vm.recSubsFetched = false;
            } else {
                $timeout(function() {
                    scrollToSpecificElementWithAnimation('#sideDiv', '#'+ vm.selectedItem.div.divCode + "-" + $scope.replaceSpecialCharacters(vm.selectedItem.spec.specCode) + "-" + vm.pager.specIndex, true, 150);
                }, 0);
                doFullSpecViewSearch();
                loadSubmittals(vm.selectedItem.spec.specCode, vm.selectedItem.spec.specName);
            }

            vm.ShowPypeAICheckbox = true;
    		vm.highlightRecommended = true;
        }

        function showGeneratePypeAIPopup(dontShowIntroScreen, hideDontShowChkbx, callback){
        	var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: MAINURL + 'views/smartview/specview/specview.pypeai.generationpopup.view.html',
                controller: 'SpecViewPypeAIGenerationController',
                size: 'md',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                	items : function() {
                		return {project: vm.selectedProject, version: vm.selectedVersion, hideDontShowChkbx: hideDontShowChkbx, dontShowIntroScreen: dontShowIntroScreen,
                			recs: vm.recommendedSubmittalsTemp, ShowPypeAICheckbox: vm.ShowPypeAICheckbox}
                	}
                }
            });

            modalInstance.result.then(function (data) {
            	data.proceed = true;
            	callback(data);
            }, function (data) {
            	callback(data);
            });
        }

        vm.addRecommendedToRegister = function(record) {
            vm.dataLoading = 'Adding to Register...Please wait..';
            RecommendedSubmittalsService.addRecommendedToSR(vm.selectedProject.projectId, vm.selectedVersion.versionId, [record], function(response) {
                if(response.success) {
                    // Updating SR Submittals list
                    vm.submittalregisters = response.data.smartRegisterRecords;

                    // Updating delete flag for that particular Recommended Submittal
                    vm.recommendedSubmittals.forEach(function(r) {
                        if(r.recid === record.recid) {
                            r.deleteFlag = true;
                        }
                    });
                    doFullSpecViewSearch();
                    loadSubmittals(vm.selectedItem.spec.specCode, vm.selectedItem.spec.specName);
                    FlashService.Success('Successfully added to Register');
                } else {
                    FlashService.Error('Problem while adding Pype AI Submittals to Register');
                }
                vm.dataLoading = false;
            });
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

        function getSelectedValuesBasedOnFilter(){
        	var tempSearch = [], tempValues = [], i, finalList = [];
        	$scope.visibleColumnsList = [];
            vm.searchDataTemp.filter(function (data) {
            	if(data.visibility){
            		$scope.visibleColumnsList.push(data.field);
            	}
            	if(data.value && data.value.length > 0){
            		if(data.field === vm.columnsList.submittalGroup){
            			tempValues = data.value;
                    	finalList = [];
                    	for(i=0;i<tempValues.length;i++){
                    		if(vm[data.field + "SelectedItemsAll"].indexOf(tempValues[i]) > -1){
                    			finalList.push(tempValues[i]);
                    		}
                    	}
            		} else {
            			finalList = data.value;
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

        function applyFiltersForAll(submittalRegisters){
            vm.submittalRegisters = submittalRegisters?submittalRegisters:vm.remainingData.concat(vm.filterSmartRegisteredData);
            if(vm.submittalRegisters && vm.submittalRegisters.length > 0){
            	var filteredData = [], remainingData = [];
            	vm.filterSmartRegisteredData = vm.submittalRegisters.filter(function(record) {
            		if((($.inArray(record.projectSummaryGroup && record.projectSummaryGroup.toUpperCase(), vm.projectSummaryGroupSelectedItems) !== -1)
	    						|| (record.projectSummaryGroup === "" && $.inArray(emptyValuesLabel, vm.projectSummaryGroupSelectedItems) !== -1) ||
	    						vm.projectSummaryGroupSelectedItems.length === 0)){
            				filteredData.push(record);
            			} else {
            				remainingData.push(record);
            			}
    				});

            	vm.filterSmartRegisteredData = filteredData;
            	vm.remainingData = remainingData;
            }
          }

        function saveFilters(preferenceId, name, description) {
        	var filters = AuthenticationService.GetSmartRegisterFilter();
        	vm.dataLoading = "Saving filter preferences... Please wait...";
            AuthenticationService.UpdateFilterPreferences(preferenceId, vm.user.userId, name, description, filters, function (response) {
                vm.dataLoading = false;
                if (response.success) {
                    if(name !== "lastAppliedFilter" && name !== 'Default') {
                      FlashService.Success(response.message);
                    }
                    $scope.filtersDirty = false;
                    AuthenticationService.SetShowSaveSmartRegisterFilter($scope.filtersDirty);
                    AuthenticationService.SetListOfFilters(response.data);
                }
                else {
                    FlashService.Error(response.message);
                }
            });
        }

        function clearFilter(){
        	var column = vm.columnsList.submittalGroup;
        	this[vm.columnsTotalVarData[column].allVar + "Temp"] = this[vm.columnsTotalVarData[column].allVar + "Temp"].filter(function(data){data.selected = false; return data;});
        	this[vm.columnsTotalVarData[column].allVar] = this[vm.columnsTotalVarData[column].allVar + "Temp"];

        	this[column + "SelectedItemsTemp"] = [];
        	this[column + "SelectedItems"] = this[column + "SelectedItemsTemp"];

            vm.highlightRecommendedTemp = false;
            vm.highlightRecommended = false;
            vm.loadSubmittalsInList();

        	resetAllFilterDataValues();
        	updateSearchData();
        	vm[vm.columnsList.submittalGroup + 'SelectAll'] = false;
           // Update Last Used Filter with current filter
            updateLastUsedFilter();
        }

        function resetAllFilterDataValues(){
        	var tempSearch = [], tempValues = [], i, finalList = [];
            vm.searchDataTemp.filter(function (data) {
            	if(data.field === vm.columnsList.submittalGroup){
                	finalList = [];
                	data.value = finalList;
                	vm[data.field + "SelectedItems"] = angular.copy(finalList);
            	}
            	tempSearch.push(data);
            });

            vm.searchDataTemp = tempSearch;
        }

        /*NEW FILTER RELATED CODE ENDS HERE*/

        function initiateMergeOp() {
        	if(checkIfAnyRecommendedSubmittal()) {
                showNotificationPopup('Please select only Smart Register submittals to merge.', 'Merge records');
        		return;
        	}
        	var selectedRecords = [];
            selectedRecords = vm.submittalsList.filter(function (obj) {
                if (obj.selected == true) {
                    return obj;
                }
            });

            function showNotificationPopup(message, title) {
                ModalService.OpenConfirmModal(title, message, true);
            }

            if (selectedRecords.length < 2) {
                showNotificationPopup('Please select at least two records.', 'Merge records');
            } else if (selectedRecords.length > 20) {
                showNotificationPopup('Maximum limit to merge Submittals (records) at once is 20.', 'Merge records');
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: MAINURL + 'views/smartregister/submittals/MergeModalContent.html?version=9.0',
                    controller: 'MergeModalInstanceCtrl',
                    controllerAs: 'vm',
                    bindToController: true,
                    size: 'lg',
                    windowClass: 'createDrawingsClass',
                    backdrop: 'static',
                    resolve: {
                        recordData: function () { return selectedRecords; },
                        fromRegister : function () { return false; },
                        submittalProductVar: function () { return "submittalDescription"; },
                        fromProducts: function() { return false; }
                    }
                });

                modalInstance.result.then(function (data) {
                    var record = {}, deletedRecords = [], updatedRecords = [], rec, updatedLabel = "Update", deletedLabel = "Deleted", mergeDeletedLabel = "MergeDeleted", changes = [];
                    if (data && data.records) {
                        for (var j = 0; j < data.records.length; j++) {
                            record = data.records[j];

                            record.changes.action = updatedLabel;
                            if (record.isMergeDeletedRecord) {
                                record.changes.action = mergeDeletedLabel;
                            }
                            rec = {};
                            rec.oldRecord = vm.submittalsList.filter(function (item) { return item.recid == record.recid && item.typeOfSubmittal !== 'Recommended'; })[0];
                            rec.newRecord = angular.copy(record);
                            rec.action = record.changes.action;
                            if(rec.newRecord.changes.submittalDescription) {
                              record.submittalDescription = rec.newRecord.changes.submittalDescription;
                            }
                            delete rec.newRecord.changes;
                            if (record.changes.action == deletedLabel) delete rec.newRecord;

                            if (record.changes.action == mergeDeletedLabel) {
                              rec.newRecord = vm.submittalsList.filter(function (item) { return item.serialNumber == record.targetSerialNumber; })[0];
                              record.changes.action = deletedLabel;
                            }
                            changes.push(rec);

                            if (record.isMergeDeletedRecord) {
                                deletedRecords.push(record);
                            } else if (record.isMergeTargetRecord) {
                                updatedRecords.push(record);
                    			record = getFilteredRecordObject([record])[0];
                            }

                            vm.submittalsList.forEach(function (obj, index) { if (obj.recid === record.recid) vm.submittalsList[index] = record; });
                        }
                        deletedRecords = getFilteredRecordObject(deletedRecords);
                        updatedRecords = getFilteredRecordObject(updatedRecords);

                        SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                                [], [], updatedRecords, deletedRecords, null, changes, function (response) {
                                    if (response.success === true) {
                                        vm.submittalregisters = response.data.smartRegisterRecords;
                                        doFullSpecViewSearch();
                                        loadSubmittals(vm.selectedItem.spec.specCode, vm.selectedItem.spec.specName);
										postSubmittalSaveActions();
                                        FlashService.Success('Submittals merged successfully')
                                    } else {
                                        FlashService.Error(response.message || "Unable to merge submittals");
                                    }
                                });
                    }
                }, function () {
                });
            }
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

        function getFilteredRecordObject(array) {
            return alasql('SELECT' +
                ' companyName,divisionCode,divisionName,origPDFStartPageNumber,origSpecCategory,origSubmittalDescription,paraCode,pdfEndPageNumber,pdfLineNumber,pdfPageNumber,pdfURL,projectName,projectNumber,projectSummaryGroup,recid,serialNumber,[source],specCategory,specCategoryGroup,specName,specNumber,subContractor,submittalDescription,submittalsHeading,submtitalTargetGroup,targetDate,targetGroup,userNotes,dateIssued,uploadedToProcore, uploadedToBIM360,uploadedToACC, uploadedToAconex, uploadedToProjectSight,aconexExportedData, bim360ProjectAndSubmittalID,accProjectAndSubmittalID, procoreProjectAndSubmittalID, projectSightProjectAndSubmittalRegID FROM ?', [array]);
        }

        $scope.$on('$locationChangeStart', function (event, next, current) {
            $rootScope.hideSmartLinks = false;
            $("body").css("background-color", "#EFEBE2");
        });

        $scope.specSchedulesPopover = {
            templateUrl: 'specSchedulesPopoverTemplate.html',
            searchText:"",
            opened: false,
            open: function open(div, spec) {
                $('.dropdown').removeClass('open');
                $scope.specSchedulesPopover.opened = true;
                $scope.specSchedulesPopover.isOpen = {};
                $scope.specSchedulesPopover.isOpen[div.divCode + "-" + spec.specCode] = true;
                var specName = spec.specName.toLowerCase();
                var specsSchedules = vm.specSectionToSchedulesMap[spec.specName.toLowerCase()];
            	//$scope.specSchedulesPopover.schedulesDS = PlanViewService.getSchedulesDS(vm.allSchedules || []);
                $scope.specSchedulesPopover.schedulesDS = PlanViewService.getSchedulesDS(specsSchedules);
                $scope.specSchedulesPopover.close(div, spec);
            },
            close: function (div, spec) {
                $scope.showDuplicateErrorMsg = false;
                $scope.specSchedulesPopover.opened = false;
                $scope.projectGroupFilterPopover.isOpen = false;

                if ($scope.specSchedulesPopover.isOpen && $scope.specSchedulesPopover.isOpen[div.divCode + "-" + spec.specCode])
                    $scope.specSchedulesPopover.isOpen[div.divCode + "-" + spec.specCode] = false;
                else if ($scope.specSchedulesPopover.isOpen && $scope.specSchedulesPopover.isOpen[div.divCode + "-" + spec.uniqueSpecId]) {
                    $scope.specSchedulesPopover.isOpen[div.divCode + "-" + spec.uniqueSpecId] = false;
                }
            },
            searchSchedules: function(item){
            	var searchKeyword = $scope.specSchedulesPopover.searchText ? $scope.specSchedulesPopover.searchText.toLowerCase() : $scope.specSchedulesPopover.searchText;
            	return !searchKeyword || item.isEdit || ((item.scheduletitle.toLowerCase().indexOf(searchKeyword) > -1) ||
            			(item.refs.pagelabel_s && item.refs.pagelabel_s.toLowerCase().indexOf(searchKeyword) > -1) ||
            			(item.refs.pagename_s && item.refs.pagename_s.toLowerCase().indexOf(searchKeyword) > -1));
            }
        }

        vm.openPlanviewSchedules = function(schedule) {
        	ExportService.openNewWindow('smartview?openmode=openplanspdf&schedule=' + encodeURIComponent(JSON.stringify(schedule)), 630, 605);
        }

        function deleteSpecSection(div, spec) {
            $scope.showDuplicateErrorMsg = false;
            var message = "This will delete the spec section PDF and all associated submittals and product data.";
            if(spec.planSubmittalPresent)
                message = message + " Submittals corresponding to this spec section from Drawing will be deleted as well.";
            var title = "Delete specifications?";
            ModalService.OpenConfirmModal(title, message, false, 'Delete', 'Cancel', true)
            .result.then(function () {
                var uniqueSpecCode = spec.uniqueSpecId;
                var specName = spec.specName;
                SmartRegisterService.RemoveSpecViewLeftNavData(vm.selectedProject.projectId, vm.selectedVersion.versionId,
                        {
                            uniqueSpecId: spec.uniqueSpecId,
                            specCode: spec.specCode,
                            specName: spec.specName
                        }, function (response) {
                  if (response.success === true) {
                      FlashService.Success("Specification deleted successfully.");
                      //LOGGING EVENT
                      LogEvent("Delete SpecSection/SpecName", "User Deleted Spec Section : '" + uniqueSpecCode + "' Spec Name : '" + specName + "' successfully", "SUCCESS");
                      LoadSpecViewData(vm.selectedProject.projectId, vm.selectedVersion.versionId);
                  } else {
                      FlashService.Error(response.message || "Unable to delete spec section.");
                      //LOGGING EVENT
                      LogEvent("Delete SpecSection/SpecName", "User unable to delete Spec Section : '" + uniqueSpecCode + "' Spec Name : '" + specName + "' " + response.message, "FAILED");
                  }
              });
            }, function() {});
        }

        function editSpecSection(div, spec) {
            var specSection = {};
            specSection.divCode = div.divCode;
            specSection.uniqueDivId = div.uniqueDivId;
            specSection.specCode = spec.specCode;
            specSection.specName = spec.specName;
            specSection.specNameOld = angular.copy(spec.specName);
            specSection.uniqueSpecId = spec.uniqueSpecId;
            ModalService.editSpecSectionPopup(specSection)
            .result.then(function(updatedSpecSection) {
                var divId = encodeURIComponent(updatedSpecSection.uniqueDivId);
                SmartRegisterService.UpdateSpecViewLeftNavData(vm.selectedProject.projectId, vm.selectedVersion.versionId, divId,
                  {
                      uniqueSpecId: updatedSpecSection.uniqueSpecId,
                      specCode: updatedSpecSection.specCode,
                      specName: updatedSpecSection.specName
                  }, function (response) {
                      if (response.success === true) {
                          FlashService.Success("Spec section edited successfully.");
                          //LOGGING EVENT
                          LogEvent("Update SpecSection/SpecName", "User updated submittal with Spec Section : '" + updatedSpecSection.uniqueSpecId + "' Spec Name : '" + updatedSpecSection.specNameOld + "' to Spec Section: '" + updatedSpecSection.specCode + "' Spec Name : '" + updatedSpecSection.specName + "' successfully", "SUCCESS");
                          LoadSpecViewData(vm.selectedProject.projectId, vm.selectedVersion.versionId);
                      } else {
                          FlashService.Error(response.message || "Unable to update spec section.");
                          //LOGGING EVENT
                          LogEvent("Update SpecSection/SpecName", "User unable to update Spec Section : '" + updatedSpecSection.uniqueSpecId + "' Spec Name : '" + updatedSpecSection.specNameOld + "' to Spec Section : '" + updatedSpecSection.specCode + "' Spec Name : '" + updatedSpecSection.specName + "' " + response.message, "FAILED");
                      }
                  });
            }, function() {});
        }

        function addEditSubmittal(submittal, fromTextView) {
            if(submittal) {
                $scope.currentEditingItem = -1;
                $.each(vm.submittalsList, function (index, obj) {
                    if (obj.recid == submittal.recid) {
                        $scope.currentEditingItem = submittal.recid;
                    }
                });
            }
            if(fromTextView) vm.fromTextView = true;
            var items = {
                submittal: submittal,
                selectedItem: vm.selectedItem,
                fromTextView: fromTextView,
                selectedText: $scope.selectedText,
                currentHeadingObj: $scope.currentHeadingObj,
                uniqueSpecCategory: vm.uniqueSpecCategory,
                uniqueProjectSummaryGroup: vm.uniqueProjectSummaryGroup
            };
            ModalService.addEditSubmittalPopup(items)
            .result.then(function(updatedSubmittal) {
                if(!updatedSubmittal.recid) {
                    addNewSubmittal(updatedSubmittal);
                } else {
                    updateExistingSubmittal(updatedSubmittal);
                }
            }, function() {
                resetHighlighterValues();
            });
        }

        function addNewSubmittal(updatedSubmittal) {
            vm.dataLoading = "Adding record... Please wait...";
            vm.MaxRecId++;
            AuthenticationService.SetPypeSearchRecId(vm.MaxRecId);
            var sourceModule = null;
            var sourceId = null;
            var source = vm.selectedVersion.name;
            if (vm.SpecView === 'TextView') {
                sourceModule = 'Smart Build';
                sourceId = vm.selectedSubPdf.sourceId;
                source = vm.selectedSubPdf.sourceName;
            }
            var item = {
                "recid": vm.MaxRecId,
                "serialNumber": vm.MaxRecId,
                "divisionCode": updatedSubmittal.divCode,
                "divisionName": updatedSubmittal.divName,
                "specNumber": updatedSubmittal.specNumber,
                "specName": updatedSubmittal.specName ? updatedSubmittal.specName.toUpperCase():"",
                "paraCode": updatedSubmittal.paraCode,
                "projectSummaryGroup": updatedSubmittal.projectSummaryGroup,
                "submittalsHeading": updatedSubmittal.submittalsHeading,
                "specCategory": updatedSubmittal.specCategory,
                "submittalDescription": updatedSubmittal.submittalDescription,
                "source": source,
                "sourceModule": sourceModule,
                "sourceId": sourceId
            }

            var changes = [];
            delete item.isOpen
            delete item.selected
            changes.push({ action: "Added", newRecord: item });
            SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                            [item], [], [], [], null, changes, function (response) {
                if (response.success === true) {
                    vm.submittalregisters.splice(0, 0, item);
                    doFullSpecViewSearch();
                    loadSubmittals(updatedSubmittal.specNumber, updatedSubmittal.specName);
                    postSubmittalSaveActions();
                    var logEventType;
                    if (vm.fromTextView) {
                        logEventType = "Build Submittals";
                        vm.fromTextView = false;
                    } else {
                        logEventType = "Add SmartRegister Submittal";
                    }
                    //LOGGING EVENT
                    LogEvent(logEventType, "User added SmartRegister Submittal " + "Spec Section : '" + updatedSubmittal.specNumber
                            + "' Spec Name : '" + updatedSubmittal.specName + "' Spec sub section : '" + updatedSubmittal.paraCode + "' Successfully", "SUCCESS");
                    resetHighlighterValues();
                    FlashService.Success("Submittal data added successfully.");

                    vm.data.forEach(function (value, index) {
                        value.specSections.forEach(function (value2, index2) {
                            if((value.divCode == updatedSubmittal.divCode) && (value2.specCode == updatedSubmittal.specNumber)) {
                              value2.submittalNotPresent = false;
                            }
                        });
                    });

                    $timeout(function(){
                        scrollToSpecificElement('#cards','#' + item.recid, true);
                        $scope.pdfIconClicked(item);
                        vm.dataLoading = false;
                    }, 500);

                } else {
                    FlashService.Error(response.message || "Unable to add submittal");
                    //LOGGING EVENT
                    LogEvent("Add SmartRegister Submittal", "User added SmartRegister Submittal " + "Spec Section : '" + updatedSubmittal.specNumber
                            + "' Spec Name : '" + updatedSubmittal.specName + "' ParaCode : '" + updatedSubmittal.paraCode + "' " + response.message, "FAILED");
                    vm.dataLoading = false;
                }
            });
        }

        function updateExistingSubmittal(updatedSubmittal) {
            vm.dataLoading = "Updating record... Please wait...";
            var updatedRecordIndex = $.map(vm.submittalregisters, function (obj, index) {
                if (obj.recid === updatedSubmittal.recid) {
                    return index;
                }
            })[0];
            var item = angular.copy(vm.submittalregisters[updatedRecordIndex]);
            item.recid = updatedSubmittal.recid;
            item.paraCode = updatedSubmittal.paraCode;
            item.projectSummaryGroup = updatedSubmittal.projectSummaryGroup;
            item.submittalsHeading = updatedSubmittal.submittalsHeading;
            item.specCategory = updatedSubmittal.specCategory;
            item.submittalDescription = updatedSubmittal.submittalDescription;
            delete vm.submittalregisters[updatedRecordIndex].isOpen;
            delete item.isOpen;
            delete item.selected;
            var changes = [];
            changes.push({ action: "Update", newRecord: item, oldRecord: vm.submittalregisters[updatedRecordIndex] });
            SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                        [], [], [item], [], [], changes, function (response) {
                if (response.success === true) {
                    vm.submittalregisters[updatedRecordIndex].paraCode = updatedSubmittal.paraCode;
                    vm.submittalregisters[updatedRecordIndex].projectSummaryGroup = updatedSubmittal.projectSummaryGroup || "OTHERS";
                    vm.submittalregisters[updatedRecordIndex].submittalsHeading = updatedSubmittal.submittalsHeading;
                    vm.submittalregisters[updatedRecordIndex].specCategory = updatedSubmittal.specCategory;
                    vm.submittalregisters[updatedRecordIndex].submittalDescription = updatedSubmittal.submittalDescription;
                    doFullSpecViewSearch();
                    loadSubmittals(updatedSubmittal.specNumber, updatedSubmittal.specName);
                    postSubmittalSaveActions();
                    //LOGGING EVENT
                    LogEvent("Update SmartRegister Submittal", "User updated SmartRegister Submittal " + "Spec Section : '" + updatedSubmittal.specNumber
                            + "' Spec Name : '" + updatedSubmittal.specName + "' Spec sub section : '" + updatedSubmittal.paraCode + "' from  " + " Spec sub section : '" + updatedSubmittal.OldParaCode + "' Successfully", "SUCCESS");
                    FlashService.Success("Submittal edited successfully.");

                    $timeout(function(){
                        scrollToSpecificElement('#cards','#' + vm.submittalregisters[updatedRecordIndex].recid, true);
                        $scope.pdfIconClicked(vm.submittalregisters[updatedRecordIndex]);
                        vm.dataLoading = false;
                    }, 0);

                } else {
                    FlashService.Error(response.message || "Unable to update submittal");
                    //LOGGING EVENT
                    LogEvent("Update SmartRegister Submittal", "User unable to update SmartRegister Submittal " + "Spec Section : '" + updatedSubmittal.specNumber
                            + "' Spec Name : '" + updatedSubmittal.specName + "' Spec sub section : '" + updatedSubmittal.paraCode + "' from  " + " Spec sub section : '" + updatedSubmittal.OldParaCode + "' " + response.message, "FAILED");
                    vm.dataLoading = false;
                }
            });
        }

        function addEditProduct(product) {
            if(product) {
                $scope.currentEditingItem = -1;
                $.each(vm.productdata, function (index, obj) {
                    if (obj.recid === product.recid) {
                        $scope.currentEditingItem = product.recid;
                    }
                });
            }
            var items = {
                product: product,
                selectedItem: vm.selectedItem
            };
            ModalService.addEditProductPopup(items)
            .result.then(function(updatedProduct) {
                if(!updatedProduct.recid) {
                    addNewProduct(updatedProduct);
                } else {
                    updateExistingProduct(updatedProduct);
                }
            }, function() {});
        }

        function addNewProduct(updatedProduct) {
            vm.dataLoading = "Adding record... Please wait...";
            vm.MaxProductID++;
            var item = {
                "recid": vm.MaxProductID,
                "serialNumber": vm.MaxProductID,
                "divisionCode": updatedProduct.divCode,
                "divisionName": updatedProduct.divName,
                "specNumber": updatedProduct.specNumber,
                "specName": updatedProduct.specName ? updatedProduct.specName.toUpperCase(): '',
                "paraCode": updatedProduct.paraCode,
                "productHeading": updatedProduct.productHeading,
                "productCategory": updatedProduct.productCategory,
                "productDescription": updatedProduct.productDescription,
                "source": vm.selectedVersion.name
            }

            var changes = [];
            delete item.isOpen;
            delete item.selected;
            changes.push({ action: "Added", newRecord: item });
            ProductDataService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "specView", [item], [], [], [], null, changes, function (response) {
                if (response.success === true) {
                    vm.productdata.splice(0, 0, item);
                    doFullSpecViewSearch();
                    loadProducts(updatedProduct.specNumber);
                    FlashService.Success("Product data added successfully.");

                    //LOGGING EVENT
                    LogEvent("Add ProductData Submittal", "Added ProductData Successfully", "SUCCESS");
                }
                vm.dataLoading = false;
            });
        }

        function updateExistingProduct(updatedProduct) {
            vm.dataLoading = "Updating record... Please wait...";
            var updatedRecordIndex = $.map(vm.productdata, function (obj, index) {
                if (obj.recid === updatedProduct.recid) {
                    return index;
                }
            })[0];
            var item = angular.copy(vm.productdata[updatedRecordIndex]);
            item.paraCode = updatedProduct.paraCode;
            item.productHeading = updatedProduct.productHeading;
            item.productCategory = updatedProduct.productCategory;
            item.productDescription = updatedProduct.productDescription;
            delete vm.productdata[updatedRecordIndex].isOpen;
            delete item.isOpen;
            delete item.selected;
            var changes = [];
            changes.push({ action: "Update", newRecord: item, oldRecord: vm.productdata[updatedRecordIndex] });
            ProductDataService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "specView", [], [], [item], [], [], changes, function (response) {
                if (response.success === true) {
                    vm.productdata[updatedRecordIndex].paraCode = updatedProduct.paraCode;
                    vm.productdata[updatedRecordIndex].productHeading = updatedProduct.productHeading;
                    vm.productdata[updatedRecordIndex].productCategory = updatedProduct.productCategory;
                    vm.productdata[updatedRecordIndex].productDescription = updatedProduct.productDescription;
                    doFullSpecViewSearch();
                    loadProducts(updatedProduct.specNumber);
                    FlashService.Success("Updated successfully.");

                    //LOGGING EVENT
                    LogEvent("Update ProductData", "User updated ProductData " + "Spec Section : '" + updatedProduct.specNumber
                            + "' Spec Name : '" + updatedProduct.specName + "' Spec sub section : '" + updatedProduct.paraCode + "' from  " + " Spec sub section : '" + updatedProduct.OldParaCode + "' Successfully", "SUCCESS");

                } else {
                    FlashService.Error("Unable to update ProductData");
                    //LOGGING EVENT
                    LogEvent("Update ProductData", "User unable update ProductData " + "Spec Section : '" + updatedProduct.specNumber
                            + "' Spec Name : '" + updatedProduct.specName + "' Spec sub section : '" + updatedProduct.paraCode + "' from  " + " Spec sub section : '" + updatedProduct.OldParaCode + "' " + response.message, "FAILED");
                }
                vm.dataLoading = false;
            });
        }


        function scrollToSpecificElement(containerSelector, scrollToElementSelector, reduceTop, topToReduce){
        	var $container = $(containerSelector), $scrollTo = $(scrollToElementSelector);

        	if(reduceTop){
        		if(!topToReduce){
        			topToReduce = 50;
        		}
            if($scrollTo.offset()) {
              $container.scrollTop($scrollTo.offset().top - $container.offset().top + $container.scrollTop() - topToReduce);
            }
        	} else {
            if($scrollTo.offset()) {
              $container.scrollTop($scrollTo.offset().top - $container.offset().top + $container.scrollTop());
            }
        	}
        }

        $scope.closeDropDowns = function () {
            $('.dropdown').removeClass('open');
        }
        $scope.projectGroupFilterPopover = {};

        vm.loadSubmittalsInList = function() {
            doFullSpecViewSearch();
            loadSubmittals(vm.selectedItem.spec.specCode, vm.selectedItem.spec.specName);
        }



        function loadSubmittals(specNumber, specName) {
            var data1 = [], totalSubs = [], recSubs = [];
            vm.confirmedSubs = [];
            vm.pypeAiSubs = [];

            if(vm.initialLoad) {
                vm.filteredSubmittalRecords = setFilteredSubmittalRecords();
                vm.initialLoad = false;
            }

            totalSubs = vm.filteredSubmittalRecords.filter(function (item) {
                return (!item.sourceModule || (item.sourceModule && item.sourceModule.toLowerCase() !== 'plans'))
                            && ((specNumber && (item.specNumber == specNumber)) || (!specNumber && (specName && item.specName)
                            && item.specName.toLowerCase() === specName.toLowerCase()));
            });
            vm.confirmedSubs = totalSubs.filter(function(c) { return c.typeOfSubmittal !== 'Recommended' });
            vm.pypeAiSubs = totalSubs.filter(function(c) { return c.typeOfSubmittal === 'Recommended' && !c.deleteFlag });

            var subs1 = [];
            if(vm.highlightSubs) {
                subs1 = vm.confirmedSubs;
            }
            var subs2 = angular.copy(subs1);
            if(vm.highlightRecommended) {
                subs2 = subs1.concat(vm.pypeAiSubs)
            }

            var myData = angular.copy(subs2);;
            // if(vm.recommendedSubmittals) {
            //     var recSubs = vm.recommendedSubmittals.filter(function(item) {
            //         return ((specNumber && (item.specNumber == specNumber)) || (!specNumber && (specName && item.specName)
            //                 && item.specName.toLowerCase() === specName.toLowerCase()))
            //                 && !item.deleteFlag;
            //     });
            //     vm.pypeAiSubsCount = recSubs.length;
            // }
            // if(vm.highlightRecommended) {
            //     myData = data1.concat(recSubs);
            // }
            vm.submittalsList = myData;

            $scope.getSelectedRecordsForExport = myData;
            var groupedByProjectSummaryGroup = groupBy(myData, 'projectSummaryGroup');
            $scope.noData = jQuery.isEmptyObject(groupedByProjectSummaryGroup);
            vm.totalSubmittalsCount = 0;
            if (!$scope.noData) {
            	var ordered = {}
                Object.keys(groupedByProjectSummaryGroup).sort().forEach(function (key) {
                    ordered[key] = groupedByProjectSummaryGroup[key];
                });
                vm.groupedByProjectSummaryGroup = ordered;
                for (var key in vm.groupedByProjectSummaryGroup) {
                    if (vm.groupedByProjectSummaryGroup.hasOwnProperty(key)) {
                        vm.totalSubmittalsCount += vm.groupedByProjectSummaryGroup[key].length;
                    }
                }
            } else {
                vm.groupedByProjectSummaryGroup = null;
            }
            vm.noFilterFound = getNoFilterFound();
        }

        function exportPypeAISubmittals(){
            vm.disableDownloadPypeAI = true;
        	var columnsToIgnore = ['serialNumber', 'pdfPageNumber', 'drawingPageNumber', 'drawingSheetNumber', 'drawingSheetName',
                        'paraCode', 'targetDate', 'subContractor'];
            ExportService.exportSubmittals(vm.selectedProject, vm.selectedVersion, vm.recommendedSubmittals, columnsToIgnore,
                function(action) {
            		if (action === 'download') {
						LogEvent("PypeAI-Download", "User downloaded PRS for version: " + vm.selectedVersion.name, "SUCCESS", "Project");
            		}
            		else if(action === 'closed') {
						vm.disableDownloadPypeAI = false;
            		}
                });
        }

        function loadProducts(specCode) {
            vm.filteredProductData = vm.filteredProducts.filter(function (item) {
                return item.specNumber.toLowerCase() === specCode.toLowerCase();
            });

            vm.noProductData = vm.filteredProductData.length <= 0;
        }

        function FilterRecommendedSubmittals(specCode) {
        	vm.recommendedSubmittalLoader = "Filtering recommended submittals...";
            vm.filteredRecommendedSubmittals = vm.recommendedSubmittals.filter(function (item) {
                return item.specNumber == specCode;
            });

            vm.noRecommendedSubmittals = vm.filteredRecommendedSubmittals.length <= 0;
            vm.recommendedSubmittalLoader = false;
        }

        /* Search*/
        function trimString(s) {
            var l = 0, r = s.length - 1;
            while (l < s.length && s[l] == ' ') l++;
            while (r > l && s[r] == ' ') r -= 1;
            return s.substring(l, r + 1);
        }

        function compareObjects(o1, o2) {
            var k = '';
            for (k in o1) if (o1[k] != o2[k]) return false;
            for (k in o2) if (o1[k] != o2[k]) return false;
            return true;
        }

        function itemExists(haystack, needle) {
            for (var i = 0; i < haystack.length; i++) if (compareObjects(haystack[i], needle)) return true;
            return false;
        }

        $scope.$on('searchInSpecviewFromBox', function(event, searchText) {
            vm.filterText = searchText;
            doFullSpecViewSearch();
        });

    /* ----------------- Code for Search ------------------- */
        function doFullSpecViewSearch() {
            if(vm.filterText || vm.filterText==='') {
                var origDataCopy = angular.copy(vm.originalData);
                var data = origDataCopy.filter(function (item) {
                    var exist = existsInSpec(item);
                    return (item.divName && item.divName.toUpperCase().indexOf(vm.filterText.toUpperCase())) > -1 || item.divCode.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 || exist;
                });
                vm.data = data;

                getFilteredRecords();
                if(selectedSpecAlreadyPresent(vm.selectedItem.spec) || searchTermPresentInSubmittals()) {
                /* If selected Spec section in left panel already present in filtered Divs and Specs,
                    then no need to load pdf again */
                    loadSubmittals(vm.selectedItem.spec.specCode, vm.selectedItem.spec.specName);
                    loadProducts(vm.selectedItem.spec.specCode);
                    setPager();
                    vm.noDivOrSpecSectionFound = false;
                } else {
                    if(getDivIndexForFirstFilteredSpecSection()) {
                        /* Need to load pdf again */
                        var divIdx = getDivIndexForFirstFilteredSpecSection();
                        vm.selectedItem.div = vm.data[divIdx.value];
                        vm.selectedItem.spec = vm.data[divIdx.value].specSections[0];
                        loadSpecPDF(vm.selectedItem.div, vm.selectedItem.spec, divIdx.value, 0);
                        vm.noDivOrSpecSectionFound = false;
                    } else {
                        /* No Divisions or No Spec Sections found on search filtering */
                        vm.groupedByProjectSummaryGroup = null;
                        $scope.noData = true;
                        vm.filteredProductData = [];
                        vm.noProductData = true;
                        vm.noDivOrSpecSectionFound = true;
                    }
                }
            } else {
                // For getting filtered records after any operation
                vm.filteredSubmittalRecords = setFilteredSubmittalRecords();
                vm.filteredProducts = angular.copy(vm.productdata);
                vm.noDivOrSpecSectionFound = false;
            }
        }

        vm.expandCopy = function() {
            vm.isDownloadExpanded=false;
            vm.isCopyExpanded = !vm.isCopyExpanded;
        }

        function setFilteredSubmittalRecords() {
            var subRegisters = [];
            //if(vm.highlightSubs) {
                subRegisters = angular.copy(vm.submittalregisters);
            //}
            var subRegisters2 = subRegisters;
            if(vm.recommendedSubmittals) {
                subRegisters2 = subRegisters.concat(vm.recommendedSubmittals);
            }
            return subRegisters2;
        }

        function getDivIndexForFirstFilteredSpecSection() {
            for(var i=0; i<vm.data.length; i++) {
                if(vm.data[i].specSections.length>0) {
                    return { value: i };
                }
            }
            return false;
        }

        function existsInSpec(div) {
            div.specSections = div.specSections.filter(function(spec) {
                return spec.specName.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 || spec.specCode.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1
                    || foundSearchTextInSubmittalsAndProducts(spec);
            });
            return div.specSections.length>0;
        }

        function foundSearchTextInSubmittalsAndProducts(specSection) {
            getFilteredRecords();    // For setting vm.filteredSubmittalRecords
            specSection.specCode = (specSection.specCode ? specSection.specCode : '');
            specSection.specName = (specSection.specName ? specSection.specName : '');

            for(var i=0; i<vm.filteredSubmittalRecords.length; i++) {
                var data1 = vm.filteredSubmittalRecords[i];
                data1.specNumber = data1.specNumber ? data1.specNumber : '';
                data1.specName = data1.specName ? data1.specName : '';
                if(data1.specName.toLowerCase() === specSection.specName.toLowerCase() &&
                    data1.specNumber.toLowerCase() === specSection.specCode.toLowerCase()) {
                            return true;
                }
            }

            for(var i=0; i<vm.filteredProducts.length; i++) {
                var data2 = vm.filteredProducts[i];
                data2.specNumber = data2.specNumber ? data2.specNumber : '';
                if(data2.specNumber.toLowerCase() === specSection.specCode.toLowerCase()) {
                    return true;
                }
            }
            return false;
        }

        function selectedSpecAlreadyPresent(selectedSpec) {
            selectedSpec.specCode = selectedSpec.specCode ? selectedSpec.specCode : '';
            selectedSpec.specName = selectedSpec.specName ? selectedSpec.specName : '';
            for(var i=0; i<vm.data.length; i++) {
                for(var j=0; j<vm.data[i].specSections.length; j++) {
                    var spec = vm.data[i].specSections[j];
                    spec.specCode = spec.specCode ? spec.specCode : '';
                    spec.specName = spec.specName ? spec.specName : '';
                    if(spec.specCode.toLowerCase()===selectedSpec.specCode.toLowerCase() && spec.specName.toLowerCase()===selectedSpec.specName.toLowerCase()) {
                        return true;
                    }
                }
            }
            return false;
        }

        function setPager() {
            var divIndex=0, specIndex=0;
            for(var i=0; i<vm.data.length; i++) {
                if(vm.selectedItem.div.divCode === vm.data[i].divCode || vm.selectedItem.div.divName.toLowerCase() === vm.data[i].divName.toLowerCase()) {
                    vm.selectedItem.div = vm.data[i];
                    divIndex = i;
                    break;
                }
            }
            var specSections = vm.selectedItem.div.specSections;
            for(var i=0; i<specSections.length; i++) {
                if(vm.selectedItem.spec.specCode === specSections[i].specCode || vm.selectedItem.spec.specName.toLowerCase() === specSections[i].specName.toLowerCase()) {
                    vm.selectedItem.spec = specSections[i];
                    specIndex = i;
                    break;
                }
            }
            vm.pager = {
                isFirst: divIndex === 0 && specIndex === 0,
                isLast: vm.data.length == divIndex + 1 && vm.selectedItem.div.specSections.length == specIndex + 1,
                divIndex: divIndex,
                specIndex: specIndex
            }
            $timeout(function() {
                scrollToSpecificElementWithAnimation('#sideDiv', '#'+ vm.selectedItem.div.divCode + "-" + $scope.replaceSpecialCharacters(vm.selectedItem.spec.specCode) + "-" + specIndex, true, 150);
            }, 0);
        }

        function searchTermPresentInSubmittals() {
            if(vm.groupedByProjectSummaryGroup && Object.keys(vm.groupedByProjectSummaryGroup).length > 0) {
                 for (var key in vm.groupedByProjectSummaryGroup) {
                     if (vm.groupedByProjectSummaryGroup.hasOwnProperty(key)) {
                         for(var i=0; i<vm.groupedByProjectSummaryGroup[key].length; i++) {
                             if(filteredBoolean(vm.groupedByProjectSummaryGroup[key][i])) {
                                 return true;
                             }
                         }
                     }
                 }
                 return false;
            } else {
                return false;
            }
        }

        function getFilteredRecords() {
            // For Submittals
            var subRegisters = setFilteredSubmittalRecords();
            vm.filteredSubmittalRecords = subRegisters.filter(function(record) {
                return filteredBoolean(record);
            });
            // For Products
            vm.filteredProducts = vm.productdata.filter(function(record) {
                return filteredBoolean(record);
            });
        }

        function filteredBoolean(record) {
            return !vm.filterText || (vm.filterText &&
                (record.projectSummaryGroup && record.projectSummaryGroup.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 ) ||
                (record.paraCode && record.paraCode.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 ) ||
                (record.submittalsHeading && record.submittalsHeading.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 ) ||
                (record.specCategory && record.specCategory.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 ) ||
                (record.submittalDescription && record.submittalDescription.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 ) ||
                // For Products
                (record.productHeading && record.productHeading.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 ) ||
                (record.productCategory && record.productCategory.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 ) ||
                (record.productDescription && record.productDescription.toUpperCase().indexOf(vm.filterText.toUpperCase()) > -1 )
            );
        }
    /* ----------------- End of Code for Search ------------------- */

        /* Search*/
        $scope.addNewItem = function () {
            vm.MaxRecId++;
            AuthenticationService.SetPypeSearchRecId(vm.MaxRecId);
            vm.submittalregisters.splice(0, 0, { "recid": vm.MaxRecId, "divCode": vm.selectedItem.div.divCode, "divName": vm.selectedItem.div.divName, "specNumber": vm.selectedItem.spec.specCode, "specName": vm.selectedItem.spec.specName });
        };

        function loadSpecPDF(div, spec, divIndex, specIndex, callback, dontLoadPdf) {
            vm.pdfLoading = true;
          SmartRegisterService.getMultipleSpecDetails(vm.selectedProject.projectId, vm.selectedVersion.versionId, spec.specCode, function(response) {
            if(response.success) {
                vm.SubSpecSectionsList = response.data;
                vm.selectedSubPdf = vm.SubSpecSectionsList[0];
                if(vm.View === "SmartRegisterView" && vm.SpecView === "TextView"){
                    getTextViewContent(div.divCode, spec.specCode, false, vm.selectedSubPdf.sourceId);
                }
                else {
                    if(!dontLoadPdf) setTrustedUrl(spec);
                }
            } else {
                FlashService.Error('Could not load the Spec Section PDF');
                vm.pdfLoading = false;
            }
            if (callback) {
            	callback();
            }
          });

            vm.selectedItem = { div: div, spec: spec };
            if(vm.recSubsFetched) {
                doFullSpecViewSearch();
            }
            loadSubmittals(spec.specCode, spec.specName);
            vm.pager = {
                isFirst: divIndex == 0 && specIndex == 0,
                isLast: vm.data.length == divIndex + 1 && div.specSections.length == specIndex + 1,
                divIndex: divIndex,
                specIndex: specIndex
            }
            AuthenticationService.SetSpecViewData({ divCode: div.divCode, specCode: spec.specCode, specName: spec.specName });
            $scope.selectedRec = null;
            $scope.projectGroupFilterPopover.isOpen = false;
            $('.dropdown').removeClass('open');
            if(vm.productdata){
            	loadProducts(spec.specCode);
            }
            if(vm.recommendedSubmittals){
            	FilterRecommendedSubmittals(spec.specCode);
            }
        }

        function setTrustedUrl(spec) {
            sendPostMsgToIframe('showPdfLoader', '');
            if(vm.highlightAllSubmittals) {
                $scope.url = APIURL + 'projects/' + vm.selectedProject.projectId + '/version/' + vm.selectedVersion.versionId +
                             '/download/' + (vm.View == 'ProductDataView' ? 'product/' : '') + 'specsection/' + encodeURIComponent(spec.specCode) + "/multihighlight?sourceid="+vm.selectedSubPdf.sourceId;
            } else {
                $scope.url = APIURL + 'projects/' + vm.selectedProject.projectId + '/version/' + vm.selectedVersion.versionId +
                             '/download/specsection/' + encodeURIComponent(spec.specCode) + '?sourceid=' + vm.selectedSubPdf.sourceId;
            }
            DownloadService.prepareEncodedSpecUrlAndReturn($scope.url, null, function(encodedUrl) {
                $scope.trustedUrl = $sce.trustAsResourceUrl(encodedUrl);
                vm.pdfLoading = false;
            });
        }

        function loadSubSpecSectionPDF(div, spec, subSection) {
        	if (vm.selectedSubPdf.sourceId !== subSection.sourceId) {
        		$scope.selectedRec = null;
            	vm.selectedSubPdf = subSection;
                if(vm.View === "SmartRegisterView" && vm.SpecView === "TextView"){
              		  getTextViewContent(div.divCode, spec.specCode, false, vm.selectedSubPdf.sourceId);
              	}
                else {
                    setTrustedUrl(spec);
              	}
        	}
        }

        function getTextViewContent(divCode, specCode, fromTextViewSwitchBtn, sourceId, callback) {
            vm.pdfLoading = true;
        	vm.textViewLoading = 'Fetching textual content... please wait...';
        	var commonTopHeight = 54 + 62;
            SmartRegisterService.getTextViewContent(vm.selectedProject.projectId, vm.selectedVersion.versionId, divCode, specCode, sourceId, function (response) {
                if (response.success) {
                	//So sad to be in this kind of situation(regarding following line)
                	$('#buildsubmittals-view-container').css("height", (window.innerHeight - commonTopHeight - 74 - 23) + "px");

                    vm.textContent = response.data;
                    vm.textContentUnChanged = angular.copy(response.data);
                    $timeout(function(){
                    	getScrollBarPosition();
                    	scrollToCenterHorizontally('#' + htmlLoaderSelector);
                    	vm.textViewLoading = false;

                    	createSubmittalToolTip = $('.create-submittal-tooltip-container');
                    	if(fromTextViewSwitchBtn){
                    		checkAndOpenIntroPopup(function(){
                        		//Actions that we need to do post closing of popup here
                            });
                    	}
                    	if (callback) {
                        	callback();
                        }
                    });
                    LogEvent("Build Submittals", "User visited build submittal page.", "SUCCESS");
                } else {
                	//vm.SpecView = 'PDFView'; //Switch the view back to PDF view incase of there is some error in getting the html content
                    vm.textContent = "";
                    vm.textContentUnChanged = "";
                    vm.noHTMLContentMsg = response.message;
                    vm.textViewLoading = false;
                    LogEvent("SubmittalView", "User visited build submittal page.", "FAILED");
                }
                vm.pdfLoading = false;
            });
        }

        function scrollToCenterHorizontally(selector){
        	var $element = $(selector);
        	if($element && $element.length > 0){
        		$element = $element[0];
        		var scrollWidth = $element.scrollWidth;
            	var clientWidth = $element.clientWidth;
            	$(selector).scrollLeft((scrollWidth - clientWidth) / 2);
        	}

        }

        function resetHighlighterValues(){
        	targetDiv = $('.' + htmlRegionSelector);
        	$('#' + htmlLoaderSelector + ' .page').css('cursor','crosshair');
            $scope.currentHeadingObj = {};
            $scope.isAllowedToSelect = true;
            resetUserScrollPreferences('#' + htmlLoaderSelector);
            targetDiv.css('display', 'none');
            //createSubmittalToolTip.css('display', 'block');
        }

        var width,height;
        $scope.mouseUpEvent = function($event) {
        	if($scope.selectionStarted && ($event.currentTarget.id == 'dir')) {
        		targetDiv.css('height', $event.pageY - startEve.pageY);
        		targetDiv.css('width', '100%');
        		targetDiv.css('left', '0');
        		$('#' + htmlLoaderSelector + ' .page').css('cursor','default');
        		//createSubmittalToolTip.css('display','block');

        		$scope.isAllowedToSelect = false;
        		$scope.selectionStarted = false;

        		postRegionSelection(startEve, $event);
        		stopUserFromScrolling('#' + htmlLoaderSelector);
        	}
          else {
        		$scope.selectionStarted = false;
          }
        };

        $scope.mouseMoveEvent = function($event){
        		if($scope.selectionStarted){
            		width = $event.pageX - startEve.pageX;
            		height = $event.pageY - startEve.pageY;
            		targetDiv.css('width', width);
                targetDiv.css('height', height);
        		}
        		else {
        			if(scrollbarLeft > $event.clientX && scrollBarTop > $event.clientY){
        				createSubmittalToolTip.css('display','block');
            			createSubmittalToolTip.css('top', $event.pageY - 27);
            			createSubmittalToolTip.css('left', $event.pageX + 10);
        			} else {
        				createSubmittalToolTip.css('display','none');
        			}
        		}
        };

        var scrollbarLeft = 100000;
        var scrollBarTop = 100000;
        function getScrollBarPosition(){
        	try{
        		var elem = document.querySelector('#' + htmlLoaderSelector);
            	var elementPosition = elem.getBoundingClientRect(); //Get element position
            	scrollbarLeft = elem.clientWidth + elementPosition.left; //Calculate the position of scrollbar from left
            	scrollBarTop = elem.clientHeight + elementPosition.top; //Calculate the position of scrollbar from top
        	}
        	catch(ex){//Incase of failure allow the region to be selected
        		//
        	}
        }

        $scope.mouseDownEvent = function($event){
        	if(!$scope.selectionStarted && scrollbarLeft > $event.clientX && scrollBarTop > $event.clientY){
        		startEve = $event;
        		targetDiv = $('.' + htmlRegionSelector);
        		createSubmittalToolTip.css('display','none');
        		targetDiv.css('display', 'block');

            var coords = $('#' + htmlLoaderSelector)[0].getBoundingClientRect();
            targetDiv.css('left', startEve.pageX - coords.left);
          	targetDiv.css('top', startEve.pageY - coords.top);

        		targetDiv.css('z-index', '3');
        		targetDiv.css('width', '1px');
        		targetDiv.css('height', '1px');
        		$scope.selectionStarted = true;
          }
        }

        $scope.mouseLeftTextContainer = function($event){
        	createSubmittalToolTip.css('display','none');
        };

        function stopUserFromScrolling(selector){
        	preventScroll(selector);
        	//preventUpAndDownArrows(selector);
        }

        function resetUserScrollPreferences(selector){
        	allowScroll(selector);
        	//allowUpAndDownArrows(selector);
        }

        function preventUpAndDownArrows(selector){
        	$(selector).on('keydown', function(e){
        		if (e.keyCode == 38 || e.keyCode == 40) {
    		       return false;
    		    }
        	});
        }

        function allowUpAndDownArrows(selector){
        	$(selector).off('keydown');
        }

        function preventScroll(selector){
        	$(selector).on("mousewheel DOMMouseScroll", function(e){
        		e.preventDefault();
        	});
        }

        function allowScroll(selector){
        	$(selector).off("mousewheel DOMMouseScroll");
        }

        function getParentCoords(firstEleID){
        	var parent = document.querySelector("#" + firstEleID).parentNode;
        	if(parent === null) return null;

        	var coords = parent.getBoundingClientRect();
        	return coords;

        }

        function postRegionSelection(startEve, endEve) {
        	var coords, tempEleID, tempDiv, firstEle, row, firstEleID = "", myHighlightedRows = [], htmlRows, mySelectedHTML = "";

        	//Get all the pages from HTML content
        	var HTMLPages = extractListOfHTMLPages(vm.textContentUnChanged);

        	//Iterate through each page
      		for(var j = 0;j < HTMLPages.length;j++){
      			htmlRows = extractTextFromHTMLLatest(HTMLPages[j], "ListOfHTMLRows", true);
          		for(var i=0;i<htmlRows.length;i++) {
          			row = htmlRows[i];
          			if(row) {
          				//Get the ID of the first element in the row - This id we will use to get the coordinates of the row, as we care about only top and bottom
          				//we take first value from the list as all the words in the row will be at same height
          				firstEleID = row.firstElementChild.id;
          				if(firstEleID){
          					//Get the clientRect which will give use the dimensions related to the element that we select
          					//coords = document.querySelector("#" + firstEleID).getBoundingClientRect();
          					coords = getParentCoords(firstEleID);
          					if(coords === null) continue;
          					//If current element top is greater or equal to the selection region top line
          					//If current element top is lesser or equal to the selection region bottom line
          					//If both the above conditions satisfy then we can consider that current element is inside the selection region
          					//There is a diff of 8 units between clientY and Element BoundingClientRect, hence removing that value to make it equal
              				/*if((coords.top >= startEve.clientY - 8) && (coords.top <= endEve.clientY - 8)){
              					myHighlightedRows.push(row);
              				}*/
              				if((coords.top >= startEve.clientY - coords.height) && (coords.top <= endEve.clientY - coords.height)){
              					myHighlightedRows.push(row);
              				}
          				}
          			}
          		}
      		}

      		if(myHighlightedRows && myHighlightedRows.length > 0){

      			//Add all the selected rows in a string format inorder to match the input for our below methods
          		for(var k = 0; k< myHighlightedRows.length; k++){
          			mySelectedHTML += myHighlightedRows[k].outerHTML;
          		}

          		var selectedTextRows = extractTextFromHTMLLatest(mySelectedHTML, "ListOfRows");
          		if(selectedTextRows) {
          			//We need to remove the paraCode character from first line of the html description which is not required
          			var firstDescRow = RemoveParaCodeFromDesc(selectedTextRows[0]);
          			//Once we get the updated first line description we update the actual string array with updated value
              		selectedTextRows[0] = firstDescRow;
              		//Finally join all the elements of the array with new line which will become one string
              		$scope.selectedText = selectedTextRows.join('\n');

              		//Now autopopulate the values based on the description
              		autoPopulateSubmittalValues(vm.textContentUnChanged, mySelectedHTML);

              		$timeout(function() {
              			if(vm.user.isSuperAdmin && $rootScope.enablePypeSearch == "MAX")
              				$rootScope.enablePypeSearch = "MIN";
              			//This will finally open the popover after finding all the values that are possible
              			$('#create-submittal').click();
              		}, 0);
          		} else {
          			//FlashService.Error("Selected region is empty. Please select region which is having content.");
          			resetHighlighterValues();
          		}
      		} else {
      			//FlashService.Error("Selected region is empty. Please select region which is having content.");
      			resetHighlighterValues();
      		}

      	}

        function checkAndOpenIntroPopup(callback){
        	var dontShowIntroFlag = RememberService.GetCookie('dontShowTextViewIntro');
            if(dontShowIntroFlag){
            	dontShowIntroFlag = JSON.parse(dontShowIntroFlag);
            }
            if(!dontShowIntroFlag){
            	var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: MAINURL
    						+ 'views/smartview/specview/textview.intro.view.html',
                    controller: 'TextViewIntroPopupController',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                    }
                });

                modalInstance.result.then(function (data) {
                	if(data && data.dontShowFlag !== undefined){
                		RememberService.SetCookie('dontShowTextViewIntro', data.dontShowFlag);
                	}
                	callback();
                }, function () {
                	callback();
                });
            } else {
            	callback();
            }
        }

        function SwitchTextView() {
            if(targetDiv) {
                targetDiv.removeAttr("style")
            } else {
                targetDiv = null;
            }
            vm.SpecView = 'TextView';
            $scope.isAllowedToSelect = true;
            $scope.selectionStarted = false;
            getTextViewContent(vm.selectedItem.div.divCode, vm.selectedItem.spec.specCode, true, vm.selectedSubPdf.sourceId);
        }

        function SwitchPDFView() {
            vm.SpecView = 'PDFView';
            if(vm.highlightAllSubmittals) {
                var specViewData = AuthenticationService.GetSpecViewData();
            	setTrustedUrl(specViewData);
            } else {
                setTrustedUrl(vm.selectedItem.spec);
            }
        }

        function getSelectionHTML() {
			var range;
			if (document.selection && document.selection.createRange) {
				range = document.selection.createRange();
				return range.htmlText;
			} else if (window.getSelection) {
				var selection = window.getSelection();
				if (selection.rangeCount > 0) {
					range = selection.getRangeAt(0);
					var clonedSelection = range.cloneContents();
					var div = document.createElement('div');
					div.appendChild(clonedSelection);
					return div.innerHTML;
				}
			}
            return '';
		}

        $scope.postCreateSub = function(e){
        	e.stopPropagation();
        	$('#right-click-menu').css('display', 'none');
        }

        function getSelectedHTMLTop(html){
        	var temporalDivElement = document.createElement("div");
        	temporalDivElement.innerHTML = html;
        	var lstWordsHTML = temporalDivElement.getElementsByTagName('div'), top = -1;
        	if(lstWordsHTML && lstWordsHTML.length > 0){
        		top = lstWordsHTML[0].style.getPropertyValue("top");
        	}
        	return top;
        }

        function formatTextContent(text){
        	if(text) {
        		text = text.replace(/\s+/g, ' ');
        		if(text) {
        			text = text.trim();
        		}
        	}
        	return text;
        }

        function traverseAndFindRequiredContent(html, selectedHTML, selectedTextRows){

        	var selectedHTMLTop = getSelectedHTMLTop(selectedHTML);

        	var temporalDivElement = document.createElement("div");
    	    temporalDivElement.innerHTML = html;

    	    var lstLinesHTMLTags = temporalDivElement.getElementsByClassName(htmlRowSelector);
    	    var currTop = "", resObj = {}, subParaObj = {}, currLine = "", currentPart = "";

    	    for(var i=0;i<lstLinesHTMLTags.length;i++){
    	    	currTop = lstLinesHTMLTags[i].style.getPropertyValue("top");
    	    	currLine = (lstLinesHTMLTags[i].textContent || lstLinesHTMLTags[i].innerText);
    	    	if(currLine){
    	    		currLine = formatTextContent(currLine);

    	    		currentPart = getPartHeading(currLine);
    	    		if(currentPart && currentPart.isPart){
    	    			$scope.currentHeadingObj = {};
    	    		} else {
        	    		resObj = getParaCodeAndSubHeading(currLine);

        	    		if(!angular.equals(resObj, {})) {
            	    		$scope.currentHeadingObj = resObj;
          	    	} else {
          	    		subParaObj = getSubParaCode(currLine);
          	    		if(!angular.equals(subParaObj, {})){
          	    			$scope.currentHeadingObj["subParaCode"] = subParaObj;
          	    		}
          	    	}

    	    		}
    	    		if(checkIfSelectedTextIsCurrentRow(selectedTextRows[0], currLine, selectedHTMLTop, currTop)){
    	    			//vm.uniqueSpecCategory
    	    			if ($scope.currentHeadingObj.submittalType === defaultSubmittalType) {
    	    				$scope.currentHeadingObj.submittalType = deriveSubmittalTypeFromSelectedContent(selectedHTML);
    	    			}
    	    			break;
        	    	}
    	    	}
    	    }
        }

        function deriveSubmittalTypeFromSelectedContent(selectedHTML) {
        	var submittalType = defaultSubmittalType;
        	var content = extractTextFromHTMLLatest(selectedHTML, 'SingleString');
        	if (!content) {
        		return defaultSubmittalType;
        	}
        	content = content.replace(/[\r\n]/g, "");
    		if (!content) {
    			return defaultSubmittalType;
    		}
    		content = content.toLowerCase();
    		for (var j=0; j < vm.uniqueSpecCategory.length; j++) {
    			if (content.indexOf(vm.uniqueSpecCategory[j].toLowerCase()) != -1 && vm.uniqueSpecCategory[j].toLowerCase().indexOf(defaultSubmittalType.toLowerCase()) == -1) {
    				submittalType = vm.uniqueSpecCategory[j];
    				return submittalType;
    			}
    		}
        	return submittalType;
        }

        function dynamicallyHighlightSelectedText(record){

        	var HTMLPages = extractListOfHTMLPages(vm.textContentUnChanged), highlighterDivSelector = ".highlight-region", selectedEleFirstChild = "";
        	var updatedHTMLPage = "", currentPageStyle = "", numberOfRows = 0, currentPageId = "", updatedHTMLRows = "", headingPageIndex = -1, subHeadingRow = -1;
        	var updatingPageIndex = -1, skipSubHeadingCheck = false, currentRecordSubHeadingRow = -1, subDesResultIndexs = -1, HTMLRows = "", heightlightingDone = false;

        	//Clear all the highlighter div's height inorder to reset the already highlighted thing
        	$(highlighterDivSelector).css('height','0');

        	if(HTMLPages && HTMLPages.length > 0){
        		for(var i=0;i<HTMLPages.length;i++){

        			if(HTMLPages[i]){
        				currentPageStyle = HTMLPages[i].attributes.getNamedItem('style');
        				currentPageId = HTMLPages[i].getAttribute('id');
        			}

        			//1) Get the ListOfHTMLRows
                	HTMLRows = extractTextFromHTMLLatest(HTMLPages[i].outerHTML, "ListOfHTMLRows", true);

                	if(!skipSubHeadingCheck){
                    	//2) Iterate and find the selected ParaCode and Subheading
                    	currentRecordSubHeadingRow = getSelectedRecordSubHeadingHTMLRowIndex(HTMLRows, record);

                    	if(currentRecordSubHeadingRow === -1){
                    		continue;
                    	}

                    	subHeadingRow = currentRecordSubHeadingRow;
                    	headingPageIndex = i;
                	}

                	//3) Find the Submittal Description inside the Selected SubHeading
                	subDesResultIndexs = findAndMatchSubmittalDescription(record, currentRecordSubHeadingRow + 1, HTMLRows);

                	if(subDesResultIndexs != -1){
                		if(subDesResultIndexs.startIndex != -1){
                			heightlightingDone = addStylesForHighlighter(subDesResultIndexs, currentPageId, highlighterDivSelector);
                			selectedEleFirstChild = '#'+ HTMLRows[subDesResultIndexs.startIndex].firstElementChild.id;
                		} else {
                			//Match is in two different pages or next page
                			skipSubHeadingCheck = true;
                			currentRecordSubHeadingRow = 0;
                			continue;
                		}
                	} else {
                		continue;
                	}
                	if(heightlightingDone){
                		scrollToSpecificElement('#' + htmlLoaderSelector, selectedEleFirstChild, true);
                		break;
                	}
        		}

        		//Following code will highlight the first paraCode of the sub heading incase of no match found in description but subheading found
        		if(!heightlightingDone && headingPageIndex > -1 && subHeadingRow) {
        			var currentPage = HTMLPages[headingPageIndex];
                	var currentPageRows = extractTextFromHTMLLatest(currentPage.outerHTML, "ListOfHTMLRows", true);
                	var currentSubHeadingRow = currentPageRows[subHeadingRow];

        			if(currentSubHeadingRow && currentSubHeadingRow.firstElementChild){
        				var firstEleSelected = '#' + currentSubHeadingRow.firstElementChild.id;
        				if(firstEleSelected){
        					var tempTop = currentSubHeadingRow.firstElementChild.style.top;
        					if(tempTop){
        						tempTop = tempTop.slice(0, -2);
        						tempTop = parseInt(tempTop);
        						var tempBottom = tempTop + 16;
        						addStylesForHighlighter({top : tempTop, bottom : tempBottom}, currentPage.getAttribute('id'), highlighterDivSelector);
        					}
        					scrollToSpecificElement('#' + htmlLoaderSelector, firstEleSelected, true);
        				}
        			}
        		}
        	}

        }

        function addStylesForHighlighter(subDesResultIndexs, currentPageId, highlighterDivSelector){
        	var highlighterHeight = "", highlighterTop = "", highligherElement = "";

			if(subDesResultIndexs.top && subDesResultIndexs.bottom){

				highlighterHeight = subDesResultIndexs.bottom - subDesResultIndexs.top;
    			highlighterHeight += "pt";

    			highlighterTop = subDesResultIndexs.top + "pt";

    			highligherElement = $('#' + currentPageId + '>' + highlighterDivSelector);
    			highligherElement.css('top', highlighterTop);
    			highligherElement.css('height', highlighterHeight);

    			return true;
			}
			return false;
        }

        function removeUnnecessaryRowsAppendNewRow(HTMLRows, startIndex, endIndex, addingDiv){
        	HTMLRows.splice(startIndex, endIndex - startIndex + 1, addingDiv);
        	return HTMLRows;
        }

        function formatndSplitSubmittalDescription(description){
        	var descArray = description.split('\n'), updatedDescArray = [];
        	for(var i=0;i<descArray.length;i++){
        		if(descArray[i]){
        			updatedDescArray.push(descArray[i]);
        		}
        	}
        	return updatedDescArray;
        }

        function findAndMatchSubmittalDescription(record, startIndex, HTMLRows){
        	var subDescArrayRows = [];
        	if(startIndex > 0 && record.submittalDescription){
        		subDescArrayRows = formatndSplitSubmittalDescription(record.submittalDescription);
        		//subDescArrayRows = record.submittalDescription.split('\n');
        	} else {
        		//Nothing to highlight, just send back
        		return -1;
        	}

        	var rowIndex = startIndex, subDescIndex = 0, currentHTMLRow = "", c = 0, sIndex = -1, lIndex = -1, currentTextRow = "", reqNodeStyles = {}, bottom = 0, paraCodeSubHeadingObj = "";

        	while(true){
        		currentHTMLRow = HTMLRows[rowIndex];
        		//If we reached end of page without reaching return then break;
        		if(!currentHTMLRow){ break;}

        		//If we got the content what we are expecting then break we are done
        		if(c === subDescArrayRows.length) {
        			break;
        		}

        		currentTextRow = (currentHTMLRow.textContent || currentHTMLRow.innerText);
        		currentTextRow = formatTextContent(currentTextRow);

        		if(c === 0){
        			paraCodeSubHeadingObj = getParaCodeAndSubHeading(currentTextRow);
        			if(paraCodeSubHeadingObj && paraCodeSubHeadingObj.paraCode && paraCodeSubHeadingObj.subHeading){
        				return -1;
        			}
        			currentTextRow = RemoveParaCodeFromDesc(currentTextRow);
        		}

        		if(currentTextRow){
        			currentTextRow = currentTextRow.replace(/[^A-Za-z0-9]/g, '');
        		}
        		if(subDescArrayRows[c]){
        			subDescArrayRows[c] = subDescArrayRows[c].replace(/[^A-Za-z0-9]/g, '');
        		}

        		//If current row contains the text that we are looking for then go on
        		if(currentTextRow.indexOf(subDescArrayRows[c]) > -1){
        			if(c === 0){
        				reqNodeStyles = getFirstNodeHighlightStyles(currentHTMLRow);
        			}

        			c++;
        			if(sIndex === -1){
        				sIndex = rowIndex;
        				lIndex = rowIndex;
        				bottom = calculateBottom(currentHTMLRow.style.top, reqNodeStyles.height);
        			} else {
        				lIndex = rowIndex;
        				bottom = calculateBottom(currentHTMLRow.style.top, reqNodeStyles.height);
        			}
        		} else { //Not able to find the text we are looking for, just reset the count
        			c = 0;
        		}
        		rowIndex++;
        	}
        	return {startIndex : sIndex, endIndex : lIndex, top : reqNodeStyles.top, height : reqNodeStyles.height, bottom : bottom};

        }

        function calculateBottom(top, height){
        	var intTop = -1;
        	try{
            	var topWithoutUnits = top.slice(0,-2);
            	intTop = parseInt(topWithoutUnits);
        	} catch(ex){
        		console.log(ex);
        	}
        	return intTop + height;
        }

        function getFirstNodeHighlightStyles(HTMLRow){
        	var highlighterObj = {}, tempTop = -1;
        	if(HTMLRow && HTMLRow.style){
        		if(HTMLRow.style.top){
        			tempTop = HTMLRow.style.top.slice(0, -2);
        			tempTop = parseInt(tempTop);
        		}
        		highlighterObj['top'] = tempTop;
        	}
        	if(HTMLRow.firstElementChild && HTMLRow.firstElementChild.getAttribute('id')){
        		highlighterObj['height'] = $('#' + HTMLRow.firstElementChild.getAttribute('id')).height();
        	}
        	return highlighterObj;
        }

        function getFirstNodeStyles(HTMLRow){
        	var coords = {};
        	try{
        		var newDiv = document.createElement("div");
            	newDiv.innerHTML = HTMLRow;
            	var elements = newDiv.getElementsByClassName("p");
            	var firstElement = elements[0];
            	coords.top = firstElement.style.getPropertyValue('top');
            	coords.left = firstElement.style.getPropertyValue('left');
        	} catch(ex){
        		console.log(ex);
        	}
        	return coords;

        }

        function RemoveParaCodeFromDesc(text){
        	var result = text.match(subParaCodeRegex), finalResult = text;
        	if(result && result.length > 0){
        		finalResult = result[result.length - 1];
        	}
        	return finalResult;
        }

        function getSelectedRecordSubHeadingHTMLRowIndex(HTMLRows, record){
        	var paraCode = record.paraCode, paraCodeNumber = record.paraCode, subParaCode = "", currentParaSubHeading = {}, recordSubmittalsHeading = "";
        	var htmlRow = "", textRow = "";
        	if(paraCode.indexOf("-") > -1){
        		var paraCodeParts = paraCode.split("-");
        		paraCodeNumber = paraCodeParts[0];
        		subParaCode = paraCodeParts[1];
        	}
        	for(var i=1;i<HTMLRows.length;i++){
        		htmlRow = HTMLRows[i];
        		if(htmlRow){
        			textRow = (htmlRow.textContent || htmlRow.innerText);
        			textRow = formatTextContent(textRow);
        			currentParaSubHeading = getParaCodeAndSubHeading(textRow);
        			if(currentParaSubHeading && currentParaSubHeading.subHeading){
        				try{
                  if(currentParaSubHeading.subHeading && record.submittalsHeading) {
            				currentParaSubHeading.subHeading = currentParaSubHeading.subHeading.replace(/\s/g,'').toLowerCase();
            				recordSubmittalsHeading = record.submittalsHeading.replace(/\s/g,'').toLowerCase();
                  }
        				}catch(ex){//Incase of failure it is just because of the empty values
        					currentParaSubHeading.subHeading = currentParaSubHeading.subHeading.replace(/\s/g,'');
                  recordSubmittalsHeading = record.submittalsHeading.replace(/\s/g,'');
        				}
        			} else {
        				continue;
        			}
    	    		if(paraCodeNumber === currentParaSubHeading.paraCode
    	    				&& recordSubmittalsHeading === currentParaSubHeading.subHeading){
    	    			return i;
    	    		}

        		}
        	}
        	return -1;
        }

        function checkIfCurrTextIsResult(comparingTextArray, HTMLRows, index){
        	var currText = "";
        	for(var i=0;i<comparingTextArray.length;i++){
        		currText = getTextFromHTMLTag(HTMLRows[index + i]);
        		if(currText != comparingTextArray[i]){
        			return false;
        		}
        	}
        	return true;
        }

        function getTextFromHTMLTags(htmlTags){
    		var b = document.createElement('div');
    		b.innerHTML = htmlTags;

        	var tags = b.getElementsByTagName('div'), finalString = "", i = 0;

        	for(i=0;i<tags.length - 1;i++){
        		finalString += tags[i].innerText;
        		finalString += " ";
        	}
        	finalString += tags[i].innerText;
        	return finalString;
        }

        function getTextFromHTMLTag(htmlTag){
        	var endWord, text = "";
        	try{
        		endWord = htmlTag.split("\">");
    			text = endWord[1].split('</div>')[0];
        	}catch(ex){
        		console.log(ex); //Failed to do quick pattern will do it using DOM
        		var b = document.createElement('div');
        		b.innerHTML = htmlTag;
        		text = b.innerText;
        	}
        	return text;
        }


        function checkIfSelectedTextIsCurrentRow(selectedTextFirstRow, currLine, selectedHTMLTop, currTop){
        	var submittalType = "";
        	if(selectedTextFirstRow && currLine){
        		selectedTextFirstRow = selectedTextFirstRow.trim();
        		currLine = currLine.trim();
        		if(currLine.indexOf(selectedTextFirstRow) > -1){

        			//Get the submittal type from the selected content first row which should contain submittal type
        			submittalType = getSubmittalType(currLine);

            		if(submittalType){
            			$scope.currentHeadingObj["submittalType"] = submittalType;
            		}
        			return true;
        		}
        	}
        	return false;
        }

        function getSubmittalType(text){
        	var result = text.match(submittalTypeRegex), finalResult = defaultSubmittalType;
        	if(result && result.length > 0){
        		for(var i=1;i<result.length;i++) {
        			if(result[i] === ":"){
        				finalResult = result[i-1];
        				finalResult = verifySubmittalType(finalResult);
        				break;
        			}
        		}
        	}

        	return finalResult;
        }

        function verifySubmittalType(submittalType) {
        	if(submittalType){
        		for (var i = 0; i < invalidSubmittalTypeKeywords.length; i++) {
            		if (submittalType.toLowerCase().indexOf(invalidSubmittalTypeKeywords[i]) != -1) {
            			submittalType = defaultSubmittalType;
            			break;
            		}
            	}
        	}
        	return submittalType;
        }

        function getSubParaCode(text){
        	var result = text.match(subParaCodeRegex), finalResult = {};
        	if(result && result.length > 0){
        		finalResult = result[1];
        		if (finalResult.charAt(finalResult.length-1) == '.' || finalResult.charAt(finalResult.length-1) == '-') {
        			finalResult = finalResult.slice(0,-1);
        		}
        	}
        	return finalResult;
        }

        function getParaCodeAndSubHeading(text){
        	var finalResult = {};
        	if(text){
        		var result = text.match(paraSubHeadingRegex);
            	if(result && result.length > 0){
            		finalResult["paraCode"] = result[1];
            		finalResult["subHeading"] = result[result.length-1];
            	}
        	}
        	return finalResult;
        }

        function getPartHeading(text){
        	var finalResult = {};
        	if(text){
        		var result = text.match(partHeadingRegex);
            	if(result && result.length > 0){
            		finalResult.isPart = true;
            		finalResult.partNumber = result[1];
            		finalResult.partText = result[2];
            	}
        	}
        	return finalResult;
        }

        function autoPopulateSubmittalValues(totalHTML, selectedHTML){
        	var selectedText = extractTextFromHTMLLatest(selectedHTML, "ListOfRows");
        	traverseAndFindRequiredContent(totalHTML, selectedHTML, selectedText);
        }

        function extractListOfHTMLPages(html) {
        	if(html){
        		var temporalDivElement = document.createElement("div");
        	    temporalDivElement.innerHTML = html;

        	    var lstPagesHTML = temporalDivElement.getElementsByClassName('page');
        	    return lstPagesHTML;
        	}
        }

        function extractTextFromHTMLLatest(html, resultFormat, RemovePageTags){
        	var finalString = "";
        	if(html){
        		var temporalDivElement = "";
        		if(typeof html === "string"){
        			if(html.indexOf('</div>') === -1) {
        				return html;
        			} else {
        				temporalDivElement = document.createElement("div");
                	    temporalDivElement.innerHTML = html;
        			}
        		} else if(typeof html === "object"){
        			temporalDivElement = html;
        		} else {
            		//We should not come here
        		}

        	    var lstLinesHTML = temporalDivElement.getElementsByClassName(htmlRowSelector), currentLine = "";

        	    //If user selected only one row content
        	    if(lstLinesHTML && lstLinesHTML.length === 0){
        	    	// we have html string here in html and we need to get respective content
        	    	switch(resultFormat){
        	    		case "SingleString":{
        	    			currentLine = (temporalDivElement.textContent || temporalDivElement.innerText);
        	    			if(currentLine){
        	    				return formatTextContent(currentLine);
        	    			}
        	    			return "";
        	    		}
        	    		case "ListOfRows": {
        	    			var selectedRows = [];
        	    			currentLine = (temporalDivElement.textContent || temporalDivElement.innerText);
        	    			if(currentLine) {
        	    				currentLine = formatTextContent(currentLine);
            	    		selectedRows.push(currentLine);
        	    			}
        	    			return selectedRows;
        	    		}
        	    		case "ListOfHTMLRows": {
            	    		return html;
            	    }
        	    		case "ListOfHTMLDivs":{
        	    			lstLinesHTML = temporalDivElement.getElementsByClassName('p');
        	    			return lstLinesHTML;
        	    		}

        	    	}
        	    } else {
            	    switch(resultFormat){
            	    	case "SingleString":{
            	    		for(var i=0;i<lstLinesHTML.length;i++){
            	    			currentLine = lstLinesHTML[i].textContent;
            	    			if(currentLine){
            	    				finalString += formatTextContent(currentLine);
            	    			}
            	    			currentLine = "";
                    	    	finalString += "\n";
                    	    }
                    	    return finalString;
            	    	}
            	    	case "ListOfHTMLRows": {
            	    		return lstLinesHTML;
            	    	}
            	    	case "ListOfRows": {
            	    		var selectedRows = [];
            	    		for(var i=0;i<lstLinesHTML.length;i++){
            	    			currentLine = lstLinesHTML[i].textContent;
            	    			if(currentLine){
            	    				currentLine = formatTextContent(currentLine);
            	    				selectedRows.push(currentLine);
            	    			}
            	    			currentLine = "";
                    	}
                    	return selectedRows;
            	    	}
            	    	case "ListOfHTMLDivs": {
            	    		return temporalDivElement.getElementsByClassName('p');
            	    	}
            	    }
        	    }
        	}

    	    return finalString;
        }

        function startFocusOut(){
			$(document).on("click",function(){
				$("#right-click-menu").hide();
			});
		}

        function Previous() {
            if (vm.pager.specIndex == 0) {
                var preDivIndex = vm.pager.divIndex - 1;
                var preDiv = vm.data[preDivIndex];
                loadSpecPDF(preDiv, preDiv.specSections[preDiv.specSections.length - 1], preDivIndex, preDiv.specSections.length - 1);
            } else {
                loadSpecPDF(vm.selectedItem.div, vm.selectedItem.div.specSections[vm.pager.specIndex - 1], vm.pager.divIndex, vm.pager.specIndex - 1);
            }
        }

        function Next() {
            if (vm.pager.specIndex < vm.selectedItem.div.specSections.length - 1) {
                loadSpecPDF(vm.selectedItem.div, vm.selectedItem.div.specSections[vm.pager.specIndex + 1], vm.pager.divIndex, vm.pager.specIndex + 1);
            } else {
                var nextDivIndex = vm.pager.divIndex + 1;
                var nextDiv = vm.data[nextDivIndex];
                loadSpecPDF(nextDiv, nextDiv.specSections[0], nextDivIndex, 0);
            }
        }

        function CopyRecord(record) {
            vm.dataLoading = true;
            vm.MaxRecId++;
            AuthenticationService.SetPypeSearchRecId(vm.MaxRecId);
            var item = angular.copy(record);
            item.recid = vm.MaxRecId;
            item.serialNumber = vm.MaxRecId;
            item = settingDefaultsForIntegrations(item);
            var changes = [];
            delete item.isOpen
            delete item.selected
            changes.push({ action: "Copied", newRecord: item, sourceRecordSerialNumber: record.serialNumber});

            var copyRecordIndex = $.map(vm.submittalsList, function (obj, index) {
                if (obj.recid == record.recid) {
                    return index;
                }
            })[0];

            SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                    [item], [], [], [], null, changes, function (response) {
                        if (response.success === true) {
                            vm.submittalregisters = response.data.smartRegisterRecords;
                            doFullSpecViewSearch();
                            loadSubmittals(record.specNumber, record.specName);
							postSubmittalSaveActions();
                            FlashService.Success("Submittal copied successfully.");
                            //LOGGING EVENT
                            LogEvent("Copy SmartRegister Submittal", "Added SmartRegister Successfully", "SUCCESS");
                        } else {
                            FlashService.Error(response.message || "Copy Failed. Please contact support.");
                        }
                        vm.dataLoading = false;
                    });
        }

        function CopyProductDataRecord(record) {
            vm.MaxProductID++;
            var item = angular.copy(record);
            item.recid = vm.MaxProductID;
            item.serialNumber = vm.MaxProductID;

            var changes = [];
            delete item.isOpen;
            delete item.selected;
            changes.push({ action: "Added", newRecord: item });

            var copyRecordIndex = $.map(vm.productdata, function (obj, index) {
                if (obj.recid == record.recid) {
                    return index;
                }
            })[0];

            ProductDataService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "specView", [item], [], [], [], null, changes, function (response) {
                if (response.success === true) {
                    vm.productdata.splice(copyRecordIndex, 0, item);
                    doFullSpecViewSearch();
                    loadProducts(record.specNumber);
                    FlashService.Success("Copied Successfully ");

                    //LOGGING EVENT
                    LogEvent("Copy ProductData Submittal", "Added ProductData Successfully", "SUCCESS");
                }
            });
        }

        function DeleteRecord(record) {
            var message = "Are you sure you want to delete?";
            var title = "Confirm delete";
            ModalService.OpenConfirmModal(title, message, false, 'Delete', 'Cancel', true)
            .result.then(function () {
                var deletedRecordIndex = $.map(vm.submittalregisters, function (obj, index) {
                    if (obj.recid == record.recid) {
                        return index;
                    }
                })[0];
                var changes = [];
                delete vm.submittalregisters[deletedRecordIndex].isOpen;
                delete vm.submittalregisters[deletedRecordIndex].selected;
                changes.push({ action: "Deleted", oldRecord: vm.submittalregisters[deletedRecordIndex] })
                SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                        [], [], [], [vm.submittalregisters[deletedRecordIndex]], [], changes, function (response) {
                            if (response.success === true) {
                                var deleteRecord = angular.copy(vm.submittalregisters[deletedRecordIndex]);
                                vm.submittalregisters.splice(deletedRecordIndex, 1);
                                doFullSpecViewSearch();
                                loadSubmittals(record.specNumber, record.specName);
								postSubmittalSaveActions();
                                FlashService.Success("Deleted successfully.");

                                //LOGGING EVENT
                                LogEvent("Delete SmartRegister Submittal", "User deleted SmartRegister Submittal " + "Spec Section : '" + deleteRecord.specNumber
                                    + "' Spec Name : '" + deleteRecord.specName + "' Spec sub section : '" + deleteRecord.paraCode + "' Successfully", "SUCCESS");
                            } else {
                                FlashService.Error(response.message || "Delete Failed. Please contact support.");
                                //LOGGING EVENT
                                LogEvent("Delete SmartRegister Submittal", "User unable to delete SmartRegister Submittal " + "Spec Section : '" + vm.submittalregisters[deletedRecordIndex].specNumber
                                    + "' Spec Name : '" + vm.submittalregisters[deletedRecordIndex].specName + "' Spec sub section : '" + vm.submittalregisters[deletedRecordIndex].paraCode + "' " + response.message, "FAILED");
                            }
                });
            }, function() {});
        }

        $scope.excludeGroupsList = [];

        $scope.excludeGroups = function (key) {
            if ($scope.excludeGroupsList.indexOf(key) <= -1)
                $scope.excludeGroupsList.push(key);
            else {
                var index = $scope.excludeGroupsList.indexOf(key);
                if (index > -1) {
                    $scope.excludeGroupsList.splice(index, 1);
                }
            }

        }

        $scope.projectGroupFilterSelectAll = function () {
            $scope.excludeGroupsList = [];
        }

        $scope.projectGroupFilterUnSelectAll = function () {
            $scope.excludeGroupsList = angular.copy(vm.uniqueProjectSummaryGroup);
        }

        $scope.projectGroupFilterSave = function () {
            $scope.projectGroupFilterPopover.isOpen = false;
            AuthenticationService.SetExcludeGroupsList($scope.excludeGroupsList);
            FlashService.Success("Filter Saved Successfully");

            //LOGGING EVENT
            LogEvent("Save Filter", "Filter Saved Successfully", "SUCCESS");
        }
        $scope.projectGroupFilterReset = function () {
            if (AuthenticationService.GetExcludeGroupsList())
                $scope.excludeGroupsList = AuthenticationService.GetExcludeGroupsList();
        }

        function GetFile(fileType, isValidationRequired) {
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

        function LogEvent(type, description, status, moduleName) {
            var logEvent = {};
            logEvent.moduleName = moduleName?moduleName:"SpecView";
            logEvent.type = type;
            logEvent.description = description;
            logEvent.status = status;
            EventService.AddEvent(logEvent, vm.selectedProject.projectId, function (response) {

            });
        }

        function DownloadRequirementsMatrix() {
            if (vm.selectedProject.subscriptionStatus.toUpperCase() == 'PAID' || vm.user.isSuperAdmin) {
                vm.dataLoading = 'Exporting Requirements Matrix, please wait...';
                SmartRegisterService.DownLoadRequirementsMatrix(
                        vm.selectedProject.projectId, vm.selectedVersion.versionId, function (response) {
                            if (response.success) {
                                FlashService.Success(response.message);
                                vm.dataLoading = false;
                            } else {
                                FlashService.Error(response.message);
                                vm.dataLoading = false;
                            }
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

        function Share(project) {
            CheckIfSharingEnabled(project);
        }

        function CheckIfSharingEnabled(project) {
            $scope.dataLoading = true;
            ProjectService.CheckIfShareEnabled(project.projectId,
					function (response) {
					    if (response.success) {
					        vm.sharingEnabled = response.data;
					        ShareProject(project);
					        $scope.dataLoading = false;
					    } else {
					        FlashService.Error(response.message);
					        vm.sharingEnabled = response.data;
					        $scope.dataLoading = false;
					    }
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

        function returnUpdatedProject(projectId, callback) {
            SmartRegisterService.GetProjectById(projectId, function (response) {
                if (response.success) {
                    callback(response.data);
                } else {
                    FlashService.Error(response.message);
                }
            });
        }

        function showContactusToBuyFeature(project, items, feature) {
            ModalService.showContactusToBuyFeaturePopup(items)
            .result.then(function (data) {
                EnableVersioning(project.name, feature);
            });
        }

        function EnableVersioning(projectName, feature) {
            $scope.user = vm.user;
            var items = PopulatingUserDetails(projectName);
            if (feature == 'Version')
                items.RequestType = "Enable Versioning for " + projectName;
            else if (feature == 'Share')
                items.RequestType = "Enable Sharing for " + projectName;
            else if (feature == 'SpecView')
                items.RequestType = "Enable SpecView for " + projectName;
            items.feature = feature;
            ModalService.contactUsByFeaturePopup(items);
        }

        vm.availableExcelSystems = []; vm.availableCsvSystems = [];
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
                        bluebeam.value3 = "excel";
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
                        aconex.value3 = "excel";
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
                } else {
                	vm.availableExcelSystems[index].types.push({"domainid" : value.domainid, "value3" : value.value3, "value2" : value.value2});
                }
            });
        }

        vm.GetExportLogos = function(exportType) {
            return ExportService.GetExportLogos(exportType);
		}

        Object.size = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        function groupBy(arr, prop) {
            return arr.reduce(function (groups, item) {
                var val = item[prop]
                groups[val] = groups[val] || []
                groups[val].push(item)
                return groups
            }, {})
        }

        function ExpandAll() {
            vm.data.forEach(function (value, index) {
                value.isCollapsed = false;
            });
            $scope.isAllCollapsed = false;
        }

        function CollapseAll() {
            vm.data.forEach(function (value, index) {
                value.isCollapsed = true;
            });
            $scope.isAllCollapsed = true;
        }

        $scope.toggleSubmittalGroups = function() {
        	$scope.isCollapsedGroups = angular.copy(!$scope.isCollapsedGroups);
            $scope.collapsedGroups = {};
        	if(vm.groupedByProjectSummaryGroup && Object.keys(vm.groupedByProjectSummaryGroup).length > 0) {
        	  Object.keys(vm.groupedByProjectSummaryGroup).forEach(function(item) {
        		if($scope.isCollapsedGroups && $scope.isCollapsedGroups == true) {
        			$scope.collapsedGroups[item] = true;
        		} else {
        			$scope.collapsedGroups[item] = false;
        		}
        	   });
        	}
        }

        $scope.tooltipText = function (spec) {
            if (vm.View == 'SmartRegisterView') {
                if (spec.submittalNotPresent === false)
                    return spec.specCode + " - " + spec.specName;
                else
                    return "No Submittals found";
            } else if (vm.View == 'ProductDataView') {
                if (spec.productNotPresent === false)
                    return spec.specCode + " - " + spec.specName;
                else
                    return "No Product Data found";
            }
            else if(vm.View == 'RecommendedSubmittalsView'){
            	return spec.specCode + " - " + spec.specName;
            }
        }

        $scope.searchPdfIconClicked = function(record) {
        	var url;
        	var sourceId = DownloadService.getSourceId(record);
        	var recordType = record.submittalMetaData.recordType;
        	var addendumId = record.submittalMetaData.addendumId;

            sendPostMsgToIframe('showPdfLoader', '');
        	if(addendumId !== 0) {
        		sourceId = 'A' + addendumId;
        	}
        	if(vm.SpecView === "PDFView") {
			   if(record.submittalMetaData.recordType !== 'normal') {
				   var heading = record.submittalsHeading && record.submittalsHeading.length > 0 ? record.submittalsHeading : null;
				   var origSpecName = record.specName;
				   if(record.submittalMetaData.recordType === 'SpecSection') {
					   origSpecName = record.origSubmittalDescription.split("-")[1];
				   }

				   url =  APIURL + 'projects/' + vm.selectedProject.projectId + '/version/' + vm.selectedVersion.versionId +
					      '/download/recordtype/' + record.submittalMetaData.recordType + '/specsection/' + encodeURIComponent(record.specNumber) +
					      '/specname/' + encodeURIComponent(record.specName) + '/origSpecName/'+ encodeURIComponent(origSpecName) + '/sourceid/' + sourceId + '/submittalheading/' +
                          encodeURIComponent(heading) + '/pageno/' + record.pdfPageNumber + '/addendumname/' + record.addendumName;
			   }
			   else {
				   if(!record.submittalData) {
                       url = getSubmittalDataUrl(record, sourceId, record.submittalMetaData.isBase, false);
	        	   } else if (record.pdfPageNumber) {
	        		   url =  getSubmittalDataUrl(record, sourceId, record.submittalMetaData.isBase, true);
	               }
			   }

			   vm.searchRecordPageNumber = record.pdfPageNumber;
			   getSearchPDFBinaryData(url, function(response, status, headers) {
	               if(status == 200) {
	            	   var url = URL.createObjectURL(response);
		       		   var encodedPdfUrl = PDFJSURL +  encodeURIComponent(url);
		       		   var searchZoomString = GetSearchPageZoomString(record.pdfPageNumber, headers().highlight_coordinates, headers().page_dimensions);
		       		   var totalSearchPDFString = encodedPdfUrl + searchZoomString;
		       		   $scope.trustedUrl = $sce.trustAsResourceUrl(totalSearchPDFString);
	               }
	           });

            } else {
            	if (sourceId != vm.selectedSubPdf.sourceId) {
            		getTextViewContent(vm.selectedItem.div.divCode, vm.selectedItem.spec.specCode, false, sourceId, function() {
            			dynamicallyHighlightSelectedText(record);
            		});
            	} else {
            		dynamicallyHighlightSelectedText(record);
             }
           }
        }

        function getSearchPDFBinaryData(url, callback) {
        	$http.post(url,{
    			    responseType: 'blob'
    		})
            .then(function (response) {
                callback(response.data);
            })
            .catch(function (error) {
                callback(error.data);
            });
        }

        function getSubmittalDataUrl(record, sourceId, base, flag) {
            return APIURL + 'projects/' + vm.selectedProject.projectId
                          + '/version/' + vm.selectedVersion.versionId
                          + '/download/base/' + base
                          + '/submittalData/' + flag
                          + '/serialNumber/' + record.serialNumber
                          + '/sourceModule/' + record.sourceModule
                          + '/sourceid/' + sourceId
                          + '/addendumname/' + record.addendumName;
        }

        function GetSearchPageZoomString(pageNumber, highlightingCoordinates, pageDimensions) {
        	var x1 = 0, y1 = 0, rotation = 0, pdfHeight = 0, pdfWidth = 0, extraSpace = 50, zoomPercentDefault = 100, zoomLeft = 0, zoomTop = 0;
        	var coordinates =  JSON.parse(highlightingCoordinates);
        	var dimensions = JSON.parse(pageDimensions);
            x1 = coordinates[0];
        	y1 = coordinates[1];
            zoomLeft = x1;
            zoomTop = dimensions[1]-y1;
            //Reducing the top left values to make sure the content is not cut off and shown with some space
            zoomLeft = (zoomLeft < 0) ? 0 :  Math.ceil(zoomLeft);
            zoomTop = (zoomTop < 0) ? 0 :  Math.ceil(zoomTop);
            var zoomPercent = zoomPercent ? zoomPercent : zoomPercentDefault;
            var zoomString = '&zoom=' + zoomPercentDefault + ',' + 0 + ',' + zoomTop;
            var pageZoomString = '#page='+ (pageNumber) + zoomString;
            return pageZoomString;
        }

        function sendPostMsgToIframe(key, value){
            var iframe = document.getElementsByClassName('pdfview-container');
            if (iframe && iframe.length > 0){
                iframe[0].contentWindow.postMessage({message : key, data : value}, window.location.origin);
            }
        }

        $scope.pdfIconClicked = function (record) {
        	record.showmore = true;
            sendPostMsgToIframe('showPdfLoader', '');
            $scope.selectedRec = record.recid;
            var sourceId = DownloadService.getSourceId(record);
            if(vm.SpecView === "PDFView") {
                DownloadService.getSpecPdfUrl(record, vm.selectedProject.projectId, vm.selectedVersion.versionId, vm.highlightAllSubmittals, function(url) {
                    $scope.trustedUrl = $sce.trustAsResourceUrl(url);
                    vm.pdfLoading = false;
                });
            } else {
            	if (sourceId != vm.selectedSubPdf.sourceId) {
            		getTextViewContent(vm.selectedItem.div.divCode, vm.selectedItem.spec.specCode, false, sourceId, function() {
            			dynamicallyHighlightSelectedText(record);
            		});
            	} else {
            		dynamicallyHighlightSelectedText(record);
                    vm.pdfLoading = false;
            	}
            }

			if (vm.SubSpecSectionsList && vm.SubSpecSectionsList.length > 1) {
				for (var i = 0; i < vm.SubSpecSectionsList.length; i++) {
					if (vm.SubSpecSectionsList[i].sourceId === sourceId) {
						vm.selectedSubPdf = vm.SubSpecSectionsList[i];
					}
				}
			}
        }

        function Upgrade(projectName) {
            var upgradeItems = PopulatingUserDetails(projectName);
            ModalService.showContactUsPopup(upgradeItems);
        }

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

        function StartNewProject() {
            $location.path('/project');
        }

        function getSelectedProject() {
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
                    if (version) {
                        if(vm.selectedProject.versions && vm.selectedProject.versions.length>0) {
                            vm.selectedVersion = vm.selectedProject.versions.filter(function (data) {
                                if (data.versionId === version.versionId)
                                    return data;
                            })[0];
                            AuthenticationService.SetVersion(vm.selectedVersion);
                        }
                    }
                    else {
                        vm.selectedVersion = vm.selectedProject.versions[0];
                    }
                    LogEvent("Page visit", "User visited SPECVIEW page", "SUCCESS");
                    proceedWithLoad();
                });
            }
        }

        function proceedWithLoad() {
            // setting smart register view in the session if product flag is not enable and trial project, so that disable product view
            if (!vm.user.isSuperAdmin && (vm.selectedProject.subscriptionStatus.toUpperCase() == 'TRIAL' || vm.selectedProject.productDataFlag == 0)) {
                vm.View = "SmartRegisterView";
            }
        /* ---- COMMENTED AS ITS SPECVIEW FLAG ENABLE CHECK NOT REQUIRED IN ACC ---- */
            //GetSpecViewFlagEnabled(function() {
                //if(vm.isSpecViewEnabled) {
                    GetAvailableSystems();
                    if(vm.selectedVersion && vm.selectedVersion.versionId) {
                        validateAndLoad();
                    } else {
                        vm.dataLoading = false;
                    }
                //}
            //});
        }

        function LoadSpecView() {
            vm.dataLoading = 'Loading Specview..Please wait...';
            vm.pdfLoading = true;
            var projects = AuthenticationService.GetUserProjects();
            if(projects && projects.length>0) {
                  vm.NoProjects = false;
                  getSelectedProject();
            }
            else {
              vm.NoProjects = true;
              vm.dataLoading = false;
            }
        }

        function checkForPlanExistence(callback) {
           ProjectService.checkForPlanExistence(vm.selectedProject.projectId, vm.selectedVersion.versionId, function(response) {
               if(response.success) {
				   vm.plan = response.data;
                   if(vm.plan && vm.plan.status.toLowerCase() === 'completed'){
                       getSpecSchedulesForSpecSections();
                   } else {
                	   // if plans exists but the run is not completed yet, then hide the schedules link.
                	   vm.hideSchedulesMapFlag = true;
                   }
               }else{
            	   // if plans are not existing for current version then hide the schedules.
            	   vm.hideSchedulesMapFlag = true;
               }
			   callback();
           });
        }

		function getSpecSchedulesForSpecSections() {
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
                vm.hideSchedulesMapFlag = !vm.specSectionToSchedulesMap || (vm.specSectionToSchedulesMap && angular.equals({}, vm.specSectionToSchedulesMap));
			});
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
            .result.then(function(data) {
                vm.modalTitle = 'Upgrade Project';
                Upgrade(project.name);
            });
        }

        function validateAndLoad() {
            vm.MaxRecId = 0;
            if (vm.selectedProject.isExpired && !vm.user.isSuperAdmin) {
                vm.Selectedexpired = true;
                if (vm.selectedProject.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    showUpgradePopup(vm.selectedProject);
                } else if (vm.selectedProject.subscriptionStatus.toUpperCase() !== 'TRIAL') {
                    showRenewPopup(vm.selectedProject);
                }
                vm.dataLoading = false;

            } else {
				if(vm.selectedVersion.status.toLowerCase() === 'failed' || vm.selectedVersion.status.toLowerCase() === 'in progress') {
					vm.dataLoading = false;
					return;
				}
                if(vm.selectedProject.pypeAIFlag) {
                    getPypeAISubsFileExistsFlag(function() {
                        LoadSpecViewData(vm.selectedProject.projectId, vm.selectedVersion.versionId);
                    });
                } else {
                    LoadSpecViewData(vm.selectedProject.projectId, vm.selectedVersion.versionId);
                }
            }
        }

        function getPypeAISubsFileExistsFlag(callback){
        	RecommendedSubmittalsService.GetAISubFileExistsFlag(vm.selectedProject.projectId, vm.selectedVersion.versionId, function(response) {
        		if (response && response.success) {
        			vm.ShowPypeAICheckbox = true;
        		} else {
        			//FlashService.Error('Problem while getting Pype AI Submittals File Flag');
        			vm.ShowPypeAICheckbox = false;
        		}
        		if (callback) callback();
        	});
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

        function GetSpecViewFlagEnabled(callback) {
            var selectedProject = AuthenticationService.GetProject();
            ProductDataService.CheckSpecViewFlag(selectedProject.projectId, function (response) {
                if (response.success) {
                    vm.isSpecViewEnabled = response.data;
                } else {
                    FlashService.Error(response.message);
                }
                if(callback) callback();
            });
        }

        $scope.parseParaCodeSecondPart = function(paraCode) {
            if(paraCode){
            	if (paraCode.indexOf("-") > -1)
                    return (paraCode.substring(paraCode.indexOf("-") + 1) + ".")
                else if (paraCode.indexOf(" ") > -1)
                    return (paraCode.substring(paraCode.indexOf(" ") + 1) + ".")
                else if (paraCode.match(/[a-zA-Z]+/g))
                    return paraCode.match(/[a-zA-Z]+/g).join(".");
                else
                    return "";
            }else{
            	return "";
            }
        }

        function download(isProductData) {
            var removeNullFields = []; //fields to replace null value with empty string
            var data = [], columnsList = "";
            var fileName = vm.selectedProject.name.replace(/['"]+/g, '') + "_" + vm.selectedVersion.name.replace(/['"]+/g, '') + "_";
            fileName = fileName.replace(/\s/g, '');
            if (isProductData) {
                data = angular.copy(vm.productdata);
                fileName = fileName + "ProductsInformation";
                columnsList = "divisionCode AS [Division],specNumber AS [Spec Section],paraCode AS [Spec Sub Section],specName AS [Spec Name],productHeading AS [Product Specified],productDescription AS [Product Description],smartRegisterFlag AS [Submittal Created?]";
                FlashService.Success('Product Data exported successfully.');
            } else {
            	removeNullFields = ['targetDate', 'userNotes', 'pdfPageNumber','dateIssued','paraCode'];
                data = angular.copy(vm.submittalregisters);
                fileName = fileName + "SubmittalsRegister";
                columnsList = "[source] AS [Version],serialNumber AS [S. No.],divisionCode AS [Division],specNumber AS [Spec Section],specName AS [Spec Name],paraCode AS [Spec Sub Section],submittalsHeading AS [Sub Section Heading],specCategory AS [Submittal Type],submittalDescription AS [Submittal Description],targetDate AS [Target Date],userNotes AS [User Notes],subContractor AS [Subcontractor],specCategoryGroup AS [Spec Category Group],projectSummaryGroup AS [Submittals Group],dateIssued AS [Date Issued]";
                FlashService.Success('Submittals exported successfully.');
            }
            var updatedRecords = UtilService.sanitizeFields(angular.copy(data),removeNullFields,[],true);
            alasql('SELECT ' + columnsList + ' INTO XLSX("' + fileName + '.xlsx",{headers:true}) FROM ?', [updatedRecords]);
        }

        function openConfirmExportPopup(downloadType, types, domainId) {
            vm.downloadType = downloadType;
            if (downloadType.toUpperCase() === 'PROCORE') {
                CheckIfProcoreExportEnabled(downloadType, types);
            } else if(downloadType.toUpperCase() === 'PROJECTSIGHT') {
            	checkIfProjectSightExportEnabled(downloadType, types);
            } else if(downloadType.toUpperCase() === 'ACONEX') {
            	CheckIfAconexExportEnabled(downloadType, types);
            } else if( (downloadType.toUpperCase() === 'BIM 360' || downloadType.toUpperCase() === 'BIM360')
				|| (downloadType.toUpperCase() === 'BUILD' || downloadType.toUpperCase() === 'ACC BUILD')) {
					if(downloadType.toUpperCase() === 'BIM360') { downloadType = 'BIM 360'; }
					if(downloadType.toUpperCase() === 'BUILD') { downloadType = 'ACC Build'; }
                	ExportService.openExportToBIM360Options(downloadType, types, 'smartRegister');
            } else if (downloadType.toUpperCase() == 'BLUEBEAM STUDIO') {
                vm.domainId = types[0].domainid;
                ConnectToBlueBeam();
            } else {
               openExportOptionPopup(downloadType, types);
            }
        }

        $rootScope.$on('openExportOptionPopup', function(event, data) {
			openExportOptionPopup(data.downloadType, data.types);
		});

        function openExportOptionPopup(downloadType, types) {
        	var excelDomainID = UtilService.getDomainIDByTypeName(types, vm.excelString);
        	var csvDomainID = UtilService.getDomainIDByTypeName(types, vm.csvString);
        	if(csvDomainID === -1){
        		vm.domainId = excelDomainID;
        		connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
        	} else if(excelDomainID === -1){
        		vm.domainId = csvDomainID;
        		connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
        	} else {
        		var modalInstance2 = $uibModal.open({
                    animation: true,
                    templateUrl: MAINURL
                             + 'views/smartregister/submittals/ExportAsCMIC.view.html?version=9.2',
                    controller: 'ExportAsCMICController',
                    backdrop: 'static',
                    resolve: {
                        items: {
                            downloadType: downloadType
                        }
                    }
                });
                modalInstance2.result.then(function (data) {
                    if (data.global.exportType.toUpperCase() === "EXPORTASEXCEL") {
                    	vm.domainId = excelDomainID;
                    } else {
                    	vm.domainId = csvDomainID;
                    }
                    connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
                }, function () {
                });
        	}
        }

        function connectNewPageToexportFormatSpecificFile(domiainType, domainId) {
            var exportOption = {};
            exportOption.domainId = domainId;
            exportOption.domainName = domiainType;
            AuthenticationService.SetExportOptionInfo(exportOption);
            $location.path('/export/').search({sourcePage: 'specview'});
        }

        function connectToProcoreExcelExport(domiainType, domainId) {
			var exportOption = { 'domainId': domainId, 'domainName': domiainType };
			AuthenticationService.SetExportOptionInfo(exportOption);
			var dontShowProcoreMappingPageFlag = AuthenticationService.GetDontShowProcoreMappingPage();
			if(!dontShowProcoreMappingPageFlag) {
				$location.path('/procoremapping/').search({ sourcePage: 'specview', 'fromExcelExport': true, 'file': true });
			}
			else {
				$location.path('/excelexport/').search({sourcePage: 'specview'});
			}
		}

        function ConnectToBlueBeam() {
            prepareIntegrationUserDetails();
            BlueBeamIntegrationService.GetBlueBeamCall(vm.user.userId, vm.userDetailsInString, function (response) {
                if (response.success) {
                    AuthenticationService.SetIntegrationType(EXPORT_INTEGRATION);
                    var pWindow = ExportService.openNewWindow(response.data.api, 670, 540);
                    if (pWindow !== null) {
                        pWindow.focus();
                    }
                    else {
                        var items = {};
                        items.message = "Pop-ups should be enabled in your browser for AutoSpecs to continue with BlueBeam Integration"
                        ModalService.showPopupBlockerMessage(items);
                    }
                    vm.dataLoading = false;

                } else {
                    FlashService.Error(response.message);
                    vm.dataLoading = false;
                }
            });
        }

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

        function openExportAsCMICPopup(downloadType, domainId) {
            var modalInstance2 = $uibModal.open({
                animation: true,
                templateUrl: MAINURL
                         + 'views/smartregister/submittals/ExportAsCMIC.view.html',
                controller: 'ExportAsCMICController',
                backdrop: 'static',
                resolve: {
                    items: {
                        downloadType: downloadType,
                        domainId: domainId
                    }

                }
            });
            modalInstance2.result.then(function (data) {
                if (data.global.exportType.toUpperCase() === "EXPORTASEXCEL") {
                    connectNewPageToexportFormatSpecificFile(downloadType, domainId);
                } else {
                	for (var i = 0; i < vm.availableCsvSystems.length; i++) {
                		if (vm.availableCsvSystems[i].value1.toUpperCase() === data.global.downloadType.toUpperCase()) {
                			vm.domainId = vm.availableCsvSystems[i].domainid;
                			break;
                		}
                	}
                    //vm.domainId = 87;
                    openConfirmationForExport(data.global.downloadType);
                }
            }, function () {
            });

        }

        function openConfirmationForExport(downloadType) {
            var message = "Did you verify your log(Smart Register) before downloading(" + downloadType + ")?";
            var title = "Download " + downloadType;
            showConfirmExportPopup(message, title);
        }

        function showConfirmExportPopup(message, title) {
            var modalInstance = $uibModal
					.open({
					    animation: true,
					    templateUrl: MAINURL
								+ 'views/support/support.enterpriseconfirmation.view.html?version=9.0',
					    controller: 'ConfirmUpgradeToEnterprise',
					    backdrop: 'static',
					    resolve: {
					        items: {
					            message: message,
					            title: title
					        }
					    }
					});

            modalInstance.result.then(function (data) {
                GetFormatSpecificFile(vm.domainId, vm.gridName);
            });
        }


        function CheckIfProcoreExportEnabled(downloadType, types) {
            $scope.dataLoading = true;
            ProjectService.CheckIfProcoreExportEnabled(vm.selectedProject.projectId,
					function (response) {
					    if (response.success) {

					        if (response.data) {
					            openProcorePopup(downloadType, types);
					        } else {
                      openProcorePopup(downloadType, types, true);
					        }
					        $scope.dataLoading = false;
					    } else {
                  openProcorePopup(downloadType, types, true);
					        vm.procoreExportEnabled = response.data;
					        $scope.dataLoading = false;
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
                	ExportService.processIntegration(requiredData,externalWindowData, 'specview', function(response){
                        vm.dataLoading = false;
                        if(!response.success){
                            FlashService.Error(response.message);
                        }
        			});
    			}
    		}

        function ConnectToProcore(data) {
            setUserAndFilterDetails();
            ProcoreIntegrationService.GetProcoreCall(vm.user.userId, function (response) {
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
  			  var dontShowProjectSightMappingPageFlag = AuthenticationService.GetDontShowProjectSightMappingPage();
  			  if(!dontShowProjectSightMappingPageFlag) {
  				  $location.path('/projectsightmapping/').search({ sourcePage: 'specview', 'fromExcelExport': true, 'file': true });
  			  }
  			  else {
  			  	  $location.path('/excelexport/').search({sourcePage: 'specview'});
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


        $rootScope.$on('dataLoading', function(event, message) {
			vm.dataLoading = message;
		});

        $rootScope.$on('setUserAndFilterDetails', function() {
			setUserAndFilterDetails();
		});

        function setUserAndFilterDetails() {
            var filteredItems = {
                divisionCodeSelectedItems: [],
				specSectionSelectedItems: [],
				projectSummaryGroupSelectedItems: [],
				specCategorySelectedItems: [],
				specCategoryGroupSelectedItems: [],
				subContractorSelectedItems: []
            };
            var filters = AuthenticationService.GetSmartRegisterFilter();
            filters.forEach(function(item) {
                if(['specCategory', 'specCategoryGroup', 'subContractor'].indexOf(item.field) > -1) {
                    filteredItems[item.field+'SelectedItems'] = UtilService.convertAllValuesToLowerUpperCase(item.value);
                } else {
                    filteredItems[item.field+'SelectedItems'] = item.value;
                }
            });
            filteredItems.projectSummaryGroupSelectedItems = UtilService.convertAllValuesToLowerUpperCase(vm.projectSummaryGroupSelectedItems, 'upper');

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

        function CheckIfAconexExportEnabled(downloadType, types) {
            $scope.dataLoading = true;
            ProjectService.CheckIfAconexExportEnabled(vm.selectedProject.projectId, function (response) {
			    if (response.success) {
			        if (response.data) {
			            NavigateToAconex(downloadType, types);
			        } else {
                        vm.domainId = UtilService.getDomainIDByTypeName(types, vm.excelString);
			            connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
			        }
			        $scope.dataLoading = false;
			    } else {
                    vm.domainId = UtilService.getDomainIDByTypeName(types, vm.excelString);
			        connectNewPageToexportFormatSpecificFile(downloadType, vm.domainId);
			        vm.aconexExportEnabled = response.data;
			        $scope.dataLoading = false;
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
                templateUrl: MAINURL + 'views/smartregister/submittals/ExportToAconex.view.html?version=beta_9.0',
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
            vm.pypeProjectID = vm.selectedProject.projectId;
            vm.pypeCompanyID = vm.user.company.companyId;
            vm.pypeProjectVersionID = vm.selectedVersion.versionId;
            vm.userDetailsObject = {
                pypeUserId: vm.user.userId,
                pypeProjectId: vm.pypeProjectID,
                pypeVersionId: vm.pypeProjectVersionID,
                pypeCompanyId: vm.pypeCompanyID
            }

            $window.localStorage.setItem("userDetailsObject", JSON.stringify(vm.userDetailsObject));

            vm.userDetailsInString = JSON.stringify(vm.userDetailsObject);
            vm.userDetailsInString = encodeURIComponent(vm.userDetailsInString)
            AconexIntegrationService.GetAconexCall(function (response) {
					    if (response.success) {
                  AuthenticationService.SetIntegrationType(EXPORT_INTEGRATION);
					        var pWindow = ExportService.openNewWindow(response.data, 670, 540);
					        if (!pWindow || pWindow.closed || typeof pWindow.closed == 'undefined') {
					            var items = {};
					            items.message = "Pop-ups should be enabled in your browser for AutoSpecs to continue with Aconex Integration";
					            ModalService.showPopupBlockerMessage(items);
					        }
					        else {
					            pWindow.focus();
					            response.message = "Successfully connected to Aconex";
					            FlashService.Success(response.message);
					        }
					        vm.dataLoading = false;
					    } else {
							FlashService.Error(response.message || "Failed to connect to Aconex");
					        vm.dataLoading = false;
					    }
					});
        }

        function GetFormatSpecificFile(domainId, gridName) {
            vm.dataLoading = 'Exporting... Please wait';
            var selectedRecords = $scope.getSelectedRecordsForExport;
            var records = alasql('SELECT projectName,companyName,divisionCode,divisionName,origPDFStartPageNumber,origSpecCategory,origSubmittalDescription,paraCode,pdfEndPageNumber,pdfLineNumber,pdfPageNumber,pdfURL,projectName,projectNumber,projectSummaryGroup,recid,serialNumber,specCategory,specCategoryGroup,specName,specNumber,subContractor,submittalDescription,submittalsHeading,submtitalTargetGroup,targetDate,targetGroup,userNotes,dateIssued FROM ?', [selectedRecords]);
            SmartRegisterService.DownLoadFormatSpecificFile(vm.selectedProject.projectId, vm.selectedVersion.versionId, domainId, records, function (response) {
                if (response.success) {
                    FlashService.Success(response.message);
                    vm.dataLoading = false;
                } else {
                    FlashService.Error(response.message);
                    vm.dataLoading = false;
                }
            });
        }

        function LoadSpecViewData(projectId, versionId) {
            SmartRegisterService.GetSpecViewLeftNavData(projectId, versionId, function (response) {
                vm.data = response.data;
                SmartRegisterService.GetByProjectId(vm.selectedProject.projectId, vm.selectedVersion.versionId, function (response) {
                    if (response.success) {
                        if (response.data) {
                            vm.submittalregisters = response.data.smartRegisterRecords;
                            var plansSpecSections = new Set();
                            var specsSpecSections = new Set();

                            vm.scheduleSpecSections = new Set();

                            vm.submittalregisters.forEach(function(record){
                            	if(record['sourceModule'] && (record['sourceModule'] === 'plans' || record['sourceModule'] === 'procurementlog' )){
                            		plansSpecSections.add(UtilService.removeSpaces(record['specNumber']));
                            	}
                            	else{
                            		specsSpecSections.add(UtilService.removeSpaces(record['specNumber']));
                            	}
                            	// if for some reason submittal types data is not present then display schedules for all spec sections
                                if(!vm.scheduleSubmittalTypes || (vm.scheduleSubmittalTypes && vm.scheduleSubmittalTypes.indexOf(record.specCategory) !== -1))
                                	vm.scheduleSpecSections.add(record.specNumber);
                            });

                            vm.filteredSubmittalRecords = angular.copy(vm.submittalregisters);
                            var plansOnlyDivisions = [];
                            vm.data.forEach(function(division,i){
                            	var plansOnlySpecSections = [];
                            	division.specSections.forEach(function(specSection,j){
                            		if(plansSpecSections.has(UtilService.removeSpaces(specSection.specCode)))
                            			specSection.planSubmittalPresent = true;
                            		else
                            			specSection.planSubmittalPresent = false;
                            		if(!specsSpecSections.has(UtilService.removeSpaces(specSection.specCode)))
                            			specSection.submittalNotPresent = true;
                            		else
                            			specSection.submittalNotPresent = false;

                            		if(vm.scheduleSpecSections.has(specSection.specCode))
                            			specSection.showSchedules = true;
                            		else
                            			specSection.showSchedules = false;
                            		if(specSection.submittalNotPresent && specSection.planSubmittalPresent)
                            			plansOnlySpecSections.push(UtilService.removeSpaces(specSection.specCode));
                            	});
                            	division.specSections = division.specSections.filter(function(elem){
                            		return plansOnlySpecSections.indexOf(UtilService.removeSpaces(elem.specCode)) === -1;
                            	});

                            	if(division.specSections.length === 0)
                            		plansOnlyDivisions.push(division.divCode);

                            });
                            vm.data = vm.data.filter(function(elem){
                            	return plansOnlyDivisions.indexOf(elem.divCode) === -1;
                            });
                            vm.originalData = angular.copy(vm.data);
                            var filterData = AuthenticationService.GetSmartRegisterFilter();
                        	$scope.filtersDirty = AuthenticationService.GetShowSaveSmartRegisterFilter();

                            getFilterRelatedValues(filterData);

                            // Loading spec section
                            if($rootScope.enablePypeSearch == 'MAX' || $rootScope.enablePypeSearch == 'MIN') {
                                runFilterRelatedFunctions(vm.submittalregisters);
                            	callSearchSpecPDF();
                            } else {
                                if(vm.ShowPypeAICheckbox) {
                                	LoadRecommendedSubmittals(projectId, versionId, function() {
                                        runFilterRelatedFunctions(vm.allSubmittalsList);
                                        callLoadSpecPDF();
                                    });
                                } else {
                                    runFilterRelatedFunctions(vm.submittalregisters);
                                    callLoadSpecPDF();
                                }
                            }

                            vm.MaxRecId = getMaxRecId(vm.submittalregisters);
                            AuthenticationService.SetPypeSearchRecId(vm.MaxRecId);
                        }
                    }
                    vm.dataLoading = false;
                });
                LoadProductData(projectId, versionId);
                //if(vm.user && vm.user.isSuperAdmin){
            });
        }

        function runFilterRelatedFunctions(submittalsList) {
            if(submittalsList && submittalsList.length > 0){
                vm.uniqueSpecCategory = getDistinctValuesByProperty(submittalsList, "specCategory").sort();
                vm.uniqueSubmittalGroup = getDistinctValuesByProperty(submittalsList, "submittalsHeading").sort();
                var uniqueProjectSummaryGroup = getDistinctValuesByProperty(submittalsList, "projectSummaryGroup", false, true);
                vm.uniqueProjectSummaryGroup = uniqueProjectSummaryGroup.sort();

                var projectSummaryGroups = [];
                vm.projectSummaryGroupSelectedItems = uniqueProjectSummaryGroup;
                vm.projectSummaryGroupSelectedItemsAll = uniqueProjectSummaryGroup;
                vm.numberOfSummaryGroups = angular.copy(uniqueProjectSummaryGroup.length);
                angular.forEach(uniqueProjectSummaryGroup, function (item, index) {
                    projectSummaryGroups.push({ id: index, value: item, selected : true });
                });
                vm.allProjectSummaryGroups = projectSummaryGroups;

                getSelectedValuesBasedOnFilter();
                //setVisibleColumns();
                updateColumnSelectedValuesFlags();
                //updateFilteredItemsList();
            } else {
                initializeAllFilterRelatedValues();
            }
            setAllFilterRelatedTempValues();
        }

        function callSearchSpecPDF() {
        	vm.pypeSearchTextForSpecs = AuthenticationService.GetSearchTextForSpecs();
        	$rootScope.toggleClass = false;
        	var specviewRecord = AuthenticationService.GetPypeSearchRecordData();
        	$scope.searchPdfIconClicked(specviewRecord.record);
        	loadSubmittals(specviewRecord.record.specNumber, specviewRecord.record.specName);
        }

        function isDivSpecSectionPresent(divCode, specCode) {
            var found = false;
            for(var i=0; i<vm.data.length; i++) {
                for(var j=0; j<vm.data[i].specSections.length; j++) {
                    if(vm.data[i].divCode===divCode && vm.data[i].specSections[j].specCode===specCode) {
                        found = true;
                        break;
                    }
                }
            }
            return found;
        }

        function callLoadSpecPDF() {
        	var specViewData = AuthenticationService.GetSpecViewData();
            if(vm.View === 'ConsolidatedView') {
                switchConsolidatedView();
                if(specViewData && specViewData.record){
                	var record = specViewData.record;
                	$scope.selectedRec = record.recid;
                	$timeout(function(){
                		expandSubmittalCardGroup(record);
                		$timeout(function(){
                        	scrollToSpecificElementWithAnimation('#cards','#panel-col-smartregister-sub-' +record.recid, true);
                        	$scope.pdfIconClicked(record);
                    	},0);
                	},0);
                }
            }
            if(vm.data && vm.data.length>0) {
                loadSpecSectionAndPDF(specViewData);
            }
        }

        function loadSpecSectionAndPDF(specViewData){
            if (specViewData) {
                if (specViewData.record) {
                    $scope.excludeGroupsList = angular.copy(vm.uniqueProjectSummaryGroup);
                    var index = $scope.excludeGroupsList.indexOf(specViewData.record.projectSummaryGroup);
                    $scope.excludeGroupsList.splice(index, 1);
                    // In Case for Sub-Spec Sections
                    if(isDivSpecSectionPresent(specViewData.record.divisionCode, specViewData.record.specNumber)) {
                        loadByDivandSpec(specViewData.record.divisionCode, specViewData.record.specNumber, specViewData.record.specName, function() {
                        	$scope.pdfIconClicked(specViewData.record);
                            scrollToSpecificElementWithAnimation('#cards','#cards-spec-' + specViewData.record.recid, true);
                        }, true);
                    } else {
                        var leftNavItem = getFirstItemHasSubmittals();
                        var specSectionData = vm.data[leftNavItem.divIndex].specSections[leftNavItem.specIndex];
                        loadByDivandSpec(vm.data[leftNavItem.divIndex].divCode, specSectionData.specCode, specSectionData.specName);
                    }
                }
                else if (specViewData.divCode == "-1") {
                    var leftNavItem = getFirstItemHasSubmittals();
                    loadSpecPDF(vm.data[leftNavItem.divIndex], vm.data[leftNavItem.divIndex].specSections[leftNavItem.specIndex], leftNavItem.divIndex, leftNavItem.specIndex);
                }
                else {
                    if(isDivSpecSectionPresent(specViewData.divCode, specViewData.specCode)) {
                        loadByDivandSpec(specViewData.divCode, specViewData.specCode, specViewData.specName);
                    } else {
                        var leftNavItem = getFirstItemHasSubmittals();
                        var specSectionData2 = vm.data[leftNavItem.divIndex].specSections[leftNavItem.specIndex];
                        loadByDivandSpec(vm.data[leftNavItem.divIndex].divCode, specSectionData2.specCode, specSectionData2.specName);
                    }
                }
            } else {
                var leftNavItem = getFirstItemHasSubmittals();
                var specSectionData3 = vm.data[leftNavItem.divIndex].specSections[leftNavItem.specIndex];
                loadByDivandSpec(vm.data[leftNavItem.divIndex].divCode, specSectionData3.specCode, specSectionData3.specName);
            }
        }

        function LoadRecommendedSubmittals(projectId, versionId, callback){
        	vm.recommendedSubmittalLoader = "Loading recommended submittals...";
            vm.allSubmittalsList = [];
        	RecommendedSubmittalsService.GetRecommendedSubmittals(projectId,versionId,function(response){
        		if(response.success) {
        			vm.isRecommendedSubmittalRequestFailed = false;
        			if(response.data) {
                        vm.recommendedSubmittals = response.data;
        				var specCode = "";
        				var specViewData = AuthenticationService.GetSpecViewData();
        				if (specViewData) {
                            if (specViewData.record) {
                                specCode = specViewData.record.specNumber;
                            }
                            else if (specViewData.divCode == "-1") {
                                var leftNavItem = getFirstItemHasSubmittals();
                                specCode = vm.data[leftNavItem.divIndex].specSections[leftNavItem.specIndex].specCode;
                            }
                            else
                                specCode = specViewData.specCode;
                        } else {
                            leftNavItem = getFirstItemHasSubmittals();
                            specCode = vm.data[leftNavItem.divIndex].specSections[leftNavItem.specIndex].specCode;
                        }
        				FilterRecommendedSubmittals(specCode);
        				vm.recommendedSubmittalLoader = false;
        			}
        			else{
        				vm.recommendedSubmittals = [];
        				vm.recommendedSubmittalLoader = false;
        			}
        			vm.specSectionsWithRecommendedSubmittals = [];

        			vm.recommendedSubmittals.forEach(function(record){
        				vm.specSectionsWithRecommendedSubmittals.push(record.specNumber);
        			});
        		}
        		else{
        			vm.recommendedSubmittalLoader = false;
        			vm.isRecommendedSubmittalRequestFailed = true;
        		}
                vm.allSubmittalsList = vm.submittalregisters.concat(vm.recommendedSubmittals);
                if(callback) {
                    callback();
                }
        	});
        }

        function LoadProductData(projectId, versionId) {
            ProductDataService.GetByProjectId(projectId, versionId, function (response) {
                if (response.success) {
                    vm.MaxProductID = 0;
                    if (response.data) {
                        vm.productdata = response.data.productRegisterRecords;
                        vm.filteredProducts = angular.copy(vm.productdata);

                        var specCode = "";
                        var specViewData = AuthenticationService.GetSpecViewData();
                        if (specViewData) {
                            if (specViewData.record) {
                                specCode = specViewData.record.specNumber;
                            }
                            else if (specViewData.divCode == "-1") {
                                var leftNavItem = getFirstItemHasSubmittals();
                                specCode = vm.data[leftNavItem.divIndex].specSections[leftNavItem.specIndex].specCode;
                            }
                            else
                                specCode = specViewData.specCode;
                        } else {
                            var leftNavItem = getFirstItemHasSubmittals();
                            specCode = vm.data[leftNavItem.divIndex].specSections[leftNavItem.specIndex].specCode;
                        }

                        loadProducts(specCode);
                        vm.MaxProductID = getMaxRecId(vm.productdata);
                    }
                    else {
                        vm.MaxProductID = 0;
                        vm.productdata = [];
                        vm.filteredProducts = [];
                    }
                }
            });
        }

        function getFirstItemHasSubmittals() {
            var closestDivCode = vm.data.map(function (o) { return parseInt(o.divCode) }).reduce(function (prev, curr) {
                return (Math.abs(curr - 3) < Math.abs(prev - 3) ? curr : prev);
            });
            var firstIem;
            angular.forEach(vm.data, function (divItem, divIndex) {
                if (closestDivCode <= parseInt(divItem.divCode)) {
                    if (!firstIem) {
                        angular.forEach(divItem.specSections, function (specItem, specIndex) {
                            if (specItem.submittalNotPresent === false && !firstIem) {
                                firstIem = { divIndex: divIndex, specIndex: specIndex };
                            }
                        });
                    }
                }
            });
            return firstIem ? firstIem : { divIndex: 0, specIndex: 0 };
        }

        function loadByDivandSpec(divCode, specCode, specName, callback, dontLoadPdf) {
            var divIndex = $.map(vm.data, function (obj, index) {
                if (obj.divCode == divCode) {
                    return index;
                }
            })[0];
            if (!divIndex)
                divIndex = 0;
            var specIndex = $.map(vm.data[divIndex].specSections, function (obj, index) {
                if ( (specCode && (obj.specCode == specCode)) || ((obj.specName && specName) &&
                    obj.specName.toLowerCase() === specName.toLowerCase()) ) {
                        return index;
                }
            })[0];
            if (!specIndex)
                specIndex = 0;

            vm.data.forEach(function (value, index) {
                if(value.divCode == divCode)
                  value.isCollapsed = false;
                else
                  value.isCollapsed = true;
            });
            $timeout(function() {
                scrollToSpecificElementWithAnimation('#sideDiv', '#'+ divCode + "-" + $scope.replaceSpecialCharacters(specCode) + "-" + specIndex, true, 150);
            	vm.dataLoading = false;
            }, 0);
            loadSpecPDF(vm.data[divIndex], vm.data[divIndex].specSections[specIndex], divIndex, specIndex, callback, dontLoadPdf);
        }

        function scrollToSpecificElementWithAnimation(containerSelector, scrollToElementSelector, reduceTop, topToReduce) {
            var $container = $(containerSelector),
                $scrollTo = $(scrollToElementSelector);
            if(reduceTop){
                if(!topToReduce){
                    topToReduce = 50;
                }
                if ($scrollTo.offset()) {
                    $container.animate({scrollTop: $scrollTo.offset().top - $container.offset().top + $container.scrollTop() - topToReduce},800);
                }
            } else {
                $container.animate({scrollTop: $scrollTo.offset().top - $container.offset().top + $container.scrollTop()},800);
            }
        }

        $scope.replaceSpecialCharacters = function(filename) {
        	return filename.replace(/[^a-zA-Z0-9]/g , '_');
        }

        function getMaxRecId(recordsData) {
            var highest = 0;
            $.each(recordsData, function (key, record) {
                if (record.recid > highest)
                    highest = record.recid;
            });
            return highest;
        }

        function SwitchSmartRegisterView() {
            vm.View = 'SmartRegisterView';
            AuthenticationService.SetSpecViewView({ view: "SmartRegisterView" });
            if(vm.highlightAllSubmittals) {
              callLoadSpecPDF();
            }
        }

        function SwitchProductDataView() {
          GetProductsEnabledFlag(function(){
              vm.SpecView = "PDFView";
              if(vm.highlightAllSubmittals) {
                callLoadSpecPDF();
              }
            });
        }

        function switchRecommendedSubmittals() {
        	 	vm.View = 'RecommendedSubmittalsView';
        	 	AuthenticationService.SetSpecViewView({ view: "RecommendedSubmittalsView" });
                vm.SpecView = "PDFView";
                if(vm.highlightAllSubmittals) {
                  callLoadSpecPDF();
                }
          }

        function addRecommendedSubmittals(submittal){
        	if(vm.dataDirty){
        		items.title = vm.unsavedChangesTitle;
                items.message = vm.unsavedChangesMessage;
                ModalService.showAlertMessage(items);
        	}
        	else{
                var modalInstance = $uibModal.open({
    			    animation: true,
    			    templateUrl: MAINURL + 'views/recommendedsubmittals/addtoregister.view.html',
    			    controller: 'RecommendedSubmittalsController',
    			    backdrop: 'static',
    			    size: 'lg',
    			    resolve: {
    			        record: function() {
    			        	return submittal;
			        	},
			        	defaultSpecCategories:function() {
			        	    return vm.uniqueSpecCategory;
			        	},
			        	projectSummaryGroups:function() {
			        		if(vm.uniqueProjectSummaryGroup.indexOf(submittal.projectSummaryGroup) === -1){
			        			vm.uniqueProjectSummaryGroup.push(submittal.projectSummaryGroup)
			        		}
			        		return vm.uniqueProjectSummaryGroup;
			        	}
    			    }
    			});

                modalInstance.result.then(function (data) {
                	addRecommendedSubmittalsToRegister(data);
                }, function () {
                });

        	}
        }

		function addRecommendedSubmittalsToRegister(data) {
			if (data) {
				vm.recommendedSubmittalLoader = "Adding recommended submittals to register...";
				SmartRegisterService.addRecommendedSubmittalsToRegister(
						vm.selectedProject.projectId,
						vm.selectedVersion.versionId, data, function(response) {
							if (response.success) {
								LoadRecommendedSubmittals(
										vm.selectedProject.projectId,
										vm.selectedVersion.versionId);
								LoadSpecViewData(vm.selectedProject.projectId,
										vm.selectedVersion.versionId);
								vm.recommendedSubmittalLoader = false;
								FlashService.Success(response.message);

							} else {
								vm.recommendedSubmittalLoader = false;
								FlashService.Error(response.message);
							}
						});
			} else {
				FlashService
						.Error("Unable to get selected record,please try again...");
			}
		}


        function addtoSmartReg(recid) {
        	vm.dataLoading = 'Loading...Please Wait...';
            if (vm.dataDirty) {
                items.title = vm.unsavedChangesTitle;
                items.message = vm.unsavedChangesMessage;
                ModalService.showAlertMessage(items);
            }
            else {
                setTimeout(function () {
                    var selectedRecord = vm.productdata.filter(function (data) {
                        if (data.recid === recid)
                            return data;
                    });
                    vm.dataLoading = false;
                    if (selectedRecord && selectedRecord.length > 0) {
                        ShowAddToSmartRegisterConfirm(vm.columns, selectedRecord[0], 'Review product record below, before creating');
                    }
                    else {
                        console.log('Unable to get the selected record!!!');
                    }
                }, 100);
            }
            vm.dataLoading = false;
        }

        function ShowAddToSmartRegisterConfirm(columns, record, message) {
            var modalInstance = $uibModal.open({
			    animation: true,
			    templateUrl: MAINURL + 'views/productdata/productdata.reviewrecord.view.html',
			    controller: 'ReviewProductRecordController',
			    backdrop: 'static',
			    size: 'lg',
			    resolve: {
			        items: { columns: columns, record: record, message: message }
			    }
			});
            modalInstance.result.then(function (data) {
                addToSmartRegister(data);
            });
        }

        function addToSmartRegister(data) {
            if (data) {
                delete data.createSubmittal;
                delete data.isOpen;
                delete data.selected;
                ProductDataService.AddToSmartRegister(vm.selectedProject.projectId, vm.selectedVersion.versionId, data, function (response) {
                    if (response.success) {
                        var itemIndex = $.map(vm.productdata, function (obj, index) {
                            if (obj.recid == data.recid) {
                                return index;
                            }
                        })[0];

                        vm.productdata[itemIndex].smartRegisterFlag = true;
                        doFullSpecViewSearch();
                        loadProducts(data.specNumber);
                        LoadSpecViewData(vm.selectedProject.projectId, vm.selectedVersion.versionId);
                        FlashService.Success(response.message || "Product data added to Smart Register successfully.");

                        //LOGGING EVENT
                        LogEvent("Add to SmartRegister", "Added to Smart Register", "SUCCESS");

                    } else {
                        FlashService.Error(response.message);

                        //LOGGING EVENT
                        LogEvent("Add to SmartRegister", "Added to Smart Register", "FAILED");
                    }
                });
            }
            else {
                FlashService.Error('Unable to get the selected record details');
            }
        }

        function deleteMultipleSubmittals() {
			  var indexes = getMulitpleIgnoredRecData(vm.submittalsList);
			  if (indexes.submittalIndexes.length===0 && indexes.recommendedIndexes.length === 0) {
				  FlashService.Error("At least one submittal must be selected to delete.");
				  return ;
			  }

            var message = "Are you sure you want to delete the selected submittals?";
            var title = "Delete submittal?";
            ModalService.OpenConfirmModal(title, message, false, 'Delete', 'Cancel', true)
            .result.then(function () {
                vm.dataLoading = 'Deleting submittals...Please wait...';
                if(indexes.submittalIndexes && indexes.submittalIndexes.length>0) {
                    deleteMultipleConfirmedSubmittals(indexes, function() {
	                     FlashService.Success("Submittal deleted successfully.");
                        deleteMultipleRecommendedSubmittals(indexes);
                    });
                } else {
                    deleteMultipleRecommendedSubmittals(indexes);
                }
            }, function() {});
		}

        function deleteConfirmedSubmittal(record) {
        	var indexes, submittalIndexes = [], submittalRecids = [];
            var message = "Are you sure you want to delete the selected submittal?";
            var title = "Delete submittal?";
            ModalService.OpenConfirmModal(title, message, false, 'Delete', 'Cancel', true)
            .result.then(function () {
                vm.dataLoading = true;
            	for(var i=0; i<vm.submittalsList.length; i++) {
                    if(vm.submittalsList[i].recid === record.recid) {
                    	submittalIndexes.push(i);
                    }
                }
            	submittalRecids.push(record.recid);
                indexes =  {submittalIndexes : submittalIndexes, submittalRecids : submittalRecids};
                deleteMultipleConfirmedSubmittals(indexes, function(response) {
                    if(response) {
                        doFullSpecViewSearch();
                    	loadSubmittals(vm.selectedItem.spec.specCode, vm.selectedItem.spec.specName);
                    	FlashService.Success("Submittal deleted successfully.");
                        vm.dataLoading = false;
                    }

                });
            }, function() {});
        }

        function deleteRecommendedSubmittal(record) {
            var indexes, recommendedIndexes = [], recommendedRecids = [];
            var message = "Are you sure you want to delete?";
            var title = "Confirm delete";
            ModalService.OpenConfirmModal(title, message, false, 'Delete', 'Cancel', true)
                .result.then(function () {
                    for(var i=0; i<vm.submittalsList.length; i++) {
                        if(vm.submittalsList[i].recid === record.recid) {
                            recommendedIndexes.push(i);
                        }
                    }
                    recommendedRecids.push(record.recid);
                    indexes =  {recommendedIndexes : recommendedIndexes, recommendedRecids : recommendedRecids};
                    deleteMultipleRecommendedSubmittals(indexes);
            }, function() {});
        }

        function getMulitpleIgnoredRecData(submittals) {
        	var submittalIndexes = [], submittalRecids = [], recommendedIndexes = [], recommendedRecids = [];
            submittals.filter(function(sub, index) {
        		if (sub.selected === true && sub.specNumber === vm.selectedItem.spec.specCode){
        			delete sub.isOpen;
                    if (sub.typeOfSubmittal === 'Recommended') {
                    	recommendedIndexes.push(index);
                    	recommendedRecids.push(sub.recid);
                    } else {
                    	submittalIndexes.push(index);
                    	submittalRecids.push(sub.recid);
                    }
        		}
        	});
            return {submittalIndexes : submittalIndexes, recommendedIndexes : recommendedIndexes, submittalRecids : submittalRecids, recommendedRecids : recommendedRecids};
        }

        function deleteMultipleConfirmedSubmittals(indexes, callback) {
            var specCode, oldRecord, changes = [], records = [];
			for(var subIndex = 0; subIndex< indexes.submittalIndexes.length; subIndex++) {
				 oldRecord = vm.submittalsList[indexes.submittalIndexes[subIndex]];
	             records.push(oldRecord);
	             changes.push({ action: "Deleted", newRecord: null, oldRecord : oldRecord });
			}
			specCode = records[0].specCode;
            SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                    [], [], [], records, [], changes, function (response) {
                        if (response.success) {
                        	vm.submittalregisters = angular.copy(response.data.smartRegisterRecords);
                            doFullSpecViewSearch();
							postSubmittalSaveActions();
                            var isPresent = vm.submittalregisters.find(function(item) {
                              return item.specNumber == vm.selectedItem.spec.specCode;
                            });
                            vm.data.forEach(function (value, index) {
                                value.specSections.forEach(function (value2, index2) {
                                    if((value.divCode == vm.selectedItem.div.divCode) && (value2.specCode == vm.selectedItem.spec.specCode) && !isPresent) {
                                      value2.submittalNotPresent = true;
                                    }
                                });
                            });
                            if(callback)
                            	callback(true);
                        } else {
                            FlashService.Error(response.message || "Delete Failed. Please contact support.");
                            if(callback) {
                                callback(false);
                            }
                        }

            });
        }

        function deleteMultipleRecommendedSubmittals(indexes, callback) {
            var records = [];
            if(indexes.recommendedIndexes && indexes.recommendedIndexes.length > 0) {
    			for(var subIndex = 0; subIndex< indexes.recommendedIndexes.length; subIndex++) {
    	             records.push(vm.submittalsList[indexes.recommendedIndexes[subIndex]]);
    			}
    			RecommendedSubmittalsService.deleteMultipleRecSubmittals(vm.selectedProject.projectId, vm.selectedVersion.versionId, records, function (response) {
                    if (response.success) {
                        response.data.forEach(function(item) {
                            item.typeOfSubmittal = 'Recommended';
                        });
                    	vm.recommendedSubmittals = response.data;
                        doFullSpecViewSearch();
                    	loadSubmittals(vm.selectedItem.spec.specCode, vm.selectedItem.spec.specName);
                    	FlashService.Success("Deleted successfully.");
                    } else {
                    	FlashService.Error(response.message || "Delete Failed. Please contact support.");
                    }
                    vm.dataLoading = false;
                });
            } else {
                doFullSpecViewSearch();
            	loadSubmittals(vm.selectedItem.spec.specCode, vm.selectedItem.spec.specName);
                vm.dataLoading = false;
            }
        }

        function checkIfAnyRecordsSelected(data, specCode) {
            var selectedRecords = data.filter(function (obj) {
                if (obj.specNumber == specCode && obj.selected == true) {
                    return obj;
                }
            });
            if (selectedRecords && selectedRecords.length > 0) {
                return true;
            }
            return false;
        }

        function checkIfAnyRecommendedSubmittal() {
        	if(vm.submittalsList && vm.submittalsList.length > 0) {
        		for(var i = 0; i < vm.submittalsList.length; i++) {
        			if(vm.submittalsList[i].selected == true && vm.submittalsList[i].typeOfSubmittal === 'Recommended' )
        				return true;
        		}
        	}
        	return false;
        }
        function CopySingleRecordMultipleTimes(item, nTimes) {
            vm.dataLoading = true;
            if (!nTimes) nTimes = 1;
            var changes = [];
            var copyArray = [];
            var newObj = angular.copy(item), copiedRecordIndex = -1;
            delete newObj.isOpen;
            delete newObj.selected;
            var copiedRecordIndexLst = $.map(vm.submittalsList, function (data, index) {
                if (item.specNumber === data.specNumber && item.paraCode === data.paraCode) {
                    return index;
                }
            })

            if (copiedRecordIndexLst && copiedRecordIndexLst.length > 0) {
                copiedRecordIndex = copiedRecordIndexLst[0];
            }
            for (var i = 0; i < nTimes; i++) {
                vm.MaxRecId++;
                AuthenticationService.SetPypeSearchRecId(vm.MaxRecId);
                newObj = settingDefaultsForIntegrations(newObj);
                newObj.recid = vm.MaxRecId;
                newObj.serialNumber = vm.MaxRecId;
                var newObjTemp = angular.copy(newObj);
                changes.push({ action: "Copied", newRecord: newObjTemp, sourceRecordSerialNumber: item.serialNumber});
                copyArray.push(angular.copy(newObj));
            }

            SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                    [], copyArray, [], [], null, changes, function (response) {
                        if (response.success === true) {
                        	vm.submittalregisters = response.data.smartRegisterRecords;
                            doFullSpecViewSearch();
                            loadSubmittals(item.specNumber, item.specName);
                            FlashService.Success("Submittal copied successfully.");
                            //LOGGING EVENT
                            LogEvent("Copy SmartRegister Submittal", "Copied SmartRegister submittal with Spec Section : " + item.specNumber + ", " + nTimes + " number of times" + " successfully", "SUCCESS");
                        } else {
                            FlashService.Error(response.message || "Copy Failed. Please contact support.");
                        }
                        vm.dataLoading = false;
                    });
        }

        function CopySingleProductRecordMultipleTimes(item, nTimes) {
            if (!nTimes) nTimes = 1;
            var changes = [];
            var copyArray = [];
            var newObj = angular.copy(item), copiedRecordIndex = -1;
            delete newObj.isOpen;
            delete newObj.selected;
            var copiedRecordIndexLst = $.map(vm.productdata, function (data, index) {
                if (item.specNumber === data.specNumber && item.paraCode === data.paraCode) {
                    return index;
                }
            })

            if (copiedRecordIndexLst && copiedRecordIndexLst.length > 0) {
                copiedRecordIndex = copiedRecordIndexLst[0];
            }
            for (var i = 0; i < nTimes; i++) {
            	vm.MaxProductID++;
                newObj.recid = vm.MaxProductID;
                newObj.serialNumber = vm.MaxProductID;
                changes.push({ action: "Added", newRecord: angular.copy(newObj) });
                copyArray.push(angular.copy(newObj));
            }

            ProductDataService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                    [], copyArray, [], [], null, changes, function (response) {
                        if (response.success === true) {
                            var copiedRecordParaCodes = [];
                            var rowIndex = 0;
                            for (var j = 1; j <= nTimes; j++) {
                                if (copiedRecordParaCodes.indexOf(vm.productdata[copiedRecordIndex].paraCode) === -1) {
                                    copiedRecordParaCodes.push(vm.productdata[copiedRecordIndex].paraCode);
                                }
                                vm.productdata.splice(copiedRecordIndex, 0, copyArray[rowIndex]);
                                rowIndex++;
                            }
                            doFullSpecViewSearch();
                            loadProducts(item.specNumber);
                            FlashService.Success("Copied Successfully ");
                            copiedRecordParaCodes = copiedRecordParaCodes.join();
                            //LOGGING EVENT
                            LogEvent("Copy ProductData Submittal", "Copied ProductData with Spec Section : " + item.specNumber + " Spec sub section : " + copiedRecordParaCodes + ", " + nTimes + " number of times successfully", "SUCCESS");
                        }
                    });
        }

        function CopyMultipleRecords(specCode, nTimes) {
        	if(checkIfAnyRecommendedSubmittal()) {
        		FlashService.Error("Please select only Smart Register submittals to copy.");
        		return;
        	}
            if (!nTimes) nTimes = 1;
            var changes = [];
            var copyArray = [];
            var copiedRecordIndexs = $.map(vm.submittalsList, function (obj, index) {
                if (obj.specNumber == specCode && obj.selected == true) {
                    var newObj = angular.copy(obj);
                    delete newObj.isOpen;
                    delete newObj.selected;
                    for (var i = 0; i < nTimes; i++) {
                        vm.MaxRecId++;
                        AuthenticationService.SetPypeSearchRecId(vm.MaxRecId);
                        newObj = settingDefaultsForIntegrations(newObj);
                        newObj.recid = vm.MaxRecId;
                        newObj.serialNumber = vm.MaxRecId;
                        var newObjTemp = angular.copy(newObj);
                        changes.push({ action: "Copied", newRecord: newObjTemp, sourceRecordSerialNumber: obj.serialNumber});
                        copyArray.push(angular.copy(newObj));
                    }
                    return index;
                }
            });

            if (copiedRecordIndexs && copiedRecordIndexs.length > 0) {
                copiedRecordIndexs = copiedRecordIndexs.sort().reverse();
                SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                        [], copyArray, [], [], null, changes, function (response) {
                            if (response.success === true) {
                            	vm.submittalregisters = response.data.smartRegisterRecords;
                                doFullSpecViewSearch();
                                loadSubmittals(vm.selectedItem.spec.specCode, vm.selectedItem.spec.specName);
								postSubmittalSaveActions();
                                FlashService.Success("Copied Successfully ");
                              //  copiedRecordParaCodes = copiedRecordParaCodes.join();
                                //LOGGING EVENT
                                LogEvent("Copy SmartRegister Submittal", "Copied SmartRegister submittal with Spec Section : " + specCode + ", " + nTimes + " number of times" + " successfully", "SUCCESS");
                            } else {
								FlashService.Error(response.message || "Copy Failed. Please contact support.");
                            }
                        });
            }
            else {
                FlashService.Error("At least one submittal must be selected to copy.");
            }
        }

        function settingDefaultsForIntegrations(record) {
        	 record.uploadedToProcore = false;
        	 record.uploadedToBIM360 = false;
        	 record.uploadedToACC = false;
        	 record.uploadedToAconex = false;
             record.uploadedToProjectSight = false;
        	 record.aconexExportedData = {};
        	 record.bim360ProjectAndSubmittalID = {};
        	 record.accProjectAndSubmittalID = {};
        	 record.procoreProjectAndSubmittalID = {};
             record.projectSightProjectAndSubmittalRegID = {};
			 return record;
        }

        function showNTimesPopup(item, selected) {
            if(item) {
              item.selected = selected ? true : false;
            }
            var specCode = vm.selectedItem.spec.specCode;
            if (vm.View == 'SmartRegisterView') {
                if (item) {
                    openNTimesPopup(function (data) {
                        //CopyMultipleRecords(item.specNumber, data);
                    	if(item.sourceMoudle == 'Pype-AI') {
                    		FlashService.Error("Please select only Smart Register submittals to copy");
                    		return;
                    	}
                        CopySingleRecordMultipleTimes(item, data);
                    });
                } else {
                	if(checkIfAnyRecommendedSubmittal()) {
                		FlashService.Error("Please select only Smart Register submittals to copy");
                		return;
                	}
                    if (checkIfAnyRecordsSelected(vm.submittalsList, specCode)) {
                        openNTimesPopup(function (data) {
                            CopyMultipleRecords(specCode, data);
                        });
                    } else {
                        FlashService.Error("At least one submittal must be selected to copy.");
                    }
                }
            } else {
                if (item) {
                    openNTimesPopup(function (data) {
                        CopySingleProductRecordMultipleTimes(item, data);
                    });
                }
                else {
                    if (checkIfAnyRecordsSelected(vm.filteredProductData, specCode)) {
                        openNTimesPopup(function (data) {
                            CopyMultipleRecordsProductData(specCode, data);
                        });
                    } else {
                        FlashService.Error("At least one Product Data must be selected to copy.");
                    }
                }
            }
        }

        function openNTimesPopup(callback) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: MAINURL + 'views/smartview/specview/showntimes.popup.html?version=9.1',
                controller: 'ShowNTimesController',
                backdrop: 'static',
                windowClass: 'smallpopup',
                keyboard: false,
                resolve: {}
            });
            modalInstance.result.then(
					function (data) {
					    if (data && callback && typeof callback === 'function') {
					        callback(data);
					    }
					}, function () {
					});
        }

        function CopyMultipleRecordsProductData(specCode, nTimes) {
            if (!nTimes) nTimes = 1;
            var changes = [];
            var copyArray = [];
            var copiedRecordIndexs = $.map(vm.filteredProductData, function (obj) {
                if (obj.specNumber == specCode && obj.selected) {
                    var idx;
                    for(var i=0; i<vm.productdata.length; i++) {
                        var p = vm.productdata[i];
                        if(p.specNumber == specCode && obj.recid === p.recid) {
                            idx = i;
                            break;
                        }
                    }
                    var newObj = angular.copy(obj);
                    delete newObj.isOpen;
                    delete newObj.selected;
                    for (var i = 0; i < nTimes; i++) {
                    	vm.MaxProductID++;
                        newObj.recid = vm.MaxProductID;
                        newObj.serialNumber = vm.MaxProductID;
                        changes.push({ action: "Added", newRecord: newObj });
                        copyArray.push(angular.copy(newObj));
                    }
                    return idx;
                }
            });

            if (copiedRecordIndexs && copiedRecordIndexs.length > 0) {
                copiedRecordIndexs = copiedRecordIndexs.sort().reverse();
                ProductDataService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                        [], copyArray, [], [], null, changes, function (response) {
                            if (response.success === true) {
                                var copiedRecordParaCodes = [];
                                var rowIndex = 0;
                                for (var i = 0; i < copiedRecordIndexs.length; i++) {
                                    for (var j = 1; j <= nTimes; j++) {
                                        if (copiedRecordParaCodes.indexOf(vm.productdata[copiedRecordIndexs[i]].paraCode) === -1) {
                                            copiedRecordParaCodes.push(vm.productdata[copiedRecordIndexs[i]].paraCode);
                                        }
                                        vm.productdata.splice(copiedRecordIndexs[i], 0, copyArray[rowIndex]);
                                        rowIndex++;
                                    }
                                }

                                doFullSpecViewSearch();
                                loadProducts(specCode);
                                FlashService.Success("Copied Successfully ");
                                copiedRecordParaCodes = copiedRecordParaCodes.join();
                                //LOGGING EVENT
                                LogEvent("Copy ProductData Submittal", "Copied ProductData with Spec Section : " + specCode + " Spec sub section : " + copiedRecordParaCodes + ", " + nTimes + " number of times successfully", "SUCCESS");
                            }
                        });
            }
            else {
                FlashService.Error("At least one Product Data must be selected to copy.");
            }
        }

        function deleteMultipleProductData(specCode) {
            var changes = [];
            var deleteArray = [];
            var deletedRecordIndexs = $.map(vm.filteredProductData, function (obj) {
                if (obj.specNumber == specCode && obj.selected) {
                    var idx;
                    for(var i=0; i<vm.productdata.length; i++) {
                        var p = vm.productdata[i];
                        if(p.specNumber == specCode && obj.recid === p.recid) {
                            idx = i;
                            break;
                        }
                    }
                    delete obj.isOpen;
                    delete obj.selected;
                    changes.push({ action: "Deleted", oldRecord: obj });
                    deleteArray.push(angular.copy(obj));
                    return idx;
                }
            });
            if (deletedRecordIndexs && deletedRecordIndexs.length > 0) {
                var specName = deleteArray[0].specName; //Taking the specName considering always we will have same specName for all the selected data
                var message = "Are you sure you want to delete?<br/>";
              	var title = "Confirm delete";
                ModalService.OpenConfirmModal(title, message, false, 'Delete', 'Cancel', true)
              	.result.then(function () {
                      ProductDataService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "specView", [], [], [], deleteArray, [], changes,
                        function (response) {
                            if (response.success) {
                                var deletedRecordParaCodes = "";
                                var result = $.grep(vm.productdata, function (n, i) {
                                    if ($.inArray(i, deletedRecordIndexs) !== -1) {
                                        deletedRecordParaCodes += n.paraCode + ",";
                                        return false;
                                    }
                                    return true;
                                });
                                vm.productdata = result;
                                doFullSpecViewSearch();
                                loadProducts(specCode);
                                FlashService.Success("Deleted successfully.");

                                //LOGGING EVENT
                                deletedRecordParaCodes = deletedRecordParaCodes.substring(0, deletedRecordParaCodes.length - 1);
                                LogEvent("Delete ProductData", "Deleted Productdata with Spec Section : " + specCode + " Spec Name : " + specName + " Spec sub section : " + deletedRecordParaCodes + " successfully", "SUCCESS");
                            }
                        });
              	}, function() {});
            }
            else {
                FlashService.Error("At least one Product Data must be selected to delete.");
            }
        }



        function DeleteProductDataRecord(record) {
            var message = "Are you sure you want to delete?";
            var title = "Confirm delete";
            ModalService.OpenConfirmModal(title, message, false, 'Delete', 'Cancel', true)
            .result.then(function () {
                  var deletedRecordIndex = $.map(vm.productdata, function (obj, index) {
                      if (obj.recid == record.recid) {
                          return index;
                      }
                  })[0];
                  var specCode = vm.productdata[deletedRecordIndex].specNumber;
                  var changes = [];
                  delete vm.productdata[deletedRecordIndex].isOpen;
                  delete vm.productdata[deletedRecordIndex].selected;
                  var deleteRecord = angular.copy(vm.productdata[deletedRecordIndex]);
                  changes.push({ action: "Deleted", oldRecord: vm.productdata[deletedRecordIndex] })
                  ProductDataService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "specView", [], [], [], [vm.productdata[deletedRecordIndex]], null, changes, function (response) {
                      if (response.success === true) {
                          vm.productdata.splice(deletedRecordIndex, 1);
                          doFullSpecViewSearch();
                          loadProducts(specCode);
                          FlashService.Success("Deleted successfully.");

                          //LOGGING EVENT
                          LogEvent("Delete ProductData Record", "User deleted ProductData Record " + "Spec Section : '" + deleteRecord.specNumber
                              + "' Spec Name : '" + deleteRecord.specName + "' Spec sub section : '" + deleteRecord.paraCode + "' Successfully", "SUCCESS");
                      } else {
                          FlashService.Error(response.message || "Unable to delete product data. Please contact support.");
                          //LOGGING EVENT
                          LogEvent("Delete ProductData Record", "User unable delete ProductData Record " + "Spec Section : '" + deleteRecord.specNumber
                              + "' Spec Name : '" + deleteRecord.specName + "' Spec sub section : '" + deleteRecord.paraCode + "' " + response.message, "SUCCESS");
                      }
                  });
            }, function() {});
        }

        function hovered(spec) {
            vm.hoveredSpec = spec.specCode;
        }

        function GetProductsEnabledFlag(callback) {
            ProductDataService.GetProductsEnabledFlag(vm.selectedProject.projectId, function (response) {
                if (response.success) {
                    if(ProductData(response.data)){
                        callback();
                    }
                } else {
                    FlashService.Error(response.message);
                }
            });
        }

        function ProductData(flag) {
            if (flag === false) {
                if (vm.selectedProject.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    vm.UpgradeToSeeMsg = "Please upgrade to see products data";
                    var items = {};
                    items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                    items.popupTitle = "Project Upgrade";
                    items.popupButtonName = "Upgrade";
                    showUpgradetoSeePopup(vm.selectedProject, items);
                    return false;
                }
                else {
                    vm.UpgradeToSeeMsg = '<p class="m-b0 p-l30 text-left">Product feature is not enabled. Please contact Pype support.</p>'+
                    '<p class="m-b0 p-l30 text-left"><b>Email:</b> <span class="p-l10">pypesupport@autodesk.com.</span></p>' +
	                '<p class="m-b0 p-l30 text-left"><b>Phone:</b> <span class="p-l5">1 (855)-910-7137</span></p>';
                    var items = {};
                    items.UpgradeToSeeMsg = vm.UpgradeToSeeMsg;
                    items.popupTitle = "Alert !";
                    items.popupButtonName = "Contact Us";
                    showUpgradeProductDataPopUp(items);
                    return false;
                }
            }
            else {
                vm.View = 'ProductDataView';
                AuthenticationService.SetSpecViewView({ view: "ProductDataView" });
                return true;
            }
        }

        function showUpgradeProductDataPopUp(items) {
            ModalService.showUpgradetoSeePopup(items)
            .result.then(function (data) {
                vm.modalTitle = "Contact Us";
                EnableProducts(vm.selectedProject.name, 'Products');
            });
        }

        function EnableProducts(projectName, feature) {
            $scope.user = vm.user;
            var items = PopulatingUserDetails(projectName);
            items.RequestType = "Enable Produts for " + projectName;
            items.feature = feature;
            ModalService.contactUsByFeaturePopup(items);
        }

		function postSubmittalSaveActions(){
			var maxSubmittalId = 0;
			vm.submittalregisters.forEach(function(item){
				if(item.recid > maxSubmittalId){
					maxSubmittalId = item.recid;
				}
			});
			vm.MaxRecId = maxSubmittalId;
		}

        function ShowSubmittalCreated(record) {
            vm.searchText = record.paraCode;
            vm.View = "SmartRegisterView";
        }

        $scope.hightlightAllToggled = function() {
        	if(vm.highlightAllSubmittals){
        		var specViewData = AuthenticationService.GetSpecViewData();
                setTrustedUrl(specViewData);
        		AuthenticationService.SetHighlightAllInPDFFlag(vm.highlightAllSubmittals);
        		$scope.selectedRec = "";
        	} else {
        		callLoadSpecPDF();
        		AuthenticationService.SetHighlightAllInPDFFlag(vm.highlightAllSubmittals);
        	}
        }

        function getRecordHeading(record,paraCodeField,headingField,search){
            if(record) {
                var firstPart = record[headingField] ?(record[paraCodeField] ? SmartRegisterService.parseParaCodeFirstPart(record[paraCodeField]) +'.' : '') : SmartRegisterService.parseParaCodeFirstPart(record[paraCodeField]);
            	var heading =  firstPart + ' ' + (record[headingField] ? record[headingField] : '');
            } else {
                var heading = '';
            }
		    if (!search) {
		        return $sce.trustAsHtml(heading);
		    }
		    return $sce.trustAsHtml(heading.replace(/\n/g, " ").replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>'));
        }

        vm.highlightSearchTerm = function(value, search) {
            var highlightValue = value ? value : '';
            if (!search) {
		        return $sce.trustAsHtml(highlightValue);
		    }
            return $sce.trustAsHtml(highlightValue.replace(/\n/g, " ").replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>'));
        }

        function getRecordDescription(record,fieldName,search){
			var text = $scope.parseParaCodeSecondPart(record.paraCode);
			// for show more and show less
			if(record[fieldName].length>280 && !record.showmore)
				text = text+record[fieldName].substr(0,280)+ "...";
			else
				text = text+record[fieldName];
			if (!search) {
		        return $sce.trustAsHtml(text);
		    }
		    return $sce.trustAsHtml(text.replace(/\n/g, " ").replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>'));
        }

     // functions related to consolidated view starts here
		function switchConsolidatedView(){
			vm.dataLoading = "Loading Submittals...";
			$timeout(function(){
				vm.smartRegisterSubmittals = angular.copy(vm.submittalregisters);
				vm.smartRegisterSubmittals = vm.smartRegisterSubmittals.sort(UtilService.DynamicCustomSpecSort());
				if(vm.highlightAllSubmittals) {
	                callLoadSpecPDF();
	             }
				vm.View = 'ConsolidatedView';
				AuthenticationService.SetSpecViewView({view: "ConsolidatedView"});
				vm.dataLoading = false;
			},0);
		}

		 $scope.showSmartRegisterSpecGroupHeader = function(){
	        var item = this.item, $index = this.$index;
	        return($index == 0 || vm.filteredSmartRegisterSubmittals[$index - 1].specNumber !== item.specNumber);
	     }

		 $scope.getGroupSmartRegisterSubmittlCount = function(field, item){
        	var count = 0;
        	vm.filteredSmartRegisterSubmittals.forEach(function(record){
        		if (record[field] === item[field]){
        			count++;
        		}
        	});
        	return count;
	      }

		 $scope.addInClassSubmittal= function(item){
			return vm.smartRegisterSpecGroup[item.specNumber];
		 }
        $scope.searchSmartRegisterSubmittals = function(item){
        	var searchKeyWord = vm.searchSmartRegisterSubmittals?vm.searchSmartRegisterSubmittals.toLowerCase() : "";
        	return !searchKeyWord || (item.submittalDescription.toLowerCase().indexOf(searchKeyWord) > -1) ||
        	(item.specNumber.toLowerCase().indexOf(searchKeyWord) > -1) ||
        	(item.specName.toLowerCase().indexOf(searchKeyWord) > -1);
        }

		$scope.highlightDescription = function(record, fieldName, search) {
			var text;
			// for show more and show less
			if(record[fieldName].length>280 && !record.showmore)
				text = record[fieldName].substr(0,280)+ "...";
			else
				text = record[fieldName];
			if (!search) {
		        return $sce.trustAsHtml(text);
		    }
		    return $sce.trustAsHtml(text.replace(/\n/g, " ").replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>'));
		}

		$scope.highlightSearchKeyword = function(text, search) {
		    if (!search) {
		        return $sce.trustAsHtml(text);
		    }
		    return $sce.trustAsHtml(text.replace(/\n/g, " ").replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>'));
		};

		function smartRegisterSubmittalClicked(record){
			record.showmore = true;
			if(!record.sourceModule) {
				loadSpecSectionAndPDF({record:record});
			} else if(record.sourceModule && ['plans', 'procurementlog'].indexOf(record.sourceModule.toLowerCase()) > -1){
				//add code here to redirect to planview
                AuthenticationService.SetPlanViewRecordData(record);
            	AuthenticationService.SetPlanViewSheetData({file : { sheettype_s: record.drawingSheetType}, page : {filename: record.drawingFileName, pagenumber_i : record.drawingPageNumber}});
    			AuthenticationService.setSmartViewType('planview');
                AuthenticationService.SetPlanViewView('allSubmittals');
                $scope.$emit('loadSmartViewType', 'planview');
			}
		}

		function expandSubmittalCardGroup(record){
			if(!vm.smartRegisterSpecGroup){
				vm.smartRegisterSpecGroup = {};
			}
			vm.smartRegisterSpecGroup[record.specNumber] = true;
		}


		// functions related to consolidated view ends here

    }
})();

function leftNavScrollEvent() {
    var scope = angular.element("#page-content-wrapper").scope();
    scope.specSchedulesPopover.isOpen = {};
    scope.$apply();
}
