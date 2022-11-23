(function () {
	'use strict';

	angular.module('EventsApp').controller('Bim360SubmittalsCtrl', Bim360SubmittalsCtrl);

	Bim360SubmittalsCtrl.$inject = ['FlashService', 'AuthenticationService', '$scope', 'SmartRegisterService',
		'$timeout', 'MAINURL','$uibModal', '$location', 'BIMIntegrationService', '$window', 'ModalService',
		'ExportService', 'UtilService', 'ACCBuildService', 'ImageURL'];
	function Bim360SubmittalsCtrl(FlashService, AuthenticationService, $scope, SmartRegisterService,
			$timeout, MAINURL, $uibModal, $location, BIMIntegrationService, $window, ModalService,
			ExportService, UtilService, ACCBuildService, ImageURL) {

		var vm = this;
		vm.initialLoader = true;
		vm.RevisedLabel = '_revised_';

		vm.ConvertRecords = ConvertRecords;
		vm.ExportRecords = ExportRecords;
        vm.externalUserInfo = AuthenticationService.GetExternalUserInfo();
		vm.filteredItemsTemp = JSON.parse($window.localStorage.getItem("filteredItems"));
		vm.filteredItems = {
			allDivisionsSelectedItems: vm.filteredItemsTemp.divisionCodeSelectedItems,
			allSpecSectionsSelectedItems: vm.filteredItemsTemp.specSectionSelectedItems,
			specCategoriesSelectedItems: vm.filteredItemsTemp.specCategorySelectedItems,
			specCategoryGroupsSelectedItems: vm.filteredItemsTemp.specCategoryGroupSelectedItems,
			projectSummaryGroupsSelectedItems: vm.filteredItemsTemp.projectSummaryGroupSelectedItems,
			subcontractorsSelectedItems: vm.filteredItemsTemp.subContractorSelectedItems,
		}

		function initController() {
			vm.absUrl = $location.absUrl();
			populateExportObj();
			vm.step = 1;
			var userDetailsObject = JSON.parse($window.localStorage.getItem("userDetailsObject"));
			initBim360SelectVariables();
			if (userDetailsObject) {
					initUserDetails(userDetailsObject);
					getUserDetailsAndLoadSmartRegister();
					PrepareSmartRegisterColumns();
					$scope.myForm = {};
					$scope.myForm.$invalid = false;
					initializeQuickFilterVaraiables();
					GetCompanyName();
			} else {
					problemOccuredPleaseRestartBrowser();
			}
		}
		initController();

		function populateExportObj() {
            vm.exportObj = {};
            if(vm.absUrl.indexOf('bim360') !== -1) {
                vm.exportObj.name = 'BIM 360';
                vm.exportObj.url = ImageURL + 'logos/bim360-logo-small.png';
				vm.exportObj.module = 'bim360';
            } else if(vm.absUrl.indexOf('accbuild') !== -1) {
                vm.exportObj.name = 'ACC Build';
                vm.exportObj.url = ImageURL + 'exports/acc-build.svg';
				vm.exportObj.module = 'acc';
            }
			vm.uploadedToModule = 'uploadedTo' + vm.exportObj.module.toUpperCase();
			vm.moduleProjectSubmittalId = vm.exportObj.module + 'ProjectAndSubmittalID';
        }

		function initBim360SelectVariables() {
			var bim360Selections = JSON.parse(sessionStorage.bim360Selections);
			if(bim360Selections) {
				$scope.listOfCompanies = bim360Selections.listOfCompanies;
				$scope.listOfProjects =  bim360Selections.listOfProjects;
				vm.selectedCompany = bim360Selections.selectedCompany;
				vm.selectedProject = bim360Selections.selectedProject;
				GetBim360ObjectNames();
			}
		}

		function initUserDetails(userDetailsObject) {
			vm.pypeUserID = userDetailsObject.pypeUserId;
			vm.pypeProjectID = userDetailsObject.pypeProjectId;
            vm.pypeProjectName = userDetailsObject.pypeProjectName;
			vm.pypeCompanyID = userDetailsObject.pypeCompanyId;
			vm.pypeProjectVersionID = userDetailsObject.pypeVersionId;
		}

		vm.openBim360SelectionModal = function() {
			ModalService.Bim360SelectionModal(vm.exportObj.name)
			.result.then(function(data) {
				if(data) {
					initBim360SelectVariables();
					getUserDetailsAndLoadSmartRegister();
				}
			});
		}

		vm.Verify = function(gridName) {
			vm.dataLoading = 'Verifying Please Wait...';
			var selectedRecords = $scope.getSelectedRecords(gridName);
			// Add the PopUp selected records in BIM 360 format
			if(selectedRecords.length <= 0) {
				$scope.selectAllRecords();
				selectedRecords = $scope.getSelectedRecords(gridName);
			}
			// Saving selected Records in a variable for the case of coming back
			if(!vm.userSelectedRecords || selectedRecords.length > 0) {
				vm.userSelectedRecords = angular.copy(selectedRecords);
			} else if(vm.userSelectedRecords && selectedRecords.length <= 0) {
				selectedRecords = vm.userSelectedRecords;
			}

			processSelectedRecords(selectedRecords, function() {
				InitializeVerifyFlags();
				vm.step = 2;
				vm.dataLoading = false;
				// Expand If only one is present
				ExpandIfOnlyOneArrayPresent(vm.notExportedRecords, vm.alreadyExportedRecords, vm.noSpecNumberRecords);
			});
		}

		function InitializeVerifyFlags() {
			vm.showNotExported = false;
			vm.showAlreadyExported = false;
			vm.showNoSpecNumberExported = false;
		}


	    function initializeQuickFilterVaraiables(){
	        $scope.myForm = {};
	        $scope.myForm.$invalid = false;
	    }

		function problemOccuredPleaseRestartBrowser() {
			var items = {
				title : "Ooops!!",
				message : "Something went wrong. Please restart your browser."
			};
			showWarningMessagePopup(items);
		}

		function getUserDetailsAndLoadSmartRegister() {
			vm.userDetails = vm.externalUserInfo.userProfile;
			if(vm.userDetails) {
				loadSubmittalStatuses();
				GetSmartRegister();
			} else {
				FlashService.Error('Failed to connect to ' + vm.exportObj.name + ' Page');
			}
		}

		 function ApplyFilters() {
			 	vm.filteredItems = {};
				angular.forEach(vm.completeFilters, function(filter, index) {
					vm[filter.filterName + 'SelectedItems'] = [];

					if(vm[filter.filterName + 'SelectAll'] && filter.filterName!=='exportStatuses') {
						angular.forEach(filter.filterValue, function(item) {
							item.selected = false;
						});
					}

					if(!vm[filter.filterName + 'SelectAll'] || filter.filterName==='exportStatuses') {
						angular.forEach(filter.filterValue, function(item, index) {
							if (item.selected) {
								if(filter.filterName === 'allDivisions') {
									vm[filter.filterName + 'SelectedItems'].push(item.divisionCode);
								} else if(filter.filterName === 'allSpecSections') {
									vm[filter.filterName + 'SelectedItems'].push(item.specSection);
								} else {
									vm[filter.filterName + 'SelectedItems'].push(item.value);
								}
							}
						});
					}

					// Updating Localstorage filter Items
					vm.filteredItems[filter.filterName + 'SelectedItems'] = vm[filter.filterName + 'SelectedItems'];
				});
				CalculateAllSeletedFilters();

				vm.filterSmartRegisteredData = vm.submittalregisters.filter(function(record) {
					if(vm.exportStatusesSelectedItems.length%2 == 0) {
							return (record.divisionCode === '' || $.inArray(record.divisionCode, vm.allDivisionsSelectedItems) !== -1 || vm.allDivisionsSelectedItems.length===0) &&
							((record.specNumber !== '' && $.inArray(record.specNumber, vm.allSpecSectionsSelectedItems) !== -1) || vm.allSpecSectionsSelectedItems.length===0) &&
							(record.specCategory === '' || $.inArray(record.specCategory.toLowerCase(), vm.specCategoriesSelectedItems) !== -1 || vm.specCategoriesSelectedItems.length===0) &&
							(record.specCategoryGroup === '' || $.inArray(record.specCategoryGroup.toLowerCase(), vm.specCategoryGroupsSelectedItems) !== -1 || vm.specCategoryGroupsSelectedItems.length===0) &&
							(record.projectSummaryGroup === '' || $.inArray(record.projectSummaryGroup.toUpperCase(), vm.projectSummaryGroupsSelectedItems) !== -1 || vm.projectSummaryGroupsSelectedItems.length===0) &&
							((vm.numberOfSubContractors === vm.subcontractorsSelectedItems.length) || $.inArray(record.subContractor.toLowerCase(), vm.subcontractorsSelectedItems) !== -1 || vm.subcontractorsSelectedItems.length===0);
					}
					else {
							return (record.divisionCode === '' || $.inArray(record.divisionCode, vm.allDivisionsSelectedItems) !== -1 || vm.allDivisionsSelectedItems.length===0) &&
							((record.specNumber !== '' && $.inArray(record.specNumber, vm.allSpecSectionsSelectedItems) !== -1) || vm.allSpecSectionsSelectedItems.length===0) &&
							(record.specCategory === '' || $.inArray(record.specCategory.toLowerCase(), vm.specCategoriesSelectedItems) !== -1 || vm.specCategoriesSelectedItems.length===0) &&
							(record.specCategoryGroup === '' || $.inArray(record.specCategoryGroup.toLowerCase(), vm.specCategoryGroupsSelectedItems) !== -1 || vm.specCategoryGroupsSelectedItems.length===0) &&
							(record.projectSummaryGroup === '' || $.inArray(record.projectSummaryGroup.toUpperCase(), vm.projectSummaryGroupsSelectedItems) !== -1 || vm.projectSummaryGroupsSelectedItems.length===0) &&
							((vm.numberOfSubContractors === vm.subcontractorsSelectedItems.length) || $.inArray(record.subContractor.toLowerCase(), vm.subcontractorsSelectedItems) !== -1 || vm.subcontractorsSelectedItems.length===0) &&
							(vm.exportStatusesSelectedItems[0] === 'Previously Exported' ? isAlreadyExported(record) : (!isAlreadyExported(record) || !record[vm.uploadedToModule] ));
					}
				});

				$scope.myForm.$invalid = false;
				$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
				vm.dataLoading = false;
			}

			function CalculateAllSeletedFilters() {
				vm.selectedFiltersLength = vm.completeFilters.reduce(function(sum, item) {
					return sum + (vm[item.filterName + 'SelectedItems'].length !== item.filterValue.length ? vm[item.filterName + 'SelectedItems'].length : 0);
				}, 0);
			}

			vm.toggleFilterDropdown = function(filter) {
					filter.filterSelected = !filter.filterSelected;
					if(!filter.filterSelected && vm[filter.filterName + 'SelectedItems'].length > 0 && (vm[filter.filterName + 'SelectedItems'].length !== filter.filterValue.length)) {
						vm.removeAllIndividualFilters(filter.filterName);
					}
			}

			vm.removeAllIndividualFilters = function(filterName) {
					vm.dataLoading = "Applying Filters... Please wait..";
					$timeout(function() {
						vm[filterName] = vm[filterName].map(function(item) {
							item.selected = false;
							return item;
						});
						ApplyFilters();
					}, 10);
			}

			// Selecting and Unselecting Checkboxes of filters
			vm.toggleSelectionOnFilters = function(item, filterName) {
				item.selected = !item.selected;
				if(!item.selected) {
					vm[filterName + 'SelectAll'] = false;
				} else {
					var notSelected = false;
					angular.forEach(vm[filterName], function(item, index) {
						if (!item.selected) {
							notSelected = true;
						}
					});
					vm[filterName + 'SelectAll'] = !notSelected;
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


			// Function for dynamically initializing Filter Popovers
			function initializePopovers() {
				angular.forEach(vm.completeFilters, function(filter, index) {
					$scope[filter.filterName + 'FilterPopover'] = {
			            isOpen: false,
			            templateUrl: filter.filterName + 'FilterTemplate.html',
			            open: function open() {
			                $scope[filter.filterName + 'FilterPopover'].isOpen = true;
			            },
			            selectAll: function selectAll(flag) {
							angular.forEach(filter.filterValue, function (item, index) {
								item.selected = flag;
							});
			            },
			            close: function close() {
							vm.dataLoading = "Applying Filters... Please wait..";
				            // intentional delay of 10 milli seconds to make sure loader will appear
							setTimeout(ApplyFilters,10);
							$scope[filter.filterName + 'FilterPopover'].isOpen = false;
			            }
			 		};
				});
			}

			// Function for dynamically initializing Angular Filters for filter Search
			function initializeSearchFilters() {
				angular.forEach(vm.completeFilters, function(filter, index) {
					$scope[filter.filterName  + 'Filter'] = function(item) {
						if(filter.filterName === 'allDivisions') {
							if(!vm['search' + filter.filterName] ||  (item.divisionName && item.divisionName.toUpperCase().indexOf(vm['search' + filter.filterName].toUpperCase()) > -1)
								|| (item.divisionCode && item.divisionCode.indexOf(vm['search' + filter.filterName]) > -1)) {
								return true;
							}
							return false;
						} else if(filter.filterName === 'allSpecSections') {
							if(!vm['search' + filter.filterName] || (item.specName && item.specName.toUpperCase().indexOf(vm['search' + filter.filterName].toUpperCase()) > -1)
								|| (item.specSection && item.specSection.indexOf(vm['search' + filter.filterName]) > -1)) {
									return true;
							}
							return false;
						} else {
							if(!vm['search' + filter.filterName] || (item.value && item.value.toUpperCase().indexOf(vm['search' + filter.filterName].toUpperCase()) > -1)
								|| (item.value && item.value.indexOf(vm['search' + filter.filterName]) > -1)) {
									return true;
							}
							return false;
						}
					}
				});
			}

			$scope.dismissPopOver = function(event) {
				angular.forEach(vm.completeFilters, function(filter, index) {
					if (!event || event.target.className.indexOf(filter.popoverClass) <= -1) {
						 $scope[filter.filterName + 'FilterPopover'].isOpen = false;
						 for (var index = 0; index < filter.filterValue.length; index++) {
							 if(filter.filterName === 'allDivisions') {
								 filter.filterValue[index].selected = (vm[filter.filterName + 'SelectedItems'].indexOf(filter.filterValue[index].divisionCode) !== -1);
							 } else if(filter.filterName === 'allSpecSections') {
									filter.filterValue[index].selected = (vm[filter.filterName + 'SelectedItems'].indexOf(filter.filterValue[index].specSection) !== -1);
							 } else {
								 filter.filterValue[index].selected = (vm[filter.filterName + 'SelectedItems'].indexOf(filter.filterValue[index].value) !== -1);
							 }
						 }
						 var notSelected = false;
						 angular.forEach(filter.filterValue, function(item, index) {
							 if (!item.selected) {
								 notSelected = true;
							 }
						 });
						 vm[filter.filterName + 'SelectAll'] = !notSelected;
				 }
			 });
		 }


		function PrepareBIM360RegisterColumns() {
			vm.columnsDataPreview = [
				{
					field : 'specSectionIdentifier',
					caption : 'Spec Section Identifier',
					tooltip : 'Spec Section Identifier',
					sortable : true,
					size : '10%',
					resizable : true,
					editable :  false
				},{
					field : 'specSectionTitle',
					caption : 'Spec Section Title',
					tooltip : 'Spec Section Title',
					sortable : true,
					size : '12%',
					resizable : true,
					editable : false

				},{
					field : 'specSubSection',
					caption : 'Spec Sub Section',
					tooltip : 'Spec Sub Section',
					sortable : true,
					size : '10%',
					resizable : true,
					editable : false

				},{
					field : 'submittalTitle',
					caption : 'Submittal Title',
					tooltip : 'Submittal Title',
					sortable : true,
					size : '10%',
					resizable : true,
					editable : {type : "text"}

				}, {
					field : 'submittalType',
					caption : 'Submittal type',
					tooltip : 'Submittal type',
					sortable : true,
					size : '10%',
					resizable : true,
					editable : false
				}, {
					field : 'submittalDescription',
					caption : 'Submittal description',
					tooltip : 'Submittal description',
					sortable : true,
					size : '25%',
					resizable : true,
					editable :  false
				},{
					field : vm.uploadedToModule,
					caption : 'Export Status',
					sortable : true,
					size : '8%',
					resizable : true,
					editable : false,
					render : function(record) {
						var projectNum = undefined;
						if(vm.selectedProject.id){
							projectNum = vm.selectedProject.id.toString();
						}
						if(projectNum === undefined) {
							return "";
						}
						if(record[vm.uploadedToModule]) {
							var log = [];
							var forProjectAlreadyUploaded = false;
							for(var key in record[vm.moduleProjectSubmittalId]) {
								if(key === projectNum) {
									forProjectAlreadyUploaded = true;
								}
							}
							if(forProjectAlreadyUploaded) {
								return "<div class='text-center'><i class='fa fa-check-circle lblgreen fontWeightXLarge' title='Submittal already exported to project in " + vm.exportObj.name + ", Re-exporting will update the existing submittal in " + vm.exportObj.name + "'></i></div>";
							}
							else{
								return "<div class='text-center'><i class='fa fa-times-circle lblOrange fontWeightXLarge' title='New Submittal will be created'></i></div>";
							}
						}
						else{
							return "<div class='text-center'><i class='fa fa-times-circle lblOrange fontWeightXLarge' title='New Submittal will be created'></i></div>";
						}
					}
				}
			];
		}

		$scope.setGridEvents = function(event, getselection, getSelectedRecords, selectAll, selectNone, reinitializeGrid, selectRecords) {
			$scope.gridReload = event;
			$scope.selectedRecords = getselection;
			$scope.getSelectedRecords = getSelectedRecords;
			$scope.selectNone = selectNone;
			$scope.reinitializeGrid = reinitializeGrid;
			$scope.selectAllRecords = selectAll;
			$scope.selectRecords = selectRecords;
		};

		function GetCompanyName() {
			vm.companyName = AuthenticationService.GetCompanyName();
		}

		function PrepareSmartRegisterColumns() {
			vm.searchData = [
					{ field: 'source', caption: 'Source Version', type: 'text' },
					{ field: 'specCategoryGroup', caption: 'Spec Category Group', type: 'text' },
					{ field: 'specNumber', caption: 'Spec Section', type: 'text' },
					{ field: 'specName', caption: 'Spec Name', type: 'text' },
					{ field: 'paraCode', caption: 'Spec sub section', type: 'text' },
					{ field: 'specCategory', caption: 'Submittal Type', type: 'text' },
					{ field: 'submittalDescription', caption: 'Submittal description', type: 'text' },
					{ field: 'submittalsHeading', caption: 'Sub Section Heading', type: 'text' },
					{ field: 'subContractor', caption: 'Subcontractor', type: 'text' },
					{ field: 'dateIssued', caption: 'Date Issued', type: 'text' }
			];

			if(vm.initialLoader) {
				vm.columnsData = [
						{ field: 'source', caption: 'Source Version', tooltip: 'Source Version', sortable: true, size: '8%', hidden: true, resizable: true, editable: false },
						{ field: 'serialNumber', caption: 'S. No.', sortable: true, size: '6%', resizable: true, editable: false, tooltip: 'Submittal Number',
							render: function(record) {
								if(record[vm.uploadedToModule]) {
									var forProjectAlreadyUploaded = false;
									var submittalId = null;
									for(var key in record[vm.moduleProjectSubmittalId]) {
										if(key === vm.selectedProject.id) {
											forProjectAlreadyUploaded = true;
											submittalId = record[vm.moduleProjectSubmittalId][key];
										}
									}
									if(record.specNumber && forProjectAlreadyUploaded) {
										return '<div><span>' + record.serialNumber + '</span><a class="cursorPointer pull-right" onclick=\'openBim360SubmittalWindow("' + vm.selectedProject.id + ', ' + submittalId + ', ' + vm.exportObj.module + '");event.stopPropagation();\' >' +
										'<image src="images/procore/preview-outline.png" title="View in ' + vm.exportObj.name + '"></pype-image><a></div>';
									} else {
										return record.serialNumber;
									}
								}
								else {
									return record.serialNumber;
								}
							}
						},
						{ field: 'divisionCode', caption: 'Division', hidden: true, sortable: true, size: '7%', resizable: true, tooltip: 'Division', editable: false },
						{ field: 'specNumber', caption: 'Spec Section', sortable: true, size: '7%',
							render: function (record) {
								if(record.changes && record.changes.specNumber !== undefined && record.changes.specNumber !== ''){
									return record.changes.specNumber;
								}
								else if (record.specNumber && record.specNumber.toLowerCase().indexOf("unknown") >= 0)
									return 'Enter the Spec Section Number';

								else if (record.specNumber && record.specNumber.indexOf(vm.RevisedLabel) > -1)
									return record.specNumber.slice(0, record.specNumber.indexOf(vm.RevisedLabel));

								return record.specNumber;
							},
							resizable: true, editable: false, tooltip: 'Spec Section', },
							{ field: 'specName', caption: 'Spec Name', sortable: true, size: '15%', resizable: true, tooltip: 'Spec Name', editable: false },
							{ field: 'paraCode', caption: 'Spec sub section', tooltip: 'Paragraph', sortable: true, size: '6%', resizable: true, editable: false },
							{ field: 'submittalsHeading', caption: 'Sub Section Heading', sortable: true, size: '10%', hidden: false, tooltip: 'Sub Section Heading', resizable: true, editable: false},
							{ field: 'specCategory', caption: 'Submittal Type', sortable: true, size: '11%', resizable: true, tooltip: 'Submittal Type', editable: false },
							{ field: 'submittalDescription', caption: 'Submittal description', sortable: true, size: '30%', resizable: true, tooltip: 'Submittal description', editable: false },
							{ field: 'targetDate', caption: 'Target Date', sortable: true, size: '6%', resizable: true, tooltip: 'Target Date', editable: false },
							{ field: 'userNotes', caption: 'User Notes', sortable: true, size: '8%', resizable: true,hidden: true, tooltip: 'User Notes', editable: false },
							{ field: 'subContractor', caption: 'Subcontractor', sortable: true, size: '6%', resizable: true, tooltip: 'Subcontractor', editable: false, hidden: true },
							{ field: 'specCategoryGroup', caption: 'Submittal Type Group', hidden: true, sortable: true, size: '7%', tooltip: 'Spec category group', resizable: true, editable: false},
							{ field: 'projectSummaryGroup', caption: 'Submittals Group', hidden: true, sortable: true, size: '7%', tooltip: 'Submittals Group', resizable: true, editable: false },
							{ field: 'dateIssued', caption: 'Date Issued', hidden: false, sortable: true, size: '6%', tooltip: 'Date Issued', resizable: true, editable: false },
							{
								field : vm.uploadedToModule,
								caption : 'Export Status',
								sortable : true,
								size : '9%',
								resizable : true,
								editable : false,
								render: function (record) {

									var projectNum = undefined;

									if(vm.selectedProject.id){
										projectNum = vm.selectedProject.id.toString();
									}

									if(projectNum === undefined) {
										return "";
									}

									if(record[vm.uploadedToModule]) {
										var log = [];
										var forProjectAlreadyUploaded = false;
										for(var key in record[vm.moduleProjectSubmittalId]) {
											if(key === projectNum) {
												forProjectAlreadyUploaded = true;
											}
										}

										if(forProjectAlreadyUploaded) {
											return "<div class='text-center'><span class='exported-green' title='Submittal already exported to project in " + vm.exportObj.name + ", Re-exporting will update the existing submittal in " + vm.exportObj.name + "'>Exported</span></div>";
										}
										else {
											return "<div class='text-center'><span class='notexported'>Not Exported</span></div>";
										}
									}
									else {
										return "<div class='text-center'><span class='notexported'>Not Exported</span></div>";
									}
								}
							}
					];
					SmartRegisterService.initSmartColumns(vm.smartColumns, vm.columnsData, true, true);
			}
		}

		function PrepareBIM360ResponseColumns() {
			vm.columnsDataFinal = [
				{ field : 'id', caption : vm.exportObj.name + ' Submittal Link', sortable : true, size : '5.5%', resizable : true, hidden : false, editable :  false, style:'text-align:center;',
					render: function (record) {
						if(record.id)
							return '<div><a class="cursorPointer" onclick=\'openBim360SubmittalWindow("' + vm.selectedProject.id + ', ' + record.id + ', ' + vm.exportObj.module +  '");event.stopPropagation();\' >' +
							'<image src="images/procore/preview-outline.png" title="View in ' + vm.exportObj.name + '" class="p-r5"></pype-image>View in ' + vm.exportObj.name + '<a></div>';
						else
							return '<div class="text-center orangeColor" title="' + record.message + '"><i class="fa fa-times-circle fontWeightXLarge"></i></div>';
					}
				},
				{ field : 'title', caption : 'Submittal Title', sortable : true, size : '5%', resizable : true, editable :  false, hidden : false },
				{ field : 'subsection', caption : 'Spec Sub Section', sortable : true, size : '5%', resizable : true, editable :  false, hidden : false },
				{ field : 'specIdentifier', caption : 'Spec Section Identifier', tooltip : 'Spec Section Identifier', sortable : true, size : '3%', resizable : true, editable :  false },
				{ field : 'description', caption : 'Description', sortable : true, size : '10%', resizable : true,hidden : false, editable :  false },
				{ field : 'specType', caption : 'Submittal Type', sortable : true, size : '5%', resizable : true,hidden : false, editable :  false },
				{
					field : 'exportStatus',
					caption : 'Export Status',
					sortable : true,
					size : '3%',
					resizable : true,
					editable : false,
					render: function (record) {
						if(record.exportStatus === "CREATED"){
							return "<div class='text-center'><span class='exported-green' title='Successfully created submittal in " + vm.exportObj.name + "'>Exported</span></div>";
						}
						else if(record.exportStatus === "UPDATED"){
							return "<div class='text-center'><span class='exported-green' title='Successfully updated submittal in " + vm.exportObj.name + "'>Exported</span></div>";
						}
						else{
							return "<div class='text-center orangeColor'><span class='notexported' title='Unable to export.This submittal has been voided in " + vm.exportObj.name + ".'>Not Exported</span></div>	";
						}
					}
				}
			];
		}
		function checkTimeOutAndShowConfirmDownload(msg){
			var items = {
				title : "Alert",
				message : msg ? msg : "Timeout Occured please restart the process"
			};
			showWarningMessagePopup(items);
		}

		function showWarningMessagePopup(items) {
			var accProject = AuthenticationService.GetACCProject();
			ModalService.showAlertMessage(items)
			.result.then(function (data) {
				$location.path('/smartregister/projects/' + accProject.id)
			}, function () {
			    $location.path('/smartregister/projects/' + accProject.id)
			});
		}

		vm.GoToStep1 = function() {
			vm.step = 1;
			vm.filteredItems = null;
			vm.userSelectedRecords = [];
			vm.lastSearch = null;
			initController();
		}

		vm.goOneStepBack = function() {
			if(vm.step === 2) {
				// Within Verify step
				vm.goingToStepOne = true;
				vm.step = vm.step - 1;
				initController();
			} else {
				// Coming from Step 3 to step 2
				vm.step = vm.step - 1;
				vm.Verify('procoresubmittalGrid');
				InitializeVerifyFlags();
				PrepareSmartRegisterColumns();
			}
		}

        function loadSubmittalStatuses() {
            if(vm.selectedProject && vm.selectedCompany) {
				BIMIntegrationService.getStatuses(vm.userDetails.emailId, vm.selectedCompany.id, vm.selectedCompany.name,
							vm.selectedProject.id, vm.selectedProject.name, function(response) {
					if (response.success) {
                        if(response.data) {
                            vm.listOfSubmittalStatus = response.data;
                            vm.selectedStatus = vm.listOfSubmittalStatus[0]; //Assigning the one and only value 'Draft' as the Selected Value
                        } else {
                            var items = { title : "Alert", message : response.message };
                            ModalService.showAlertMessage(items);
                        }
                    } else {
                        FlashService.Error(response.message);
                    }
				});
            }
        }

		function getUniqueDivisions(submittals) {
			var uniqueDivisions = [], uniqueDivsionCodes = [];
			var record = {};
			for(var i=0;i<submittals.length;i++){
				if(submittals[i].divisionCode != null && submittals[i].divisionCode != '' && uniqueDivsionCodes.indexOf(submittals[i].divisionCode) === -1) {
					record = {divisionCode : submittals[i].divisionCode, divisionName : submittals[i].divisionName};
					uniqueDivisions.push(angular.copy(record));
					uniqueDivsionCodes.push(submittals[i].divisionCode);
				}
			}
			return {uniqueDivisionRecords : uniqueDivisions, uniqueDivisionCodes : uniqueDivsionCodes};
		}

    function getUniqueSpecSections(submittals) {
			var uniqueSpecSectionRecords = [], uniqueSpecSections = [];
			var record = {};
			for(var i=0;i<submittals.length;i++){
				if(submittals[i].specNumber !== null && submittals[i].specNumber !== '' && uniqueSpecSections.indexOf(submittals[i].specNumber) === -1){
					record = {specSection : submittals[i].specNumber, specName : submittals[i].specName};
					uniqueSpecSectionRecords.push(angular.copy(record));
					uniqueSpecSections.push(submittals[i].specNumber);
				}
			}
			return { uniqueSpecSectionRecords : uniqueSpecSectionRecords, uniqueSpecSections : uniqueSpecSections};
		}

		vm.exportStatuses = [
				{ value: 'Not Exported', selected: true },
				{ value: 'Previously Exported', selected: false }
		]
		vm.exportStatusesSelectedItems = ['Not Exported'];

		function GetSmartRegister() {
			vm.dataLoading = 'Loading... Please Wait...';
			BIMIntegrationService.GetSmartRegister(vm.userDetails.emailId, vm.pypeUserID, vm.pypeProjectID, vm.pypeProjectVersionID, function(response) {
				if (response.success) {
					vm.MaxId = 0;
					vm.submittalregisters = response.data.smartRegisterRecords;
					vm.recordsData = vm.submittalregisters;

					SmartRegisterService.prepareAndSetSmartColumns(vm, vm.submittalregisters, response.data.smartColumnsContainer);
					PrepareSmartRegisterColumns();
					prepareQuickFiltrDataNComboOptions();
					createFullFiltersObject();

					$scope.reinitializeGrid(true, true, vm.searchData, vm.recordsData.length);
					$timeout(function(){
							ApplyFilters();
							if(vm.userSelectedRecords && vm.userSelectedRecords.length>0 && ((!vm.lastSearch && vm.userSelectedRecords.length !== vm.filterSmartRegisteredData.length) || (vm.lastSearch && vm.userSelectedRecords.length !== vm.searchedRecordsIndexes.length))) {
								$scope.selectRecords(vm.userSelectedRecords);
							}
					},10);
				} else {
					checkTimeOutAndShowConfirmDownload(message);
					vm.dataLoading = false;
				}
				vm.initialLoader = false;
			});
		}

        function prepareQuickFiltrDataNComboOptions() {
            // Project Summary Groups Initializations
            var uniqueProjectSummaryGroup = getDistinctValuesByProperty(vm.submittalregisters, "projectSummaryGroup", false, true);
            uniqueProjectSummaryGroup.sort();
            var ProjectRequirements = ["DIVISION 01 REQUIREMENTS", "PERFORMANCE REQUIREMENTS", "FIELD QUALITY CONTROL", "QUALITY ASSURANCE", "TESTS AND INSPECTIONS"];
            vm.projectSummaryGroups = [];
            var selectedPSGCount = 0;
            angular.forEach(uniqueProjectSummaryGroup, function (item, index) {
                var record = { id: index, value: item, selected: false };
                if(vm.filteredItems && vm.filteredItems.projectSummaryGroupsSelectedItems.length>0 && vm.filteredItems.projectSummaryGroupsSelectedItems.indexOf(item.toUpperCase()) > -1) {
                    record.selected = true;
                    selectedPSGCount++;
                }

                if ($.inArray(item, ProjectRequirements) != -1) {
                    record.group = "PR"
                } else {
                    record.group = "SR"
                }
                vm.projectSummaryGroups.push(record);
            });
            if(selectedPSGCount === uniqueProjectSummaryGroup.length) {
                fillSelectedFilters('projectSummaryGroups');
            }

            // Spec Category Initialization
            var uniqueSpecCategory = getDistinctValuesByProperty(vm.submittalregisters, "specCategory", true);
            uniqueSpecCategory = convertAllValuesToLowerCase(uniqueSpecCategory);
            uniqueSpecCategory.sort();
            vm.specCategories = [];
            var selectedSpecCategoryCount = 0;
            angular.forEach(uniqueSpecCategory, function (item, index) {
                var record = { id: index, value: item, selected: false };
                if(vm.filteredItems && vm.filteredItems.specCategoriesSelectedItems.length>0 && vm.filteredItems.specCategoriesSelectedItems.indexOf(item.toLowerCase()) > -1) {
                    record.selected = true;
                    selectedSpecCategoryCount++;
                }
                vm.specCategories.push(record);
            });
            if(selectedSpecCategoryCount === uniqueSpecCategory.length) {
                fillSelectedFilters('specCategories');
            }

            // Spec Category Group Initialization
            var uniqueSpecCategoryGroup = getDistinctValuesByProperty(vm.submittalregisters, "specCategoryGroup", true);
            uniqueSpecCategoryGroup = convertAllValuesToLowerCase(uniqueSpecCategoryGroup);
            uniqueSpecCategoryGroup.sort();
            vm.specCategoryGroups = [];
            var selectedSpecCategoryGroupCount = 0;
            angular.forEach(uniqueSpecCategoryGroup, function (item, index) {
                var record = { id: index, value: item, selected: false };
                if(vm.filteredItems && vm.filteredItems.specCategoryGroupsSelectedItems.length>0 && vm.filteredItems.specCategoryGroupsSelectedItems.indexOf(item.toLowerCase()) > -1) {
                    record.selected = true;
                    selectedSpecCategoryGroupCount++;
                }
                vm.specCategoryGroups.push(record);
            });
            if(selectedSpecCategoryGroupCount === uniqueSpecCategoryGroup.length) {
                fillSelectedFilters('specCategoryGroups');
            }

            // Subcontractor Initialization
            var uniqueSubcontractor = getDistinctValuesByProperty(vm.submittalregisters, "subContractor", true);
            uniqueSubcontractor = convertAllValuesToLowerCase(uniqueSubcontractor);
            uniqueSubcontractor.sort();
            vm.numberOfSubContractors = angular.copy(uniqueSubcontractor.length);
            vm.subcontractors = [];
            var selectedSubcontractorCount = 0;
            angular.forEach(uniqueSubcontractor, function (item, index) {
                var record = { id: index, value: item, selected: false };
            	if(vm.filteredItems && vm.filteredItems.subcontractorsSelectedItems.length>0 && vm.filteredItems.subcontractorsSelectedItems.indexOf(item.toLowerCase()) > -1) {
            		record.selected = true;
            		selectedSubcontractorCount++;
            	}
                vm.subcontractors.push(record);
            });
            if(selectedSubcontractorCount === uniqueSubcontractor.length) {
            	fillSelectedFilters('subcontractors');
            }

            if (vm.submittalregisters.length > 0) {
                  var highest = 0;
                  $.each(vm.submittalregisters, function (key, submittalregister) {
                      if (submittalregister.recid > highest) highest = submittalregister.recid;
                  });
                  vm.MaxId = highest;
            }
            else {
                vm.MaxId = 0;
                vm.submittalregisters = [];
            }

            if(vm.submittalregisters.length > 0){
                //Division codes filter related code
                var divisions = [], record;
                var uniqueDivisionResult = getUniqueDivisions(vm.submittalregisters);
                vm.uniqueDivisions = uniqueDivisionResult.uniqueDivisionRecords;

                var selectedUniqueDivisionCount = 0;
                angular.forEach(vm.uniqueDivisions, function (item, index) {
                    record = { id: index, divisionCode: item.divisionCode, divisionName : item.divisionName, selected: false };
                    if(vm.filteredItems && vm.filteredItems.allDivisionsSelectedItems.length>0 && vm.filteredItems.allDivisionsSelectedItems.indexOf(item.divisionCode) > -1) {
                        record.selected = true;
                        selectedUniqueDivisionCount++;
                    }
                    divisions.push(record);
                });
                vm.allDivisions = divisions;
                vm.allDivisionsSelectedItems = uniqueDivisionResult.uniqueDivisionCodes;
                if(selectedUniqueDivisionCount === vm.uniqueDivisions.length) {
                    fillSelectedFilters('allDivisions');
                }

                //Spec sections filter related code
                var specSections = [], record;
                var uniqueSpecSectionResult = getUniqueSpecSections(vm.submittalregisters);

                vm.uniqueSpecSections = uniqueSpecSectionResult.uniqueSpecSectionRecords;

                var selectedUniqueSpecSectionCount = 0;
                angular.forEach(vm.uniqueSpecSections, function (item, index) {
                    record = { id: index, specSection: item.specSection, specName : item.specName,  selected: false };
                    if(vm.filteredItems && vm.filteredItems.allSpecSectionsSelectedItems.length>0 && vm.filteredItems.allSpecSectionsSelectedItems.indexOf(item.specSection) > -1) {
                        record.selected = true;
                        selectedUniqueSpecSectionCount++;
                    }
                    specSections.push(record);
                });
                vm.allSpecSections = specSections;
                vm.allSpecSectionsSelectedItems = uniqueSpecSectionResult.uniqueSpecSections;
                if(selectedUniqueSpecSectionCount === vm.uniqueSpecSections.length) {
                    fillSelectedFilters('allSpecSections');
                }
            }
            else {
                vm.allDivisions = [];
                vm.allSpecSections = [];
            }
        }

		function fillSelectedFilters(filterName) {
			vm[filterName].forEach(function(record) {
				record.selected = false;
			});
			vm[filterName + 'SelectedItems'] = [];
		}

		function createFullFiltersObject() {
			vm.completeFilters = [
				{filterName: 'allDivisions', filterValue: vm.allDivisions, displayName: 'Division', popoverClass: 'divisionsPopOver', filterSelected: true},
				{filterName: 'allSpecSections', filterValue: vm.allSpecSections, displayName: 'Spec Section', popoverClass: 'specSectionsPopOver', filterSelected: true},
				{filterName: 'specCategories', filterValue: vm.specCategories, displayName: 'Submittal Type', popoverClass: 'submittalTypesPopOver', filterSelected: true},
				{filterName: 'specCategoryGroups', filterValue: vm.specCategoryGroups, displayName: 'Submittal Type Group', popoverClass: 'submittalTypeGroupsPopOver', filterSelected: true},
				{filterName: 'projectSummaryGroups', filterValue: vm.projectSummaryGroups, displayName: 'Submittal Group', popoverClass: 'submittalGroupsPopOver', filterSelected: true},
				{filterName: 'subcontractors', filterValue: vm.subcontractors, displayName: 'Subcontractor', popoverClass: 'subcontractorPopOver', filterSelected: true},
				{filterName: 'exportStatuses', filterValue: vm.exportStatuses, displayName: 'Export Status', popoverClass: 'exportStatusesPopover', filterSelected: true}
			];
			initializePopovers();
			initializeSearchFilters();
		}

		function getSelectedRecordsToConvert() {
			var selectedRecords = [];
			selectedRecords = selectedRecords.concat(vm.notExportedRecords);
			selectedRecords = selectedRecords.concat(vm.alreadyExportedRecords);
			return selectedRecords;
		}

		function ConvertRecords() {
			var selectedRecords = getSelectedRecordsToConvert();
			convertSelectedRecordsToBim360(selectedRecords);
		}

		function isAlreadyExported(record) {
			var uploaded = false;
			if(record[vm.uploadedToModule]) {
				for(var key in record[vm.moduleProjectSubmittalId]) {
					if(key === vm.selectedProject.id.toString()) {
						uploaded = true;
						break;
					}
				}
			}
			return uploaded;
		}

		function processSelectedRecords(selectedRecords, callback) {
			vm.notExportedRecords = [];
			vm.alreadyExportedRecords = [];
			vm.noSpecNumberRecords = [];

			for (var i = 0; i < selectedRecords.length; i++) {
				var rec = selectedRecords[i];
				if(rec.specNumber && rec.specName) {
					if (isAlreadyExported(rec)) {
						vm.alreadyExportedRecords.push(rec);
					} else {
						vm.notExportedRecords.push(rec);
					}
				} else {
					vm.noSpecNumberRecords.push(rec);
				}
			}
			if(callback) callback();
		}

		function ExpandIfOnlyOneArrayPresent(array1, array2, array3) {
			vm.disablePreviewBtn = false;
			if((array1.length===0 && array2.length===0 && array3.length>0) ||
				(array1.length===0 && array2.length>0 && array3.length===0) ||
				(array1.length>0 && array2.length===0 && array3.length===0)) {
						if(array1.length===0 && array2.length===0) {
							vm.showNoSpecNumberExported = true;
							vm.disablePreviewBtn = true;
							reloadVerifyGrid(vm.noSpecNumberRecords);
						} else if(array1.length===0 && array3.length===0) {
							vm.showAlreadyExported = true;
							reloadVerifyGrid(vm.alreadyExportedRecords);
						} else {
							vm.showNotExported = true;
							reloadVerifyGrid(vm.notExportedRecords);
						}
			}
		}

		function reloadVerifyGrid(records) {
			$timeout(function() {
				$scope.reinitializeGrid(false, false, vm.searchData, records.length);
				$scope.gridReload(records, vm.columnsData);
			}, 1);
		}

		function convertSelectedRecordsToBim360(smartRegisterContainer) {
			// Call the convert Api and Reload the grid with new Data and
			// Columns and Change the buttons Too!!
			GetSmartRegisterInBim360Format(smartRegisterContainer);
		}

		function GetSmartRegisterInBim360Format(smartRegisterContainer) {
			vm.dataLoading = 'Please wait... Generating ' + vm.exportObj.name + ' Preview';
			vm.hidePreviewError = false;
			vm.selectedSmartRegisterRecordIds = smartRegisterContainer.map(function(r){ return r.serialNumber; });
			getRegisterInExportedFormat(function(response) {
				if (response.success) {
					vm.recordsData = response.data;
					GetBim360ObjectNames();
					PrepareBIM360RegisterColumns();
					vm.step = 3;
					$timeout(function(){
						$scope.reinitializeGrid(false, true, vm.searchData, vm.recordsData.length);
						$scope.gridReload(vm.recordsData, vm.columnsDataPreview);
						$scope.selectNone();
						vm.dataLoading = false;
					}, 10);

					$timeout(function() {
						vm.hidePreviewError = true;
					}, 7500);
				} else {
					checkTimeOutAndShowConfirmDownload(response.message);
					vm.dataLoading = false;
				}
			});
		}

		function getRegisterInExportedFormat(callback) {
			if(vm.exportObj.name.toUpperCase() === 'BIM 360') {
				BIMIntegrationService.GetConvertedRegisterInBIM360Format(vm.userDetails.emailId, vm.pypeUserID, vm.pypeCompanyID, vm.pypeProjectID,
					vm.pypeProjectVersionID, vm.selectedCompany.id, vm.selectedProject.id, vm.selectedStatus.id, vm.selectedSmartRegisterRecordIds,
					function(response) {
                    	if(callback) { callback(response); }
                });
            } else if(vm.exportObj.name.toUpperCase() === 'ACC BUILD') {
                ACCBuildService.getRegisterInAccBuildFormat(vm.userDetails.emailId, vm.pypeUserID, vm.pypeCompanyID, vm.pypeProjectID,
					vm.pypeProjectVersionID, vm.selectedCompany.id, vm.selectedProject.id, vm.selectedStatus.id, vm.selectedSmartRegisterRecordIds,
					function(response) {
                    	if(callback) { callback(response); }
                });
            }
		}

		function GetBim360ObjectNames() {
				var companyList = $scope.listOfCompanies;
				for(var i=0; i < companyList.length; i++) {
					if(companyList[i].id === vm.selectedCompany.id) {
						vm.selectedCompanyName = companyList[i].name;
					}
				}
				var projectList = $scope.listOfProjects;
				for(var i=0; i < projectList.length; i++) {
					if(projectList[i].id === vm.selectedProject.id) {
						vm.selectedProjectName = projectList[i].name;
					}
				}
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
			return columns.filter(function(column) {
				return column.field == dataItem.field;
			})[0].caption;
		}

		function ExportRecords() {
			var selectedRecords = vm.recordsData;
			vm.dataLoading = 'Please wait... Exporting submittals to ' + vm.exportObj.name;
			for(var i=0; i < selectedRecords.length; i++) {
				delete selectedRecords[i].style;
			}

			BIMIntegrationService.UploadRecords(vm.userDetails.emailId, vm.userDetails.userId, vm.selectedCompany.id, vm.selectedProject.id, vm.pypeUserID,
				vm.pypeProjectID, vm.pypeProjectVersionID, vm.selectedSmartRegisterRecordIds,
				function(response) {
					if (response.success && response.data && response.data.uploadResults && response.data.uploadResults.length>0) {
						vm.step = 4;
						vm.showExportedRecords = false;
						vm.showFailedExports = false;
						PrepareBIM360ResponseColumns();
						getExportedRecordsList(response.data.uploadResults);
						FlashService.Success('Successfully exported to ' + vm.exportObj.name);
					} else {
						checkTimeOutAndShowConfirmDownload(response.message);
					}
					vm.dataLoading = false;
			});
		}

		function getExportedRecordsList(data) {
			if(data) {
				vm.successRecs = data.filter(function(item) {
					return item && item.exportStatus && (item.exportStatus === 'CREATED' || item.exportStatus === 'UPDATED');
				});
				vm.failedRecs = data.filter(function(item) {
					return !item.exportStatus || (item.exportStatus !== 'CREATED' && item.exportStatus !== 'UPDATED');
				});
				vm.successfulExports = vm.recordsData.filter(function(item) {
					return vm.successRecs.some(function(rec) {
						return item.recid === rec.clientSubmittalId;
					});
				});
				vm.FailedExports = vm.recordsData.filter(function(item) {
					return vm.failedRecs.some(function(rec) {
						if(!rec || !item) {
							return true;
						} else {
							return item.recid === rec.clientSubmittalId;
						}
					});
				});

				// Show Successfully Exported Records if only successful
				if(vm.successfulExports.length > 0 && (!vm.FailedExports || vm.FailedExports.length === 0)) {
					vm.showExportedRecords = true;
					$timeout(function() {
						$scope.reinitializeGrid(false, false, vm.searchData, vm.successfulExports.length);
						$scope.gridReload(vm.successRecs, vm.columnsDataFinal);
						$scope.selectNone();
					}, 1);
				}
			}
		}

		vm.ViewInBim360 = function() {
			var projectId = vm.selectedProject.id;
			projectId = projectId.slice(2, projectId.length);
			if(vm.exportObj.module === 'bim360') {
				window.open('https://pm.b360.autodesk.com/projects/' + projectId + '/submittals/items');
			} else if(vm.exportObj.module === 'acc') {
				window.open('https://acc.autodesk.com/build/submittals/projects/' + projectId + '/items');
			}
		}

		vm.NavigateToSmartRegister = function() {
			var accProject = AuthenticationService.GetACCProject();
			$location.path('/smartregister/projects/' + accProject.id)
		}

		vm.showNotExportedGrid = function() {
			vm.showNotExported = !vm.showNotExported;
			vm.showAlreadyExported = false;
			vm.showNoSpecNumberExported = false;
			if(vm.showNotExported) {
				reloadVerifyGrid(vm.notExportedRecords);
			}
		}

		vm.showAlreadyExportedGrid = function() {
			vm.showAlreadyExported = !vm.showAlreadyExported;
			vm.showNotExported = false;
			vm.showNoSpecNumberExported = false;
			if(vm.showAlreadyExported) {
				reloadVerifyGrid(vm.alreadyExportedRecords);
			}
		}

		vm.showNoSpecNumberGrid = function() {
			vm.showNoSpecNumberExported = !vm.showNoSpecNumberExported;
			vm.showNotExported = false;
			vm.showAlreadyExported = false;
			if(vm.showNoSpecNumberExported) {
				reloadVerifyGrid(vm.noSpecNumberRecords);
			}
		}

		vm.showExportedRecordsGrid = function() {
				vm.showExportedRecords = !vm.showExportedRecords;
				vm.showFailedExports = false;
				if(vm.showExportedRecords) {
					$timeout(function() {
						$scope.reinitializeGrid(false, false, vm.searchData, vm.successfulExports.length);
						$scope.gridReload(vm.successRecs, vm.columnsDataFinal);
						$scope.selectNone();
					}, 1);
				}
		}

		vm.showFailedExportsGrid = function() {
				vm.showFailedExports = !vm.showFailedExports;
				vm.showExportedRecords = false;
				if(vm.showFailedExports) {
					$timeout(function() {
						$scope.reinitializeGrid(false, false, vm.searchData, vm.FailedExports.length);
						$scope.gridReload(vm.failedRecs, vm.columnsDataFinal);
						$scope.selectNone();
					}, 1);
				}
		}

	}
})();

function openBim360SubmittalWindow(csvParam) {
	var arrayParam = csvParam.split(', ');
	var projectId = arrayParam[0].slice(2, arrayParam[0].length);  	//Removing the 'b.' from the project id which is not required
	if(arrayParam[2] === 'bim360') {
		var url = 'https://pm.b360.autodesk.com/projects/' + projectId + '/submittals/items?preview=' + arrayParam[1] + '&tab=overview';
	} else if(arrayParam[2] === 'acc') {
		var url = 'https://acc.autodesk.com/build/submittals/projects/' + projectId + '/items/' + arrayParam[1];
	}
	var exportService = angular.element(document.body).injector().get('ExportService');
	return exportService.openNewWindow(url, 1100, 450);
}
