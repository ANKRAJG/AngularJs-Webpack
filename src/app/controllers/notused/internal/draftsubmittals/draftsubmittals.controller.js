(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('DraftSubmittalsExportCtrl', DraftSubmittalsExportCtrl);

    DraftSubmittalsExportCtrl.$inject = ['$scope', 'AuthenticationService', 'AccService', 'ModalService', 'FlashService', 'SmartRegisterService',
        '$window', '$location', '$timeout', 'UtilService'];
    function DraftSubmittalsExportCtrl($scope, AuthenticationService, AccService, ModalService, FlashService, SmartRegisterService,
            $window, $location, $timeout, UtilService) {
        var vm = this;
        vm.initialLoader = true;
        vm.accProject = AuthenticationService.GetACCProject();
        vm.user = AuthenticationService.GetUserInfo();
        vm.selectedProject = AuthenticationService.GetProject();
        vm.selectedVersion = AuthenticationService.GetVersion();
        vm.lastRoute = AuthenticationService.GetLastRoute();
        vm.RevisedLabel = '_revised_';
        vm.exportStatuses = [
			{ value: 'Not Published', selected: true },
			{ value: 'Published', selected: false }
		];
		vm.exportStatusesSelectedItems = ['Not Published'];

        vm.filteredItemsTemp = JSON.parse($window.localStorage.getItem("filteredItems"));
		vm.filteredItems = {
			allDivisionsSelectedItems: vm.filteredItemsTemp.divisionCodeSelectedItems,
			allSpecSectionsSelectedItems: vm.filteredItemsTemp.specSectionSelectedItems,
			specCategoriesSelectedItems: vm.filteredItemsTemp.specCategorySelectedItems,
			specCategoryGroupsSelectedItems: vm.filteredItemsTemp.specCategoryGroupSelectedItems,
			projectSummaryGroupsSelectedItems: vm.filteredItemsTemp.projectSummaryGroupSelectedItems,
			subcontractorsSelectedItems: vm.filteredItemsTemp.subContractorSelectedItems
		};

        vm.applyFiltersFromView = applyFiltersFromView;

        (function initController() {
            var accProjectId;
            if(vm.accProject) {
                accProjectId = vm.accProject.id;
            }
            AccService.initialiseACCDetails(accProjectId, function() {
                vm.step = 1;
                vm.lastRouteLabel = getLastRouteLabel(vm.lastRoute);
                getSmartRegister();
            });
        })();

        function getLastRouteLabel(lastRoute) {
        	var label = lastRoute.split("/")[1];
        	if(label == 'smartview')
        		return 'Spec View';
        	return 'Smart Register';
        }

        vm.contactSupport = function() {
			window.solvvyApi.open();
		}

        vm.close = function() {
            if(vm.step===2 || (vm.step===3 && vm.moreMsg)) {
            	$location.path(vm.lastRoute);
            	return;
            }
        	var bodyMsg = 'Are you sure you want to perform the selected actions? Your Submittal type assignments will be lost.';
            var headMsg = "Go to " + vm.lastRouteLabel;
            ModalService.OpenConfirmModal(headMsg, bodyMsg, false, 'Ok', 'Cancel', true)
               .result.then(function() {
                   clearTimerForPublishStatus();
            	   $location.path(vm.lastRoute);
            }, function() {});
        }

        vm.back = function() {
            clearTimerForPublishStatus();
            $location.path('/draftmappings');
        }

        vm.goToSmartRegister = function() {
            clearTimerForPublishStatus();
            $location.path(vm.lastRoute);
        }

        function clearTimerForPublishStatus() {
            if(vm.timerForPublishSubmittals) {
                $timeout.cancel(vm.timerForPublishSubmittals);
            }
        }

        function applyFiltersFromView() {
            vm.dataLoading = "Applying filters... please wait..";
            // intentional delay of 10 milli seconds to make sure loader will appear
            $timeout(function() {
                applyFilters();
            }, 10);
        }

        function getSmartRegister() {
			vm.dataLoading = 'Loading... Please Wait...';
			AccService.getSmartRegister(vm.selectedProject.projectId, vm.selectedVersion.versionId)
            .then(function(response) {
				if (response && response.data && response.data.success) {
                    var resData = response.data.data;
					vm.MaxId = 0;
					var removeNullFields = [];
					var smartRegisterRecords = angular.copy(resData.smartRegisterRecords);
					var sanitizedRecords = UtilService.sanitizeFields(angular.copy(smartRegisterRecords),removeNullFields,[],true);
					vm.submittalregisters = sanitizedRecords.filter(function(record) {
							if(!record.specNumber || !record.specName) {
								record["style"] = "background-color: #FAE0E0 !important;";
							}
							return record;
					});
					vm.recordsData = angular.copy(vm.submittalregisters);
					SmartRegisterService.prepareAndSetSmartColumns(vm, vm.submittalregisters, resData.smartColumnsContainer);
					PrepareSmartRegisterColumns();
					prepareQuickFiltrDataNComboOptions();
					createFullFiltersObject();

					$scope.reinitializeGrid(true, true, vm.searchData, vm.recordsData.length);
					$timeout(function(){
							applyFilters();
							if(vm.userSelectedRecords && vm.userSelectedRecords.length>0 && ((!vm.lastSearch && vm.userSelectedRecords.length !== vm.filterSmartRegisteredData.length) || (vm.lastSearch && vm.userSelectedRecords.length !== vm.searchedRecordsIndexes.length))) {
								$scope.selectRecords(vm.userSelectedRecords);
							}
					}, 10);
				} else {
					checkTimeOutAndShowConfirmDownload(message);
					vm.dataLoading = false;
				}
				vm.initialLoader = false;
			})
            .catch(function(error) {
                FlashService.Error(error.data.message);
                vm.dataLoading = false;
                vm.initialLoader = false;
            });
		}

        /* FILTERS RELATED CODE STARTS HERE */
        function createFullFiltersObject() {
			vm.completeFilters = [
				{filterName: 'allDivisions', filterValue: vm.allDivisions, displayName: 'Division', filterSelected: true},
				{filterName: 'allSpecSections', filterValue: vm.allSpecSections, displayName: 'Spec section', filterSelected: true},
				{filterName: 'specCategories', filterValue: vm.specCategories, displayName: 'Submittal type', filterSelected: true},
				{filterName: 'specCategoryGroups', filterValue: vm.specCategoryGroups, displayName: 'Submittal type group', filterSelected: true},
				{filterName: 'projectSummaryGroups', filterValue: vm.projectSummaryGroups, displayName: 'Submittal group', filterSelected: true},
				{filterName: 'subcontractors', filterValue: vm.subcontractors, displayName: 'Subcontractor', filterSelected: true},
				{filterName: 'exportStatuses', filterValue: vm.exportStatuses, displayName: 'Publish status', filterSelected: true}
			];
		}

        vm.selectAll = function(filter, flag) {
            angular.forEach(filter.filterValue, function (item) {
                item.selected = flag;
            });
        }

        vm.clearAllFilters = function() {
            angular.forEach(vm.completeFilters, function(filter) {
                angular.forEach(filter.filterValue, function (item) {
                    item.selected = false;
                });
            });
            applyFiltersFromView();
            $scope.$broadcast('doSearchInBoxFromParent', { value: ''});
        }

        // Function for dynamically initializing Angular Filters for filter Search
        $scope.commonFilter = function(filterName) {
            return function(item) {
                if(filterName === 'allDivisions') {
                    if(!vm['search' + filterName] ||  (item.divisionName && item.divisionName.toUpperCase().indexOf(vm['search' + filterName].toUpperCase()) > -1)
                        || (item.divisionCode && item.divisionCode.indexOf(vm['search' + filterName]) > -1)) {
                            return true;
                    }
                    return false;
                } else if(filterName === 'allSpecSections') {
                    if(!vm['search' + filterName] || (item.specName && item.specName.toUpperCase().indexOf(vm['search' + filterName].toUpperCase()) > -1)
                        || (item.specSection && item.specSection.indexOf(vm['search' + filterName]) > -1)) {
                            return true;
                    }
                    return false;
                } else {
                    if(!vm['search' + filterName] || (item.value && item.value.toUpperCase().indexOf(vm['search' + filterName].toUpperCase()) > -1)
                        || (item.value && item.value.indexOf(vm['search' + filterName]) > -1)) {
                            return true;
                    }
                    return false;
                }
            }
        }

        vm.toggleFilterDropdown = function(filter) {
                filter.filterSelected = !filter.filterSelected;
                if(!filter.filterSelected && vm[filter.filterName + 'SelectedItems'].length > 0 && (vm[filter.filterName + 'SelectedItems'].length !== filter.filterValue.length)) {
                    vm.removeAllIndividualFilters(filter.filterName);
                }
        }

        vm.removeAllIndividualFilters = function(filterName) {
                vm.dataLoading = "Applying filters... please wait..";
                $timeout(function() {
                    vm[filterName] = vm[filterName].map(function(item) {
                        item.selected = false;
                        return item;
                    });
                    applyFilters();
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

        function fillSelectedFilters(filterName) {
            vm[filterName].forEach(function(record) {
                record.selected = false;
            });
            vm[filterName + 'SelectedItems'] = [];
        }

        function applyFilters() {
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
                   vm[filter.filterName + 'isOpen'] = false;
               });

               var filteredRecords = vm.submittalregisters.filter(function(record) {
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
                           (vm.exportStatusesSelectedItems[0] === 'Published' ? isAlreadyExported(record) : (!isAlreadyExported(record) || !record.uploadedToACC ));
                   }
               });

               vm.filterSmartRegisteredData = getFilteredSRData(filteredRecords);

               $scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
               getSelectedRecordsFromGrid();
               vm.dataLoading = false;
        }

        function getFilteredSRData(filteredRecords) {
            var filterSRData;
            if(vm.filterMissingSpecSections) {
                filterSRData = filteredRecords.filter(function(record) {
                    return !record.specNumber || !record.specName;
                });
            } else {
                filterSRData = filteredRecords;
            }

            vm.showMissingSpecSectionBanner = filterSRData.filter(function(record) {
                return !record.specNumber || !record.specName;
            }).length>0;
            return filterSRData;
        }

        function getSelectedRecordsFromGrid() {
            vm.selectedRecords = $scope.getSelectedRecords('publishToBuildGrid');
            if(vm.selectedRecords.length===0 && vm.filterSmartRegisteredData.length>0) {
                vm.selectedRecords = vm.filterSmartRegisteredData;
            }
            vm.disableProceedBtn = (vm.selectedRecords.length===0 && vm.filterSmartRegisteredData.length===0) ||
                                    (vm.selectedRecords.length>0 && vm.selectedRecords.filter(function(record) { return record && (!record.specNumber || !record.specName); }).length>0);

        }

        $scope.$on('gridCheckboxToggle', function(event, data) {
            var filteredData = angular.copy(vm.filterSmartRegisteredData);
            if(data && data.length>0) {
                vm.filterSmartRegisteredData = filteredData.filter(function(item, idx) {
                    return data.indexOf(idx) > -1;
                });
            }
            getSelectedRecordsFromGrid();
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });

        vm.filterDropdownToggled = function(filter) {
            angular.forEach(filter.filterValue, function(item) {
                if(filter.filterName === 'allDivisions') {
                    item.selected = (vm[filter.filterName + 'SelectedItems'].indexOf(item.divisionCode) !== -1);
                } else if(filter.filterName === 'allSpecSections') {
                    item.selected = (vm[filter.filterName + 'SelectedItems'].indexOf(item.specSection) !== -1);
                } else {
                    item.selected = (vm[filter.filterName + 'SelectedItems'].indexOf(item.value) !== -1);
                }
            });
            var notSelected = false;
            angular.forEach(filter.filterValue, function(item, index) {
                if (!item.selected) {
                    notSelected = true;
                }
            });
            vm[filter.filterName + 'SelectAll'] = !notSelected;
        }
        /* FILTERS RELATED CODE ENDS HERE */

        function isAlreadyExported(record) {
			var uploaded = false;
			if(record.uploadedToACC) {
				for(var key in record.accProjectAndSubmittalID) {
					if(key === vm.accProject.id.toString()) {
						uploaded = true;
						break;
					}
				}
			}
			return uploaded;
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

        function convertAllValuesToLowerCase(items){
                var result = [];
                for(var i=0;i<items.length;i++){
                    if(items[i]){
                        result.push(items[i].toLowerCase());
                    }
                }
                return result;
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

        function PrepareSmartRegisterColumns() {
			vm.searchData = [
					{ field: 'source', caption: 'Source version', type: 'text' },
					{ field: 'specCategoryGroup', caption: 'Spec category group', type: 'text' },
					{ field: 'specNumber', caption: 'Spec section', type: 'text' },
					{ field: 'specName', caption: 'Spec name', type: 'text' },
					{ field: 'paraCode', caption: 'Spec sub section', type: 'text' },
					{ field: 'specCategory', caption: 'Submittal type', type: 'text' },
					{ field: 'submittalDescription', caption: 'Submittal description', type: 'text' },
					{ field: 'submittalsHeading', caption: 'Sub section heading', type: 'text' },
					{ field: 'subContractor', caption: 'Subcontractor', type: 'text' },
					{ field: 'dateIssued', caption: 'Date issued', type: 'text' }
			];

			if(vm.initialLoader) {
				vm.columnsData = [
                    {
                        field : 'uploadedToACC',
                        caption : 'Publish status',
                        sortable : true,
                        size : '9%',
                        resizable : true,
                        editable : false,
                        render: function (record) {
                            if(record.uploadedToACC) {
                                var forProjectAlreadyUploaded = false;
								var submittalId = null;
								for(var key in record.accProjectAndSubmittalID) {
									if(key === vm.accProject.id) {
										forProjectAlreadyUploaded = true;
										submittalId = record.accProjectAndSubmittalID[key];
									}
								}

                                if(forProjectAlreadyUploaded) {
                                    return '<div class="text-left"><span class="exported-green" title="Submittal already published to project in Build, Re-publishing will update the existing submittal in Build">Published</span>' +
                                           '<a class="cursorPointer m-l15" onclick=\'openBuildSubmittalWindow("' + vm.accProject.id + ', ' + submittalId + '");event.stopPropagation();\'>' +
									       '<image src="images/procore/preview-outline.png" title="View in Build"></pype-image><a></div>';
                                }
                                else {
                                    return '<div class="text-left"><span class="notexported">Not Published</span></div>';
                                }
                            }
                            else {
                                return '<div class="text-left"><span class="notexported">Not Published</span></div>';
                            }
                        }
                    },
					{ field: 'source', caption: 'Source version', tooltip: 'Source version', sortable: true, size: '8%', hidden: true, resizable: true, editable: false },
					{ field: 'serialNumber', caption: 'S. No.', tooltip: 'Submittal Number', sortable: true, size: '6%', resizable: true, hidden: true, editable: false },
					{ field: 'divisionCode', caption: 'Division', hidden: true, sortable: true, size: '7%', resizable: true, tooltip: 'Division', editable: false },
					{ field: 'specNumber', caption: 'Spec #', sortable: true, size: '6%',
						render: function (record) {
                            if(!record.specNumber){
                                return '<div class="text-left"><img src="images/unification/validate-error.svg" class="w-20 m-r10 inline-block failedtopubicon"><span class="sr-tooltiptext sr-tooltiptext1">Missing spec number</span></div>';
                            }
                            return record.specNumber;
						},
                        resizable: true, editable: false, tooltip: 'Spec section'
                    },
					{ field: 'specName', caption: 'Spec name', sortable: true, size: '9%',
                        render: function (record) {
                            if(!record.specName){
                                return '<div class="text-left"><img src="images/unification/validate-error.svg" class="w-20 m-r10 inline-block failedtopubicon"><span class="sr-tooltiptext sr-tooltiptext1">Missing spec name</span></div>';
                            }
                            return record.specName;
                        },
                        resizable: true, tooltip: 'Spec name', editable: false
                    },
					{ field: 'paraCode', caption: 'Spec sub section', tooltip: 'Paragraph', sortable: true, size: '5%', resizable: true, editable: false },
					{ field: 'submittalsHeading', caption: 'Sub section heading', sortable: true, size: '12%', hidden: false, tooltip: 'Sub section heading', resizable: true, editable: false},
					{ field: 'specCategory', caption: 'Submittal type', sortable: true, size: '11%', resizable: true, tooltip: 'Submittal type', editable: false },
					{ field: 'submittalDescription', caption: 'Submittal description', sortable: true, size: '25%', resizable: true, tooltip: 'Submittal description', editable: false },
					{ field: 'targetDate', caption: 'Target date', sortable: true, size: '9%', resizable: true, tooltip: 'Target date', editable: false },
					{ field: 'userNotes', caption: 'User notes', sortable: true, size: '8%', resizable: true,hidden: true, tooltip: 'User notes', editable: false },
					{ field: 'subContractor', caption: 'Subcontractor', sortable: true, size: '6%', resizable: true, tooltip: 'Subcontractor', editable: false, hidden: true },
					{ field: 'specCategoryGroup', caption: 'Submittal type group', hidden: true, sortable: true, size: '7%', tooltip: 'Spec category group', resizable: true, editable: false},
					{ field: 'projectSummaryGroup', caption: 'Submittals group', hidden: true, sortable: true, size: '7%', tooltip: 'Submittals group', resizable: true, editable: false },
					{ field: 'dateIssued', caption: 'Date issued', hidden: false, sortable: true, size: '9%', tooltip: 'Date issued', resizable: true, editable: false }
				];
				SmartRegisterService.initSmartColumns(vm.smartColumns, vm.columnsData, true, true);
			}
		}

        function prepareBuildResponseColumns() {
            vm.columnsDataFinal = [
                {
					field : 'exportStatus', caption : 'Publish status', sortable : true, size : '4.5%', resizable : true, editable : false,
					render: function (record) {
						return '<div class="text-left"><img src="images/unification/validate-error.svg" title="' + record.message + '" class="w-20 m-r10 inline-block failedtopubicon"><span class="notexported">Failed to publish</span></div>';
					}
				},
                {
                    field : 'id', caption : 'Status', sortable : true, size : '2%', resizable : true, editable :  false,
                    render: function (record) { return '<span>Draft</span>'; }
                },
                { field : 'recid', caption : '#', sortable : true, size : '2%', resizable : true, editable :  false },
                { field : 'specIdentifier', caption : 'Spec #', tooltip : 'Spec #', sortable : true, size : '2.5%', resizable : true, editable :  false },
				{ field : 'title', caption : 'Spec title', sortable : true, size : '5%', resizable : true, editable :  false, hidden : false },
                { field : 'submittalType', caption : 'Type', sortable : true, size : '4.5%', resizable : true,hidden : false, editable :  false },
				{ field : 'subsection', caption : 'Spec sub section', sortable : true, size : '4%', resizable : true, editable :  false, hidden : false },
				{ field : 'description', caption : 'Description', sortable : true, size : '15%', resizable : true,hidden : false, editable :  false }
			];
        }

        vm.publishSubmittals = function() {
            if(!vm.filterMissingSpecSections && !vm.disableProceedBtn && (!vm.lastSearch || (vm.lastSearch && vm.searchedRecordsIndexes.length>0))) {
                vm.step = 3; // Loader step
                var submittalIds = [];
                vm.moreMsg = false;
    			// After 60 secs show another message.
    			$timeout(function() {
    				vm.moreMsg = true;
    			}, 60000);
                vm.selectedRecords.forEach(function(record) {
                    submittalIds.push(record.recid);
                });
                vm.successfulExports = [];
                vm.failedExports = [];
                vm.newlyCreatedSubmittals = [];

                AccService.publishSubmittals(vm.selectedProject.projectId, vm.selectedVersion.versionId, submittalIds)
                .then(function(response) {
                    if(response) response = response.data;
                    if(response.success) {
                        if(response.data && response.data.uploadResults && response.data.uploadResults.length>0) {
                            gotoStep2(response.data);
                        } else {
                            getUpdatedPublishStatus(response.data.uploadId);
                        }
                    } else {
                        showFlashError('Failed to export submittals.');
                    }
                })
                .catch(function(error) {
					var message = 'Failed to export submittals.';
					if (error.status == 400) {
						message = error.data.message;
					}
                    showFlashError(message);
                });
            }
        }

        function showFlashError(message) {
            vm.step = 1;
            FlashService.Error(message);
        }

        function gotoStep2(data) {
            vm.step = 2;
            prepareBuildResponseColumns();
            data.uploadResults.forEach(function(item) {
                item.recid = item.clientSubmittalId;
            });
            getExportedRecordsList(data.uploadResults);
        }

        function getUpdatedPublishStatus(uploadId) {
            getPublishStatus(uploadId, function(data) {
                if(data && data.uploadResults && data.uploadResults.length>0) {
                    gotoStep2(data);
				} else {
                    vm.timerForPublishSubmittals = $timeout(function() {
						// Running this after 5 secs
						getUpdatedPublishStatus(uploadId);
					}, 5000);
				}
            });
        }

        function getPublishStatus(uploadId, callback) {
            AccService.getPublishResultsByUploadId(uploadId, function(response) {
        		if (response.success) {
					if(callback) callback(response.data);
        		} else {
                    showFlashError();
        		}
        	});
        }

        function getExportedRecordsList(data) {
            // To check for failed grid
            // data.forEach(function(item, idx) {
            //         item.exportStatus = 'FAILED';
            //         item.id = null;
            // });
            vm.newlyCreatedSubmittals = data.filter(function(item) { return item && item.exportStatus === 'CREATED_UPDATE_FAILED'; });
			vm.successfulExports = data.filter(function(item) {
				return item && (item.exportStatus === 'CREATED' || item.exportStatus === 'UPDATED' || item.exportStatus === 'CREATED_UPDATE_FAILED');
			});
			vm.failedExports = data.filter(function(item) {
				return !item.exportStatus || (item.exportStatus !== 'CREATED' && item.exportStatus !== 'UPDATED' && item.exportStatus !== 'CREATED_UPDATE_FAILED');
			});

            if(vm.failedExports.length>0) {
                $timeout(function() {
                    $scope.reinitializeGrid(false, false, vm.searchData, vm.failedExports.length);
                    $scope.gridReload(vm.failedExports, vm.columnsDataFinal);
                    $scope.selectNone();
                }, 1);
            }
		}

        vm.viewInBuild = function() {
            window.open('/build/submittals/projects/' + vm.accProject.id + '/items');
        }

    }
})();

function openBuildSubmittalWindow(csvParam) {
	var arrayParam = csvParam.split(', ');
	//var projectId = arrayParam[0].slice(2, arrayParam[0].length);  	//Removing the 'b.' from the project id which is not required
	var url = '/build/submittals/projects/' + arrayParam[0] + '/items/' + arrayParam[1];
	var exportService = angular.element(document.body).injector().get('ExportService');
	return exportService.openNewWindow(url, 1100, 450);
}
