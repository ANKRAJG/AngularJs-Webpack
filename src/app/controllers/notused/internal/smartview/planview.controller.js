(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('PlanViewController', PlanViewController);

    PlanViewController.$inject = ['$location', '$linq', 'ProjectService', 'AuthenticationService', 'FlashService', 'MAINURL', '$uibModal', '$uibModalStack', '$route', '$scope', '$sce',
            'SmartRegisterService', 'APIURL', 'PYPECUSTOMPDFJSURL', '$rootScope', 'ProductDataService', 'CompanyService', '$window', 'ProcoreIntegrationService', 'BlueBeamIntegrationService',
            'BIMIntegrationService', 'EventService', '$timeout', 'PypeRegexObj', 'RememberService','DrawingsService', 'UtilService', '$routeParams', 'ModalService', 'PlanViewService',
            'ProcurementLogService', 'DownloadService'];
    function PlanViewController($location, $linq, ProjectService, AuthenticationService, FlashService, MAINURL, $uibModal, $uibModalStack, $route, $scope, $sce,
                SmartRegisterService, APIURL, PYPECUSTOMPDFJSURL, $rootScope, ProductDataService, CompanyService, $window, ProcoreIntegrationService, BlueBeamIntegrationService,
                BIMIntegrationService, EventService, $timeout, PypeRegexObj, RememberService, DrawingsService, UtilService, $routeParams, ModalService, PlanViewService,
                ProcurementLogService, DownloadService) {

        var vm = this;
        vm.StartNewProject = StartNewProject;
        vm.ContactUs = ContactUs;
        vm.Upgrade = Upgrade;
        vm.Renew = Renew;
        vm.ExpandAll = ExpandAll;
        vm.CollapseAll = CollapseAll;
        vm.ExpandAllSpecNames = ExpandAllSpecNames;
        vm.CollapseAllSpecNames = CollapseAllSpecNames;
        vm.hovered = hovered;
        vm.LoadDrawingsPDF = LoadDrawingsPDF;
        vm.NavigateToReplaceVersion = NavigateToReplaceVersion;

		vm.toggleAllCommonFiltersSelection = toggleAllCommonFiltersSelection;
		vm.filterSheetsWithSubmittals = filterSheetsWithSubmittals;
		vm.getPDFRectCoordinates = getPDFRectCoordinates;

		vm.SwitchToSubmittals = SwitchToSubmittals;
		vm.SwitchToSchedules = SwitchToSchedules;
        vm.SwitchToProcurementLog = SwitchToProcurementLog;
        vm.SwitchToAllSubmittals = SwitchToAllSubmittals;
		vm.SwitchToScopeOfWork = SwitchToScopeOfWork;
		vm.selectedRegionClicked = selectedRegionClicked;
		vm.pageLoadInitialized = pageLoadInitialized;
		vm.previousPageBtnClicked = previousPageBtnClicked;
		vm.nextPageBtnClicked = nextPageBtnClicked;
		vm.lastPageBtnClicked = lastPageBtnClicked;
		vm.firstPageBtnClicked = firstPageBtnClicked;

		vm.openSchedulesSmartBuild = openSchedulesSmartBuild;
		vm.toggleSidePaneClicked = toggleSidePaneClicked;
		vm.scopeOfWorkPageClicked = scopeOfWorkPageClicked;
		vm.specNameSpecClicked = specNameSpecClicked;
		vm.highlightCombinationOfSubmittals = highlightCombinationOfSubmittals;
        vm.pdfDocumentClicked = pdfDocumentClicked;
        vm.getThumbnailIndexById = getThumbnailIndexById;
        vm.submittalCardClicked = submittalCardClicked;
        vm.smartBuildDisableActions = smartBuildDisableActions;
        vm.smartBuildEnableActions = smartBuildEnableActions;
        vm.GetTypeOfSubmittal = GetTypeOfSubmittal;
        vm.pdfPageRendered = pdfPageRendered;
        vm.movePdfToBottomRightCorner = movePdfToBottomRightCorner;
        vm.downloadCurrentPDF = downloadCurrentPDF;
        vm.scheduleRowClicked = scheduleRowClicked;

        vm.deleteConfirmedSubmittal = deleteConfirmedSubmittal;
        vm.deleteRecommendedSubmittal = deleteRecommendedSubmittal;


		//All Variables goes here
		$scope.visibleColumnsList = [];
		$scope.isAllCollapsed = false;
		$scope.allSubmittalsSelected = false;
		vm.selectAllSubmittals = selectAllSubmittals;
		vm.isAllSpecNamesCollapsed = false;
		vm.isAddFullScreen = false;
        vm.SpecView = "PDFView";
        vm.routeParams = angular.copy($routeParams);
        if(vm.routeParams && !vm.routeParams.openmode) {
            $location.search({});
        }
        vm.submittalsEnum = UtilService.submittalsEnum;
        vm.pvRecord = AuthenticationService.GetPlanViewRecordData();
        vm.sideBarHidden = false;
        vm.isLatestPlanview = true;
        vm.enableUndoButton = false;
        var emptyValuesLabel = "(empty)";

        //Highlight related checkboxes
        vm.highlightAllSubmittals = true;

        vm.numberOfPages = 1;
        vm.currentPageNumber = 0;
        vm.deletedActionLabel = "DELETED";
        vm.movedActionLabel = "MOVE";
        vm.filteredSheetsInfo = {
        		allSheets: {
        			label: 'All Sheets',
        			key: 'all',
        			sheets: []
        		},
        		withSubmittals: {
        			label: 'Sheets With Submittals',
        			key: 'withSubmittals',
        			sheets: []
        		},
        		withoutSubmittals: {
        			label: 'Sheets Without Submittals',
        			key: 'withoutSubmittals',
        			sheets: []
        		},
                withSchedules: {
        			label: 'Sheets With Schedules',
        			key: 'withSchedules',
        			sheets: []
        		},
        		withScanned: {
        			label: 'Raster Sheets (Scanned)',
        			key: 'withScanned',
        			sheets: []
        		},
        		withoutScanned: {
        			label: 'Vector Sheets (Non-scanned)',
        			key: 'withoutScanned',
        			sheets: []
        		},
        		currentfilter: {
        			sheets: []
        		}
    	};
        vm.cardClicked = {recid : 0, type : ''};
        //Following 3 variables are the label names for different submittals. We use these variables for showing the submittal names in different places
        vm.submittalsLabel = 'Submittals';

        vm.highlightSubs = true;
        vm.highlightRecommended= true;
        vm.ShowPypeAICheckbox = true;

        vm.groupBySubmittalsField = 'drawingSheetNumber';

        //Following two variables are specific to pdf viewer
        vm.pdfViewerCursors = { hand : "handTool", smartbuild : "textselection", arrow : "arrow", downloadExcel : "downloadExcel", addProcurement : "addProcurement", addSubmittal : "addSubmittal",
        		appendText : "appendText", addSchedule : "addSchedule"};
        vm.currentSelectedCursor = vm.pdfViewerCursors.hand;
        vm.previousCursorToolbar = angular.copy(vm.currentSelectedCursor);

		$scope.filterFlag = vm.filteredSheetsInfo.allSheets.key;

		//PlanviewFS-2 Methods and Variables
		vm.allSheetsSlider = true;
		vm.selectedFilter = vm.filteredSheetsInfo.allSheets.key;

		vm.deleteMultipleSubmittals = deleteMultipleSubmittals;
		vm.copySubmittalRecord = copySubmittalRecord;
		vm.ignoreAllChecked = false;
		vm.highlightSchedules = true;
		vm.showSubmittalCountLegends = true;
		vm.deletedRectClasses = UtilService.GetDeletedRectangleClass();
		vm.highlightRecordsInPDF = highlightRecordsInPDF;
		vm.switchToScopeOfWorkView = switchToScopeOfWorkView;
		vm.switchToThumnailView = switchToThumnailView;
		vm.togglesubmittalCount = togglesubmittalCount;
		vm.sortSchedules = sortSchedules;
        vm.showProcurementLogIntro = showProcurementLogIntro;

		vm.addNewSheetToPreviousStack = addNewSheetToPreviousStack;
		vm.previousOpenedPageBtnClicked = previousOpenedPageBtnClicked;
		vm.nextOpenedPageBtnClicked = nextOpenedPageBtnClicked;;
        vm.sideBarToggled = sideBarToggled;

		vm.previousSheetStack = [];
		vm.nextSheetStack = [];
		vm.enableAppendTextMsg = "Select Text from Sheet";
		vm.disableAppendTextMsg = "Select Text from Sheet";
		vm.leftTabView = {thumbnail : 'ThumbnailView', ScopeOfWork: 'ScopeOfWorkView'};
        vm.SheetView = vm.leftTabView.thumbnail;
        vm.ManualPlanView = "Manual-PlanView";
        vm.SmartBuildPlanView = "SmartBuild-PlanView";
        $scope.confirmPopupMessage = "Continuing will result in loosing changes. Are you sure you want to continue ?" ;
        $scope.doShowConfirmPopup = false;
        $scope.fullScreeMode = false;
        $scope.unsavedSheetView = false;
        vm.unsavedSheetsPreviousData = [];

        vm.SubmittalSortView = {
    		sheetnumber : {
    			key : 'SheetNumber',
    			label : 'Sheet Number'
    		},
    		specnumber : {
    			key : 'SpecNumber',
    			label : 'Spec Section'
    		},
    		submittaltype : {
    			key : 'SubmittalType',
    			label : 'Submittal Type'
    		},

    		none : {
    			key : 'none',
    			label : 'None'
    		}
        };
        vm.procurementLogSortView = {
        		sheetnumber : {
        			key : 'SheetNumber',
        			label : 'Sheet Number'
        		},
        		specnumber : {
        			key : 'SpecNumber',
        			label : 'Spec Section'
        		},
        		none : {
        			key : 'none',
        			label : 'None'
        		}
            };
        vm.procurementLogView = vm.procurementLogSortView.specnumber.key;
        vm.submittalView = vm.SubmittalSortView.specnumber.key;
        vm.counts = {specNumber : {}, drawingSheetNumber : {}};
        initDataRelToSheetChangeFlow();

        vm.downloadData = downloadData;
        vm.switchSubmittalsSortOrder = switchSubmittalsSortOrder;
        vm.switchProcurementLogsSortOrder = switchProcurementLogsSortOrder;
        vm.allDisciplines =[];
        vm.currentPDFDimensions = {};

        // Filters Related Code

        vm.columnsList = {division : 'divisionCode', specSection : 'specSection', submittalGroup : 'projectSummaryGroup', submittalType : 'specCategory', specCategoryGroup : 'specCategoryGroup', drawingSheetNumber : 'drawingSheetNumber', source: 'source'};
        vm.columnsTotalVarData = {
        		divisionCode : {allVar : 'allDivisions', searchVar : 'searchDivisionCodes', form : 'divisionFormDirty', mapValue : 'divisionCode', mapName : 'Division Code', filterItem : 'divisionFilterItem',  number : 'numberOfDivisions', selectAllVar : "divisionCodeSelectAll"},
        		specSection : {allVar : 'allSpecSections', searchVar : 'searchSpecSections', form : 'specSectionFormDirty', mapValue : 'specSection', mapName : 'Spec Section', filterItem : 'specSectionFilterItem',  number : 'numberOfSpecSections', selectAllVar : "specSectionSelectAll"},
        		projectSummaryGroup : {allVar : 'allProjectSummaryGroups', searchVar : 'searchSubmittalGroups', form : 'submittalGroupFormDirty', mapValue : 'value', mapName : 'Project Summary Group', filterItem : 'projectSummaryGroupsFilterItem',  number : 'numberOfSummaryGroups', selectAllVar : "projectSummaryGroupSelectAll"},
        		specCategory : {allVar : 'allSpecCategories', searchVar : 'searchSubmittalTypes', form : 'specCategoryFormDirty', mapValue : 'value', mapName : 'Submittal Type', filterItem : 'specCategoriesFilterItem',  number : 'numberOfSpecCategories', selectAllVar : "specCategorySelectAll"},
        		specCategoryGroup : {allVar : 'allSpecCategoryGroups', searchVar : 'searchSpecCategoryGroups', form : 'specCategoryGroupFormDirty', mapValue : 'value', mapName : 'Submittal Type Group', filterItem : 'specCategoryGroupFilterItem',  number : 'numberOfSpecCategoryGroups', selectAllVar : "specCategoryGroupSelectAll"},
        		drawingSheetNumber : {allVar : 'allDrawingSheetNumber', searchVar : 'searchDrawingSheetNumber', form : 'drawingSheetNumberFormDirty', mapValue : 'value', mapName : 'Drawing Sheet', filterItem : 'drawingSheetNumberFilterItem',  number : 'numberOfDrawingSheetNumber', selectAllVar : "drawingSheetNumberSelectAll"},
        		source : {allVar : 'allSource', searchVar : 'searchSource', form : 'sourceFormDirty', mapValue : 'value', mapName : 'Source', filterItem : 'sourceFilterItem',  number : 'numberOfSource', selectAllVar : "sourceSelectAll"}
        };


        vm.toggleClearAllFiltersSelection = toggleClearAllFiltersSelection;
        vm.toggleAllDivisionFiltersSelection = toggleAllDivisionFiltersSelection;
        vm.toggleAllSpecSectionFiltersSelection = toggleAllSpecSectionFiltersSelection;
        vm.sliderChanged = sliderChanged;

        vm.addSchedule = addSchedule;
        vm.saveScheduleClicked = saveScheduleClicked;
        vm.cancelUpdateScheduleClicked = cancelUpdateScheduleClicked;
        vm.deleteSchedules = deleteSchedules;
        vm.deleteScheduleClicked = deleteScheduleClicked;
        vm.editScheduleRefClicked = editScheduleRefClicked;
        vm.editScheduleIndxClicked = editScheduleIndxClicked;;
        vm.getPlanVersionIndex = getPlanVersionIndex;

        //vm.pypeAIBtnClicked = pypeAIBtnClicked;

        vm.showIndexsGroupItems = true;
        vm.showReferenceGroupItems = true;
        vm.falseValue = 'false';

        // pype search code here
        vm.planviewSideBarHidden = false;
		vm.planviewRightBarHidden = false;
        vm.togglePlanViewPypeSearch = togglePlanViewPypeSearch;
        vm.pypeSearchStart = pypeSearchStart;
        vm.toolBarOptionsForUser = toolBarOptionsForUser;

        //procurement log related changes added here.
        vm.allProcurementLogsSelected = false;
        vm.selectAllProcurementLogs = selectAllProcurementLogs;
        vm.deleteSelectedProcurementLogs = deleteSelectedProcurementLogs;
        vm.deleteSingleProcurementLog = deleteSingleProcurementLog;
        vm.copySingleProcurementLog = copySingleProcurementLog;
        vm.copyMultipleProcurementLog = copyMultipleProcurementLog;
        vm.openProcurementLogToRegisterModal = openProcurementLogToRegisterModal;
        vm.expandAllProcurementLogs = expandAllProcurementLogs;
        vm.collapseAllProcurementLogs = collapseAllProcurementLogs;
        vm.procurementLogCardClicked = procurementLogCardClicked;

		(function initController() {
            //if (opener && !opener.closed) {
            if(vm.routeParams && vm.routeParams.openmode && vm.routeParams.openmode.toLowerCase() === 'openplanspdf') {
                vm.showOnlyPdfViewer = true;
            }
            var view = AuthenticationService.GetPlanViewView();
            if (view) {
                vm.View = view;
            }
            else {
              vm.View = vm.submittalsEnum.submittals;
            }
			vm.enablePypeSearch = window.scope.vm.enablePypeSearch;
            $rootScope.hideSmartLinks = true;
            localStorage.specViewLoaded = true;
            LoadUserDetails();
            GetCompanyName();
            GetSubmittalTypes();
            getAllLabels();
            getAllDiscipline();
            initializeAllFilterItems();
            LoadSRPlansRecords(function() {
                LoadPlanView();
            });
            sortSchedules('scheduletitle');
        })();


        // function pypeAIBtnClicked(){
        //     var dontShowIntroScreen = AuthenticationService.GetDontShowPypeAIIntroScreen();
        //     showGeneratePypeAIPopup(dontShowIntroScreen, true, function(data){
        //         if (data.dontShowFlag){
        //             AuthenticationService.SetDontShowPypeAIIntroScreen(data.dontShowFlag);
        //         }
        //         if (data.proceed){
        //             postPypeAIGet(data.submittals);
        //
        //             if (data.cancelClick) return;
        //
        //             vm.showSideBarBackdrop = true;
        //             if (data.newSubsCount > 0){
        //                 //new Pype AI Submittals found... So just check the Pype AI checkbox, uncheck submittals checkbox and collapse all results
        //                 vm.highlightSubs = false;
        //                 vm.highlightRecommended = true;
        //                 //Make sure that we add highlight class for particular checkbox to highlight it once user view side bar
        //                 vm.highlightConfirmedPostAIGen = false;
        //                 vm.highlightRecommendedPostAIGen = true;
        //             } else {
        //                 //No new Pype AI Submittals found... Check both the checkboxes and collapse all results
        //                 //Check both the checkboxes
        //                 vm.highlightSubs = true;
        //                 vm.highlightRecommended = true;
        //                 //Make sure that we add highlight class for particular checkbox to highlight it once user view side bar
        //                 vm.highlightConfirmedPostAIGen = true;
        //                 vm.highlightRecommendedPostAIGen = true;
        //             }
        //             //collapse all results
        //             $scope.collapseAllSubs();
        //             vm.showSideBarBackdrop = true;
        //
        //             $timeout(function(){
        //                 //Following block of code will add click event listener to whole document body and it will execute only once and it will automatically remove once used
        //                 document.getElementsByTagName('body')[0].addEventListener('click', function(event){
        //                     vm.showSideBarBackdrop = false;
        //                     vm.highlightConfirmedPostAIGen = false;
        //                     vm.highlightRecommendedPostAIGen = false;
        //                     $scope.$apply();
        //                 }, {once : true});
        //             }, 0);
        //         }
        //     });
        // }

        // function showGeneratePypeAIPopup(dontShowIntroScreen, hideDontShowChkbx, callback){
        // 	var modalInstance = $uibModal.open({
        //         animation: true,
        //         templateUrl: MAINURL
		// 				+ 'views/smartview/planview/planview.pypeai.generationpopup.view.html',
        //         controller: 'PypeAIGenerationController',
        //         size: 'lg',
        //         backdrop: 'static',
        //         keyboard: false,
        //         resolve: {
        //         	items : function() {
        //         		return {project: vm.selectedProject, version: vm.selectedVersion, hideDontShowChkbx: hideDontShowChkbx, dontShowIntroScreen: dontShowIntroScreen,
        //         			recs: vm.recommendedSubmittalsTemp, ShowPypeAICheckbox: vm.ShowPypeAICheckbox}
        //         	}
        //         }
        //     });
        //
        //     modalInstance.result.then(function (data) {
        //     	data.proceed = true;
        //     	callback(data);
        //     }, function (data) {
        //     	callback(data);
        //     });
        // }
        //
        // function postPypeAIGet(data) {
        //     vm.recommendedSubmittals = data.filter(function(item) {
        //         return !item.deleteFlag;
        //     });
		// 	vm.allSubmittals = angular.copy(vm.submittals.concat(vm.recommendedSubmittals));
        //     vm.allSubmittalsNoSort = angular.copy(vm.allSubmittals);
        //
        //     vm.allSubmittals = sortSubmittalsByView(vm.allSubmittals);
        //     vm.allSubmittalsUnchanged = angular.copy(vm.allSubmittals);
        //
        //     prepareSubsDataWithDifferentTypes();
        //     prepareSheetSpecificSubmittals();
        //
        //     getAllSubsAndSchedsCount(true);
        //
        //     vm.ShowPypeAICheckbox = true;
    	// 	createRectangles();
    	// 	vm.highlightRecommended = true;
        // }
        //
        // function getPypeAISubsFileExistsFlag(callback){
        // 	PlanViewService.GetAISubFileExistsFlag(vm.selectedProject.projectId, vm.selectedVersion.versionId, function(response){
        // 		if (response && response.success) {
        // 			vm.ShowPypeAICheckbox = response.data;
        // 		} else {
        // 			FlashService.Error('Problem while getting Pype AI Submittals File Flag');
        // 			vm.ShowPypeAICheckbox = true;
        // 		}
        // 		if (callback) callback();
        // 	});
        // }

        $scope.isRecSubmittalClickable = function(record){
        	if (record.submittalCategory === vm.submittalsEnum.recommended){
        		if (record.mergedCoordinates && record.mergedCoordinates.length > 0){
        			//1) MergedCoordinates present and Not Zero Coordinates - true
        			//2) MergedCoordinates present and Zero Coordinates - false
        			return !zeroCoords(record.mergedCoordinates[0]);
        		} else if ((!record.mergedCoordinates || record.mergedCoordinates.length === 0) && record.coordinates && record.coordinates.length > 0){
        			//3) MergedCoordinates not present and coordinates present and Not Zero Coordinates - true
        			//4) MergedCoordinates not present and coordinates present and Zero Coordinates - false
        			return !zeroCoords(record.coordinates[0]);
        		}
        		return false;
        	}
        	return true;
        }

        function zeroCoords(coords){
            if (coords[0] === 0 && coords[1] === 0 && coords[2] === 0 && coords[3] === 0) return true;
            return false;
        }


	 // PYPE SEARCH CODE STARTS HERE
		 function pypeSearchStart() {
			if(!vm.user.isSuperAdmin && window.scope.vm.smartviewType == 'planview')
				toolBarOptionsForUser(true);
			$rootScope.searchClicked = true;
        	$rootScope.enablePypeSearch = "MAX";
        	$rootScope.$broadcast("EnablePypeSearch", $rootScope.enablePypeSearch);
        	$rootScope.toggleClass = false;
         }

		 function toolBarOptionsForUser(hidden) {
			    var iframe = document.getElementsByClassName('pdfviewer-container');
				var blockingIds = ["nextOpenedPage" , "previousOpenedPage", "addSubmittal", "downloadExcel", "showPlanBuildIntro"];
			    var blockingClasses = ["page-container"];
			    // removing blocking classes
			    for(var i = 0; i < blockingClasses.length; i++) {
			    	if(hidden) {
				    	   iframe[0].contentWindow.document.getElementsByClassName(blockingClasses[i])[0].classList.add('hidden');
				    	} else {
				    	   iframe[0].contentWindow.document.getElementsByClassName(blockingClasses[i])[0].classList.remove('hidden');
				    	}
			    }
			    // removing blocking Ids
				for(var i = 0; i < blockingIds.length; i++) {
			    	if(hidden) {
			    	   iframe[0].contentWindow.document.getElementById(blockingIds[i]).classList.add('hidden');
			    	} else {
			    	   iframe[0].contentWindow.document.getElementById(blockingIds[i]).classList.remove('hidden');
			    	}
			    }
		 }

		 $rootScope.$on('EnablePypeSearch', function (event, data) {
	        	$rootScope.enablePypeSearch = data;
	        	if(data == false) {
	        		removeThumbnail();
	        		vm.sideBarHidden = false;
	        		toggleSidePaneClicked();
	        		toolBarOptionsForUser(false);
	        	} else if(data == "MAX") {
	        		vm.sideBarHidden = true;
	        		toggleSidePaneClicked();
	        	}
         });

		 $rootScope.$on('HighlightPlansPdf', function (event, data) {
			 openPypeSearchRecordInPlanView();
		 });

		 function togglePlanViewPypeSearch(search) {
			 $timeout(function(){
	        	if(search === 'MAX') {
	        		$rootScope.enablePypeSearch = 'MIN';
	        		vm.sideBarHidden = false;
	        		vm.toggleSidePaneClicked();
	        	} else if(search === 'MIN') {
	        		$rootScope.enablePypeSearch = 'MAX';
	        		vm.sideBarHidden = true;
	        		vm.toggleSidePaneClicked();
	        	}
	        	$rootScope.$broadcast($rootScope.enablePypeSearch);
			 }, 0);
	     }
	// PYPE SEARCH CODE ENDS HERE

         function getPlanVersionIndex() {
             if(vm.selectedProject.planVersions) {
                 return UtilService.findWithAttr(vm.selectedProject.planVersions, 'versionId', vm.selectedVersion.versionId);
             }
             return -1;
         }


        function LoadSRPlansRecords(callback) {
            var project = AuthenticationService.GetProject();
            var version = AuthenticationService.GetVersion();
        	vm.smartRegPlansSubmittals = [];
            vm.dataLoading = vm.showOnlyPdfViewer ? "Loading... Please Wait.." : "Loading PlanView... Please Wait..";
            vm.MaxRecId = 0;
            SmartRegisterService.GetByProjectId(project.projectId, version.versionId, function (response) {
                if (response.success && response.data) {
                    vm.smartRegAllSubmittals = response.data.smartRegisterRecords;
                    if(vm.smartRegAllSubmittals && vm.smartRegAllSubmittals.length>0) {
                        vm.MaxRecId = getMaxRecId(vm.smartRegAllSubmittals);
                        vm.smartRegPlansSubmittals = vm.smartRegAllSubmittals.filter(function(item) {
                            return item.sourceModule && (['plans', 'procurementlog'].indexOf(item.sourceModule.toLowerCase()) > -1);
                        });
                        if (vm.smartRegPlansSubmittals.length > 0) {
                            vm.smartRegPlansSubmittals.forEach(function(sub){
                            	sub.submittalCategory = vm.submittalsEnum.submittals;
                            });
                        }
                    }
                }
                callback();
            });
        }

		function switchToThumnailView(view){
			vm.SheetView = view;
			$timeout(function(){
				scrollToSpecificSheetThumbnail();
			}, 0);
		}

		function switchToScopeOfWorkView(view){
			vm.SheetView = view;
			$timeout(function(){
				scrollToSpecificElementWithAnimation('#scopeOfWorkContainer', '#'+ vm.selectedItem.file.sheettype_s + "-" + $scope.replaceSpecialCharacters(vm.selectedItem.page.filename) + "-" +vm.selectedItem.page.pagenumber_i, true);
			}, 0);
		}

		function togglesubmittalCount() {
			vm.showSubmittalCountLegends = !vm.showSubmittalCountLegends;
		}


		function getThumbnailIndexById(id, sheetsList){
			var sheet = null;
			if (!sheetsList) sheetsList = vm.filteredSheetsInfo.currentfilter.sheets;
			for (var ind = 0; ind < sheetsList.length; ind++){
				sheet = sheetsList[ind];
				if ($scope.replaceSpecialCharacters(sheet.filename) + sheet.pagenumber_i === id){
					return ind;
				}
			}
		}

		function getPage(filename, pagenumber){
			for (var i = 0; i< vm.originalSheetsAll.length; i++){
				for (var j = 0; j< vm.originalSheetsAll[i].pages.length; j++){
					if (vm.originalSheetsAll[i].pages[j].filename === filename && parseInt(vm.originalSheetsAll[i].pages[j].pagenumber_i) === parseInt(pagenumber)){
						return vm.originalSheetsAll[i].pages[j];
					}
				}
			}
		}
		function scopeOfWorkPageClicked(page, file, fromThumbnail , dontAddToStack , islistViewClicked, fromSheetUpdateFlow, doNotloadPdfFlag) {
			// closing edit popover when switching thumbnail
			$scope.myPopover2.close();
            $scope.selectedScheduleRow = null;
            if(vm.selectedSubmittalItem) {
                var index = getSubmittalIndex(vm.selectedSubmittalItem, vm.allSubmittals);
                cancelSubmittalChanges(vm.selectedSubmittalItem, index);
                vm.selectedSubmittalItem = null;
            }
			// remove the search text in sidebar when user switch from thumbnail and This Sheet selected
			if(!vm.allSheetsSlider) {
				vm.searchSidebar = "";
			}
			if (!file){
				file = getFileByPage(page);
			}
			vm.selectedItem = {file : file, page : page, spec : null};

			var fit = '#view=fit';

			prepareSheetSpecificSubmittals();
			prepareSheetSpecificSchedules();

            updateSheetNums();
            vm.cardClicked = {recid : 0, type : ''};

            highlightCombinationOfSubmittals(true, false, '', fromThumbnail , dontAddToStack , islistViewClicked, fromSheetUpdateFlow, doNotloadPdfFlag);
			AuthenticationService.SetPlanViewSheetData({ file : vm.selectedItem.file, page : vm.selectedItem.page});
		}

        function deleteConfirmedSubmittal(record) {
            var message = "Are you sure you want to delete?";
            var title = "Confirm Delete";
            ModalService.OpenConfirmModal(title, message, false)
            .result.then(function () {
                var deletedRecordIndex = $.map(vm.allSubmittals, function (obj, index) {
                    if (obj.recid == record.recid) { return index; }
                })[0];
                var changes = [];
                changes.push({ action: "Deleted", oldRecord: vm.allSubmittals[deletedRecordIndex] });
                vm.dataLoading = 'Deleting Submittal...Please wait...';
                SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "PlanView",
                        [], [], [], [vm.allSubmittals[deletedRecordIndex]], [], changes, function (response) {
                            if (response.success) {
                                var recs = [];
         	                    recs.push(vm.allSubmittals[deletedRecordIndex]);

                                var deleteRecord = angular.copy(vm.allSubmittals[deletedRecordIndex]);
                                // Remove it from All Submittals
                                vm.allSubmittals.splice(deletedRecordIndex, 1);

                                // Remove it from All No Sorted Submittals As well
                                var deletedIndex = $.map(vm.allSubmittalsNoSort, function (obj, index) {
                                    if (obj.recid === record.recid) {
                                        return index;
                                    }
                                })[0];
                                if(deletedIndex) {
                                    vm.allSubmittalsNoSort.splice(deletedIndex, 1);
                                }

                                FlashService.Success("Deleted successfully.");
                                postSubmittalChangeActions();
         	               	    updateThumbnailsSubmittalCountInMultipleSheets(recs);

                                //LOGGING EVENT
                                LogEvent("Delete SmartRegister Submittal", "User deleted SmartRegister Submittal " + "Spec Section : '" + deleteRecord.specNumber
                                    + "' Spec Name : '" + deleteRecord.specName + "' ParaCode : '" + deleteRecord.paraCode + "' Successfully", "SUCCESS");
                            } else {
                                FlashService.Error(response.message || "Delete Failed. Please contact support.");
                                //LOGGING EVENT
                                LogEvent("Delete SmartRegister Submittal", "User unable to delete SmartRegister Submittal " + "Spec Section : '" + vm.allSubmittals[deletedRecordIndex].specNumber
                                    + "' Spec Name : '" + vm.allSubmittals[deletedRecordIndex].specName + "' " + response.message, "FAILED");
                            }
                            vm.dataLoading = false;
                });
            }, function() {});
        }

        function deleteRecommendedSubmittal(record, callback) {
            var indexes, recommendedIndexes = [], recommendedRecids = [];
            var message = "Are you sure you want to delete?";
            var title = "Confirm Delete";
            if(!callback) {
                ModalService.OpenConfirmModal(title, message, false)
                .result.then(function () {
                    for(var i=0; i<vm.allSubmittals.length; i++) {
                        if(vm.allSubmittals[i].recid === record.recid) {
                            recommendedIndexes.push(i);
                        }
                    }
                    recommendedRecids.push(record.recid);
                    indexes =  {recommendedIndexes : recommendedIndexes, recommendedRecids : recommendedRecids};
                    vm.dataLoading = 'Deleting Recommended Submittal...Please wait...';
                    deleteMultipleRecommendedSubmittals(indexes, false, callback);
                }, function() {});
            } else {
                PlanViewService.deleteMultipleRecSubmittals(vm.selectedProject.projectId,
                    vm.selectedVersion.versionId, [record.recid], function (response) {
                        if (response.success) {
                            if(callback) {
                                callback(true);
                            }
                            vm.dataLoading = false;
                        }
                });
            }
        }

		function deleteMultipleSubmittals() {
              var allSubmittalsCopy = angular.copy(vm.allSubmittals);
			  var indexes = getMulitpleIgnoredRecData(vm.allSubmittals);
			  if (indexes.submittalIndexes.length===0 && indexes.recommendedIndexes.length === 0) {
				  FlashService.Error("Please select at least one submittal to delete.");
				  return ;
			  }

              var message = "Are you sure you want to Delete the selected submittals?<br/>Clicking on yes will delete and save the changes automatically.<br/>";
              var title = "Delete submittal?";
              ModalService.OpenConfirmModal(title, message, false)
              .result.then(function () {
                  vm.dataLoading = 'Deleting Submittals...Please wait...';
                  if(indexes.submittalIndexes && indexes.submittalIndexes.length>0) {
                      deleteMultipleConfirmedSubmittals(indexes, function() {
                          deleteMultipleRecommendedSubmittals(indexes, true);
                      });
                  } else {
                      deleteMultipleRecommendedSubmittals(indexes);
                  }
              }, function() {});
		}

        function deleteMultipleConfirmedSubmittals(indexes, callback) {
            var oldRecord, changes = [], records = [];
			for(var subIndex = 0; subIndex< indexes.submittalIndexes.length; subIndex++) {
				 oldRecord = vm.allSubmittals[indexes.submittalIndexes[subIndex]];
	             records.push(oldRecord);
	             changes.push({ action: "Deleted", newRecord: null, oldRecord : oldRecord });
			}

            SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "PlanView",
                    [], [], [], records, [], changes, function (response) {
                        if (response.success) {
                            postDeleteSubmittalActions(indexes.submittalIndexes, records);
                            if(!indexes.recommendedIndexes || indexes.recommendedIndexes.length === 0) {
                                FlashService.Success("Successfully deleted the submittals");
                            }

                            //LOGGING EVENT
                            LogEvent("Delete SmartRegister Submittal", "Deleted SmartRegister submittals Successfully", "SUCCESS");
                        } else {
                            FlashService.Error(response.message || "Delete Failed. Please contact support.");
                        }
                        //vm.dataLoading = false;
                        if(callback) {
                            callback();
                        }
            });
        }

        function deleteMultipleRecommendedSubmittals(indexes, deleteBothTypes, callback) {
            var records = [];
            // Again get updated recommendedIndexes, in case of multi-delete,
            // where we came after deleting confirmed submittals as vm.allSubmittals gets altered
            if(deleteBothTypes) {
                indexes = getMulitpleIgnoredRecData(vm.allSubmittals);
            }
            if(indexes.recommendedIndexes && indexes.recommendedIndexes.length > 0) {
    			for(var subIndex = 0; subIndex< indexes.recommendedIndexes.length; subIndex++) {
    	             records.push(vm.allSubmittals[indexes.recommendedIndexes[subIndex]]);
    			}
                PlanViewService.deleteMultipleRecSubmittals(vm.selectedProject.projectId, vm.selectedVersion.versionId, indexes.recommendedRecids, function (response) {
                    if (response.success) {
                        if(callback) {
                            callback(true);
                        } else {
                            postDeleteSubmittalActions(indexes.recommendedIndexes, records);
                            FlashService.Success("Successfully deleted the submittals");
                        }

                    } else {
                        if(callback) {
                            callback(false);
                        } else {
                            FlashService.Error(response.message || "Delete Failed. Please contact support.");
                        }
                    }
                    vm.dataLoading = false;
                });
            } else {
                vm.dataLoading = false;
            }
        }

        function postDeleteSubmittalActions(indexes, records) {
            var allSubmittalsCopy = angular.copy(vm.allSubmittals);
            // Remove it from (All Submittals) AND (All No Sorted Submittals) List
            if($scope.allSubmittalsSelected) {
                vm.allSubmittals = [];
                vm.allSubmittalsNoSort = [];
            } else {
                removeDeletedSubmittalsFromList(vm.allSubmittals, records);
                removeDeletedSubmittalsFromList(vm.allSubmittalsNoSort, records);
            }

            var recs = [];
            for(var index = 0; index < indexes.length; index++){
                allSubmittalsCopy[indexes[index]].deleteFlag = true;
                allSubmittalsCopy[indexes[index]].selected = false;
                recs.push(allSubmittalsCopy[indexes[index]]);
            }
            postSubmittalChangeActions();
            updateThumbnailsSubmittalCountInMultipleSheets(recs);
        }

        function removeDeletedSubmittalsFromList(submittals, ignored) {
            ignored.forEach(function(item1) {
                for(var i=0; i<submittals.length; i++) {
                    if(item1.recid === submittals[i].recid) {
                        submittals.splice(i, 1);
                        break;
                    }
                }
            });
        }

		function scopeOfWorkSpecClicked(spec, page, file){
			if (spec && (spec.specName || spec.specNumber)) { // Make sure you have at least one value in spec object
				if (file === null){
					file = getFileByPage(page);
				}
				var sheetLoadRequired = vm.selectedItem.page ? (vm.selectedItem.page.pagenumber_i !== page.pagenumber_i || vm.selectedItem.page.filename !== page.filename) : true;
				vm.selectedItem = {file : file, page : page, spec : spec};
				postSubmittalChangeActions();

	            updateSheetNums();
				//We are going to get the coordinates for the spec in future, we can pass the zoomstring as a parameter for below method once we get it
	            highlightCombinationOfSubmittals(sheetLoadRequired);
				AuthenticationService.SetPlanViewSheetData({ file : vm.selectedItem.file, page : vm.selectedItem.page});
			} else {
				scopeOfWorkPageClicked(page, file);
			}
		}

		function specNameSpecClicked(spec){
			scopeOfWorkSpecClicked(spec, spec.pages[0], null);
			vm.currentPageNumber = 0;
			vm.numberOfPages = spec.pages.length;
		}

		function pdfPageRendered(){
            if(vm.showOnlyPdfViewer && vm.routeParams && vm.routeParams.schedule) {
                goToSchedulesAndHighlight();
            }
            var PlanViewRecord = angular.copy(AuthenticationService.GetPlanViewRecordData());
			if(PlanViewRecord) {
                if(!vm.showOnlyPdfViewer) {
                    AuthenticationService.SetPlanViewRecordData('');
                }
			}
		}

		function scrollToSpecificSheetThumbnail(fromSheetUpdateFlow){
			if (!window.scope.$$childHead.vm.selectedItem || !window.scope.$$childHead.vm.selectedItem.page) return ;
			var sheet = window.scope.$$childHead.vm.selectedItem.page, sheetsList = vm.filteredSheetsInfo.currentfilter.sheets;
			var rh = $('.pype-thumbnail-container') ? $('.pype-thumbnail-container').height() : 162; // height of the thumbnail container
			var thumbnailId = $scope.replaceSpecialCharacters(sheet.filename) + sheet.pagenumber_i;
			if (fromSheetUpdateFlow) sheetsList = vm.filteredSheetsList;
			var thumbInd = vm.getThumbnailIndexById(thumbnailId, sheetsList);
			var cScrollTop = rh*thumbInd;

			$timeout(function(){
				//$('#pypeThumbnailsView').animate({scrollTop: cScrollTop}, 800);
				$('#pypeThumbnailsView').scrollTop(cScrollTop);
			}, 0);
		}

		function callZoomToXY(zoomString){
			var obj = {zoom : 0, x : 0, y : 0};
			var zoomStrings = zoomString.split(',');
			obj.zoom = zoomStrings[0];
			obj.x = parseInt(zoomStrings[1]);
			obj.y = parseInt(zoomStrings[2]);
			sendPostMsgToIframe('zoomToXY', obj);
		}

		function downloadCurrentPDF() {
            vm.dataLoading = 'Downloading...Please wait...';
			var actualUrl = APIURL + 'downloadresource/sheet/project/' + vm.selectedProject.projectId + '/version/' + vm.selectedVersion.versionId +
			'/filename/'+ encodeURIComponent(vm.selectedItem.page.filename) + '/pagenumber/' + vm.selectedItem.page.pagenumber_i + '/'+ vm.highlightSubs + '/true/' + vm.highlightRecommended + '/true';
            DownloadService.downloadAndSaveFile(actualUrl, null, 'Successfully downloaded the file', function(response) {
                if(response.success) {
                    FlashService.Success(response.message);
                } else {
                    FlashService.Error(response.message);
                }
                vm.dataLoading = false;
            });
			LogEvent("Download Planview Sheet", "User has downloaded " + vm.selectedItem.page.pagelabel_s + " - "+ vm.selectedItem.page.pagename_s + " sheet from PlanView", "SUCCESS");
		}

		function highlightCombinationOfSubmittals(loadPDF, zoomString, clickedCardObj, isThumbnailClicked, dontAddToStack , islistViewClicked, fromSheetUpdateFlow, doNotloadPdfFlag) {
			vm.cardClicked = clickedCardObj;
			vm.previousZoomString = zoomString;
			var page = vm.selectedItem.page, pdfParams = '#view=fit';
			if (zoomString) pdfParams = '#' + zoomString;

			if (loadPDF) {
				if(!dontAddToStack)
					addNewSheetToPreviousStack(vm.selectedItem.page);

                if(!doNotloadPdfFlag) { setTrustedUrl(page, pdfParams); }

				if (!isThumbnailClicked) scrollToSpecificSheetThumbnail(fromSheetUpdateFlow);
				if (!islistViewClicked) {
					scrollToSpecificElementWithAnimation('#scopeOfWorkContainer', '#'+ vm.selectedItem.file.sheettype_s + "-" + $scope.replaceSpecialCharacters(vm.selectedItem.page.filename) + "-" +vm.selectedItem.page.pagenumber_i, true);
				}
				if (zoomString) callZoomToXY(zoomString);
			} else {
				sendPostMsgToIframe('updateSubsCheckboxesNNumbers', '');
				if (zoomString) callZoomToXY(zoomString);
			}
		}

        function setTrustedUrl(page, pdfParams) {
            var url = APIURL + 'downloadresource/sheet/project/' + vm.selectedProject.projectId + '/version/' + vm.selectedVersion.versionId +
                            '/filename/'+ encodeURIComponent(page.filename) + '/pagenumber/' + page.pagenumber_i + '/false/false/false/false';
            // DownloadService.getUrlWithTempAuthToken(url, PYPECUSTOMPDFJSURL, pdfParams, null, function(urlWithToken) {
            //     $scope.trustedUrl = $sce.trustAsResourceUrl(urlWithToken);
            // });
        }

		function highlightRecordsInPDF() {
			sendPostMsgToIframe('createRectangles', '');
			vm.selectAllSubmittals(false);
			prepareQuickFiltrDataNComboOptions(vm.filteredItems);
		}

		function sliderChanged() {
			sendPostMsgToIframe('createRectangles', '');
			prepareQuickFiltrDataNComboOptions(vm.filteredItems);
		}

		$scope.highlightSearchKeyword = function(text, search) {
		    if (!search) {
		        return $sce.trustAsHtml(text);
		    }
		    return $sce.trustAsHtml(text.replace(/\n/g, " ").replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>'));
		};

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

		function scrollToSelectedSheetWithAnimation(){
			//Following block of code will scroll to the particular selected item so that user can see it in the view
			if (vm.SheetView === 'ScopeOfWorkView') {
				var id = vm.selectedItem.file.sheettype_s + '-' + $scope.replaceSpecialCharacters(vm.selectedItem.page.filename) + '-' + vm.selectedItem.page.pagenumber_i;
	            if (vm.selectedItem.spec){
	            	id = id + '-' + $scope.replaceSpecialCharacters(vm.selectedItem.spec.specName) + '-' + vm.selectedItem.spec.specNumber;
	            }
			}
			else if(vm.SheetView === 'DefaultView') {
			   var id = '-' + $scope.replaceSpecialCharacters(vm.selectedItem.page.filename) + '-' + vm.selectedItem.page.pagenumber_i;
			}

			else {
				var specNum = '', specName = '';
	            if (vm.selectedItem.spec){
	            	specNum = vm.selectedItem.spec.specNumber ? vm.selectedItem.spec.specNumber : '';
	            	specName = vm.selectedItem.spec.SpecName ? vm.selectedItem.spec.SpecName : '';
	            }
	            var id = 'sheets-' + specNum + '-' + $scope.replaceSpecialCharacters(specName) + '-' + $scope.replaceSpecialCharacters(vm.selectedItem.page.filename) + '-' + vm.selectedItem.page.pagenumber_i;
			}

            $timeout(function(){
        		scrollToSpecificElementWithAnimation('#scopeOfWorkContainer','#' + id, true);
        	}, 0);
		}

		function pdfDocumentClicked(){
			$('#closeSheetBtn').click();
		}

        function pageLoadInitialized(){
        	updateSheetNums();
        }

        function updateSheetNums(){
        	vm.currentNumOfSheets = getCurrentNumberOfSheets();
        	vm.currentSheetNum = getCurrentSheetNumber();
        	sendPostMsgToIframe('updatePagination', '');
        }

        function nextPageBtnClicked(fromSheetUpdateFlow){
        	var sheetsList = vm.filteredSheetsInfo.currentfilter.sheets;
        	if (fromSheetUpdateFlow) sheetsList = vm.filteredSheetsList;

        	var pageIndex = getPageIndex(sheetsList, vm.selectedItem.page);
        	if (pageIndex !== -1 && pageIndex < sheetsList.length - 1) {
        		scopeOfWorkPageClicked(sheetsList[pageIndex + 1], false, false, false, false, fromSheetUpdateFlow);
        		return pageIndex + 1;
        	} else if (pageIndex === -1){
        		scopeOfWorkPageClicked(sheetsList[0]);
        		return 0;
        	} else if(pageIndex === sheetsList.length - 1){
        		return pageIndex+1;
        	}
        	return pageIndex;
        }

        function previousPageBtnClicked(fromSheetUpdateFlow){
        	var sheetsList = vm.filteredSheetsInfo.currentfilter.sheets;
        	if (fromSheetUpdateFlow) sheetsList = vm.filteredSheetsList;

        	var pageIndex = getPageIndex(sheetsList, vm.selectedItem.page);
        	if (pageIndex > 0) {
        		scopeOfWorkPageClicked(sheetsList[pageIndex - 1], false, false, false, false, fromSheetUpdateFlow);
        		return pageIndex - 1;
        	} else if (pageIndex === -1){
        		scopeOfWorkPageClicked(sheetsList[0]);
        		return 0;
        	} else if (pageIndex === 0) {
        		return pageIndex - 1;
        	}
        	return pageIndex;

        }

        function firstPageBtnClicked(){
        	if(vm.filteredSheetsInfo.currentfilter.sheets.length > 0)
        		scopeOfWorkPageClicked(vm.filteredSheetsInfo.currentfilter.sheets[0]);
        }

        function lastPageBtnClicked(){
        	if(vm.filteredSheetsInfo.currentfilter.sheets.length > 0)
        		scopeOfWorkPageClicked(vm.filteredSheetsInfo.currentfilter.sheets[vm.filteredSheetsInfo.currentfilter.sheets.length - 1]);
        }

        $scope.$watch('vm.sideBarHidden', function(value){
        	//console.log(value);
        }, true);

        $scope.$watch('vm.filteredItems', function(value){
        	if(value && value.length > 0) {
        	   prepareQuickFiltrDataNComboOptions(vm.filteredItems, true);
        	}
        }, true);

        $scope.$watch('vm.appendToItem', function(value){
        	if (value == false && (vm.currentSelectedCursor === vm.pdfViewerCursors.arrow ||
        			vm.currentSelectedCursor === vm.pdfViewerCursors.appendText || vm.currentSelectedCursor === vm.pdfViewerCursors.smartbuild)){
        		sendPostMsgToIframe('DisableAppendSelectText', '');
        	}
        });

        function expandRightPane(){
        	var slideScreenBtn = $('button#resizer-image'), sideBar = $('#sidebar');
			if (vm.sideBarHidden && slideScreenBtn && slideScreenBtn.length>0) {
				slideScreenBtn[0].click();
			}
        }

        function removeThumbnail() {
        	$("#wrapper-planview").removeClass("thumbnail-toggled");
        	$('.thumbnail-resizer >  .pype-search-toggle-btn > .resizer-image > i').toggleClass('fa-angle-double-right');
        	vm.thumbnailToggled = false;
        }

        vm.thumbnailToogled = function() {
            $("#wrapper-planview").toggleClass("thumbnail-toggled");
            $('.thumbnail-resizer > .pype-search-toggle-btn > .resizer-image > i').toggleClass('fa-angle-double-right fa-angle-double-left');
            if ($("#wrapper-planview").hasClass('thumbnail-toggled')) {
                vm.thumbnailToggled = true;
                $timeout(function(){
                    scrollToSpecificSheetThumbnail();
                    scrollToSpecificElementWithAnimation('#scopeOfWorkContainer', '#'+ window.scope.$$childHead.vm.selectedItem.file.sheettype_s + "-" + $scope.replaceSpecialCharacters(window.scope.$$childHead.vm.selectedItem.page.filename) + "-" +window.scope.$$childHead.vm.selectedItem.page.pagenumber_i, true);
                }, 100); //This delay is actually same as the animation time for thumbnail view toggle
            } else {
                vm.thumbnailToggled = false;
            }
        }

        function sideBarToggled() {
        	$("#wrapper-planview").toggleClass("toggled");
			$('.planview-resizable > .resizer-image> i').toggleClass('fa-angle-double-right fa-angle-double-left');
			vm.sideBarHidden = angular.copy(!vm.sideBarHidden);
        }

	    function toggleSidePaneClicked(e){
        	if(e) e.preventDefault();
        	var $resizerIcon = $('#resizer-image>.fa');
        	if (vm.sideBarHidden){
        		$resizerIcon.removeClass('fa-angle-double-left');
        		$resizerIcon.addClass('fa-angle-double-right');
        		$("#wrapper-planview").removeClass('toggled');
        	} else {
        		$resizerIcon.removeClass('fa-angle-double-right');
        		$resizerIcon.addClass('fa-angle-double-left');
        		$("#wrapper-planview").addClass('toggled');

        	}
        }


		function getFileIndexByPage(page){
			for (var i = 0; i< vm.originalSheetsAll.length; i++){
				for (var j = 0; j< vm.originalSheetsAll[i].pages.length; j++){
					if (vm.originalSheetsAll[i].pages[j].filename === page.filename && vm.originalSheetsAll[i].pages[j].pagenumber_i == page.pagenumber_i){
						return i;
					}
				}
			}
			return -1;
		}

		function getFileByPage(page){
			var fileIndex = getFileIndexByPage(page);
			return vm.originalSheetsAll[fileIndex];
		}

		function getCurrentSheetNumber(){
			var count = 1;
			if (!vm.filteredSheetsInfo.currentfilter.sheets || vm.filteredSheetsInfo.currentfilter.sheets.length <= 0) return count;
			for (var i = 0; i < vm.filteredSheetsInfo.currentfilter.sheets.length; i++){
				if (vm.filteredSheetsInfo.currentfilter.sheets[i].filename === vm.selectedItem.page.filename && vm.filteredSheetsInfo.currentfilter.sheets[i].pagenumber_i == vm.selectedItem.page.pagenumber_i){
					return count;
				} else {
					count++;
				}
			}
			return count;
		}

		function getCurrentNumberOfSheets() {
			if (!vm.filteredSheetsInfo.currentfilter.sheets || vm.filteredSheetsInfo.currentfilter.sheets.length <= 0) return 0;
			return vm.filteredSheetsInfo.currentfilter.sheets.length;
		}

		$scope.$on('vsRepeatInnerCollectionUpdated', function(event, index) {
			if (event.targetScope.thumbnailRepeater) {
				var start = event.targetScope.vsRepeat.startIndex;
				var end = event.targetScope.vsRepeat.endIndex;
				processPostThumbnailRender(event.targetScope.$vs_collection, start, end);
			}
        });

		function processPostThumbnailRender(collection, start, end){
			//Check if all the sheets from start index to end index is having thumbs
			var sheets = getSheetsWithoutThumbnails(collection, start, end), range = 0, fileIndex = -1;
			if (sheets && sheets.length <= 0) { // No sheets means not required to make API call since we already have thumbnails in all sheets
				return;
			}

			getThumbnailsBySheets(sheets, function(updatedSheets){
				if (updatedSheets && updatedSheets.length > 0) {
					range = end - start;
					for (var i = 0; i < updatedSheets.length; i++){
						fileIndex = getPageIndex(vm.filteredSheetsInfo.currentfilter.sheets, updatedSheets[i]);
						if (fileIndex === -1) continue;
						vm.filteredSheetsInfo.currentfilter.sheets[fileIndex].thumbnaildata = updatedSheets[i].thumbnaildata;
					}
				}
			});
		}

		function getThumbnailsBySheets(sheets, callback){
			ProjectService.GetThumbnailSheets(vm.selectedProject.projectId, vm.selectedVersion.versionId, sheets, function(response){
				if (response && response.success) {
					callback(response.data);
				} else {
					FlashService.Error(response ? response.message : 'Problem while fetching thumbnails');
					callback([]);
				}
			});
		}

		function getSheetsWithoutThumbnails(thumbnailsList, start, end){
			var sheetsList = [], isSheetWithoutThumbPresent = false, range = end - start, thumbnailSheets = angular.copy(thumbnailsList);
			for (var i = 0; i < range; i++) {
				if (thumbnailSheets[i]) {
					if (!thumbnailSheets[i].thumbnaildata){
						delete thumbnailSheets[i].hasSubmittals;
						delete thumbnailSheets[i].submittalsCount;
						sheetsList.push(thumbnailSheets[i]);
					}
				}
			}
			return sheetsList;
		}

		function getFileNamePlusSheet(){
			var originalFileName = vm.selectedItem.page.filename;
			var fileName = originalFileName.substring(0, originalFileName.lastIndexOf("."));
			return encodeURIComponent(fileName) + " " + vm.selectedItem.page.pagenumber_i + ".pdf";
		}

        function setMinimizedWindowDimensionsToDefault() {
            $('#procurementMinWindow').hide();
            $('.procurementMinWindow').css('bottom', 'auto');
            $('.procurementMinWindow').css('right', 'auto');
            $('.procurementMinWindow').css('top', '30px');
            $('.procurementMinWindow').css('left', '0');
            $('.procurementMinWindow').css('width', '90%');
            $('.procurementMinWindow').css('height', '540px');
            $('.procurementMinWindow').css('margin-left', '5%');
            $('.procurementMinWindow').css('margin-right', '5%');
        }

		function getPDFRectCoordinates(coordinates, floatCoordinates, pdfDimensions, fileDownloadType) {
			$scope.coordinates = coordinates;
			var fileNamePlusSheet = getFileNamePlusSheet();
			if(!vm.appendToItem && !vm.addScheduleItem) {
			  if(fileDownloadType === "downloadExcel") {
		    	$uibModal.open({
                    animation: true,
                    templateUrl: MAINURL + 'views/smartview/planview/download.pdfselection.view.html',
                    controller: 'DownloadTableController',
                    size: 'xl',
                    backdrop: 'static',
                    windowClass: 'extractDataPopupClass planview-modal-xl download-highlighted-region-popup',
                    resolve: {
                    	items : function(){
                            return {
                                project: vm.selectedProject, version: vm.selectedVersion,
                                coordinates: coordinates, fileNamePlusSheet: fileNamePlusSheet,
                                selectedSheet : vm.selectedItem.page
                            }
                    	}
                    }
                });
			} else if (fileDownloadType === "addProcurement") {
                vm.disablePLIconOnPdf = true;
                $rootScope.pLogTableExtracted = true;

                sendPostMsgToIframe('disablePLIconOnPdf', true);
                $('.resizer-image').addClass('disable-div-more');
                $('.smart-search-filter-icon').addClass('disable-div-more');
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: MAINURL + 'views/smartview/planview/procurementedit.popup.view.html',
                    controller: 'ProcurementLogEditController',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'procurementedit-popup resizerWindow',
                    resolve: {
                        items : function(){
                    		return {
                                project: vm.selectedProject, version: vm.selectedVersion,
                                coordinates: coordinates, fileNamePlusSheet: fileNamePlusSheet,
                                selectedSheet : vm.selectedItem.page, masterSpecData: vm.masterSpecData,
                                selectedSchedule: vm.selectedSchedule
                            }
                    	}
                    }
                });

                modalInstance.rendered.then(function () {
                    $uibModalStack.getTop().value.modalDomEl.attr('id', 'addProcureLog');
                    $('#procurementMinWindow').show();
                    $('.modal-backdrop').hide();
              		$('.procurementMinWindow').append($uibModalStack.getTop().value.modalDomEl);
                });

                modalInstance.result.then(function(data) {
                    if(data) {
                        sideBarToggled();
                        $("#wrapper-planview").addClass("toggled");
                        LoadSRPlansRecords(function() {
                            LoadPlanView();
                        });
                        loadProcurementLog(vm.selectedVersion.versionId,function(response){
                    		vm.View = vm.submittalsEnum.procurementlog;
                    		$timeout(function(){
                    			var addedProcurementLogs = getRecentlyUpdatedProcurementLogs(vm.procurementLogs,response.data.updatedTime);
                    			addedProcurementLogs.forEach(function(item){
                    				item.isHighlighted = true;
                    				expandProcurementCardGroup(item);
                    			});
                    		},0);
                        });

                    }
                    vm.disablePLIconOnPdf = false;
                    $rootScope.pLogTableExtracted = false;

                    sendPostMsgToIframe('disablePLIconOnPdf', false);
                    $('.resizer-image').removeClass('disable-div-more');
                    $('.smart-search-filter-icon').removeClass('disable-div-more');
                    setMinimizedWindowDimensionsToDefault();
                });
        	}
            else {
            	vm.dataLoading = "Extracting Text... Please wait...";
            	getExtractedText(fileNamePlusSheet, coordinates, function(response) {
            		if (response && response.success && response.data) {
            			SmartRegisterService.GetExtractedText(vm.selectedProject.projectId, vm.selectedVersion.versionId, response.data, function (response) {
                    		if (response && response.success) {
                    			vm.recentCoords = floatCoordinates;
                    			vm.currentPDFDimensions = pdfDimensions;
                    			if ( fileDownloadType === "addSubmittal"){
                    				vm.highlightSubs = true;
                    				$scope.selectedText = response.data;
                    				SwitchToSubmittals();
                        			$timeout(function() {
                        				expandRightPane();
                        				$timeout(function() {
                    						$scope.addSubmittalClickedFromSmartBuild(response.data);
                    					}, 100);
                            		}, 0);
                				}
                                vm.dataLoading = false;
                        	} else {
                            	vm.dataLoading = false;
                            	FlashService.Error('Problem while getting file data');
                        	}
                        });
                	} else {
                		vm.dataLoading = false;
                		FlashService.Error('Problem while getting the file');
                	}
        		});
              }
			} else if (vm.appendToItem) {
        		getExtractedText(fileNamePlusSheet, coordinates, function(response) {
        			if (response && response.success && response.data) {
        				SmartRegisterService.GetExtractedText(vm.selectedProject.projectId, vm.selectedVersion.versionId, response.data, function (response) {
                			if (response && response.success) {
                				vm.recentCoords = floatCoordinates;
                				vm.currentPDFDimensions = pdfDimensions;
                				//Append the text to the description here
                                vm.appendToItem.item.submittalDescription = vm.appendToItem.item.submittalDescription ? (vm.appendToItem.item.submittalDescription + '\n' + response.data) : response.data;
                                $timeout(function(){
                                    var $submittalDesc = $('[name="submittalDescription"]');
                                    $submittalDesc.focus();
                                    $submittalDesc.scrollTop($submittalDesc[0].scrollHeight);
                                    var editSubForm = angular.element('form[name="frmEditSubmittal"]').scope();
                                    editSubForm.frmEditSubmittal.$dirty = true;
                                });
                				if(vm.appendToItem.item.mergedCoordinates && vm.appendToItem.item.mergedCoordinates.length > 0) {
                				    vm.appendToItem.item.mergedCoordinates.push(vm.recentCoords);
                				}
                				else {
                					vm.appendToItem.item.coordinates = []; vm.appendToItem.item.coordinates.push(vm.recentCoords);
                				}

                			   //making appendToItem to false to select hand cursor
                				vm.appendToItem = false;
                				vm.dataLoading = false;

                        	} else {
                        		vm.dataLoading = false;
                        		FlashService.Error('Problem while getting file data');
                        	}
                        });
                	} else {
                		vm.dataLoading = false;
                		FlashService.Error('Problem while getting the file');
                	}
        		});
        	} else if (vm.addScheduleItem){
        		getExtractedText(fileNamePlusSheet, coordinates, function(response) {
        			if (response && response.success && response.data) {
        				SmartRegisterService.GetExtractedText(vm.selectedProject.projectId, vm.selectedVersion.versionId, response.data, function (response) {
	        				if (response && response.success) {
	        					vm.recentCoords = floatCoordinates;
	            				vm.currentPDFDimensions = pdfDimensions;

	            				var newRef = {
	            						originalfilename: vm.selectedItem.page.filename,
	            						pagenumber: vm.selectedItem.page.pagenumber_i,
	            						coordinates : [vm.recentCoords],
	            						pagelabel_s : vm.selectedItem.page.pagelabel_s,
	            						pagename_s : vm.selectedItem.page.pagename_s
	            				};

	            				var scheduleObj = { recid: 0, scheduletitle : response.data.substring(0,50), refs: newRef, type : vm.addScheduleItem.type,
	            						sheetDetail : UtilService.getScheduleSheetDetails(newRef), uuid : '', coordinates: [vm.recentCoords], isEdit: true};
	            				if (vm.addScheduleItem.type === vm.submittalsEnum.scheduleRef) {
	            					vm.referenceDS.splice(0, 0, scheduleObj);
	            				} else {
	            					vm.scheduleDS.splice(0, 0, scheduleObj);
	            				}
	            				vm.addScheduleItem = false;
	        				} else {
	                    		vm.dataLoading = false;
	                    		FlashService.Error('Problem while getting file data');
	                    	}
        				});
	            	} else {
	            		vm.dataLoading = false;
	            		FlashService.Error('Problem while getting the file');
	            	}
        		});
        	}
		}

		function removeDragDropClasses(){
			$('#collapseIndexes').removeClass('border-div-inactive');
			$('#collapseReferences').removeClass('blink-div');
			$('#collapseReferences').removeClass('border-div-inactive');
			$('#collapseIndexes').removeClass('blink-div');
		}

        $window.onbeforeunload = function (event) {
            if (vm.disablePLIconOnPdf) {
                return true;
            }
        };

		function postRefDrag(obj){
			if (obj.reference.isEdit) return ;

			vm.referenceDSUnchanged = angular.copy(vm.referenceDS);
			vm.scheduleDSUnchanged = angular.copy(vm.scheduleDS);
			obj.reference.type = vm.submittalsEnum.scheduleIndex;
			updateSchedules([obj.reference]);
		}

		function postIndexDrag(obj){

			if (obj.schedule.isEdit) return ;

			vm.referenceDSUnchanged = angular.copy(vm.referenceDS);
			vm.scheduleDSUnchanged = angular.copy(vm.scheduleDS);
			obj.schedule.type = vm.submittalsEnum.scheduleRef;
			updateSchedules([obj.schedule]);
		}

		$scope.refDragEnded = function(event){
			removeDragDropClasses();
		}

		$scope.indexDragEnded = function(event){
			removeDragDropClasses();
		}

		$scope.indexDragoverCallback = function(index,external,type,d){
			//Allow dragover only if the schedule being dragged is opposite type
			return type === vm.submittalsEnum.scheduleRef.toLowerCase();
		}

		$scope.referenceDragoverCallback = function(index,external,type,d){
			//Allow dragover only if the schedule being dragged is opposite type
			return type === vm.submittalsEnum.scheduleIndex.toLowerCase();
		}

		$scope.refDropCallback = function(index, schedule, c, d){
			if (schedule.isEdit) return false;
			schedule.type = vm.submittalsEnum.scheduleRef;
			if (this.vm.referenceDS && this.vm.referenceDS.length > 0) {
				this.vm.referenceDS.splice(index, 0, schedule);
			} else {
				this.vm.referenceDS.push(schedule);
			}
			postRefDrag({reference: schedule});
			return true;

		}

		$scope.indDropCallback = function(index, schedule, c, d){
			if (schedule.isEdit) return false;
			schedule.type = vm.submittalsEnum.scheduleIndex;
			if (this.vm.scheduleDS && this.vm.scheduleDS.length > 0) {
				this.vm.scheduleDS.splice(index, 0, schedule);
			} else {
				this.vm.scheduleDS.push(schedule);
			}
			postIndexDrag({schedule: schedule});
			return true;
		}

		$scope.indexMoved = function(schedule){
			this.vm.scheduleDS = this.vm.scheduleDS.filter(function(sch){
				return sch.recid !== schedule.recid;
			});
			postIndexDrag(this);
		}

		$scope.referenceMoved = function(schedule){
			this.vm.referenceDS = this.vm.referenceDS.filter(function(sch){
				return sch.recid !== schedule.recid;
			});
			postRefDrag(this);
		}

		$scope.schIndDragStarted = function(){
			$('#collapseIndexes').addClass('border-div-inactive');
			$('#collapseReferences').addClass('blink-div');
			//Add class to disable index container
		}

		$scope.schRefDragStarted = function(){
			$('#collapseReferences').addClass('border-div-inactive');
			$('#collapseIndexes').addClass('blink-div');
			//Add class to disable reference container
		}

		$scope.showIndexsTrashIcon = function(){
			return showTrashIconForSchedules(vm.scheduleDS);
		}

		$scope.showReferencesTrashIcon = function(){
			return showTrashIconForSchedules(vm.referenceDS);
		}

		function showTrashIconForSchedules(data){
			if (!data || data.length <= 0){
				return false;
			} else {
				var ind = data.findIndex(function(sch){
					return sch.selected;
				});
				return ind !== -1;
			}
		}

		function saveScheduleClicked(schedule){
			if (schedule.recid === 0){
				addSchedule(schedule);
			} else {
				updateSchedules([schedule]);
			}
		}

		function addSchedule(schedule){
			var newScheduleObj = {
					coordinates : schedule.coordinates, filename: vm.selectedItem.page.filename, pagenumber: vm.selectedItem.page.pagenumber_i,
					scheduletitle: schedule.scheduletitle, source : 'PlanView', type: schedule.type
				};
			SmartRegisterService.AddSchedule(vm.selectedProject.projectId, vm.selectedVersion.versionId, newScheduleObj, function (response) {
				if (response && response.success){
    				var newSchedule = {scheduletitle: newScheduleObj.scheduletitle, refs: [schedule.refs], mappedspecs: [], mappeddivs: [], uuid: response.data, source: newScheduleObj.source, type: schedule.type};
    				vm.originalScheduleData.schedstodivmap.push(newSchedule);
    				vm.refs = vm.refs.concat(newSchedule.refs);

    				var scheduleObj = { recid: ++vm.maxScheduleRecId, mappedDivs : newSchedule.mappeddivs, uuid : newSchedule.uuid, scheduletitle: schedule.scheduletitle, refs: schedule.refs,
    					coordinates: schedule.coordinates, filename: newSchedule.refs[0].originalfilename, pagenumber_i : newSchedule.refs[0].pagenumber, type : schedule.type,
    					sheetDetail : UtilService.getScheduleSheetDetails(newSchedule.refs[0])};

    				if (scheduleObj.type === vm.submittalsEnum.scheduleIndex) {
    					vm.scheduleDS[0] = scheduleObj;
        				vm.scheduleDSUnChanged.splice(0, 0, scheduleObj);
    				} else {
    					vm.referenceDS[0] = scheduleObj;
        				vm.referenceDSUnChanged.splice(0, 0, scheduleObj);
    				}
    				prepareSheetSpecificSchedules();
				} else {
					vm.dataLoading = false;
					FlashService.Error('Problem while adding new schedule');
				}
			});
		}

		function updateSchedules(schedules){
			var dataToUpdate = schedules.map(function(sch){
				return {uuid : sch.uuid, scheduletitle: sch.scheduletitle, type: sch.type};
			});
			SmartRegisterService.UpdateSchedules(vm.selectedProject.projectId, vm.selectedVersion.versionId, dataToUpdate, function (response) {
				if (response && response.success){
					schedules.forEach(function(schedule){
						schedule.isEdit = false;
					});
					var ind = 0;
					FlashService.Success(response.message);
					dataToUpdate.forEach(function(dat){
						ind = vm.originalScheduleData.schedstodivmap.findIndex(function(sch){
							return dat.uuid === sch.uuid;
						});
						vm.originalScheduleData.schedstodivmap[ind].scheduletitle = dat.scheduletitle;
						if (schedules[0].type === vm.submittalsEnum.scheduleIndex){
							ind = vm.scheduleDSUnChanged.findIndex(function(sch){
								return dat.uuid === sch.uuid;
							});
							vm.scheduleDSUnChanged[ind].scheduletitle = dat.scheduletitle;
						} else {
							ind = vm.referenceDSUnChanged.findIndex(function(sch){
								return dat.uuid === sch.uuid;
							});
							vm.referenceDSUnChanged[ind].scheduletitle = dat.scheduletitle;
						}

					});
					prepareSheetSpecificSchedules();
				} else {
					FlashService.Error(response ? response.message : 'Problem while updating schedule');
				}
			});
		}

		function editScheduleIndxClicked(schedule, frmName){
			var frmScope = angular.element("form[name='" + frmName + "'").scope();
			var frm = frmScope ? frmScope[frmName] : frmScope;
			editSchedule(vm.scheduleDS, schedule, frm);
		}

		function editScheduleRefClicked(reference, frmName){
			var frmScope = angular.element("form[name='" + frmName + "'").scope();
			var frm = frmScope ? frmScope[frmName] : frmScope;
			editSchedule(vm.referenceDS, reference, frm);
		}

		function editSchedule(data, schedule, frm){
			var ind = data.findIndex(function(sch){
				return sch.isEdit;
			});
			if (ind === -1) {
				schedule.isEdit = true;
				schedule.selected = false;
			} else {
				cancelUpdateScheduleClicked(data[ind], frm, function(allowed){
					if (allowed) {
						schedule.isEdit = true;
						schedule.selected = false;
					}
				});
			}
		}

		function cancelUpdateScheduleClicked(schedule, frm, callback){
			if (frm.$dirty || schedule.recid == 0) {
				var title = 'Alert', message = 'You have unsaved changes. Are you sure you want to continue ?';
        		showConfirmPopup(message, title, 'confirm-change-popup', function(allowedToContinue){
        			if (allowedToContinue) {
        				cancelUpdateSchedule(schedule);
        				if (callback) callback(true);
        			} else {
        				if (callback) callback(false);
        			}
        		});
			} else {
				cancelUpdateSchedule(schedule);
				if (callback) callback(true);
			}
		}

		function cancelUpdateSchedule(schedule){
			if (schedule.type === vm.submittalsEnum.scheduleIndex){
				if (schedule.recid === 0) {
					vm.scheduleDS.splice(0,1);
				} else {
					vm.scheduleDSUnChanged.forEach(function(sch){
						if (sch.recid === schedule.recid){
							schedule.scheduletitle = sch.scheduletitle;
						}
					});
				}
			} else {
				if (schedule.recid === 0) {
					vm.referenceDS.splice(0,1);
				} else {
					vm.referenceDSUnChanged.forEach(function(sch){
						if (sch.recid === schedule.recid){
							schedule.scheduletitle = sch.scheduletitle;
						}
					});
				}
			}
			schedule.isEdit = false;
		}

		function deleteScheduleClicked(type){
			var schedules = vm.scheduleDS.filter(function(sch){
				return type === sch.type && sch.selected;
			});
			if (schedules && schedules.length > 0){
				deleteSchedules(schedules);
			} else {
				//Show error message here
			}

		}

		function deleteSchedules(schedules){
			var dataToDelete = schedules.map(function(sch){
				return sch.uuid;
			});
			SmartRegisterService.DeleteSchedules(vm.selectedProject.projectId, vm.selectedVersion.versionId, dataToDelete, function (response) {
				if (response && response.success){
					if (schedules[0].type === vm.submittalsEnum.scheduleIndex){
						vm.scheduleDS = vm.scheduleDS.filter(function(sch){
							return dataToDelete.indexOf(sch.uuid) === -1;
						});
						vm.scheduleDSUnChanged = vm.scheduleDSUnChanged.filter(function(sch){
							return dataToDelete.indexOf(sch.uuid) === -1;
						});
					} else {
						vm.referenceDS = vm.referenceDS.filter(function(sch){
							return dataToDelete.indexOf(sch.uuid) === -1;
						});
						vm.referenceDSUnChanged = vm.referenceDSUnChanged.filter(function(sch){
							return dataToDelete.indexOf(sch.uuid) === -1;
						});
					}
					vm.originalScheduleData.schedstodivmap = vm.originalScheduleData.schedstodivmap.filter(function(sch){
						return dataToDelete.indexOf(sch.uuid) === -1;
					});
					prepareSheetSpecificSchedules();
					FlashService.Success(response.message);
				} else {
					FlashService.Error(response ? response.message : 'Problem while updating schedule');
				}
			});
		}

		function getExtractedText(fileNamePlusSheet, coordinates, callback) {
    		SmartRegisterService.GetExtractedTextFile(vm.selectedProject.projectId, vm.selectedVersion.versionId, fileNamePlusSheet, coordinates, vm.selectedItem.page.ocrEnabled.toString() === "true", function (response) {
    			callback(response);
            });
		}

		function initializeAllFilterItems(){
	            $scope.projectSummaryGroupsFilterItem = {selected:true};
	    }

		$scope.appendTextChanged = function(flag, item, frm){
			if (flag) {
				vm.appendToItem = {};
				vm.appendToItem.item = item;vm.appendToItem.form = frm;
				sendPostMsgToIframe('EnableAppendSelectText', '');

			} else {
				vm.appendToItem = false;
			}
		}

        function showAddSchedulePopup(hideDontShowChkbx, callback){
        	var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: MAINURL + 'views/smartview/planview/planview.scheduleintro.view.html',
                controller: 'ScheduleAddIntroPopupController',
                size: 'md',
                backdrop: 'static',
                resolve: {
                	hideDontShowChkbx : hideDontShowChkbx
                }
            });

            modalInstance.result.then(function (data) {
            	callback(data);
            }, function () {
            	callback();
            });
        }

        function checkAndOpenSchedulePopup(callback) {
            var dontShowIntroFlag;
            dontShowIntroFlag = RememberService.GetCookie('dontShowScheduleIntro');
            if(dontShowIntroFlag) {
                dontShowIntroFlag = JSON.parse(dontShowIntroFlag);
            }
            if (!dontShowIntroFlag){
                var flag = AuthenticationService.GetScheduleIntroFlag();
                if (flag) dontShowIntroFlag = flag;
                else AuthenticationService.SetScheduleIntroFlag(true);
            }

            if (dontShowIntroFlag) {
                if (callback) callback();
            } else {
                showAddSchedulePopup(false, function(data){
                    if(data && data.dontShowFlag !== undefined){
                        RememberService.SetCookie('dontShowScheduleIntro', data.dontShowFlag);
                    }
                    if (callback) callback();
                });
            }
        }

        $scope.addScheduleClicked = function(type){
			vm.addScheduleItem = {type : type};
			sendPostMsgToIframe('EnableAddSchedule', '');
			checkAndOpenSchedulePopup(function(){});
		}

		$scope.collapseUncollapseRef = function(){
			vm.showReferenceGroupItems = !vm.showReferenceGroupItems;
		}

		$scope.collapseUncollapseIndex = function(){
			vm.showIndexsGroupItems = !vm.showIndexsGroupItems;
		}

        $scope.commonFilter = function (key) {
        	return function(item) {
        		if (vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == ''
        			|| (item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)){
        			return true;
        		}
        		return false;
            }
		}

        /*Custom filter for spec section*/
        $scope.specSectionFilter = function (item) {
            if (vm.searchSpecSections == undefined || vm.searchSpecSections == '' || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1)
        		|| (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)){
            	return true;
            }
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

        $scope.commonSearchValueChanged = function(key){
        	vm[key + "SelectedItemsTemp"] = [];

        	var currentAllVar = vm[vm.columnsTotalVarData[key].allVar + "Temp"], item = "";
        	vm.currentSearchResults = [];

        	if(key === "divisionCode"){
        		for(var i=0;i<currentAllVar.length;i++){
        			item = currentAllVar[i];
        			if(vm.searchDivisionCodes == undefined || vm.searchDivisionCodes == '') {
        				vm[key + "SelectedItemsTemp"] = [];
        				item.selected = false;
        			}
        			else if ((item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
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
        			if(vm.searchSpecSections == undefined || vm.searchSpecSections == '') {
        				vm[key + "SelectedItemsTemp"] = [];
        				item.selected = false;
        			}
        			else if ( (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1)
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
        			if(vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == '') {
        				vm[key + "SelectedItemsTemp"] = [];
        				item.selected = false;
        			}
        			else if ((item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)){
	        			vm[key + "SelectedItemsTemp"].push(item[vm.columnsTotalVarData[key].mapValue]);
	        			vm.currentSearchResults.push(item[vm.columnsTotalVarData[key].mapValue]);
	        			item.selected = true;
	        		} else {
	        			item.selected = false;
	        		}
        		}
        	}

        	vm[vm.columnsTotalVarData[key].selectAllVar] = commonSelectAllChecked(key);
        	updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItemsTemp"], true);
        	updateSearchData();
        	createRectangles()

        }

        function commonSelectAllChecked(key){
        	if (((vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == '') &&
        			vm[key + "SelectedItemsTemp"] && vm[vm.columnsTotalVarData[key].number] === vm[key + "SelectedItemsTemp"].length)
        		|| (vm[vm.columnsTotalVarData[key].searchVar] && vm[key + "SelectedItemsTemp"].length && vm[key + "SelectedItemsTemp"].length === vm.currentSearchResults.length)){
        		return true;
        	}
        	return false;
        }

        $scope.itemClicked = function(item, index, key){
        	vm.searchSidebar = "";
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


        	updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItemsTemp"], true);
        	updateSearchData();
        	// highlighting recrods in PDF
        	createRectangles();
        }


        function convertAllValuesToLowerCase(items){
        	if(items && items.length > 0) {
				var result = [];
				for (var i = 0; i < items.length; i++) {
					if (items[i]) {
						result.push(items[i].toLowerCase());
					}
				}
        	}
        	return result;
        }

        function applyFiltersFunction() {
        	vm.filteredData = [];
        }


        $scope.applyFiltersForAll = function(submittalRegisters) {
            if(submittalRegisters && [submittalRegisters].length > 0){
            	var filteredData = [], remainingData = [];
                if([submittalRegisters][0].isEdit || [submittalRegisters][0].isAddToRegister) {
                	return true;
                }
            	[submittalRegisters].forEach(function(record) {
            		if(((record.divisionCode !== '' && $.inArray(record.divisionCode, vm.divisionCodeSelectedItemsTemp) !== -1)
        						|| (record.divisionCode === '' && vm.divisionCodeSelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.divisionCodeSelectedItemsTemp.length === 0 ) &&
	    				((record.specNumber !== '' && $.inArray(record.specNumber, vm.specSectionSelectedItemsTemp) !== -1)
	    						|| (record.specNumber === '' && vm.specSectionSelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.specSectionSelectedItemsTemp.length === 0) &&
	    				(($.inArray(record.projectSummaryGroup && record.projectSummaryGroup.toUpperCase(), vm.projectSummaryGroupSelectedItemsTemp) !== -1)
	    						|| (record.projectSummaryGroup === "" && $.inArray(emptyValuesLabel, vm.projectSummaryGroupSelectedItemsTemp) !== -1) || vm.projectSummaryGroupSelectedItemsTemp.length === 0) &&
	    				((record.specCategory && vm.specCategorySelectedItemsTemp.indexOf(record.specCategory) !== -1)
	    						|| (record.specCategory === "" && vm.specCategorySelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.specCategorySelectedItemsTemp.length === 0) &&
	    				((record.specCategoryGroup && vm.specCategoryGroupSelectedItemsTemp.indexOf(record.specCategoryGroup) !== -1)
	    						|| (record.specCategoryGroup === "" && vm.specCategoryGroupSelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) ||vm.specCategoryGroupSelectedItemsTemp.length === 0)&&
	    	    		((record.drawingSheetNumber && vm.drawingSheetNumberSelectedItemsTemp.indexOf(record.drawingSheetNumber) !== -1)
	    	    				|| (record.drawingSheetNumber === "" && vm.drawingSheetNumberSelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.drawingSheetNumberSelectedItemsTemp.length === 0)&&
	    	    		((record.source && vm.sourceSelectedItemsTemp.indexOf(record.source) !== -1)
	    	    	    		|| (record.source === "" && vm.sourceSelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.sourceSelectedItemsTemp.length === 0)){
            				filteredData.push(record);
            			} else {
            				remainingData.push(record);
            			}
    				});

            	if(filteredData.length > 0)
            		return true;
            	else
            		return false;
            	// vm.submittalsInView = angular.copy(filteredData);
            }
          }

        function GetSubmittalTypes() {
        	SmartRegisterService.GetSubmittalTypes(function (response) {
                if (response.success) {
                	vm.defaultSubmittalTypes = response.data;
                } else {
                	vm.defaultSubmittalTypes = [];
                }
            });
        }

        function getAllLabels() {
        	SmartRegisterService.GetAllLabels(function (response) {
                if (response.success) {
                	vm.defaultTags = response.data;
                } else {
                	vm.defaultTags = [];
                }
            });
        }

        function getAllDiscipline(){
        	SmartRegisterService.GetAllDisciplines(function (response) {
                if (response.success) {
                	vm.allDisciplines = response.data;
                } else {
                	vm.allDisciplines = ['ARCHITECTURAL', 'CIVIL', 'DEMOLITION', 'ELECTRICAL', 'GENERAL', 'LANDSCAPE', 'MECHANICAL', 'OTHERS', 'PLUMBING', 'STRUCTURAL'];
                }
            });
        }

        function LoadDrawingsPDF(file, page, fileIndex,  pageIndex, scrollToSheet, forceReload) {
        	var selectedFile, selectedPage, originalFileName, fileName, page, fileNamePlusSheet, timeStamp = "";
        	$scope.selectedRec = -1;
        	$scope.selectedRecord = null;
			if (forceReload) {
				timeStamp = "&t=" + (new Date()).getTime();
			}
            vm.selectedItem = { file: file, page: page}
            prepareSheetSpecificSubmittals();
            prepareSheetSpecificSchedules();

            updateSheetNums();
            highlightCombinationOfSubmittals(true,'',false,false, false);
            if (scrollToSheet) {
            	$timeout(function() {
                    scrollToSpecificElement('#scopeOfWorkContainer', '#'+ vm.selectedItem.file.sheettype_s + "-" + $scope.replaceSpecialCharacters(vm.selectedItem.page.filename) + "-" +vm.selectedItem.page.pagenumber_i, true);
            	}, 0);
            }
        }

        $scope.$on('$locationChangeStart', function (event, next, current) {
            $rootScope.hideSmartLinks = false;
        //    $("body").css("background-color", "#EFEBE2");
        });

        $scope.toggleAddEditPopoverFullScreen = function() {
        	if (!vm.isAddFullScreen) {
        		$('.specview-add-edit-popover').addClass('expanded-popover');
            	$('.specview-add-edit-popover').removeClass('specview-add-popover');
        	} else {
        		$('.specview-add-edit-popover').removeClass('expanded-popover');
            	$('.specview-add-edit-popover').addClass('specview-add-popover');
        	}
        	vm.isAddFullScreen = !vm.isAddFullScreen;
        }

       function callResetRegionHighlight(){
    	   sendPostMsgToIframe('resetSelectedRegion', '');
       }

       function callToggleFSIcon(){
    	   sendPostMsgToIframe('toggleFSIcon', '');
       }

		function highlightRectangle(record){
			sendPostMsgToIframe('highlightRegionWithBorder', record);
		}

		function highlightSearchRectangles() {
			sendPostMsgToIframe('createSearchRectangles', '');
		}

       function getFileNamePageNumberKeysBasedOnRecord(record){
    	   var filename = 'drawingFileName', pageNumber = 'drawingPageNumber';
    	   if (record.type) {
    		   filename = 'fileName';
    		   pageNumber = 'pageNumber';
    	   }
    	   return {filename : filename, pageNumber: pageNumber};
       }

       function updateThumbnailsSubmittalCountInMultipleSheets(records){
    	   var pages = [], uniquePages = [];
    	   var keys = getFileNamePageNumberKeysBasedOnRecord(records[0]);
    	   for (var i = 0; i < records.length; i++){
    		   var pageUnique = records[i][keys.filename] + records[i][keys.pageNumber];
    		   if (uniquePages.indexOf(pageUnique) === -1){
    			   pages.push({drawingFileName : records[i][keys.filename], drawingPageNumber : records[i][keys.pageNumber]});
    			   uniquePages.push(pageUnique);
    		   }
    	   }
    	   if (pages.length > 1){
    		   for (var index = 0; index < pages.length; index++){
    			   updateThumbnailsSubmittalCount(pages[index]);
    		   }
    	   } else {
    		   updateThumbnailsSubmittalCount(pages[0]);
    	   }
       }

        function updateThumbnailsSubmittalCount(record) {
        	var keys = getFileNamePageNumberKeysBasedOnRecord(record);
    	   var page = {};
    	   page.filename = record[keys.filename];
    	   page.pagenumber_i = record[keys.pageNumber];
    	   var submittalCount = hasSubmittalsByPageNumber(page);
    	   if(vm.filteredSheetsInfo.currentfilter.sheets){
				for (var i = 0; i < vm.filteredSheetsInfo.currentfilter.sheets.length; i++) {
					if (parseInt(vm.filteredSheetsInfo.currentfilter.sheets[i].pagenumber_i) == page.pagenumber_i
							&& vm.filteredSheetsInfo.currentfilter.sheets[i].filename === page.filename) {
						vm.filteredSheetsInfo.currentfilter.sheets[i].submittalsCount = angular.copy(submittalCount);
						break;
					}
				}
			}

			if(vm.originalSheets){
				for (var i = 0; i < vm.originalSheets.length; i++) {
					for(var j = 0 ; j < vm.originalSheets[i].pages.length ; j++) {
						if (vm.originalSheets[i].pages[j].pagenumber_i == page.pagenumber_i
								&& vm.originalSheets[i].pages[j].filename === page.filename) {
							vm.originalSheets[i].pages[j].submittalsCount = angular.copy(submittalCount);
							return;
						}
					}
				}
			}

         }

	   function sortSchedules(column) {
        	if($scope.field && $scope.field.name === column) {
        		$scope.field.order = !$scope.field.order
            }
        	else {
        		$scope.field = {};
        		$scope.field.name = column;
        		$scope.field.order = false;
        	}
        }

       function scrollToSpecificElement(containerSelector, scrollToElementSelector, reduceTop, topToReduce) {
        	var $container = $(containerSelector),
            $scrollTo = $(scrollToElementSelector);
            if(reduceTop){
        		if(!topToReduce){
        			topToReduce = 50;
        		}
        		if ($scrollTo.offset()) {
        			$container.scrollTop($scrollTo.offset().top - $container.offset().top + $container.scrollTop() - topToReduce);
        		}
        	} else {
        		$container.scrollTop($scrollTo.offset().top - $container.offset().top + $container.scrollTop());
        	}
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

        function getSubmittalsByPage(submittals, page){
        	var data = submittals.filter(function (item) {
                return (item.drawingFileName == page.filename && item.drawingPageNumber == page.pagenumber_i );
            });
        	return data;
        }

        function getSchedulesByPage(schedules, page){
        	var data = [];
        	if(schedules && schedules.length > 0){
        		data = schedules.filter(function (item) {
                    return (item.filename == page.filename && item.pagenumber_i == page.pagenumber_i);
                });
        	}
        	return data;
        }

        function loadSubmittalsByPageNumber(page, submittals) {
        	var result = { groupedByValues : [], noData : false, records : [] };
        	if(submittals && submittals.length> 0) {
        		var data;
        		if(page) {
        			data = getSubmittalsByPage(submittals, page);
        		}
        		else {
        			data = angular.copy(submittals);
        		}
	            result.records = angular.copy(data);
	            //$scope.getSelectedRecordsForExport = angular.copy(data);
	            data.sort(function (a, b) { return (a.paraCode > b.paraCode) ? 1 : ((b.paraCode > a.paraCode) ? -1 : 0); });
	            var groupByField =  vm.groupBySubmittalsField;
	            result.groupedByValues = groupBy(data, groupByField);
	            result.noData = jQuery.isEmptyObject(result.groupedByValues);
	            if (result.noData === false) {
	                var ordered = {};
	                Object.keys(result.groupedByValues).sort().forEach(function (key) {
	                    ordered[key] = result.groupedByValues[key];
	                });
	                result.groupedByValues = ordered;
	            }
	            var sortByValues = [];
	            Object.keys(result.groupedByValues).sort().forEach(function (key) {
	            	sortByValues.push([key, result.groupedByValues[key]]);
                });
	            result.sortByValues = sortByValues;
            } else {
            	result.noData = true;
        	}
        	return result;
        }

        function checkAndOpenIntroPopup(schedulesSmartBuild, callback) {
        	var dontShowIntroFlag;
        	if(schedulesSmartBuild) {
            	dontShowIntroFlag = false;
            }
            else {
            	dontShowIntroFlag = RememberService.GetCookie('dontShowTextViewIntro');
                if(dontShowIntroFlag) {
                	dontShowIntroFlag = JSON.parse(dontShowIntroFlag);
                }
           }
        	if (!dontShowIntroFlag){
        		var flag = AuthenticationService.GetTextViewIntroFlag();
        		if (flag) dontShowIntroFlag = flag;
        		else AuthenticationService.SetTextViewIntroFlag(true);
        	}

        	if (dontShowIntroFlag) {
        		callback();
        	} else {
        		var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: MAINURL + 'views/smartview/planview/textview.intro.view.html',
                    controller: 'TextViewIntroPopupController',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                    	schedulesSmartBuild : schedulesSmartBuild
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
        	}
        }

        function showProcurementLogIntro() {
            var dontShowPlInroFlag = AuthenticationService.GetDontShowPLIntroFlag();
            if(!dontShowPlInroFlag) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: MAINURL + 'views/smartview/planview/procurelog.intro.view.html',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'procurement-intro',
                    controller: function($scope, $uibModalInstance) {
                        $scope.Cancel = function() {
                            $uibModalInstance.dismiss('cancel');
                        };
                        $scope.Continue = function() {
                            $uibModalInstance.close({dontShowFlag : true});
                        };
                    }
                });

                modalInstance.result.then(function (data) {
                    AuthenticationService.SetDontShowPLIntroFlag(data.dontShowFlag);
                });
            }
        }

        function SwitchToSchedules() {
        	vm.View = vm.submittalsEnum.schedule;
        	vm.highlightSchedules = true;
            vm.allSubmittals.forEach(function(sub, index) {
        		if(sub.selected){
                    delete sub.selected;
        		}
        	});
            AuthenticationService.SetPlanViewView(vm.View);
		}
		function SwitchToSubmittals() {
            vm.searchSidebar = '';
            $scope.selectedScheduleRow = null;
            vm.highlightSubs = true;
			vm.View = vm.submittalsEnum.submittals;
			collapseSpecificSubmittalTypeShowMoreLink(vm.confirmedSubsResult);
            AuthenticationService.SetPlanViewView(vm.View);
		}
        function SwitchToProcurementLog() {
            $scope.selectedScheduleRow = null;
            vm.View = vm.submittalsEnum.procurementlog;
            AuthenticationService.SetPlanViewView(vm.View);
        }
        function SwitchToAllSubmittals(planViewRecord) {
            vm.searchSidebar = '';
            vm.dataLoading = "Loading Submittals...Please wait..";
            $timeout(function() {
                $scope.selectedScheduleRow = null;
                vm.View = vm.submittalsEnum.allSubmittals;
                if(planViewRecord) {
                    highlightSubmittalInSRTab(planViewRecord);
                }
                vm.dataLoading = false;
                AuthenticationService.SetPlanViewView('allSubmittals');
            }, 0);
        }
        function SwitchToScopeOfWork() {
            vm.SheetView = 'ScopeOfWorkView';
            scrollToSelectedSheetWithAnimation();
        }

        function SwitchTextView2(schedulesSmartBuild) {
        	vm.SpecView = 'SmartBuild2';
        	switchToPDFClicked(true, schedulesSmartBuild);
        }

        function GetTypeOfSubmittal(record){
        	return UtilService.GetTypeOfSubmittal(record);
        }

        function selectedRegionClicked(record, currentScale) {
        	var recordIndexInCollection;
        	var subT = UtilService.GetTypeOfSubmittal(record);
    		vm.highlightClickedRecord = record;
			expandRightPane();
			$scope.selectedRec = record.recid;
            $scope.selectedRecord = record;
        	var zoom = UtilService.GetZoomString(record);
            vm.View = (subT=== vm.submittalsEnum.schedule || subT === vm.submittalsEnum.procurementlog) ? subT : vm.submittalsEnum.submittals;
            if(vm.View !== vm.submittalsEnum.schedule) {
                $scope.selectedScheduleRow = null;
            }
        	$timeout(function(){
                 if(vm.View === vm.submittalsEnum.submittals) {
                     expandCardGroup(record);
                     $scope.selectedScheduleRow = null;
            		 if (currentScale < 80){
                		highlightCombinationOfSubmittals(false, zoom);
                	 }
                	 else {
                		collapseSubmittalTabShowMoreLinks(vm.allSubmittals);
                		recordIndexInCollection = getSubmittalIndex(record, vm.allSubmittals);
                		vm.allSubmittals[recordIndexInCollection].showmore = true;
                	 }
                 }
            	 vm.searchSidebar = "";
                 if(vm.View === vm.submittalsEnum.schedule) {
                     scheduleRowClicked(record, record.refs, record.index);
                 }
                 if(vm.View === vm.submittalsEnum.procurementlog){
                	 expandProcurementCardGroup(record);
                	 if (currentScale < 80){
                 		highlightCombinationOfSubmittals(false, zoom);
                 	 }
                 	 else {
                 		collapseSubmittalTabShowMoreLinks(vm.allSubmittals);
                 		recordIndexInCollection = getProcurementItemIndex(record, vm.procurementLogs);
                 		vm.procurementLogs[recordIndexInCollection].showmore = true;
                 	 }

                 }
            	 $timeout(function() {
                    if(vm.View === vm.submittalsEnum.schedule) {
                        scrollToSpecificElementWithAnimation('#collapseIndexes', '#schedule-'+record.index, true, 75);
                    }else if(vm.View === vm.submittalsEnum.procurementlog){
                    	scrollToSpecificElementWithAnimation('#cards','#panel-col-procurement-' + record.id, true);
                    } else {
                        scrollToSpecificElementWithAnimation('#cards','#panel-col-' + subT + '-' + record.recid, true);
                    }
            		vm.isRegionClicked = record;
            		highlightRectangle(record);
            	 }, 0);
        	}, 0);
        }

        function expandCardGroup(record){
        	if (vm.submittalView === vm.SubmittalSortView.sheetnumber.key){
        		vm.sheetGroupsParent[record.drawingSheetNumber] = true;
        	} else if (vm.submittalView === vm.SubmittalSortView.specnumber.key){
        		vm.specGroupsParent[record.specNumber] = true;
        	} else if (vm.submittalView === vm.SubmittalSortView.submittaltype.key){
        		vm.submittalTypeGroupsParent[record.specCategory] = true;
        	} else {
        		//Do nothing here
        	}
        }

        function expandAllSubsCardGroup(record) {
            vm.procurementLogSpecGroup[record.specNumber] = true;
        }

        function switchToPDFClicked(regionSelection, schedulesSmartBuild) {
        	var zoom = null;
            if ($scope.selectedRecord) {
            	zoom = UtilService.GetZoomString($scope.selectedRecord);
            }
            highlightCombinationOfSubmittals(true, zoom);
            $timeout(function() {
            	if (regionSelection) {
            		checkAndOpenIntroPopup(schedulesSmartBuild, function(){
                		//Actions that we need to do post closing of popup here
                	});
                }
            }, 0);
        }

        function showConfirmPopup(message, title, windowClass, callback) {
            var modalInstance = $uibModal
				.open({
				    animation: true,
				    templateUrl: MAINURL
							+ 'views/support/support.enterpriseconfirmation.view.html',
				    controller: 'ConfirmUpgradeToEnterprise',
				    backdrop: 'static',
					windowClass: windowClass,
				    resolve: {
				        items: {
				            message: message,
				            title: title
				        }
				    }
				});

            modalInstance.result.then(function (data) {
            	callback(true);
            }, function () {
            	callback(false);
            });
        }

        function showPendingSheetsPopup(unsavedSheets, windowClass, callback) {
            var modalInstance = $uibModal
					.open({
					    animation: true,
					    templateUrl: MAINURL
								+ 'views/smartview/planview/pendingchanges.popup.view.html',
					    controller: 'PendingChangesPopupController',
					    backdrop: 'static',
						size: 'lg',
						windowClass: windowClass,
					    resolve: {
					        items: {
					        	sheets: unsavedSheets
					        }
					    }
					});

            modalInstance.result.then(function (data) {
            	callback(true);
            }, function () {
            	callback(false);
            });
        }

        $scope.editSubmittalEnabled = function(item){
        	$timeout(function(){
        		scrollToSpecificElementWithAnimation('#cards','#panel-col-' + item.submittalCategory + '-' + item.recid, true, 15);
        		$('#edit-specName-' + item.recid).focus();
        	}, 0);
        }

        $scope.addToRegisterEnabled = function(item) {
        	$scope.addSubmittalTypes = [];
        	var specCategory = item.specCategory;
        	if(specCategory) {
        		var specItem = {};
        		specItem.text = specCategory;
        		$scope.addSubmittalTypes.push(specItem);
        	}
        	$timeout(function(){
        		scrollToSpecificElementWithAnimation('#cards','#panel-col-' + (item.type ? item.type : item.submittalCategory) + '-' + item.recid, true, 15);
        	}, 0);
        }

        $scope.editSubmittalClicked = function(item){
            vm.disableAddIcon = true;
            vm.addNewSubmittal = false;
            item = UtilService.decodeStringFields(item);
            if(item.submittalCategory === vm.submittalsEnum.submittals) {
                preOpenFormActions(item, 'isAddToRegister');
            } else {
                preOpenFormActions(item, 'isEdit');
            }
            vm.selectedSubmittalItem = item;
        }


        function preOpenFormActions(item, field, fromSmartBuild, selectedText){
        	var editFrmName = 'frmEditSubmittal', addToRegisterFrmName = 'frmAddToRegisterSubmittal';
        	var editSubForm = angular.element('form[name="' + editFrmName + '"]');
        	var addToRegisterSubForm = angular.element('form[name="'+ addToRegisterFrmName +'"]');
        	var formScopeEle, formScope, prevItem;

        	if (editSubForm.length <= 0 && addToRegisterSubForm.length <= 0) {
        		item[field] = true;
        		vm.appendToItem = false;
        		if(fromSmartBuild) {
        			addNewSubmittalObjInTab(selectedText, true);
				}
        		return;
        	} else if (editSubForm.length > 0) {
        		formScopeEle = editSubForm.scope();
        		formScope = formScopeEle[editFrmName];
        		prevItem = formScopeEle.frmItem;
        	} else if (addToRegisterSubForm.length > 0) {
        		formScopeEle = addToRegisterSubForm.scope();
        		formScope = formScopeEle[addToRegisterFrmName];
        		prevItem = formScopeEle.frmItem;
        	}
            checkAndResetSubs(formScope, prevItem, function(allowedToProceed){
                if (allowedToProceed) {
                    item[field] = true;
                    vm.appendToItem = false;
                    if(fromSmartBuild) {
                        addNewSubmittalObjInTab(selectedText, true);
                    }
                }
                else {
                    $timeout(function(){
                        scrollToSpecificElementWithAnimation('#cards','#panel-col-' + prevItem.submittalCategory + '-' + prevItem.recid, true);
                    }, 0);
                }
            });
        }

        function checkAndResetSubs(frm, item, callback){
        	var index = getSubmittalIndex(item, vm.allSubmittals);
        	if (frm.$dirty) {
        		var title = 'Alert', message = 'You have unsaved changes. Are you sure you want to cancel?';
        		showConfirmPopup(message, title, 'confirm-change-popup', function(allowedToContinue){
                    if (allowedToContinue) {
                        cancelSubmittalChanges(item, index);
                        if (callback) callback(true);
        			} else {
        				if (callback) callback(false);
        			}
        		});
        	} else {
        		cancelSubmittalChanges(item, index);
        		if (callback) callback(true);
        	}
        }

        function cancelSubmittalChanges(item, index) {
            vm.allSubmittals[index].isEdit = false;
            vm.allSubmittals[index].isAddToRegister = false;
            vm.disableAddIcon = false;
            vm.addNewSubmittal = false;
            if (item.recid === vm.MaxRecId) {
                vm.allSubmittals.splice(0, 1);
                callResetRegionHighlight();
            }
            vm.appendToItem = false;
        }

        $scope.addSubmittalClicked = function(item) {
            vm.disableAddIcon = true;
            vm.MaxRecId++;
            vm.addNewSubmittal = true;
            var itemTemp = addNewSubmittalObjInTab();
            vm.selectedSubmittalItem = itemTemp;
            preOpenFormActions(item, 'isAddToRegister');
        }

        function addNewSubmittalObjInTab(selectedText, fromSmartBuild){
        	if (!vm.highlightSubs) {
        		FlashService.Error('Please check the Submittals checkbox to see submittal card');
        	}
        	var item = {};
        	item.drawingFileName = vm.selectedItem.page.filename;
        	item.drawingPageNumber = vm.selectedItem.page.pagenumber_i;
        	item.submittalCategory = vm.submittalsEnum.submittals;
        	item.source = fromSmartBuild ? vm.SmartBuildPlanView : vm.ManualPlanView;
        	if (selectedText) {
        		item.submittalDescription = selectedText;
    			if (vm.recentCoords && vm.recentCoords.length > 0) {
                	item.coordinates = [vm.recentCoords];
                	item.mergedCoordinates = [vm.recentCoords];
                	item.pageHeight = vm.currentPDFDimensions.height;
                	item.pageWidth = vm.currentPDFDimensions.width;
                	item.pageRotation = vm.currentPDFDimensions.rotation;
                }
        	}

            item.isAddToRegister = true;
            item.recid = vm.MaxRecId;
            item.serialNumber = vm.MaxRecId;
        	if (vm.allSubmittals.length > 0 && vm.allSubmittals[0].recid == 0) {
        		vm.allSubmittals.splice(0, 1, item);
            } else {
        		vm.allSubmittals.splice(0, 0, item);
        	}
            return item;
        }

        $scope.addSubmittalClickedFromSmartBuild = function(selectedText) {
        	var item = {};
            vm.MaxRecId++;
            vm.addNewSubmittal = true;
        	preOpenFormActions(item, 'isEdit', true, selectedText);
        }

        $scope.cancelSubmittalBtnClicked = function(frm, item){
        	checkAndResetSubs(frm, item);
        }

        $scope.addToRegisterSubmittalClicked = function(item) {
            vm.addNewSubmittal = true;
            var itemToDelete = angular.copy(item);
            item.action = '';
            vm.MaxRecId++;
            item.recid = vm.MaxRecId;
            item.serialNumber = vm.MaxRecId;
            $scope.saveSubmittalBtnClicked(null, item, function() {
                deleteRecommendedSubmittal(itemToDelete, function(success) {
                    //postSubmittalChangeActions();
                    if(success) {
                        FlashService.Success("Successfully added to Smart Register.");
                    }
                });
            });
        }

        function setMoreFieldsBeforeAdding(item) {
            var item1 = {
                "divisionCode": "",
                "divisionName": "",
                "projectSummaryGroup": "",
                "submittalsHeading": "",
                "drawingFlag" : true,
                "drawingSheetName" : vm.selectedItem.page.pagename_s,
                "drawingSheetNumber" : vm.selectedItem.page.pagelabel_s,
                "drawingSheetType" : vm.selectedItem.file.sheettype_s,
                "confidenceLevel" : 0.75
            }

            item = UtilService.MergeObjects(item, item1);
            if (!item.coordinates) item.coordinates = [];
            if (!item.mergedCoordinates) item.mergedCoordinates = [];
            return item;
        }

        $scope.saveSubmittalBtnClicked = function(frm, item, callback) {
			  if (!frm || !frm.$invalid) {
                //var item = angular.copy(itemOrig);
                var addedRecords = [], updatedRecords = [];
                item.submittalCategory = vm.submittalsEnum.submittals;
                if(item.specName) {
                    item.specName = item.specName.toUpperCase();
                }

                var changes = [];
                if(vm.addNewSubmittal) {
                    // In case of Add Submittals to Register
                    item = setMoreFieldsBeforeAdding(item);
                    addedRecords.push(item);
                    changes.push({ action: 'Added', newRecord: item });
                } else {
                    // In case of Edit SR Submittals
                    var index = getSubmittalIndex(item, vm.allSubmittals);
                	var oldRecord = getFilteredRecordObject([vm.allSubmittalsUnchanged[index]])[0];
                    updatedRecords.push(item);
                    changes.push({ action: 'Update', oldRecord: oldRecord, newRecord: item });
                }

                var operation = 'PlanView';
                vm.dataLoading = "Saving Submittal...Please wait...";
				SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, operation,
	            		addedRecords, [], updatedRecords, [], [], changes, function (response){
					if(response.success) {
                        if(vm.addNewSubmittal && frm) {
                            item.showmore = true;
                            var idx = 0; //Always should be zero
                            updateDifferentSubmittalsLists(item, idx);
                            postAddEditSubmittal(item);
                            FlashService.Success("Successfully added to Smart Register.");
                        } else {
                            var idx = getSubmittalIndex(item, vm.allSubmittals);
                            updateDifferentSubmittalsLists(item, idx);
                            if(frm) {
                                postAddEditSubmittal(item);
                                FlashService.Success("Submittal has been updated successfully.");
                            } else {
                                // In case of Rec Submittal Add to Register
                                postAddRecommendedToRegister(item);
                            }
                        }
                        if(callback) {
                            callback();
                        }
                        vm.disableAddIcon = false;
					} else{
						FlashService.Error("Error in adding the submittal to smart register");
					}
                    vm.dataLoading = false;
				});
                item.isAddToRegister = false;
			} else {
				FlashService.Error('Please fill all mandatory fields to continue');
			}
        }

        function postAddRecommendedToRegister(submittal) {
            vm.highlightSubs = true;
          	postSubmittalChangeActions();
          	updateThumbnailsSubmittalCount(submittal);
          	vm.appendToItem = false;
          	$timeout(function(){
          		scrollToSpecificElementWithAnimation('#cards','#panel-col-' + submittal.submittalCategory + '-' + submittal.recid, true);
          		submittalCardClicked(submittal, submittal.drawingFileName, submittal.drawingPageNumber);
          	});
        }

        function updateDifferentSubmittalsLists(item, index) {
            vm.allSubmittals[index] = angular.copy(item);
            vm.allSubmittalsNoSort = angular.copy(vm.allSubmittals);
            vm.allSubmittals = sortSubmittalsByView(vm.allSubmittalsNoSort);
            vm.allSubmittalsUnchanged = angular.copy(vm.allSubmittals);
        }

        function postAddEditSubmittal(submittal) {
            postSubmittalChangeActions();
            updateThumbnailsSubmittalCount(submittal);
            vm.appendToItem = false;
            loadMasterSpecCodesndNames();
            $scope.selectedRec = submittal.recid;
            $scope.selectedRecord = submittal;
            vm.cardClicked = {recid : submittal.recid, type : submittal.submittalCategory};

            switchSubmittalsSortOrder(vm.submittalView);

            sendPostMsgToIframe('appendRectangles', [submittal]);
            callResetRegionHighlight();
            var zoomString = UtilService.GetZoomString(submittal);

            $timeout(function(){
                callZoomToXY(zoomString);
                highlightRectangle(submittal);
                expandCardGroup(submittal);
                scrollToSpecificElementWithAnimation('#cards','#panel-col-' + submittal.submittalCategory + '-' + submittal.recid, true);
          		submittalCardClicked(submittal, submittal.drawingFileName, submittal.drawingPageNumber);
            }, 0);
        }

        function downloadData(){

        }

        function getSubmittalIndex(item, submittals){
        	var index = -1;
    		for (var i = 0; i < submittals.length; i++){
    			if (item.submittalCategory === submittals[i].submittalCategory && submittals[i].recid === item.recid){
    				index = i;
    				break;
    			}
    		}
    		return index;
        }

        function smartBuildEnableActions(){
        	LogEvent("Smart Build", "User has enabled Smart Build", "SUCCESS");
        	vm.SpecView = 'SmartBuild2';
        	checkAndOpenIntroPopup(false, function(){
        		//Actions that we need to do post closing of popup here
        	});
        }

        function smartBuildDisableActions(){
        	LogEvent("Smart Build", "User has disabled Smart Build", "SUCCESS");
        	vm.SpecView = 'PDFView';
        }

        $scope.postCreateSub = function(e){
        	e.stopPropagation();
        	$('#right-click-menu').css('display', 'none');
        }

        function startFocusOut(){
			$(document).on("click",function(){
				$("#right-click-menu").hide();
			});
		}

        function copySubmittalRecord(item) {
        	 var changes = [];
         	 var copyRecordIndex = getRecordIndexByRecid(vm.allSubmittals, item.recid);
         	 var record = getFilteredRecordObject([vm.allSubmittals[copyRecordIndex]])[0];
             var  recordsToAdd = [], newRecord, newRecordTemp, tempRecId = angular.copy(vm.MaxRecId);
             tempRecId++;
             newRecord = angular.copy(record);
             newRecord.recid = tempRecId;
             newRecord.serialNumber = tempRecId;
             newRecord.drawingFlag = true;
             recordsToAdd.push(newRecord);
             changes.push({ action: "Copied", newRecord: newRecord,sourceRecordSerialNumber:item.serialNumber});
             vm.MaxRecId = angular.copy(tempRecId);
             SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "PlanView",
                     [newRecord], [], [], [], null, changes, function (response) {
                         if (response && response.success) {
                        	 vm.allSubmittals.splice(copyRecordIndex, 0, newRecord);
                         	 postSubmittalChangeActions();
                         	 updateThumbnailsSubmittalCount(item);
                         	 $scope.selectedRec = newRecord.recid;
                             $scope.selectedRecord = newRecord;
                             $timeout(function(){
                            	scrollToSpecificElementWithAnimation('#cards','#panel-col-' + $scope.selectedRecord.submittalCategory + '-' + $scope.selectedRecord.recid, true);
                            }, 0);
                             FlashService.Success("Copied Successfully");
                         } else {
                         	FlashService.Error("Problem while copying");
                         }
                     });
             }

        function LogEvent(type, description, status) {
            var logEvent = {};
            logEvent.moduleName = "PlanView";
            logEvent.type = type;
            logEvent.description = description;
            logEvent.status = status;
            EventService.AddEvent(logEvent, vm.selectedProject.projectId, function (response) {
           });
        }

        Object.size = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        function groupByProperties(arr, propsarr) {
            return arr.reduce(function (groups, item) {
            	var val = '';
            	propsarr.forEach(function(prop){val = val ? val + ' - ' + item[prop] : item[prop];});
                //var val = item[prop]
                groups[val] = groups[val] || []
                groups[val].push(item)
                return groups
            }, {})
        }

        function groupBy(arr, prop) {
            return arr.reduce(function (groups, item) {
                var val = item[prop]
                groups[val] = groups[val] || []
                groups[val].push(item)
                return groups
            }, {})
        }

        function ExpandAll(event) {
        	vm.originalSheets.forEach(function (value, index) {
                value.isCollapsed = false;
            });
            $scope.isAllCollapsed = false;
            event.preventDefault();event.stopImmediatePropagation();
        }

        function CollapseAll(event) {
        	vm.originalSheets.forEach(function (value, index) {
                value.isCollapsed = true;
            });
            $scope.isAllCollapsed = true;
            if(event) {
            	event.preventDefault();event.stopImmediatePropagation();
            }
        }

        function ExpandAllSpecNames(event) {
        	vm.originalSpecs.forEach(function (value, index) {
                value.isCollapsed = false;
            });
        	vm.isAllSpecNamesCollapsed = false;
            event.preventDefault();event.stopImmediatePropagation();
        }

        function CollapseAllSpecNames(event) {
        	vm.originalSpecs.forEach(function (value, index) {
                value.isCollapsed = true;
            });
        	vm.isAllSpecNamesCollapsed = true;
            event.preventDefault();event.stopImmediatePropagation();
        }

        $scope.searchInThumbs = function(item, scope) {
        	if (vm.searchThumbnail === '' || vm.searchThumbnail === undefined || (item.pagelabel_s && item.pagelabel_s.toLowerCase().indexOf(vm.searchThumbnail.toLowerCase()) > -1) ||
        			(item.pagename_s && item.pagename_s.toLowerCase().indexOf(vm.searchThumbnail.toLowerCase()) > -1)){
        		return true;
        	} else if (vm.searchThumbnail && ((!item.pagelabel_s && vm.searchThumbnail.toLowerCase().indexOf("sheetnumber") > -1) ||
        			(!item.pagename_s && "sheetname".indexOf(vm.searchThumbnail.toLowerCase()) > -1))){
        		return true;
        	}
        	return false;
        }

        $scope.filterSubmittals = function(item) {
        	return submittalBelongsToCheckbox(item);
        }

        $scope.filterByToggleBtn = function(item){
        	return submittalBelongsToToggleButton(item);
        }

        $scope.filterProcurementLogBySheet = function(item){
        	return vm.allSheetsSlider || (!vm.allSheetsSlider && item.pdfFileName === vm.selectedItem.page.filename && item.pdfPageNumber == vm.selectedItem.page.pagenumber_i);
        }
        $scope.searchProcurementLogs = function(item){
        	var searchKeyWord = vm.searchProcurementLog?vm.searchProcurementLog.toLowerCase() : vm.searchProcurementLog;
        	return !searchKeyWord || (item.description.toLowerCase().indexOf(searchKeyWord) > -1) ||
        	(item.specNumber.toLowerCase().indexOf(searchKeyWord) > -1) ||
        	(item.specName.toLowerCase().indexOf(searchKeyWord) > -1);
        }

        $scope.searchInSidebarRecords = function(item){
        	return submittalBelongsToSearchKeyword(item);
        }

        $scope.searchInAllSubmittalRecords = function(item){
        	return submittalBelongsToSearchKeyword(item, true);
        }

        $scope.toggleSchedules = function(item) {
        	return vm.allSheetsSlider || (!vm.allSheetsSlider && CheckIfRefIsInSelected([item.refs]));
        }

        $scope.searchInSchedules = function(item) {
        	var searchKeyword = vm.searchSchedules ? vm.searchSchedules.toLowerCase() : vm.searchSchedules;
        	return !searchKeyword || item.isEdit || ((item.scheduletitle.toLowerCase().indexOf(searchKeyword) > -1) ||
        			(item.refs.pagelabel_s && item.refs.pagelabel_s.toLowerCase().indexOf(searchKeyword) > -1) ||
        			(item.refs.pagename_s && item.refs.pagename_s.toLowerCase().indexOf(searchKeyword) > -1));
        }

        function CheckIfRefIsInSelected(refs) {
        	for(var index = 0; index < refs.length; index++) {
        		if(refs[index].originalfilename === vm.selectedItem.page.filename && refs[index].pagenumber == vm.selectedItem.page.pagenumber_i)
        			return true;
        	}
        	return false;
        }

        function submittalBelongsToToggleButton(item){
        	return vm.allSheetsSlider || (!vm.allSheetsSlider && item.drawingFileName === vm.selectedItem.page.filename && item.drawingPageNumber == vm.selectedItem.page.pagenumber_i);
        }

        function submittalBelongsToCheckbox(item){
            var subType = GetTypeOfSubmittal(item);
            return (subType === vm.submittalsEnum.submittals && vm.highlightSubs) ||
                    (subType === vm.submittalsEnum.recommended && vm.highlightRecommended && item.action !== 'MOVE');
        }

        function recordBelongsToSearchKeyword(record, keyword, fields){
        	if (keyword === '' || keyword === undefined) return true;
			var searchField,searchStrUpperCase = keyword.toUpperCase();
			for (var index = 0; index < fields.length; index++) {
				searchField = fields[index];
				if(Array.isArray(record[searchField])){
					for(var i = 0; i < record[searchField].length ; i++ ){
						var label = record[searchField][i];
						if(label.replace(/\n/g, " ").toString().toUpperCase().indexOf(searchStrUpperCase) !== -1){
							record.showmore = true;
							return true;
						}
					}
				} else if (record[searchField] && (record[searchField].replace(/\n/g, " ").toString().toUpperCase().indexOf(searchStrUpperCase) !== -1)) {
					record.showmore = true;
					return true;
				}
			}
			return false;
        }

        function submittalBelongsToSearchKeyword(record, allSubmittalsFlag) {
        	if (vm.searchSidebar === '' || vm.searchSidebar === undefined) return true;
            var fields = [ 'specNumber', 'specName', 'submittalDescription', 'specCategory', 'submittalSummary', 'drawingSheetNumber', 'drawingSheetName'];
            var belongs = recordBelongsToSearchKeyword(record, vm.searchSidebar, fields);
            if (belongs) {
                //allSubmittalsFlag ? expandAllSubsCardGroup(record) : expandCardGroup(record);
                if(!allSubmittalsFlag) {
                    expandCardGroup(record);
                }
            }
            return belongs;
		}

        $scope.filterScopeOfWork = function(item){
        	if (!vm.searchThumbnail || (item.sheettype_s && item.sheettype_s.toUpperCase().indexOf(vm.searchThumbnail.toUpperCase()) > -1)){
        		showAllPagesInScopeOfWorkTab(item.pages);
        		return true;
        	} else {
        		var found = searchTextInScopeOfWorkTab(item.pages);
        		return found;
        	}
        }

        $scope.expandAllSubs = function(){
        	this.collapsedAllSubs = !this.collapsedAllSubs;
        	vm.allSubmittals.forEach(function(sub){
        		vm.specGroupsParent[sub.specNumber] = true;
        		vm.sheetGroupsParent[sub.drawingSheetNumber] = true;
        		vm.submittalTypeGroupsParent[sub.specCategory] = true;
        	});
        }

        $scope.collapseAllSubs = function(){
        	this.collapsedAllSubs = !this.collapsedAllSubs;
        	vm.allSubmittals.forEach(function(sub){
        		vm.specGroupsParent[sub.specNumber] = false;
        		vm.sheetGroupsParent[sub.drawingSheetNumber] = false;
        		vm.submittalTypeGroupsParent[sub.specCategory] = false;
        	});
        }

        $scope.addInClassForSubmittal = function(item){
        	return (item.recid === 0 || item.isEdit || item.isAddToRegister) || (vm.submittalView === vm.SubmittalSortView.specnumber.key && vm.specGroupsParent[item.specNumber]) ||
        		(vm.submittalView === vm.SubmittalSortView.sheetnumber.key && vm.sheetGroupsParent[item.drawingSheetNumber]) ||
        		(vm.submittalView === vm.SubmittalSortView.submittaltype.key && vm.submittalTypeGroupsParent[item.specCategory]) ||
        		vm.submittalView === vm.SubmittalSortView.none.key;
        }

        $scope.showSpecGroupHeader = function(){
        	var item = this.item, $index = this.$index;
        	return item.recid !== 0 && !item.isEdit && !item.isAddToRegister && vm.submittalView === vm.SubmittalSortView.specnumber.key && ($index == 0 || vm.submittalsInView[$index - 1].specNumber !== item.specNumber);
        }

        $scope.showSheetGroupHeader = function(){
        	var item = this.item, $index = this.$index;
        	return item.recid !== 0 && !item.isEdit && !item.isAddToRegister && vm.submittalView === vm.SubmittalSortView.sheetnumber.key && ($index == 0 || vm.submittalsInView[$index - 1].drawingSheetNumber !== item.drawingSheetNumber);
        }

        $scope.showSubmittalTypeGroupHeader = function(){
        	var item = this.item, $index = this.$index;
        	return item.recid !== 0 && !item.isEdit && !item.isAddToRegister && vm.submittalView === vm.SubmittalSortView.submittaltype.key && ($index == 0 || vm.submittalsInView[$index - 1].specCategory !== item.specCategory);
        }

        $scope.getGroupCount = function(field, item){
        	var count = 0;
        	vm.submittalsInView.forEach(function(submittal){
        		if (submittal[field] === item[field]){
        			count++;
        		}
        	});
        	return count;
        }

        $scope.collapseSheetType = function(file){
        	$timeout(function(){
        		file.isCollapsed = !file.isCollapsed;
        	}, 0);
        }

        $scope.legendToggleClicked = function(scope){
        	scope.showLegendBar = !scope.showLegendBar;
        }

        function showAllPagesInScopeOfWorkTab(pages){
        	for (var i = 0; i < pages.length; i++) {
        		pages[i].hide = false;
        		if (!pages[i].specDetails) continue;

            	for (var j = 0; j < pages[i].specDetails.length; j++) {
                    pages[i].specDetails[j].hide = false;
            	}
            }
        }

        function searchTextInScopeOfWorkTab(pages){
        	var found = false, pageFound = false;
        	for (var i = 0; i < pages.length; i++) {
        		found = false;
                if (pages[i].pagelabel_s.toUpperCase().indexOf(vm.searchThumbnail.toUpperCase()) > -1 || pages[i].pagename_s.toUpperCase().indexOf(vm.searchThumbnail.toUpperCase()) > -1) {
                    found = true;
                }
                if (!found) {
                	pages[i].hide = true;
                } else {
                    pages[i].hide = false;
                }
                if (!pageFound && found) pageFound = true;
            }
        	return pageFound;
        }

        vm.specSubmittalClicked = function(record) {
            AuthenticationService.SetSpecViewData({ record: record });
            AuthenticationService.SetSpecViewView({ view: 'ConsolidatedView' });
            AuthenticationService.setSmartViewType('specview');
            $scope.$emit('loadSmartViewType', 'specview');
        }

        function submittalCardClicked(record, file, page) {
            var planVersion = vm.selectedProject.planVersions[getPlanVersionIndex()];
        	if (record.isEdit || record.isAddToRegister) return;

            if ($scope.isRecSubmittalClickable(record) === false) return;

            if(record.sourceId && record.sourceModule.toLowerCase()==='plans' && record.sourceId !== 'P'+planVersion.id) {
                FlashService.Error('No sheet found');
                return;
            }

        	if (record.drawingFileName === vm.selectedItem.page.filename && record.drawingPageNumber == vm.selectedItem.page.pagenumber_i) {
        		$scope.pdfIconClicked(record, file, page, false, vm.submittalsEnum.submittals , true);
        	} else {
        		var page = getPage(record.drawingFileName, record.drawingPageNumber);
            	vm.selectedItem.page = page;
            	vm.selectedItem.file = getFileByPage(page);
    			AuthenticationService.SetPlanViewSheetData({ file : vm.selectedItem.file, page : vm.selectedItem.page});
    			postSubmittalChangeActions();
                prepareSheetSpecificSchedules();
            	$scope.pdfIconClicked(record, record.drawingFileName, record.drawingPageNumber, true, GetTypeOfSubmittal(record) ,false);
        	}
        }

        function scheduleRowClicked(record, refs, index){
        	if (record.recid === 0) return;
            $scope.selectedScheduleRow = index;
            vm.selectedSchedule = record;
        	var scheduleKeyword = 'schedule';

            if (record.refs) {
        		record.pageRotation = record.refs.pageRotation;
            	record.pageHeight = record.refs.pageHeight;
            	record.pageWidth = record.refs.pageWidth;
        	}

        	//belongs to same sheet
        	if(record.filename === vm.selectedItem.page.filename && record.pagenumber_i === vm.selectedItem.page.pagenumber_i){
        		$scope.pdfIconClicked(record, record.filename, record.pagenumber_i, false, scheduleKeyword, true);
        	} else {
        		var page = getPage(record.filename, record.pagenumber_i);
            	vm.selectedItem.page = page;
            	vm.selectedItem.file = getFileByPage(page);
            	prepareSheetSpecificSchedules();
    			AuthenticationService.SetPlanViewSheetData({ file : vm.selectedItem.file, page : vm.selectedItem.page});
    			$scope.pdfIconClicked(record, record.filename, record.pagenumber_i, true, scheduleKeyword, false);
        	}
        }


        $scope.pdfIconClicked = function (record, file, page, forceReload, clickedCardType , dontAddToStack) {
        	collapseSubmittalTabShowMoreLinks(vm.allSubmittals, record);
        	record = updateRecordWithDimensions(record);
            $scope.selectedRec = record.recid;
            $scope.selectedRecord = record;
            var zoom = 0;
            if (vm.CURRENT_SCALE > 80) {
            	zoom = UtilService.GetZoomString(record, vm.CURRENT_SCALE);
            } else {
            	zoom = UtilService.GetZoomString(record);
            }
        	createRectangles();

        	var clickedCardObj = {recid : 0, type : ''};
        	if (clickedCardType) clickedCardObj = {recid : record.recid, type : clickedCardType};
        	highlightCombinationOfSubmittals(forceReload, zoom, clickedCardObj , false , dontAddToStack);

        	$timeout(function(){
        		if(vm.pypeSearchPlansPdf) {
        			$("#wrapper-planview").removeClass("toggled");
        			highlightSearchRectangles();
        			return;
        		}
        		if (clickedCardType)
        			highlightRectangle(record);
        	}, 10);
       }

        function updateRecordWithDimensions(record){
        	if (!record.pageWidth){
        		record.pageWidth = vm.currentPDFDimensions.pdfWidth;
        	}
        	if (!record.pageHeight){
        		record.pageHeight = vm.currentPDFDimensions.pdfHeight;
        	}
        	if (!record.pageRotation){
        		record.pageRotation = vm.currentPDFDimensions.pdfRotation;
        	}
        	return record;
        }

        function createRectangles(){
            sendPostMsgToIframe('createRectangles', '');
        }
        $scope.sortSchedulesComparator = function(schedule){
        	return schedule.recid === 0 ? schedule.recid : schedule[$scope.field.name];
        }

        function Upgrade(projectName) {
            var upgradeItems = PopulatingUserDetails(projectName);
            ModalService.showContactUsPopup(upgradeItems);
        }

        function NavigateToReplaceVersion() {
            if(vm.selectedVersion.status.toLowerCase() !== 'completed') {
                var items = {};
                items.message = "Looks like there is no submittal generated for " + vm.selectedVersion.name  + ". Hence, you will not be allowed to Import Plans at this time.";
                items.title = "Oops! You cannot import Plans";
                ModalService.showAlertMessage(items);
            } else {
                var items = {
    				project: vm.selectedProject,
    				version: vm.selectedVersion
    			}
    			items.isOverride = getPlanVersionIndex()!==-1 && vm.selectedProject.planVersions[getPlanVersionIndex()].status.toLowerCase()==='completed';
    			ProjectService.openUploadPlansPopup(1, items)
                .result.then(function() {
                    $route.reload();
                });
            }
        }

        function ContactUs() {
            $location.path('/contactus');
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

        function LoadPlanView() {
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

        function returnUpdatedProject(projectId, callback) {
            SmartRegisterService.GetProjectById(projectId, function (response) {
                if (response.success) {
                    callback(response.data);
                } else {
                    FlashService.Error(response.message);
                    vm.dataLoading = false;
                }
            });
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
                        vm.selectedVersion = vm.selectedProject.versions.filter(function (data) {
                            if (data.versionId === version.versionId)
                                return data;
                        })[0];
                        AuthenticationService.SetVersion(vm.selectedVersion);
                    }
                    else {
                        vm.selectedVersion = vm.selectedProject.versions[0];
                    }
                    LogEvent("Page visit", "User visited PLANVIEW page", "SUCCESS");
					validateAndLoad();
                });
            }
        }

        function showUpgradePopup(project) {
            ModalService.showUpgradePopup(project)
            .result.then(function(data) {
                vm.modalTitle = 'Upgrade Project';
                Upgrade(project.name);
            });
        }

        function validateAndLoad() {
            if (vm.selectedProject.isExpired && !vm.user.isSuperAdmin) {
                vm.Selectedexpired = true;
                if (project.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    showUpgradePopup(project);
                } else if (project.subscriptionStatus.toUpperCase() !== 'TRIAL') {
                    showRenewPopup(project);
                }
            } else {
            	loadMasterSpecCodesndNames();
                if(getPlanVersionIndex()!==-1 && vm.selectedProject.planVersions[getPlanVersionIndex()].status.toLowerCase()==='completed') {
                        loadPlanViewData(vm.selectedProject.projectId, vm.selectedVersion.versionId);
                        loadProcurementLog(vm.selectedVersion.versionId);
                        //LoadDummyAPI();
                } else if(getPlanVersionIndex()!==-1 && vm.selectedProject.planVersions[getPlanVersionIndex()].status.toLowerCase()==='in progress') {
                    getEstimatedCompletionForPlan();
                } else {
                    vm.dataLoading = false;
                }
            }
        }

        function getEstimatedCompletionForPlan() {
            DrawingsService.EstimatedPlanCompletion(vm.selectedProject.projectId, vm.selectedVersion.versionId, function(response) {
                if(response.success) {
                    vm.estimatedPlanCompletion = (response.data===0 ? '0' : Math.floor(response.data));
                } else {
                    vm.estimatedPlanCompletion = '0';
                }
                vm.dataLoading = false;
            });
        }

        function loadMasterSpecCodesndNames() {
        	SmartRegisterService.GetMasterSpecCodeNames(vm.selectedProject.projectId, function (response) {
        		if (response && response.success) {
        			var data = response.data;
        			vm.masterSpecData = [];
                    vm.masterSpecCodes = [];
        			vm.masterSpecNameData = [];
        			var result = UtilService.PrepareMasterSpecNameNumberData(data);
        			vm.masterSpecData = result.masterSpecData;
                    vm.masterSpecCodes = result.masterSpecCodes;
        			vm.masterSpecNameData = result.masterSpecNameData;
        		} else {
        			vm.masterSpecData = [];
                    vm.masterSpecCodes = [];
        			vm.masterSpecNameData = [];
        			FlashService.Error(response.message);
        		}
        	});
        }

	    $scope.onSelectSpecNumberNew = function(item, record) {
			var parts = UtilService.GetSpecNumNameParts(item);
			if (parts && parts.length > 0) {
				record.specNumber = angular.copy(parts[0]);
				record.specName = angular.copy(parts[1]);
			}
		}

	    $scope.onSelectSpecNameNew = function(item, record) {
			var parts = UtilService.GetSpecNameNumParts(item);
			if (parts && parts.length > 0) {
				record.specName = angular.copy(parts[0]);
				record.specNumber = angular.copy(parts[1]);
			}
	    }

	    $scope.onSelectSubmittalType = function(popover, item) {
			popover.specCategory = angular.copy(item);
		}

	    $scope.onSelectSubmittalTypeNew = function(item, record) {
			record.specCategory = angular.copy(item);
		}

        function checkAndUpdateSubsCountInFilterSheets(page, subsCount){
        	vm.filteredSheetsInfo.allSheets.sheets = updateSubsCountInSpecificSheet(vm.filteredSheetsInfo.allSheets.sheets, page, subsCount);
        	vm.filteredSheetsInfo.withSchedules.sheets = updateSubsCountInSpecificSheet(vm.filteredSheetsInfo.withSchedules.sheets, page, subsCount);
        	vm.filteredSheetsInfo.withSubmittals.sheets = updateSubsCountInSpecificSheet(vm.filteredSheetsInfo.withSubmittals.sheets, page, subsCount);
        	vm.filteredSheetsInfo.withoutSubmittals.sheets = updateSubsCountInSpecificSheet(vm.filteredSheetsInfo.withoutSubmittals.sheets, page, subsCount);
        	vm.filteredSheetsInfo.currentfilter.sheets = updateSubsCountInSpecificSheet(vm.filteredSheetsInfo.currentfilter.sheets, page, subsCount);
        }

        function updateSubsCountInSpecificSheet(sheets, page, subsCount){
        	sheets.forEach(function(sheet){
        		if (sheet.pagenumber_i === page.pagenumber_i && sheet.filename === page.filename){
        			sheet.submittalsCount = subsCount;
        		}
        	});
        	return sheets;
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

        $scope.parseParaCodeSecondPart = function (paraCode) {
        	if (!paraCode) {
        		return "";
        	} else if (paraCode.indexOf("-") > -1)
                return (paraCode.substring(paraCode.indexOf("-") + 1) + ".")
            else if (paraCode.indexOf(" ") > -1)
                return (paraCode.substring(paraCode.indexOf(" ") + 1) + ".")
            else if (paraCode.match(/[a-zA-Z]+/g))
                return paraCode.match(/[a-zA-Z]+/g).join(".");
            else
                return "";
        }

        function hasSubmittalsByPageNumber(page) {
        	var confirmedSheetData = vm.confirmedSubmittals.filter(function (item) {
                return (item.drawingFileName == page.filename && item.drawingPageNumber == page.pagenumber_i);
            });
            var recommendedSheetData = vm.recommendedSubmittals.filter(function (item) {
                return (item.drawingFileName == page.filename && item.drawingPageNumber == page.pagenumber_i && item.action !== vm.deletedActionLabel && item.action !== vm.movedActionLabel);
            });
        	return {confirmedSubsCount: confirmedSheetData.length, recommendedSubsCount: recommendedSheetData.length};
        }

        function movePdfToBottomRightCorner(height, width, rotation) {
        	var zoomLeft, zoomTop, thumbnailWrapper, thumbnailResizer, sidebarWrapper, extraSpace = 0;
        	thumbnailWrapper = document.getElementById('thumbnail-wrapper-planview').offsetWidth;
        	thumbnailResizer = document.getElementById('thumbnail-resizer').offsetWidth;
        	sidebarWrapper = document.getElementById('sidebar-wrapper-planview').offsetWidth;
            extraSpace = thumbnailWrapper + thumbnailResizer + sidebarWrapper;
            var zoomPercent = 80;
			switch(rotation) {
        		case 0:
        		case 360: {
        			zoomLeft = width + extraSpace;
        			zoomTop = 0;
        			break;
        		}
        		case 90: {
        			zoomLeft = height + extraSpace;
        			zoomTop = width + extraSpace;
        			break;
        		}
        		case 180: {
        			zoomLeft = 0;
        			zoomTop = height + extraSpace
        			break;
        		}
        		case 270: {
        			zoomLeft =  0;
        			zoomTop =  0;
        			break;
        		}
            }
			var zoomString = 'zoom=' + zoomPercent + ',' + zoomLeft + ',' + zoomTop;
			callZoomToXY(zoomString);
        }

        function prepareHasSubmittals(data, updateFlag, preventFilter) {
        	var submittalsFound, subsCount;
        	var defaultOrderSheets = [];
        	if (vm.allSubmittals && vm.allSubmittals.length > 0) {
        		for(var sheetsIndex = 0; sheetsIndex < data.length; sheetsIndex++) {
            		for(var pageIndex = 0; pageIndex < data[sheetsIndex].pages.length; pageIndex++) {
        				subsCount = hasSubmittalsByPageNumber(data[sheetsIndex].pages[pageIndex]);
        				if (subsCount.confirmedSubsCount > 0) {
            				submittalsFound = true;
            				data[sheetsIndex].pages[pageIndex].hasSubmittals = true;
        				} else {
        					data[sheetsIndex].pages[pageIndex].hasSubmittals = false;
        				}
        				data[sheetsIndex].pages[pageIndex].submittalsCount = subsCount;
        				defaultOrderSheets.push(data[sheetsIndex].pages[pageIndex]);
            		}
            	}
        	} else {
        		//If there are no submittals at all from response then just simply assign zero values to all the sheets
        		for(var sheetsIndex = 0; sheetsIndex < data.length; sheetsIndex++) {
            		for(var pageIndex = 0; pageIndex < data[sheetsIndex].pages.length; pageIndex++) {
        				subsCount = hasSubmittalsByPageNumber(data[sheetsIndex].pages[pageIndex]);
        				data[sheetsIndex].pages[pageIndex].submittalsCount = subsCount;
                        data[sheetsIndex].pages[pageIndex].hasSubmittals = false;
            		}
            	}
        	}
            if (preventFilter) return ;
        	vm.originalSheets = angular.copy(data);
        	vm.originalSheetsAll = angular.copy(data);
        	vm.defaultOrderSheetsNoSort = angular.copy(defaultOrderSheets);
        	vm.defaultOrderSheetsSort = defaultOrderSheets.sort(sortByMultipleKey(['filename', 'pagenumber_i']));
        	if(updateFlag && submittalsFound) {
        		filterSheetsWithSubmittals($scope.filterFlag, true);
        	} else {
        		filterSheetsWithSubmittals(vm.filteredSheetsInfo.allSheets.key, true);
        	}
        }

        function sortByMultipleKey(keys) {
        	var key;
            return function(a, b) {
                if (keys.length == 0) return 0; // force to equal if keys run out
                key = keys[0]; // take out the first key
                if (a[key] < b[key]) return -1; // will be 1 if DESC
                else if (a[key] > b[key]) return 1; // will be -1 if DESC
                else return sortByMultipleKey(keys.slice(1))(a, b);
            }
        }

        function getAllSubsAndSchedsCount() {
        	var allSubmittals = [], filterWithSubmittals = [], filterWithoutSubmittals = [], withSchedules = [];
            var totalSheets = angular.copy(vm.originalSheetsAll);
          	var pages = [], filteredSheets = [], sheet = {}, fileNameIndx = -1, refsFileNames = [], refsPageNumbers = [], totalSheetsTemp = [], allSheets = [];
          	for (var sheetsIndex = 0; sheetsIndex < totalSheets.length; sheetsIndex++) {
          		pages = [];refsFileNames = [];refsPageNumbers = [];fileNameIndx = -1;
          		allSheets = allSheets.concat(totalSheets[sheetsIndex].pages);
          		for (var pageIndex = 0; pageIndex < totalSheets[sheetsIndex].pages.length; pageIndex++) {
          			if(totalSheets[sheetsIndex].pages[pageIndex].hasSubmittals) {
          				filterWithSubmittals.push(totalSheets[sheetsIndex].pages[pageIndex]);
          			}
          			else {
          				filterWithoutSubmittals.push(totalSheets[sheetsIndex].pages[pageIndex]);
          			}
          			if(vm.refs){
          				for (var i = 0; i < vm.refs.length; i++) {
              				if (vm.refs[i].originalfilename === totalSheets[sheetsIndex].pages[pageIndex].filename &&
              						parseInt(vm.refs[i].pagenumber) === parseInt(totalSheets[sheetsIndex].pages[pageIndex].pagenumber_i)) {
              					fileNameIndx = refsPageNumbers.indexOf(vm.refs[i].pagenumber);
              					//If both file name and page number is present in already list then only we need to ignore it
              					if (fileNameIndx > -1 && refsFileNames[fileNameIndx] === vm.refs[i].originalfilename){
              						continue;
              					}
              					refsFileNames.push(vm.refs[i].originalfilename);
              					refsPageNumbers.push(vm.refs[i].pagenumber);
              					pages.push(totalSheets[sheetsIndex].pages[pageIndex]);
              				}
              			}
          			}
      			}
          		if (pages.length > 0) {
  					totalSheetsTemp = totalSheetsTemp.concat(pages);
  				}
          	}
          	vm.filteredSheetsInfo.allSheets.sheets = sortDisplayThumbnails(allSheets);
          	vm.filteredSheetsInfo.withSubmittals.sheets = sortDisplayThumbnails(filterWithSubmittals);
          	vm.filteredSheetsInfo.withoutSubmittals.sheets = sortDisplayThumbnails(filterWithoutSubmittals);
          	vm.filteredSheetsInfo.withSchedules.sheets = sortDisplayThumbnails(totalSheetsTemp);
        }

        function sortDisplayThumbnails(sheets) {
        	var updatedSheets = sheets.sort(function(s1, s2){
        		if (s1.filename > s2.filename) return 1;
        		if (s1.filename < s2.filename) return -1;
        		//Incase file name is same then go to page number
        		if (parseInt(s1.pagenumber_i) > parseInt(s2.pagenumber_i)) return 1;
        		if (parseInt(s1.pagenumber_i) < parseInt(s2.pagenumber_i)) return -1;
        	});
        	return updatedSheets;
        }

        function getWithSchedulesSheets() {
            var totalSheets = angular.copy(vm.originalSheetsAll);
        	var pages = [], filteredSheets = [], sheet = {}, fileNameIndx = -1, refsFileNames = [], refsPageNumbers = [], totalSheetsTemp = [];
        	for (var sheetsIndex = 0; sheetsIndex < totalSheets.length; sheetsIndex++) {
        		pages = [];refsFileNames = [];refsPageNumbers = [];fileNameIndx = -1;
        		for (var pageIndex = 0; pageIndex < totalSheets[sheetsIndex].pages.length; pageIndex++) {
        			for (var i = 0; i < vm.refs.length; i++) {
        				if (vm.refs[i].originalfilename === totalSheets[sheetsIndex].pages[pageIndex].filename &&
        						parseInt(vm.refs[i].pagenumber) === parseInt(totalSheets[sheetsIndex].pages[pageIndex].pagenumber_i)) {
        					fileNameIndx = refsPageNumbers.indexOf(vm.refs[i].pagenumber);
        					//If both file name and page number is present in already list then only we need to ignore it
        					if (fileNameIndx > -1 && refsFileNames[fileNameIndx] === vm.refs[i].originalfilename){
        						continue;
        					}
        					refsFileNames.push(vm.refs[i].originalfilename);
        					refsPageNumbers.push(vm.refs[i].pagenumber);
        					pages.push(totalSheets[sheetsIndex].pages[pageIndex]);
        				}
        			}
    			}
        		if (pages.length > 0) {
        			sheet = {};
					sheet.pages = pages;
					sheet.sheettype_s = totalSheets[sheetsIndex].sheettype_s;
					filteredSheets.push(sheet);
					totalSheetsTemp = totalSheetsTemp.concat(pages);
				}
        	}
        	vm.filteredSheetsInfo.withSchedules.sheets = sortDisplayThumbnails(totalSheetsTemp);
        	return filteredSheets;
        }

        function getFilteredSheets(flag) {
        	var totalSheets = angular.copy(vm.originalSheetsAll), subFlag = (flag === vm.filteredSheetsInfo.withSubmittals.key);
			var filteredSheets = [], totalSheetsTemp = [], otherTotalSheets = [];
			for (var sheetsIndex = 0; sheetsIndex < totalSheets.length; sheetsIndex++) {
				var pages = [];
				var sheet = {};
				for (var pageIndex = 0; pageIndex < totalSheets[sheetsIndex].pages.length; pageIndex++) {
					if (totalSheets[sheetsIndex].pages[pageIndex].hasSubmittals == subFlag) {
						pages.push(totalSheets[sheetsIndex].pages[pageIndex]);
					} else {
						otherTotalSheets.push(totalSheets[sheetsIndex].pages[pageIndex]);
					}
				}
				if (pages.length > 0) {
					sheet.pages = pages;
					sheet.sheettype_s = totalSheets[sheetsIndex].sheettype_s;
					filteredSheets.push(sheet);
					totalSheetsTemp = totalSheetsTemp.concat(pages);
				}
			}

			if (subFlag) {
				vm.filteredSheetsInfo.withSubmittals.sheets = sortDisplayThumbnails(totalSheetsTemp);
				vm.filteredSheetsInfo.withoutSubmittals.sheets = sortDisplayThumbnails(otherTotalSheets);
			} else {
				vm.filteredSheetsInfo.withoutSubmittals.sheets = sortDisplayThumbnails(totalSheetsTemp);
				vm.filteredSheetsInfo.withSubmittals.sheets = sortDisplayThumbnails(otherTotalSheets);
			}
			return filteredSheets;
        }

        function getFilteredScannedSheets(flag) {
        	var totalSheets = angular.copy(vm.originalSheetsAll);
			var filteredSheets = [], totalSheetsTemp = [], otherTotalSheets = [];
			for (var sheetsIndex = 0; sheetsIndex < totalSheets.length; sheetsIndex++) {
				var pages = [];
				var sheet = {};
				for (var pageIndex = 0; pageIndex < totalSheets[sheetsIndex].pages.length; pageIndex++) {
					if (totalSheets[sheetsIndex].pages[pageIndex].ocrEnabled === flag.toString()) {
						pages.push(totalSheets[sheetsIndex].pages[pageIndex]);
					} else {
						otherTotalSheets.push(totalSheets[sheetsIndex].pages[pageIndex]);
					}
				}
				if (pages.length > 0) {
					sheet.pages = pages;
					sheet.sheettype_s = totalSheets[sheetsIndex].sheettype_s;
					filteredSheets.push(sheet);
					totalSheetsTemp = totalSheetsTemp.concat(pages);
				}
			}
			if (flag) {
				vm.filteredSheetsInfo.withScanned.sheets = sortDisplayThumbnails(totalSheetsTemp);
				vm.filteredSheetsInfo.withoutScanned.sheets = sortDisplayThumbnails(otherTotalSheets);
			} else {
				vm.filteredSheetsInfo.withScanned.sheets = sortDisplayThumbnails(otherTotalSheets);
				vm.filteredSheetsInfo.withoutScanned.sheets = sortDisplayThumbnails(totalSheetsTemp);
			}
			return filteredSheets;
        }

        function getDefaultSheetNdPage() {
        	return vm.filteredSheetsInfo.currentfilter.sheets[0];
        }

        vm.extractProcurementLog = function() {
            sendPostMsgToIframe('extractProcurementLog');
            $("#wrapper-planview").removeClass("toggled");
			$('.planview-resizable > .resizer-image> i').addClass('fa-angle-double-left');
            $('.planview-resizable > .resizer-image> i').removeClass('fa-angle-double-right');
			vm.sideBarHidden = true;

            $("#wrapper-planview").removeClass("thumbnail-toggled");
			$('.thumbnail-resizer > .pype-search-toggle-btn > .resizer-image > i').addClass('fa-angle-double-right');
            $('.thumbnail-resizer > .pype-search-toggle-btn > .resizer-image > i').removeClass('fa-angle-double-left');
            vm.thumbnailToggled = false;
        }

        vm.downloadProcurementLogExcel = function() {
            sendPostMsgToIframe('downloadProcurementLogExcel');
        }

        function sendPostMsgToIframe(key, value){
        	var iframe = document.getElementsByClassName('pdfviewer-container');
        	if (iframe && iframe.length > 0){
        		iframe[0].contentWindow.postMessage({message : key, data : value}, window.location.origin);
        	}
        }

		function filterSheetsWithSubmittals(flag, preventLoadPdf) {
			$scope.myPopover2.close(true);
			vm.searchThumbnail = "";
			$scope.isAllCollapsed = false;
			if (flag == vm.filteredSheetsInfo.allSheets.key) {
				$scope.filterType = vm.filteredSheetsInfo.allSheets.label;
				vm.originalSheets = angular.copy(vm.originalSheetsAll);
				vm.filteredSheets = angular.copy(vm.originalSheetsAll);
				$scope.filterFlag = vm.filteredSheetsInfo.allSheets.key;
				vm.filteredSheetsInfo.currentfilter = vm.filteredSheetsInfo.allSheets;
				scrollToSpecificSheetThumbnail();
				if (!preventLoadPdf) {
					var defaultSheet = getDefaultSheetNdPage();
					scopeOfWorkPageClicked(defaultSheet);
				}
			} else {
				var filteredSheets = [];
				if (flag === vm.filteredSheetsInfo.withSchedules.key) {
					filteredSheets = getWithSchedulesSheets();
				}
				else if(flag === vm.filteredSheetsInfo.withScanned.key) {
					filteredSheets = getFilteredScannedSheets(true);
				} else if(flag === vm.filteredSheetsInfo.withoutScanned.key) {
					filteredSheets = getFilteredScannedSheets(false);
				}
				else {
					filteredSheets = getFilteredSheets(flag);
				}
				if (filteredSheets && filteredSheets.length > 0) {
					vm.originalSheets = angular.copy(filteredSheets);
					vm.filteredSheets = angular.copy(filteredSheets);
					if(flag === vm.filteredSheetsInfo.withSubmittals.key) {
						$scope.filterType = vm.filteredSheetsInfo.withSubmittals.label;
						$scope.filterFlag = vm.filteredSheetsInfo.withSubmittals.key;
						vm.filteredSheetsInfo.currentfilter = vm.filteredSheetsInfo.withSubmittals;
					} else if (flag === vm.filteredSheetsInfo.withoutSubmittals.key) {
						$scope.filterType = vm.filteredSheetsInfo.withoutSubmittals.label;
						$scope.filterFlag = vm.filteredSheetsInfo.withoutSubmittals.key;
						vm.filteredSheetsInfo.currentfilter = vm.filteredSheetsInfo.withoutSubmittals;
					} else if (flag === vm.filteredSheetsInfo.withScanned.key) {
						$scope.filterType = vm.filteredSheetsInfo.withScanned.label;
						$scope.filterFlag = vm.filteredSheetsInfo.withScanned.key;
						vm.filteredSheetsInfo.currentfilter = vm.filteredSheetsInfo.withScanned;
					} else if (flag === vm.filteredSheetsInfo.withoutScanned.key) {
						$scope.filterType = vm.filteredSheetsInfo.withoutScanned.label;
						$scope.filterFlag = vm.filteredSheetsInfo.withoutScanned.key;
						vm.filteredSheetsInfo.currentfilter = vm.filteredSheetsInfo.withoutScanned;
					} else {
						$scope.filterType = vm.filteredSheetsInfo.withSchedules.label;
						$scope.filterFlag = vm.filteredSheetsInfo.withSchedules.key;
						vm.filteredSheetsInfo.currentfilter = vm.filteredSheetsInfo.withSchedules;
					}
					if (!preventLoadPdf) {
						var defaultSheet = getDefaultSheetNdPage();
		            	scopeOfWorkPageClicked(defaultSheet);
					}
				} else {
					if(preventLoadPdf) {
						setAllSheetsFilterData(preventLoadPdf);
					} else {
					var msg = "";
					if (flag === vm.filteredSheetsInfo.withSubmittals.key) {
						msg = "Submittals are not identified in any sheet in this project.";
					} else if (flag === vm.filteredSheetsInfo.withoutSubmittals.key) {
						msg = "There are no sheets without submittals in this project.";
					} else if (flag === vm.filteredSheetsInfo.withScanned.key) {
						msg = "There are no sheets with scanned in this project.";
					} else if (flag === vm.filteredSheetsInfo.withoutScanned.key) {
						msg = "There are no sheets without scanned in this project.";
					} else {
						msg = "There are no sheets with schedules in this project.";
					}
					var items = {title : 'Alert', message : msg};
                    ModalService.showAlertMessage(items);
				}
			   }
			}
		}

		function loadPlanViewData(projectId, versionId, dontShowLoader){
			if (!dontShowLoader) {
                vm.dataLoading = vm.showOnlyPdfViewer ? "Loading... Please Wait.." : "Loading PlanView... Please Wait..";
            }
			DrawingsService.GetPlanviewSheetData(projectId, versionId, function (response) {
            	if(response && response.success && response.data && response.data.results && response.data.results.length > 0) {
	                vm.originalSheets = response.data.results;
	                vm.originalSheetsNoSort = angular.copy(vm.originalSheets);
	                sortSheetData();
                    loadPlanViewDataBySpec(projectId, versionId, function(){
	                	SmartRegisterService.GetPlanViewData(vm.selectedProject.projectId, vm.selectedVersion.versionId, function (response) {
		                	if (response && response.success && response.data){
		    					//Assign the data related to confirmed and schedules to their respective variables
		                		getAllTypesOfSubmittalsNSchedulesFromResponse(response);
		    	                //Update the sheets data with hasSubmittal flag and confirmed subs count
		                    	prepareHasSubmittals(vm.originalSheets, true);

		        				getWithSchedulesSheets();
		                    	//All the actions related to filters
		                    	postSubmittalGetFilterActions();
		                    	//All the actions related to previously saved view or submittal
		                    	postSubmittalGetViewActions();
		                    	if($rootScope.enablePypeSearch == "MAX" || $rootScope.enablePypeSearch == "MIN") {
		                    		openPypeSearchRecordInPlanView();
		                    	}
                                // submittals filter data preparation
		                    	prepareQuickFiltrDataNComboOptions(vm.allSubmittals, true);

		    				} else {

		    					initializeAllVariables();
		                		vm.allSpecCategoriesItems = mergeItems(vm.defaultSubmittalTypes, []);
		                    	prepareHasSubmittals(vm.originalSheets, true);
		                    	postSubmittalGetViewActions();
		    				}
                            var tabView = AuthenticationService.GetPlanViewView();
                            if(vm.user.isSuperAdmin && tabView === vm.submittalsEnum.allSubmittals) {
                                $timeout(function() {
                                    vm.View = tabView;
                                }, 0);
                            } else {
                                vm.dataLoading = false;
                            }
		                });
	                });
            	} else {
            	  	vm.originalSheets = [], vm.originalSheetsAll = [];
            	  	initializeAllVariables()
            		vm.dataLoading = false;
               }
            });
		}

		function loadProcurementLog(versionId,callback){
			ProcurementLogService.getProcurementLogs(versionId, function(response){
				if(response.success) {
					vm.procurementLogs  = response.data.records;
				} else {
					vm.procurementLogs = [];
				}
				postProcurementLogChangeActions();
				if(callback)
					callback(response);
			});
		}
        function getScheduleFromParam() {
            if(vm.showOnlyPdfViewer) {
                var stringifiedSchedule = angular.copy(decodeURIComponent(vm.routeParams.schedule));
                return JSON.parse(stringifiedSchedule);
            }
            return angular.copy(vm.routeParams.schedule);
        }

        function goToSchedulesAndHighlight() {
            vm.View = vm.submittalsEnum.schedule;
            var schedule = getScheduleFromParam();
            var foundSchedule = vm.scheduleDS.filter(function(item) {
                return (item.scheduletitle.toLowerCase() === schedule.scheduletitle.toLowerCase()) &&
                        (item.refs.filename === schedule.refs.filename) &&
                        (item.refs.pagelabel_s === schedule.refs.pagelabel_s) &&
                        (item.refs.pagename_s === schedule.refs.pagename_s);
            })[0];
            if(foundSchedule && foundSchedule.index) {
                scheduleRowClicked(foundSchedule, foundSchedule.refs, foundSchedule.index);
                if(!vm.showOnlyPdfViewer) {
                    $timeout(function(){
                        scrollToSpecificElementWithAnimation('#collapseIndexes', '#schedule-'+foundSchedule.index, true, 75);
                    }, 0);
                }
            }
        }

		function initializeAllVariables(){
			vm.confirmedSubmittals = [], vm.recommendedSubmittals = [], vm.allSubmittals = [], vm.allSubmittalsUnchanged = [],
			vm.MaxRecId = 0, vm.scheduleDS = [], vm.nRecId = 0, vm.scheduleDSUnChanged = [],
			vm.referenceDS = [], vm.referenceDSUnchanged = [];vm.procurementLogs = [];
		}

		function loadPlanViewDataBySpec(projectId, versionId, callback){
			callback();
		}

		function sortSpecsData(){
			for (var ind = 0; ind < vm.originalSpecs.length ; ind++){
				vm.originalSpecs[ind].pages.sort(UtilService.DynamicSort('pagelabel_s'));
			}
			vm.originalSpecs.sort(UtilService.DynamicSortMultiple(['specNumber', 'specName']));
		}

		function sortSheetData(){
			for (var ind = 0; ind < vm.originalSheets.length ; ind++){
				for (var sInd = 0; sInd < vm.originalSheets[ind].pages.length; sInd++){
					if (vm.originalSheets[ind].pages[sInd].specDetails){
						vm.originalSheets[ind].pages[sInd].specDetails.sort(UtilService.DynamicSort('specNumber'));
					}
				}
				vm.originalSheets[ind].pages.sort(UtilService.DynamicSort('pagelabel_s'));
			}
			vm.originalSheets.sort(UtilService.DynamicSort('sheettype_s'));
		}

        function postSubmittalGetViewActions(){
        	var fromDashboardSchedules = AuthenticationService.GetProductSchedulesFilter();
        	if (fromDashboardSchedules == 'products'){
        		AuthenticationService.SetProductSchedulesFilter(false);
          	  	vm.View = vm.submittalsEnum.schedule;
          	  	vm.allSheetsSlider = true;
          	  	getAllSubsAndSchedsCount();
        		var defaultSheet = getDefaultSheetNdPage();
          	  	scopeOfWorkPageClicked(defaultSheet);
          	  	return;
        	}

            var DrawingsspecViewData;
            // When Opening Schedules in new Window from SR or Specview
            if(vm.routeParams && vm.routeParams.schedule) {
                vm.highlightSubs = false;
                var schedule = getScheduleFromParam();
                DrawingsspecViewData = { page: schedule.refs };
            } else {
                DrawingsspecViewData = AuthenticationService.GetPlanViewSheetData();
            }
        	if(DrawingsspecViewData){
        		var pageIndex = -1, fileIndex = -1;
        		if (DrawingsspecViewData.page.pagenumber_i){
        			fileIndex = getFileIndexByPage(DrawingsspecViewData.page);
        			if (fileIndex !== -1){
        				pageIndex = getPageIndex(vm.originalSheets[fileIndex].pages, DrawingsspecViewData.page);
        			} else {
        				getAllSubsAndSchedsCount();
        				var defaultSheet = getDefaultSheetNdPage();
                  	  	scopeOfWorkPageClicked(defaultSheet);
                  	  	scrollToSpecificSheetThumbnail();
                        loadAllSubmittalsTab();
                  	  	return;
        			}

        		} else {
        			fileIndex = getFileIndexByPageForSchedule(DrawingsspecViewData.page);
        			if (fileIndex !== -1){
        				pageIndex = getPageIndexForSchedule(vm.originalSheets[fileIndex].pages, DrawingsspecViewData.page);
            			DrawingsspecViewData.page.pagenumber_i = DrawingsspecViewData.page.pagenumber;
            			DrawingsspecViewData.page.filename = DrawingsspecViewData.page.originalfilename;
        			} else {
        				getAllSubsAndSchedsCount();
        				var defaultSheet = getDefaultSheetNdPage();
                  	  	scopeOfWorkPageClicked(defaultSheet);
                	  	scrollToSpecificSheetThumbnail();
                        loadAllSubmittalsTab();
                  	  	return;
        			}
        		}
        		if (pageIndex === -1) {
        			var defaultSheet = getDefaultSheetNdPage();
              	  	scopeOfWorkPageClicked(defaultSheet);
              	  	getAllSubsAndSchedsCount();
              	  	scrollToSpecificSheetThumbnail();
                    loadAllSubmittalsTab();
              	  	return;
        		} else {
        			var PlanViewRecord = angular.copy(AuthenticationService.GetPlanViewRecordData());
        			if(PlanViewRecord) {
                        PlanViewRecord.submittalCategory = vm.submittalsEnum.submittals;
        				$scope.selectedRec = PlanViewRecord.recid;
        				$scope.selectedRecord = PlanViewRecord;
                        $timeout(function() {
                            var tabView = AuthenticationService.GetPlanViewView();
                            if(vm.user.isSuperAdmin && tabView === vm.submittalsEnum.allSubmittals) {
                                SwitchToAllSubmittals(PlanViewRecord);
                            } else if(tabView === vm.submittalsEnum.procurementlog){
	                        	vm.View = vm.submittalsEnum.procurementlog;
	                        	requiredProcurementFlags(PlanViewRecord);
	                        	highlightProcurementLogFromGrid(PlanViewRecord);
                            } else if(!tabView || tabView === vm.submittalsEnum.submittals) {
                                highlightSubmittalFromSR(PlanViewRecord);
                            }
            				scopeOfWorkPageClicked(vm.originalSheets[fileIndex].pages[pageIndex], vm.originalSheets[fileIndex], false, null, null, null, true);
                			$scope.pdfIconClicked(PlanViewRecord, DrawingsspecViewData.page.filename, DrawingsspecViewData.page.pagenumber_i, true, GetTypeOfSubmittal(PlanViewRecord),true);
                        }, 0);
        			}
        			else {
                        loadAllSubmittalsTab();
        				scopeOfWorkPageClicked(vm.originalSheets[fileIndex].pages[pageIndex], vm.originalSheets[fileIndex]);
        			}
        			getAllSubsAndSchedsCount();
        			scrollToSpecificSheetThumbnail();
                    if(!PlanViewRecord) {
                        vm.CollapseAll();
                    }
        		}

              } else {
            	  getAllSubsAndSchedsCount();
            	  var defaultSheet = getDefaultSheetNdPage();
            	  scopeOfWorkPageClicked(defaultSheet);
            	  scrollToSpecificSheetThumbnail();
            	  vm.CollapseAll();
              }
        }

        function loadAllSubmittalsTab() {
            var tabView = AuthenticationService.GetPlanViewView();
            if(vm.user.isSuperAdmin && tabView === 'allSubmittals') {
                $timeout(function() {
                    SwitchToAllSubmittals();
                }, 0);
            }
        }

        function highlightSubmittalFromSR(record) {
            expandCardGroup(record);
            collapseSubmittalTabShowMoreLinks(vm.allSubmittals);
            var recordIndexInCollection = getSubmittalIndex(record, vm.allSubmittals);
            vm.allSubmittals[recordIndexInCollection].showmore = true;
            $timeout(function() {
                scrollToSpecificElementWithAnimation('#cards','#panel-col-' + vm.View + '-' + record.recid, true);
            }, 0);
        }

        function highlightSubmittalInSRTab(record) {
            $timeout(function() {
                expandAllSubsCardGroup(record);
                //collapseSubmittalTabShowMoreLinks(vm.smartRegAllSubmittals);
                //var recordIndexInCollection = getSubmittalIndex(record, vm.smartRegAllSubmittals);
                //vm.smartRegAllSubmittals[recordIndexInCollection].showmore = true;
                $timeout(function() {
                    scrollToSpecificElementWithAnimation('#cards','#panel-col-allSubmittals-' + record.recid, true, 100);
                }, 0);
            }, 0);
        }

        function openPypeSearchRecordInPlanView(){
        	vm.pypeSearchPlansPdf = true;
        	vm.pypeSearchTextForPlans = AuthenticationService.GetSearchTextForPlans();
        	var record, searchRecord;
        	var searchRecordData = AuthenticationService.GetPypeSearchRecordData();
        	if(searchRecordData && searchRecordData.type == 'planview') {
        		vm.planviewSearchRecord = searchRecordData.record
        		record = searchRecordData.record;
        	} else {
        		return ;
        	}
        	var page = getPage(record.drawingFileName, record.drawingPageNumber);
        	vm.selectedItem = {};
        	vm.selectedItem.page = page;
        	vm.selectedItem.file = getFileByPage(page);
			AuthenticationService.SetPlanViewSheetData({ file : vm.selectedItem.file, page : vm.selectedItem.page});
			postSubmittalChangeActions();
        	$scope.pdfIconClicked(record, record.drawingFileName, record.drawingPageNumber, true, GetTypeOfSubmittal(record) ,false);
        }

        function postSubmittalGetFilterActions(){
        	var filterData = AuthenticationService.GetSmartRegisterFilter();
        	$scope.filtersDirty = AuthenticationService.GetShowSaveSmartRegisterFilter();
           // getFilterRelatedValues(filterData);
            if(vm.confirmedSubmittals && vm.confirmedSubmittals.length > 0) {
                vm.uniqueSpecCategory = getDistinctValuesByProperty(vm.confirmedSubmittals, "specCategory").sort();
                vm.allSpecCategoriesItems = mergeItems(vm.defaultSubmittalTypes, vm.uniqueSpecCategory);
            } else {
          	  	vm.allSpecCategoriesItems = mergeItems(vm.defaultSubmittalTypes, []);
            }
        }

        function prepareQuickFiltrDataNComboOptions(submittalRecords, forceReload) {
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

                var uniqueDrawingSheetNumber = getDistinctValuesByProperty(submittalRecords, "drawingSheetNumber", false, true);

                var uniqueDrawingSheetName = getDistinctValuesByProperty(submittalRecords, "drawingSheetName", false, true);

                var uniqueVersions = getDistinctValuesByProperty(submittalRecords, "source", false, true);
                vm.sourceSelectedItemsAll = uniqueVersions;

                uniqueProjectSummaryGroup.sort();

                var projectSummaryGroups = [], specCategories = [], versions = [], specCategoryGroups = [], drawingSheetNumbers = [], sources = [];

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

                var specCategorySelectedItems = convertAllValuesToLowerCase(vm.specCategorySelectedItems);
            	var specCategoryGroupSelectedItems = convertAllValuesToLowerCase(vm.specCategoryGroupSelectedItems);

                vm.drawingSheetNumberSelectedItems = uniqueDrawingSheetNumber;
                vm.drawingSheetNumberSelectedItemsAll = uniqueDrawingSheetNumber;
                vm.numberOfDrawingSheetNumber = angular.copy(uniqueDrawingSheetNumber.length);
                angular.forEach(uniqueDrawingSheetNumber, function (item, index) {
                	drawingSheetNumbers.push({ id: index, value: item, selected : true });
                });

                vm.allDrawingSheetNumber = drawingSheetNumbers;

                vm.sourceSelectedItems = uniqueVersions;
                vm.sourceSelectedItemsAll = uniqueVersions;
                vm.numberOfSource = angular.copy(uniqueVersions.length);
                angular.forEach(uniqueVersions, function (item, index) {
                	sources.push({ id: index, value: item, selected : true });
                });

                vm.allSource = sources;

                if(forceReload) {
                  setTotalValues();
                }
                getSelectedValuesBasedOnFilter();
                updateColumnSelectedValuesFlags(false,  true);
            }
            else {
                initializeAllFilterRelatedValues();
            }
                setAllFilterRelatedTempValues(true);
            }

        function setTotalValues() {
        	for(var key in vm.columnsTotalVarData) {
        		vm[vm.columnsTotalVarData[key].allVar + "Total"] = angular.copy(vm[vm.columnsTotalVarData[key].allVar]);
        	}
        }

        $scope.getAllFiltersSelected = function() {
		    for(var key in vm.columnsTotalVarData) {
				if (vm[key + "SelectedItemsTemp"] && vm[key + "SelectedItemsTemp"].length > 0 && vm[key + "SelectedItems"].length != vm[vm.columnsTotalVarData[key].allVar + "Temp"].length)
						return true;
				}

           return false;
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
                if (submittals[i].specNumber != null) {
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

       function getAllTypesOfSubmittalsNSchedulesFromResponse(response) {
            vm.recommendedSubmittals = [];
            vm.submittals = angular.copy(vm.smartRegPlansSubmittals);

            /* Commented Recommended Submittals Code */
            // Filling Recommended Submittals
            // if (vm.ShowPypeAICheckbox && response.data.pypeRecommendedSubmittals) {
        	// 	vm.recommendedSubmittals = response.data.pypeRecommendedSubmittals;
        	// }
            vm.allSubmittals = vm.submittals.concat(vm.recommendedSubmittals);

            vm.allSubmittalsNoSort = angular.copy(vm.allSubmittals);
            vm.allSubmittals = sortSubmittalsByView(vm.allSubmittalsNoSort);
            vm.allSubmittalsUnchanged = angular.copy(vm.allSubmittals);

            prepareSubsDataWithDifferentTypes();
            prepareSchedulesRelatedData(response.data.schedsAndDivision);
        }

        function postSheetNumberUpdateActions(pagesToUpdate, submittalsToUpdate) {
        	var subInd = 0, uniquePageID, ind = 0;
        	if (pagesToUpdate && pagesToUpdate.length > 0){
        		pagesToUpdate.forEach(function(page){
        			uniquePageID = $scope.replaceSpecialCharacters(page.filename) + page.pagenumber_i;
        			ind = vm.filteredSheetsInfo.currentfilter.sheets.findIndex(function(sheet){
            			return ($scope.replaceSpecialCharacters(sheet.filename) + sheet.pagenumber_i === uniquePageID)
            		});
        			vm.filteredSheetsInfo.currentfilter.sheets[ind].pagelabel_s = page.pagelabel_s;
        			vm.filteredSheetsInfo.currentfilter.sheets[ind].pagename_s = page.pagename_s;
        			vm.filteredSheetsInfo.currentfilter.sheets[ind].sheettype_s = page.sheettype_s;

        			for(var i = 0; vm.originalSheets.length; i++){
            			ind = vm.originalSheets[i].pages.findIndex(function(sheet){
                			return ($scope.replaceSpecialCharacters(sheet.filename) + sheet.pagenumber_i === uniquePageID)
                		});
            			if (ind >= 0) {
            				vm.originalSheets[i].pages[ind].pagelabel_s = page.pagelabel_s;
                			vm.originalSheets[i].pages[ind].pagename_s = page.pagename_s;
                			vm.originalSheets[i].pages[ind].sheettype_s = page.sheettype_s;
                			break;
            			}
            		}
        		});
        	}
        	if (submittalsToUpdate && submittalsToUpdate.length > 0){
        		submittalsToUpdate.forEach(function(submittal){
        			subInd = vm.allSubmittals.findIndex(function(sub){
            			return (sub.recid === submittal.recid && sub.submittalCategory === submittal.submittalCategory)
            		});
        			vm.allSubmittals[subInd] = angular.copy(submittal);

        			subInd = vm.allSubmittalsNoSort.findIndex(function(sub){
            			return (sub.recid === submittal.recid && sub.submittalCategory === submittal.submittalCategory)
            		});
        			vm.allSubmittalsNoSort[subInd] = angular.copy(submittal);
        		});

        		vm.allSubmittalsUnchanged = angular.copy(vm.allSubmittals);
                prepareSubsDataWithDifferentTypes();
        	}

        	var originalScheduleDataTemp = vm.originalScheduleData.schedstodivmap;
        	if (pagesToUpdate && pagesToUpdate.length > 0){
        		for(var i=0; i< pagesToUpdate.length ; i++){
        			for(var j=0; j < originalScheduleDataTemp.length ; j++){
        				var refIndex = originalScheduleDataTemp[j].refs.findIndex(function( tempRef){
        					return (tempRef.originalfilename === pagesToUpdate[i].filename
            						&& tempRef.pagenumber === pagesToUpdate[i].pagenumber_i);
        				});
        				if(refIndex > -1) {
        					originalScheduleDataTemp[j].refs[refIndex].pagelabel_s = pagesToUpdate[i].pagelabel_s;
        					originalScheduleDataTemp[j].refs[refIndex].pagename_s = pagesToUpdate[i].pagename_s;
        				}
        			}
        		}
        	}
            prepareSchedulesRelatedData(vm.originalScheduleData);
        }

        function prepareSchedulesRelatedData(schedsAndDivision){
        	vm.originalScheduleData = schedsAndDivision, vm.refs = [];
            var scheduleObj = [], refObj = [], cnt= 1, tempObj, cnt2=0;
            angular.forEach(schedsAndDivision.schedstodivmap, function (item, index) {
            	   vm.refs = vm.refs.concat(item.refs);
            	   for(var i=0 ; i< item.refs.length ; i++){
            		   tempObj = { index: cnt2++, mappedDivs : item.mappeddivs, scheduletitle : item.scheduletitle, refs: item.refs[i], type : item.type,
            			   sheetDetail : UtilService.getScheduleSheetDetails(item.refs[i]), recid: cnt, uuid : item.refs[i].scheduleUid,
            			   coordinates: item.refs[i].coordinates, filename: item.refs[i].originalfilename, pagenumber_i : item.refs[i].pagenumber};
            		   if (item.type === vm.submittalsEnum.scheduleRef){
            			   refObj.push(tempObj);
            		   } else {
            			   scheduleObj.push(tempObj);
            		   }
            		   cnt++;
            	   }
               });
            vm.scheduleDS = scheduleObj;
            vm.scheduleDSUnChanged = angular.copy(scheduleObj);
            vm.referenceDS = angular.copy(refObj);
            vm.referenceDSUnChanged = angular.copy(refObj);
            vm.maxScheduleRecId = cnt;
        }

        function switchSubmittalsSortOrder(field){
        	vm.submittalView = field;
        	vm.allSubmittals = sortSubmittalsByView(vm.allSubmittalsNoSort);
            vm.allSubmittalsUnchanged = angular.copy(vm.allSubmittals);
        }

        function sortSubmittalsByView(allSubmittals){
        	var submittals = angular.copy(allSubmittals);
        	if (vm.submittalView === vm.SubmittalSortView.sheetnumber.key){
        		submittals = allSubmittals.sort(UtilService.DynamicSort('drawingSheetNumber'));
        	} else if (vm.submittalView === vm.SubmittalSortView.specnumber.key) {
        		//submittals = allSubmittals.sort(UtilService.DynamicSort('specNumber'));
                submittals = allSubmittals.sort(UtilService.DynamicCustomSpecSort());
        	} else if(vm.submittalView === vm.SubmittalSortView.submittaltype.key) {
        		submittals = allSubmittals.sort(UtilService.DynamicSort('specCategory'));
        	}

        	return submittals;
        }

        function mergeItems(defaultValues, customValues) {
        	var result = angular.copy(defaultValues);
        	for (var index = 0; index < customValues.length; index++) {
        		if (customValues[index] && result.indexOf(customValues[index]) === -1) {
        			result.push(customValues[index]);
        		}
        	}
        	result.sort();
        	return result;
        }


        $scope.replaceSpecialCharacters = function(filename) {
        	return filename ? filename.replace(/[^a-zA-Z0-9]/g , '_') : '';
        }

        function getFileIndexByPageForSchedule(page) {
        	var tempPage = "";
        	for(var i = 0; i < vm.originalSheets.length; i++) {
        		for(var j = 0; j < vm.originalSheets[i].pages.length; j++) {
        			tempPage = vm.originalSheets[i].pages[j];
        			if (tempPage.pagenumber_i == page.pagenumber && tempPage.filename == page.originalfilename) {
        				return i;
        			}
            	}
        	}
        	return -1;
        }

        function getPageIndexForSchedule(pages, page) {
        	var pageIndexArray = $.map(pages, function (obj, index) {
                if (obj.pagenumber_i == page.pagenumber && obj.filename == page.originalfilename) {
                    return index;
                }
            });
        	if (pageIndexArray && pageIndexArray.length > 0) {
        		return pageIndexArray[0];
        	}
        	return -1;
        }

        function getPageIndex(pages, page) {
        	var fileName = $scope.replaceSpecialCharacters(page.filename);
        	var pageIndexArray = $.map(pages, function (obj, index) {
                if (obj.pagenumber_i == page.pagenumber_i && $scope.replaceSpecialCharacters(obj.filename) == fileName) {
                    return index;
                }
            });
        	if (pageIndexArray && pageIndexArray.length > 0) {
        		return pageIndexArray[0];
        	}
        	return -1;
        }

        function initializeAllFilterRelatedValues(){
        	for(var key in vm.columnsTotalVarData){
        		vm[key + "SelectedItems"] = [];
        		vm[vm.columnsTotalVarData[key].allVar] = [];
        	}
        }

        function setAllFilterRelatedTempValues(isSubmittals) {
           if(isSubmittals) {
        	for(var key in vm.columnsTotalVarData) {
                vm[vm.columnsTotalVarData[key].searchVar] = "";
        		vm[key + "SelectedItemsTemp"] = angular.copy(vm[key + "SelectedItems"]);
        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = angular.copy(vm[vm.columnsTotalVarData[key].allVar]);
        		vm[vm.columnsTotalVarData[key].selectAllVar] = commonSelectAllChecked(key);
        	 }
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

        function getSelectedValuesBasedOnFilter(){
        	var tempSearch = [], tempValues = [], i, finalList = [];
            if(vm.searchDataTemp && vm.searchDataTemp.length > 0) {
            vm.searchDataTemp.filter(function (data) {
            	if(data.value && data.value.length > 0) {
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
            }
            else {
            	var data;
            	for(var key in vm.columnsTotalVarData) {
            		data = [];
            		data.caption = vm.columnsTotalVarData[key].mapName;
            		data.field = key;
            		data.visisbility = true;
            		data.value = [];
            		vm[key + "SelectedItems"] = [];
            		tempSearch.push(data);
                }
            }
            vm.searchDataTemp = tempSearch;
        }

        function updateColumnSelectedValuesFlags(key,  isSubmittals){
        	var trueFlag = true;
			var falseFlag = false;
    		updateColumnsSelectedValues(key, trueFlag, falseFlag, isSubmittals);
        }

        function updateColumnsSelectedValues(key, trueFlag, falseFlag, isSubmittals){
        	if(!key){
        	  if(isSubmittals){
            	for(var key in vm.columnsTotalVarData){
                    for(var index = 0; index < vm[vm.columnsTotalVarData[key].allVar].length; index++){
                      if(vm[key + "SelectedItems"].indexOf(vm[vm.columnsTotalVarData[key].allVar][index][vm.columnsTotalVarData[key].mapValue]) !== -1){
                          vm[vm.columnsTotalVarData[key].allVar][index].selected = trueFlag;
                      } else {
                          vm[vm.columnsTotalVarData[key].allVar][index].selected = falseFlag;
                      }
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

        }

        function toggleAllCommonFiltersSelection(key, clearAll) {
        	if(vm[vm.columnsTotalVarData[key].selectAllVar] == true || clearAll){
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
        	createRectangles();
        	updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItemsTemp"], true);
         	updateSearchData();
         }


        function toggleClearAllFiltersSelection() {
            for(var key in vm.columnsTotalVarData) {
                  toggleAllCommonFiltersSelection(key, true);
            }
            createRectangles();
        }

        function updateSearchDataVariable(fieldName, caption, values, visibility) {
            var found = -1;
            if (values && values.length >= 0) {
            	if(vm[fieldName+ "SelectedItems"].length === values.length && vm.allSheetsSlider && vm.highlightSubs && vm.highlightRecommended) {
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

        function getMaxRecId(recordsData) {
            var highest = 0;
            $.each(recordsData, function (key, record) {
                if (record.recid > highest)
                    highest = record.recid;
            });
            return highest;
        }

        function getMulitpleIgnoredRecData(submittals) {
        	var submittalIndexes = [], submittalRecids = [], recommendedIndexes = [], recommendedRecids = [];
            submittals.filter(function(sub, index) {
        		if (sub.selected === true){
        			delete sub.isOpen;
                    //delete sub.selected;
                    delete sub.showmore;
                    if (sub.submittalCategory === vm.submittalsEnum.recommended) {
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

        function prepareSheetSpecificSchedules(page){
        	var page = page ? page : vm.selectedItem.page;
        	var allSchedules = angular.copy(vm.scheduleDS);
        	allSchedules = allSchedules.concat(angular.copy(vm.referenceDS));
        	vm.sheetSchedules = getSchedulesByPage(allSchedules, page);
        }

        function prepareSubsDataWithDifferentTypes(){
            vm.allSubmittals = vm.allSubmittals.filter(function(sub){
        		if (sub.submittalCategory !== vm.submittalsEnum.recommended || (sub.action !== 'DELETE' && sub.action !== 'MOVE')){
        			return sub;
        		}
        	});
        	vm.allSubmittalsUnchanged = angular.copy(vm.allSubmittals);
        	vm.confirmedSubmittals = [], vm.recommendedSubmittals = [];
        	for (var i = 0; i < vm.allSubmittals.length; i++){
                switch(vm.allSubmittals[i].submittalCategory) {
    				case vm.submittalsEnum.submittals : {
    					vm.confirmedSubmittals.push(vm.allSubmittals[i]);
    					break;
    				} case vm.submittalsEnum.recommended : {
    					vm.recommendedSubmittals.push(vm.allSubmittals[i]);
    					break;
    				}
    			}

                // if(vm.submittalsEnum.submittals && vm.allSubmittals[i].isUserSubmittal) {
                //     vm.confirmedSubmittals.push(vm.allSubmittals[i]);
                // }
        	}
        }

        function prepareSheetSpecificSubmittals(){
        	var page = vm.selectedItem.page;
        	vm.confirmedSubsResult = loadSubmittalsByPageNumber(page, vm.confirmedSubmittals);
            vm.recommendedSubsResult = loadSubmittalsByPageNumber(page, vm.recommendedSubmittals);

            vm.sheetConfirmedSubs = vm.confirmedSubsResult.records;
            vm.sheetRecommendedSubs = vm.recommendedSubsResult.records;
            vm.sheetAllSubs = vm.sheetConfirmedSubs;
        }

        function postSubmittalChangeActions(){
            vm.submittals = vm.allSubmittals.filter(function(sub){
        		return sub.submittalCategory === vm.submittalsEnum.submittals;
        	});
        	prepareSubsDataWithDifferentTypes();
        	prepareSheetSpecificSubmittals();
        }

        function addNewSheetToPreviousStack(page){
    		vm.nextSheetStack = [];
    		if(!isSheetCurrentTop(page)){
    			var sheetCopy = angular.copy(page);
    			sheetCopy.thumbnaildata = "";
    			vm.previousSheetStack.push(sheetCopy);
    		}
        }

        function isSheetCurrentTop(sheet){
        	if(vm.previousSheetStack.length > 0 && vm.previousSheetStack[vm.previousSheetStack.length - 1].filename === sheet.filename
        			&& vm.previousSheetStack[vm.previousSheetStack.length - 1].pagenumber_i === sheet.pagenumber_i){
        		return true;
        	}
        	return false;
        }


        function getPreviousVisitedPage(){
        	if(vm.previousSheetStack && vm.previousSheetStack.length > 0) {
        		var cur = vm.previousSheetStack.pop();
        		vm.nextSheetStack.push(cur);
        		return (vm.previousSheetStack.length > 0) ? vm.previousSheetStack[vm.previousSheetStack.length - 1] : -1;
        	}
        	return -1;
        }

        function getNextVisitingPage(){
        	if(vm.nextSheetStack && vm.nextSheetStack.length > 0){
        		var cur = vm.nextSheetStack.pop();
        		vm.previousSheetStack.push(cur);
        		return cur;
        	}
        	return -1;
        }

        function previousOpenedPageBtnClicked(){
        	var page = getPreviousVisitedPage();
        	if(page !== -1){
        		var file = getFileByPage(page);
        		scopeOfWorkPageClicked(page , file , false , true);
        	}
        }

        function nextOpenedPageBtnClicked(){
        	var page = getNextVisitingPage();
        	if(page !== -1){
        		var file = getFileByPage(page);
        		scopeOfWorkPageClicked(page , file , false , true);
        	}
        }

        function showAddSuccessMsg(record){
        	FlashService.Success(record.specNumber + " - " + record.specName + " " + record.specCategory + " has been added successfully.");
        }

		  function getRecordIndexByRecid(submittals, recid) {
			if (!submittals || submittals.length <= 0) return -1;

            for (var i = 0; i < submittals.length; i++) {
                if (submittals[i].recid === recid) {
                    return i
                }
            }
		}

        $scope.loadSubmittalTypes = function ($query) {
            var totalSpecCategories = vm.defaultSubmittalTypes;
             return totalSpecCategories.filter(function (type) {
			    return (type.toLowerCase().indexOf($query.toLowerCase()) != -1);
			});
        };

        $scope.loadTags = function ($query) {
            var totalTags = vm.defaultTags;
             return totalTags.filter(function (type) {
			    return (type.toLowerCase().indexOf($query.toLowerCase()) != -1);
			});
        };

        function collapseAllShowMoreLinks(){
        	collapseSpecificSubmittalTypeShowMoreLink(vm.confirmedSubsResult);
        }

        function collapseCurrentTabShowMoreLinks(record){
        	if (vm.View === vm.submittalsEnum.submittals){
        		collapseSpecificSubmittalTypeShowMoreLink(vm.confirmedSubsResult, record);
        	}
        }

        function collapseSubmittalTabShowMoreLinks(submittals, record){
    		for (var j = 0; j < submittals.length; j++) {
    			if (!record || record.recid !== submittals[j].recid){
    				submittals[j].showmore = false;
    			}
    		}
        }

        function collapseSpecificSubmittalTypeShowMoreLink(data, record){
        	for (var i in data.groupedByValues){
        		for (var j = 0; j < data.groupedByValues[i].length; j++){
        			if (!record || record.recid !== data.groupedByValues[i][j].recid){
        				data.groupedByValues[i][j].showmore = false;
        			}
        		}
        	}
        }

        function getFilteredRecordObject(array) {
        	var columns = UtilService.GetSaveSmartregisterColumns();
            return alasql('SELECT ' + columns +' FROM ?', [array]);
        }

        function hovered(file, page) {
            vm.hoveredSubmittal = file.sheettype_s +'-'+ $scope.replaceSpecialCharacters(page.filename) + '-' +page.pagenumber_i;
        }

       function closePopoverCommonCode(){
    	   $scope.myPopover2.opened = false;
           if($scope.myPopover2.isOpen) {
           	 $scope.myPopover2.isOpen[$scope.replaceSpecialCharacters($scope.myPopover2.filename) + "-" +
           		 $scope.myPopover2.pagenumber + ($scope.myPopover2.outsidePopover ? "-out" : "") + 'SIDEBAR'] = false;
           	 $scope.myPopover2.isOpen[$scope.replaceSpecialCharacters($scope.myPopover2.filename) + "-" +
           		 $scope.myPopover2.pagenumber + ($scope.myPopover2.outsidePopover ? "-out" : "") + 'DROPDOWN' ] = false;
           	 $scope.myPopover2.isOpen[$scope.replaceSpecialCharacters($scope.myPopover2.filename) + "-" +
           		 $scope.myPopover2.pagenumber + ($scope.myPopover2.outsidePopover ? "-out" : "") + 'TOPBAR' ] = false;
           }
       }

        $scope.myPopover2 = {
                templateUrl: 'myPopoverTemplate2.html',
                opened: false,
                open: function open(file, page, out, src , unsavedSheetsCount) {
                	sendPostMsgToIframe('movePdfToBottomRightCorner', '');
                	$scope.myPopover2.step = 1;
                    $scope.myPopover2.opened = true;
                    $scope.myPopover2.isOpen = {};
                    $scope.myPopover2.isOpen[$scope.replaceSpecialCharacters(page.filename) + "-" + page.pagenumber_i + ((out)? "-out" : "" + src)] = true;
                    $scope.myPopover2.pagelabel = page.pagelabel_s;
                    $scope.myPopover2.pagenumber = page.pagenumber_i;
                    $scope.myPopover2.sheetname = page.pagename_s;
                    $scope.myPopover2.filename = page.filename;
                    $scope.myPopover2.sheettype = (page.sheettype_s) ? page.sheettype_s : window.scope.$$childHead.vm.selectedItem.file.sheettype_s;
                    $scope.myPopover2.page = page;
                    $scope.myPopover2.file = file;
                    $scope.myPopover2.outsidePopover = out;
                    $scope.myPopover2.unsavedSheetsCount = unsavedSheetsCount;
                    var pageIndex = getPageIndex(vm.filteredSheetsList, vm.selectedItem.page);
                    $scope.myPopover2.pageIndex = pageIndex;
                    $scope.myPopover2.popoverplacement = ((pageIndex === vm.filteredSheetsList.length - 1) && vm.filteredSheetsList.length !== 1) ? "right-bottom" : "right-top";
                },
                close: function (fromView) {
                	if (fromView) {
                		if (vm.unsavedSheets && vm.unsavedSheets.length > 0) {
                			$scope.doShowConfirmPopup = true;
                		} else {
                			initDataRelToSheetChangeFlow();
                    		closePopoverCommonCode();
                		}
                	} else {
                		closePopoverCommonCode();
                    }
                },
                next: function(frm) {
                	getDisciplineNSpecData(frm, function(){
                		$scope.myPopover2.save(frm);
                	});
                },
                back: function() {
                	$timeout(function(){
                		$scope.myPopover2.step = 1;
                	}, 0);
                },
                nextSheet: function(frm){
                	doPostNextOrPrevSheetBtnClick('nextPageBtnClicked', frm);
                },
                previousSheet: function(frm){
                	doPostNextOrPrevSheetBtnClick('previousPageBtnClicked', frm);
                },
                save: function (frm) {
                	var updatedPage = angular.copy($scope.myPopover2.page);
                	updatedPage.pagename_s = $scope.myPopover2.sheetname;
                	updatedPage.pagelabel_s = $scope.myPopover2.pagelabel;
                	updatedPage.sheettype_s = $scope.myPopover2.sheettype;

                	if (frm.$dirty) {
                		vm.unsavedSheets.push(updatedPage);
                		getNUpdateDataToUpdateOnSheetChange(updatedPage);
                	}
                	if (vm.unsavedSheets.length > 0) {
                		updateMultipleSheets();
                		$scope.myPopover2.unsavedSheetsCount = 0;
                		vm.unsavedSheets = [];
                		vm.unsavedSheetsPreviousData = [];
                	} else {
                		FlashService.Error('No changes present to update sheet');
                	}
              },
              Yes: function(){
            	$scope.doShowConfirmPopup = false;
  				initDataRelToSheetChangeFlow();
          		closePopoverCommonCode();
              },
              No: function(){
            	  $scope.doShowConfirmPopup = false;
              }
        }

        function getDisciplineNSpecData(frm, callback){
        	DrawingsService.getDisciplineNSpecsByPageNumber(vm.selectedProject.projectId, vm.selectedVersion.versionId, $scope.myPopover2.pagelabel ,
 				    function (response) {
 					    if (response && response.success == 0) {
 					    	$scope.identifiedDisciple = response.discipline;
								if (response.specName && response.specNumber) {
									$scope.sheetNameSpecName = response.specName;
									$scope.sheetNameSpecNumber = response.specNumber;
								 }
				    	callback(true);
				    } else {
									$scope.dataLoading = false;
				        callback(false);
				    }
			  });
        }

        $scope.closeForSpecificView = function(){
	        if($scope.doShowConfirmPopup && !$scope.unsavedSheetView){
	        	$scope.myPopover2.Yes();
	        }
	        else {
	        	$scope.myPopover2.close(true);
		    }
        }

        $scope.openUnsavedSheetView= function(){
        	var container = document.getElementsByClassName("my-popover-template-thumbnail");
        	container[0].classList.add("set-zindex-to-1");
        	if($scope.doShowConfirmPopup){
        		$scope.previousEditPopupView = "confirmSheetChangesView";
        		$scope.doShowConfirmPopup = false;
        	}else{
        		$scope.previousEditPopupView = "EditPopupView";
        	}
        	$scope.unsavedSheetView = true;
        	showPendingSheetsPopup(vm.unsavedSheetsPreviousData , 'pending-changes-modal' ,function(goBackToPreviousView){
    			if (goBackToPreviousView) {
    				$scope.goBackToPreviousPopupState();
    			}
    		});
        }

        $scope.goBackToPreviousPopupState = function(){
        	$scope.unsavedSheetView = false;
        	if($scope.previousEditPopupView === "confirmSheetChangesView"){
        		$scope.doShowConfirmPopup = true;
         					    } else {
        		$scope.doShowConfirmPopup = false;
        	}
        }

        function initDataRelToSheetChangeFlow(){
    		vm.unsavedSheets = [];
    		vm.unsavedSheetsPreviousData= [];
    		vm.submittalsToUpdate = [];
    		vm.submittalsToUpdateUnchageVersion = [];
        }

        function getNUpdateDataToUpdateOnSheetChange(updatedPage) {
        	var subs = getSubmittalsToUpdate(updatedPage);
    		vm.submittalsToUpdate = vm.submittalsToUpdate.concat(subs.updatedSubs);
    		vm.submittalsToUpdateUnchageVersion = vm.submittalsToUpdateUnchageVersion.concat(subs.unchangedVerOfUpdatedSubs);
        }

        function doPostNextOrPrevSheetBtnClick(relatedFuncName, frm){
        	var updatedPage = angular.copy($scope.myPopover2.page);
        	updatedPage.pagename_s = $scope.myPopover2.sheetname;
        	updatedPage.pagelabel_s = $scope.myPopover2.pagelabel;
        	updatedPage.sheettype_s = $scope.myPopover2.sheettype;

        	var unUpdatedPage = angular.copy(vm.selectedItem.page);
        	unUpdatedPage.sheettype_s = angular.copy(vm.selectedItem.file.sheettype_s);

        	//We are doing same stuff for both next sheet click and previous sheet click, inorder to avoid duplication of code I'm passing function name which we need to call in between
        	//When it is required to call we call it using vm function name and it will call it and other stuff is actually same.
        	var pageIndex = vm[relatedFuncName](true);

        	//temporary Fix.. will not do anything if we are at first sheet and user clicks previous
        	//or if at last sheet , user clicks next .
        	if((pageIndex === -1 && relatedFuncName === 'previousPageBtnClicked')||
        			(pageIndex == vm.filteredSheetsList.length && relatedFuncName === 'nextPageBtnClicked')){
        		return;
         					    }


        	var page = vm.filteredSheetsList[pageIndex];
        	var file = getFileByPage(page);
        	var popover2Context = $scope.myPopover2;

        	//to check whether the same sheet has been updated previously
        	vm.uniqueUnsavedSheets = [];
        	for(var i=0; i< vm.unsavedSheets.length ; i++){
        		if(vm.unsavedSheets[i].filename !== updatedPage.filename ||
        				vm.unsavedSheets[i].pagenumber_i !== updatedPage.pagenumber_i){
        			var sheet = angular.copy(vm.unsavedSheets[i]);
        			vm.uniqueUnsavedSheets.push(sheet);
        		}
        	}

        	$timeout(function(){
        		popover2Context.open(file, page, false, 'SIDEBAR' ,
        				(frm.$dirty) ? vm.uniqueUnsavedSheets.length +1 : vm.uniqueUnsavedSheets.length);
        		if (frm.$dirty) {
        			getDisciplineNSpecData(frm, function(){
        				if(vm.uniqueUnsavedSheets.length != vm.unsavedSheets.length) {
        					var sameSheetUpdated = true;
        				}
        				vm.uniqueUnsavedSheets.push(updatedPage);

        				vm.unsavedSheets = angular.copy(vm.uniqueUnsavedSheets);
                		var changedFields= [];
                		if(frm.sheetname.$dirty){
                			changedFields.push("sheetname");
                		}
                		if(frm.sheettype.$dirty){
                			changedFields.push("sheettype");
                		}
                		if(frm.pagelabel.$dirty){
                			changedFields.push("pagelabel");
                		}


                		if(sameSheetUpdated){
                			for(var i=0 ;i< vm.unsavedSheetsPreviousData.length ; i++){
                				if(vm.unsavedSheetsPreviousData[i].oldrecord.pagenumber_i === updatedPage.pagenumber_i
                						&& vm.unsavedSheetsPreviousData[i].oldrecord.filename === updatedPage.filename){
                					vm.unsavedSheetsPreviousData[i].newrecord = updatedPage;
              }
        }
                		}else{
                			var sheetchangeObj = {oldrecord:unUpdatedPage , newrecord:updatedPage , changes: changedFields};
                    		vm.unsavedSheetsPreviousData.push(sheetchangeObj);
                		}
                		getNUpdateDataToUpdateOnSheetChange(updatedPage);
                	});
            	}
        	}, 1000);
        }

        function getSubmittalsToUpdate(updatedPage){
        	var unChangedVersionOfUpdatedSubs = [], uniquePageID = $scope.replaceSpecialCharacters(updatedPage.filename) + updatedPage.pagenumber_i;
        	var updatedSubs = vm.allSubmittals.filter(function(submittal){
        		return (uniquePageID === $scope.replaceSpecialCharacters(submittal.drawingFileName) + submittal.drawingPageNumber);
        	}).map(function(submittal){
        		unChangedVersionOfUpdatedSubs.push(angular.copy(submittal));
        		if (!submittal.specName || !submittal.specNumber) {
    				submittal.specName = $scope.sheetNameSpecName ? angular.copy($scope.sheetNameSpecName) : submittal.specName;
    				submittal.specNumber = $scope.sheetNameSpecNumber ? angular.copy($scope.sheetNameSpecNumber) : submittal.specNumber;
         		}
				submittal.drawingSheetNumber = updatedPage.pagelabel_s ? updatedPage.pagelabel_s : submittal.drawingSheetNumber;
				submittal.drawingSheetName = updatedPage.pagename_s ? updatedPage.pagename_s : submittal.drawingSheetName;
				submittal.drawingSheetType = updatedPage.sheettype_s ? updatedPage.sheettype_s : submittal.drawingSheetType;
        		return submittal;
        	});
        	return {updatedSubs : updatedSubs, unchangedVerOfUpdatedSubs : unChangedVersionOfUpdatedSubs};
        }

        function updateMultipleSheets(sheets){
        	vm.dataLoading = "Updating Sheet Number and Sheet Name... Please wait";
        	var unsavedUniqueSheets = [], submittalsToUpdate = [], submittalsToUpdateUnChanged = [];
        	for (var i = vm.unsavedSheets.length - 1, unsavedSheetUniqueIds = []; i >= 0 ; i--){
        		var uniqueId = $scope.replaceSpecialCharacters(vm.unsavedSheets[i].filename) + vm.unsavedSheets[i].pagenumber_i;
        		if (unsavedSheetUniqueIds.indexOf(uniqueId) === -1) {
        			vm.unsavedSheets[i].thumbnaildata = '';
        			delete vm.unsavedSheets[i].submittalsCount;

        			unsavedUniqueSheets.push(vm.unsavedSheets[i]);
        			unsavedSheetUniqueIds.push(uniqueId);
        		}
        	}

        	var submittalWarpperChanges = [], submittalWrapperUpdatedRecords = [];
        	var filteredSubmittalList = getFilteredRecordObject(vm.submittalsToUpdate);
        	for (var i = vm.submittalsToUpdate.length - 1, passedRecIds = []; i >= 0; i--){
        		if (passedRecIds.indexOf(vm.submittalsToUpdate[i].recid + vm.submittalsToUpdate[i].submittalCategory) === -1){
        			submittalsToUpdate.push(vm.submittalsToUpdate[i]);
        			submittalsToUpdateUnChanged.push(vm.submittalsToUpdateUnchageVersion[i]);
        			var change = { action: "Update", newRecord: vm.submittalsToUpdate[i], oldRecord : vm.submittalsToUpdateUnchageVersion[i] };
                    if(vm.submittalsToUpdate[i].submittalCategory === vm.submittalsEnum.recommended) {
        				recommendedWrapperChanges.push(change);
        				recommendedWrapperupdatedRecords.push(angular.copy(filteredSubmittalList[i]));
        			} else {
        				submittalWarpperChanges.push(change);
        				submittalWrapperUpdatedRecords.push(angular.copy(filteredSubmittalList[i]));
        			}
        			passedRecIds.push(vm.submittalsToUpdate[i].recid + vm.submittalsToUpdate[i].submittalCategory);
        		}
        	}
        	var submittalWrapper;
        	if(submittalWrapperUpdatedRecords.length > 0){
        		submittalWrapper = createSmartRegisterRecordWrapper("PlanView", [], [],submittalWrapperUpdatedRecords , [], [], submittalWarpperChanges);
        	}

        	//Here we have access to subs to update and original subs
        	DrawingsService.UpdateSheetNameNNumber(vm.selectedProject.projectId, vm.selectedVersion.versionId, unsavedUniqueSheets, null, submittalWrapper, null, [], function(response) {
        		if (response && response.success){
        			$scope.myPopover2.close();
        			vm.dataLoading = false;
        			postSheetNumberUpdateActions(unsavedUniqueSheets, submittalsToUpdate);
                    FlashService.Success('Sheet(s) updated Successfully.');
        		} else {
        			FlashService.Error('Problem while updating sheet name and number');
        			vm.dataLoading = false;
        		}
        	});
        }

        function createSmartRegisterRecordWrapper(operation , addedRecords , copiedRecords , updatedRecords , deletedRecords , notifications , changes){
 		    return {
 		    	operation: operation, addedRecords: addedRecords, copiedRecords: copiedRecords, updatedRecords: updatedRecords, deletedRecords: deletedRecords,
 		    	notifications: notifications, changes: changes
 		    };
 		}

        function openSchedulesSmartBuild(schedule, sheet, index) {
        	$scope.selectedScheduleRow = index + schedule.type;
   	    	if ($scope.filterFlag === vm.filteredSheetsInfo.allSheets.key ) {
   	    		filterSheetsWithSubmittals(vm.filteredSheetsInfo.allSheets.key, true);
   	    	}
      		vm.enableUndoButton = false;
      		var fileIndex = getFileIndexByPageForSchedule(sheet);
      		var pageIndex = getPageIndexForSchedule(vm.originalSheets[fileIndex].pages, sheet);

      		AuthenticationService.SetPlanViewSheetData({ file : vm.originalSheets[fileIndex], page : vm.originalSheets[fileIndex].pages[pageIndex]});
      		LoadDrawingsPDF(vm.originalSheets[fileIndex], vm.originalSheets[fileIndex].pages[pageIndex], fileIndex, pageIndex, true, true);
        	SwitchTextView2(true);
        }

        function selectAllSubmittals(flag) {
        	if(flag) {
        		$scope.allSubmittalsSelected = angular.copy(!$scope.allSubmittalsSelected);
        	}
        	else {
        		$scope.allSubmittalsSelected = false;
        	}
        	vm.submittalsInView.filter(function(item){
        		item.selected = $scope.allSubmittalsSelected;
        	});
        }

        function selectAllProcurementLogs(){
        	vm.allProcurementLogsSelected = !vm.allProcurementLogsSelected;
        	vm.filteredProcurementLogs.forEach(function(item){
        		item.selected = vm.allProcurementLogsSelected;
        	});
        }

        function deleteSingleProcurementLog(lineitem){
        	var deletedItems = [];
        	delete lineitem.selected;
        	deletedItems.push(lineitem);
        	deleteProcurementLogItems(deletedItems);
        }

        function deleteSelectedProcurementLogs(){
        	var deletedItems = [];
        	vm.filteredProcurementLogs.forEach(function(item){
        		if(item.selected){
        			delete item.selected;
        			deletedItems.push(item);
        		}
        	});
        	deleteProcurementLogItems(deletedItems);
        }

        function copySingleProcurementLog(item){
        	var copiedItems = [];
        	delete item.selected;
        	copiedItems.push(item);
        	copyProcurementLogItems(copiedItems);
        }

        function copyMultipleProcurementLog(item,n){
        	var copiedItems = [];
        	delete item.selected;
        	for(var i=0;i<n;i++){
        		copiedItems.push(item);
        	}
        	copyProcurementLogItems(copiedItems);
        }

        function copyProcurementLogItems(copiedItems){
        	var changesets = [];
        	copiedItems.forEach(function(item){
        		if(item.coordinates && item.coordinates.length === 0)
            		delete item.coordinates;
        		var changeset = {record:item, actions:["CREATE"]};
        		changesets.push(changeset);
        	});
        	ProcurementLogService.saveProcurementLogs(vm.selectedVersion.versionId,changesets,function(response){
        		if(response.success){
        			vm.procurementLogs = response.data.records;
        			var modifiedRecords = getRecentlyUpdatedProcurementLogs(vm.procurementLogs,response.data.updatedTime);
        			FlashService.Success("Successfully copied the procurement log(s)")
        			postAddEditProcurementLog(modifiedRecords[0]);
        		}else{
        			FlashService.Error("Failed to copy the procurement logs")
        		}
        	});
        }

        function deleteProcurementLogItems(deletedItems){
        	var changesets = [];
        	if(!deletedItems || deletedItems.length === 0){
        		FlashService.Error("Select at least one procurement log to delete");
        		return;
        	}
        	deletedItems.forEach(function(item){
        		if(item.coordinates && item.coordinates.length === 0)
        			delete item.coordinates;
        		var changeset = { record: item, actions: ["DELETE"] };
        		changesets.push(changeset);
        	});
        	ProcurementLogService.saveProcurementLogs(vm.selectedVersion.versionId, changesets, function(response){
        		if(response.success) {
        			vm.procurementLogs  = response.data.records;
        			postProcurementLogChangeActions();
        			FlashService.Success("Successfully deleted the selected procurement log(s)");
        		} else {
        			FlashService.Error("Failed to delete the procurement logs");
        		}
        	});
        }
        function openProcurementLogToRegisterModal(item) {
          var modalInstance = $uibModal.open({
				animation : true,
				templateUrl : MAINURL
						+ 'views/smartview/planview/add.single.procurementlog.submittal.html?version=9.8',
				controller : 'AddSingleProcurementlogSubmittalController',
				backdrop : 'static',
                windowClass : 'add-as-submittal',
				resolve : {
					lineitem:item
				}
			});

			modalInstance.result.then(function(data) {
				addProcurementLogToRegister(data);
			}, function() {
			});
		}

        function addProcurementLogToRegister(item){
        	vm.dataLoading = "Adding Procurement log item as submittals..."
        	delete item.selected;
        	if(item.coordinates && item.coordinates.length === 0)
        		delete item.coordinates;
        	var changesets = [];
        	changesets.push({record:item,actions:["ADD_TO_SMARTREGISTER"]})
        	ProcurementLogService.saveProcurementLogs(vm.selectedVersion.versionId,changesets,function(response){
        		if(response.success){
        			var responseData  = response.data.records;
                    vm.procurementLogs = addProcurementFlags(responseData);
                    var modifiedRecords = getRecentlyUpdatedProcurementLogs(vm.procurementLogs,response.data.updatedTime);
        			LoadSRPlansRecords(function() {
                        LoadPlanView();
                    });
        			postAddEditProcurementLog(modifiedRecords[0]);
        			FlashService.Success("Successfully added procurement log as submittal");
        		}else{
        			FlashService.Error("Failed to add the procurement logs as submittals")
        		}
        	});

        }

        $scope.saveProcurementLogEdit = function(form,item,callback){
			  if (!form || !form.$invalid) {
              var changes = [];
              if(item.coordinates && item.coordinates.length === 0)
            	  delete item.coordinates;
              if(vm.addNewProcurementLog) {
            	  delete item.isNew;
            	  delete item.id;
            	  delete item.serialNumber;
            	  changes.push({record:item,actions:["CREATE"]});
              } else {
            	  delete item.isEdit;
            	  changes.push({record:item,actions:["UPDATE"]});
              }
              vm.dataLoading = "Saving Procurement Log...Please wait...";
              ProcurementLogService.saveProcurementLogs(vm.selectedVersion.versionId, changes, function (response){
					if(response.success) {
                      vm.procurementLogs  = response.data.records;
                      var modifiedRecords = getRecentlyUpdatedProcurementLogs(vm.procurementLogs,response.data.updatedTime);
                      if(vm.addNewProcurementLog){
                    	  FlashService.Success("Successfully added new procurement log item");
                      }else{
                    	  FlashService.Success("Successfully updated procurement log item");
                      }
                      if(callback) {
                          callback();
                      }
					} else{
						FlashService.Error("Error in updating the procurement log");
					}
					vm.addNewProcurementLog = false;
					vm.disableprocurementAddIcon = false;
				  // for manual add and edit there will be only most recent updated record.
				  postAddEditProcurementLog(modifiedRecords[0]);
                  vm.dataLoading = false;
				});
			} else {
				FlashService.Error('Please fill all mandatory fields to continue');
			}

        }

        function getRecentlyUpdatedProcurementLogs(procurementLogs,updatedTime){
        	return procurementLogs.filter(function(item) {
                       return item.updatedTime === updatedTime;
                });
        }

        $scope.editProcurementLogClicked = function(item){
        	vm.disableprocurementAddIcon = true;
        	item = UtilService.decodeStringFields(item);
        	procurementLogForms(item,'isEdit');
        }

        $scope.cancelProcurementLogEdit = function(form,item){
        	resetProcurementLogEdits(form,item);
        }

        $scope.editProcurementLogEnabled = function(item){
        	$timeout(function(){
        		scrollToSpecificElementWithAnimation('#cards','#panel-col-procurement-' + item.id, true, 15);
        		$('#edit-specName-' + item.id).focus();
        	}, 0);
        }
        $scope.addToProcurementLogEnabled = function(item){
        	$timeout(function(){
        		scrollToSpecificElementWithAnimation('#cards','#panel-col-procurement-' + item.id, true, 15);
        		$('#edit-specName-' + item.id).focus();
        	}, 0);
        }


        function procurementLogForms(item,field){
        	var editFormName = 'editProcurementLogItem';
        	var addFormName = 'addProcurementLogItem';
        	var editProcurementForm = angular.element('form[name="' + editFormName + '"]');
        	var addProcurementForm = angular.element('form[name="'+ addFormName +'"]');
        	var procurementFormScopeElement,procurementFormScope,previousForm;
        	if(editProcurementForm.length === 0 && addProcurementForm.length === 0){
        		item[field] = true;
        		return;
        	}else if(editProcurementForm.length > 0){
        		procurementFormScopeElement = editProcurementForm.scope();
        		procurementFormScope = procurementFormScopeElement[editFormName];
        		previousForm = procurementFormScopeElement.formItem;
        	}else if(addProcurementForm.length > 0){
        		procurementFormScopeElement = addProcurementForm.scope();
        		procurementFormScope = procurementFormScopeElement[addFormName];
        		previousForm = procurementFormScopeElement.formItem;
        	}
        	resetProcurementLogEdits(procurementFormScope, previousForm, function(allowedToProceed){
                if (allowedToProceed) {
                    item[field] = true;
                }
                else {
                    $timeout(function(){
                        scrollToSpecificElementWithAnimation('#cards','#panel-col-procurement-' +item.id, true);
                    }, 0);
                }
            });
        }

        function resetProcurementLogEdits(form, item, callback){
        	var index = getProcurementItemIndex(item, vm.procurementLogs);
        	if (form.$dirty) {
        		var title = 'Alert', message = 'You have unsaved changes. Are you sure you want to cancel?';
        		showConfirmPopup(message, title, 'confirm-change-popup', function(allowedToContinue){
                    if (allowedToContinue) {
                        cancelProcurementLogChanges(index);
                        if (callback) callback(true);
        			} else {
        				if (callback) callback(false);
        			}
        		});
        	} else {
        		cancelProcurementLogChanges(index);
        		if (callback) callback(true);
        	}
        }

        function cancelProcurementLogChanges(index){
        	vm.procurementLogs[index].isEdit = false;
        	vm.procurementLogs[index].isNew = false;
        	if (vm.addNewProcurementLog) {
                vm.procurementLogs.pop();
            }
        	vm.addNewProcurementLog = false;
            vm.disableprocurementAddIcon = false;
        }

        function getProcurementItemIndex(item, procurementLogs){
        	var index = -1;
    		for (var i = 0; i < procurementLogs.length; i++){
    			if (procurementLogs[i].id === item.id){
    				index = i;
    				break;
    			}
    		}
    		return index;
        }

        $scope.addProcurementLogClicked = function() {
            vm.disableprocurementAddIcon = true;
            vm.addNewProcurementLog = true;
            var item = addNewProcurementLogItem();
            vm.procurementLogs.push(item);
            procurementLogForms(item, 'isNew');
        }

        function getMaxProcurementNumber(procurementLogs) {
            var highest = 0;
            procurementLogs.forEach(function(item){
            	if(item.id > highest)
            		highest = item.id;
            });
            return highest;
        }

        $scope.onSelectScheduleProcurement = function(schedule,item){
        	if(schedule.sheetDetail){
        		var sheetDetails = schedule.sheetDetail.split("-");
        		item.sheetNumber = sheetDetails[0]?sheetDetails[0].trim().toUpperCase():"";
        		item.sheetName = sheetDetails[1]?sheetDetails[1].trim().toUpperCase():"";
        	}
        	item.pdfFileName = schedule.filename;
        	item.scheduleName = schedule.scheduletitle;
        	item.scheduleUid = schedule.uuid;
        	item.pdfPageNumber = schedule.pagenumber_i;
        }

        function addNewProcurementLogItem(){
        	var item = {};
        	item.isNew = true;
        	var maxNum = getMaxProcurementNumber(vm.procurementLogs);
        	maxNum++;
        	item.id = maxNum;
        	item.serialNumber = maxNum;
        	item.addedToSmartRegister = false;
        	return item;
        }

        function switchProcurementLogsSortOrder(field){
        	vm.procurementLogView = field;
        	vm.procurementLogs = sortProcurementLogsByView(vm.procurementLogs);
        }

        function sortProcurementLogsByView(procurementLogs){
        	var logs = angular.copy(procurementLogs);
        	if (vm.procurementLogView === vm.procurementLogSortView.specnumber.key) {
        		logs = procurementLogs.sort(UtilService.DynamicCustomSpecSort());
        	}else if (vm.procurementLogView === vm.procurementLogSortView.sheetnumber.key){
        		logs = procurementLogs.sort(UtilService.DynamicSort('sheetNumber'));
        	}
        	return logs;
        }
        function expandAllProcurementLogs(){
        	$scope.procurementLogsCollapsed = !$scope.procurementLogsCollapsed;
        	vm.procurementLogs.forEach(function(item){
        		vm.procurementLogSpecGroup[item.specNumber] = true;
        		vm.procurementLogSheetGroup[item.sheetNumber] = true;
        	});
        }

        function collapseAllProcurementLogs(){
        	$scope.procurementLogsCollapsed = !$scope.procurementLogsCollapsed;
        	vm.procurementLogs.forEach(function(item){
        		vm.procurementLogSpecGroup[item.specNumber] = false;
        		vm.procurementLogSheetGroup[item.sheetNumber] = false;
        	});
        }

        $scope.getGroupProcurementLogCount = function(field, item){
        	var count = 0;
        	vm.filteredProcurementLogs.forEach(function(lineitem){
        		if (lineitem[field] === item[field]){
        			count++;
        		}
        	});
        	return count;
        }

        $scope.addInClassProcurementLog = function(item){
        	return (item.isEdit || item.isNew) || (vm.procurementLogView === vm.procurementLogSortView.specnumber.key && vm.procurementLogSpecGroup[item.specNumber]) ||
        		(vm.procurementLogView === vm.procurementLogSortView.sheetnumber.key && vm.procurementLogSheetGroup[item.sheetNumber]) ||
        		vm.procurementLogView === vm.procurementLogSortView.none.key;
        }
        $scope.showProcurementSpecGroupHeader = function(){
        	var item = this.item, $index = this.$index;
        	return !item.isEdit && !item.isNew && vm.procurementLogView === vm.procurementLogSortView.specnumber.key && ($index == 0 || vm.filteredProcurementLogs[$index - 1].specNumber !== item.specNumber);
        }

        $scope.showProcurementSheetGroupHeader = function(){
        	var item = this.item, $index = this.$index;
        	return !item.isEdit && !item.isNew && vm.procurementLogView === vm.procurementLogSortView.sheetnumber.key && ($index == 0 || vm.filteredProcurementLogs[$index - 1].sheetNumber !== item.sheetNumber);
        }

        function procurementLogCardClicked(record, file, page) {
        	if (record.isEdit || record.isNew) return;

            if(!(record.pdfFileName && record.pdfPageNumber)) {
                return;
            }
            record.isProcurementLog = true;
        	if (record.pdfFileName === vm.selectedItem.page.filename && record.pdfPageNumber == vm.selectedItem.page.pagenumber_i) {
        		$scope.pdfIconClicked(record, file, page, false, vm.submittalsEnum.procurementlog , true);
        	} else {
        		var page = getPage(record.pdfFileName, record.pdfPageNumber);
            	vm.selectedItem.page = page;
            	vm.selectedItem.file = getFileByPage(page);
    			AuthenticationService.SetPlanViewSheetData({ file : vm.selectedItem.file, page : vm.selectedItem.page});
    			prepareSheetSpecificSchedules();
    			$scope.pdfIconClicked(record, record.pdfFileName, record.pdfPageNumber, true, GetTypeOfSubmittal(record) ,false);
        	}
        }

        function addProcurementFlags(procurementLogs){
        	procurementLogs.forEach(function(item){
        		requiredProcurementFlags(item);
        	});
        	return procurementLogs;
        }

        function requiredProcurementFlags(item){
        	var coords = [];
    		if(!item.coordinates)
    			item.coordinates = [];
    		coords.push(item.coordinates);
    		item.mergedCoordinates = coords;
    		item.isProcurementLog = true;
    		return item;
        }
        function postAddEditProcurementLog(procurementLog) {
        	procurementLog.isEdit = false;
        	procurementLog.isNew = false;
        	postProcurementLogChangeActions();
            $scope.selectedRecord = procurementLog;
            switchProcurementLogsSortOrder(vm.procurementLogView);
            var zoomString = UtilService.GetZoomString(procurementLog);

            $timeout(function(){
                callZoomToXY(zoomString);
                highlightRectangle(procurementLog);
                expandProcurementCardGroup(procurementLog);
                $timeout(function(){
                	scrollToSpecificElementWithAnimation('#cards','#panel-col-procurement-' +procurementLog.id, true);
                	procurementLogCardClicked(procurementLog, procurementLog.pdfFileName, procurementLog.pdfPageNumber);
                },0);
            }, 0);

        }

        function postProcurementLogChangeActions(){
        	vm.procurementLogs = addProcurementFlags(vm.procurementLogs);
        	vm.procurementLogs = sortProcurementLogsByView(vm.procurementLogs);
        }

        function expandProcurementCardGroup(record){
        	if(!vm.procurementLogSheetGroup)
        		vm.procurementLogSheetGroup = {};
        	if(!vm.procurementLogSpecGroup)
        		vm.procurementLogSpecGroup = {};
        	if (vm.procurementLogView === vm.procurementLogSortView.sheetnumber.key){
        		vm.procurementLogSheetGroup[record.sheetNumber] = true;
        	} else if (vm.procurementLogView === vm.procurementLogSortView.specnumber.key){
        		vm.procurementLogSpecGroup[record.specNumber] = true;
        	} else {
        		//Do nothing here
        	}
        }
        function highlightProcurementLogFromGrid(procurementLog){
            $timeout(function(){
            	procurementLog.showmore = true;
                expandProcurementCardGroup(procurementLog);
                $timeout(function(){
                    scrollToSpecificElementWithAnimation('#cards','#panel-col-procurement-' +procurementLog.id, true);
                },0);
            }, 0);
        }

    }
})();

// COMMENTED BUT NEED TO ADD IT BACK ONCE PLANVIEW IS INCORPORATED IN ACC.

// $(document).on('click', '.planview-resizable > .resizer-image', function (e) {
//     var scope = window.parent.scope.$$childHead;
//     if(!scope.vm.disablePLIconOnPdf) {
//         e.stopImmediatePropagation();
//         scope.vm.sideBarToggled();
//     }
// });
//
// $(document).on('click', '.thumbnail-resizer > .pype-search-toggle-btn > .resizer-image', function (e) {
//     var scope = window.parent.scope.$$childHead;
//     if(!scope.vm.disablePLIconOnPdf) {
//         e.stopPropagation();
//         if(scope.vm.thumbnailToogled) scope.vm.thumbnailToogled();
//     }
// });
