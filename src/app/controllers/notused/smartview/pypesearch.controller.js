(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('PypeSearchController', PypeSearchController);

    PypeSearchController.$inject = ['$scope', 'AuthenticationService', '$routeParams','$linq','SmartRegisterService','PypeSearchService','$timeout','$rootScope','$sce', '$uibModal', 'MAINURL','FlashService', 'ProjectService'];
    function PypeSearchController($scope, AuthenticationService, $routeParams, $linq, SmartRegisterService, PypeSearchService, $timeout, $rootScope, $sce, $uibModal, MAINURL, FlashService, ProjectService) {
        var vm = this;
        vm.specsLabel = "SPECS";
        vm.plansLabel = "PLANS";
        vm.isPlansSelected = false;
        vm.isSpecsSelected = true;
        vm.keywordsList = ["SPECS", "PLANS"];
        vm.isCollapsedGroup = {};
        vm.selectedKeyword = vm.specsLabel;
        vm.otherRequirements = "Others";
        vm.descriptionLength = 120;
        vm.showOptions = false;
        vm.searchResults = false;
        vm.exactMatch = false;

        vm.isSpecsSelected = true;
		vm.isPlansSelected = true;

        vm.recordsStart = 0;
        vm.recordsSize = 1000;
        vm.sortByKeysSearchRecords = [];

        vm.getPypeSearchData = getPypeSearchData;
        vm.searchFilterSelected = searchFilterSelected;
        vm.highlightSubmittalInPlans = highlightSubmittalInPlans
        vm.highlightSubmittalInSpecs = highlightSubmittalInSpecs;
        vm.closePypeSearch = closePypeSearch;
        vm.exactMatchClicked = exactMatchClicked;

        vm.groupSubmittalsByField = groupSubmittalsByField;
        vm.addSearchToSmartRegister = addSearchToSmartRegister;


        $scope.isCollapsed = true;
        vm.CollapseAllRecords = CollapseAllRecords;

        vm.searchIconClicked = searchIconClicked;
        
        vm.paginationSize = 4; // show 4 pages at a time
        vm.defaultPageNumber = 1;

        // Filters related Code
        vm.columnsList = {division : 'divisionCode', specSection : 'specSection', submittalGroup : 'projectSummaryGroup', submittalType : 'specCategory', specCategoryGroup : 'specCategoryGroup', drawingSheetNumber : 'drawingSheetNumber', source: 'source'};
        vm.columnsTotalVarData = {
        		divisionCode : {allVar : 'allDivisions', searchVar : 'searchDivisionCodes', form : 'divisionFormDirty', mapValue : 'divisionCode', mapName : 'Division Code', filterItem : 'divisionFilterItem',  number : 'numberOfDivisions', selectAllVar : "divisionCodeSelectAll"},
        		specSection : {allVar : 'allSpecSections', searchVar : 'searchSpecSections', form : 'specSectionFormDirty', mapValue : 'specSection', mapName : 'Spec Section', filterItem : 'specSectionFilterItem',  number : 'numberOfSpecSections', selectAllVar : "specSectionSelectAll"},
        		projectSummaryGroup : {allVar : 'allProjectSummaryGroups', searchVar : 'searchSubmittalGroups', form : 'submittalGroupFormDirty', mapValue : 'value', mapName : 'Project Summary Group', filterItem : 'projectSummaryGroupsFilterItem',  number : 'numberOfSummaryGroups', selectAllVar : "projectSummaryGroupSelectAll"},
        		specCategory : {allVar : 'allSpecCategories', searchVar : 'searchSubmittalTypes', form : 'specCategoryFormDirty', mapValue : 'value', mapName : 'Submittal Type', filterItem : 'specCategoriesFilterItem',  number : 'numberOfSpecCategories', selectAllVar : "specCategorySelectAll"},
        		specCategoryGroup : {allVar : 'allSpecCategoryGroups', searchVar : 'searchSpecCategoryGroups', form : 'specCategoryGroupFormDirty', mapValue : 'value', mapName : 'Submittal Type Group', filterItem : 'specCategoryGroupFilterItem',  number : 'numberOfSpecCategoryGroups', selectAllVar : "specCategoryGroupSelectAll"},
        		drawingSheetNumber : {allVar : 'allDrawingSheetNumber', searchVar : 'searchDrawingSheetNumber', form : 'drawingSheetNumberFormDirty', mapValue : 'value', mapName : 'Drawing Sheet', filterItem : 'drawingSheetNumberFilterItem',  number : 'numberOfDrawingSheetNumber', selectAllVar : "drawingSheetNumberSelectAll"}

        };


        var emptyValuesLabel = "(empty)";
        
        vm.toggleClearAllFiltersSelection = toggleClearAllFiltersSelection;
        vm.toggleAllDivisionFiltersSelection = toggleAllDivisionFiltersSelection;
        vm.toggleAllSpecSectionFiltersSelection = toggleAllSpecSectionFiltersSelection;
        vm.toggleAllCommonFiltersSelection = toggleAllCommonFiltersSelection;

        //vm.recordClicked = recordClicked;
        (function initController() {
        	AuthenticationService.SetSpecsGroupByField('specNumber'); 
            LoadUserDetails();
            GetCompanyName();
            GetGroupByField();
            vm.selectedProject = AuthenticationService.GetProject();
            vm.selectedVersion = AuthenticationService.GetVersion();
            if(vm.selectedProject) {
            	 checkPlansEnabled();
                 LoadSubmittalGroups();
                 LoadSubmittalTypes();
            }
           // LoadProjects();
        })();
        
        // default variables
        $scope.pagination = {
   			    currentPage:  vm.defaultPageNumber,
   			    maxSize: vm.paginationSize
   		};


        function GetGroupByField() {
        	var groupByField;
        	if(vm.selectedKeyword == vm.specsLabel) {
        		groupByField = AuthenticationService.GetSpecsGroupByField();
        	} else {
        		groupByField = AuthenticationService.GetPlansGroupByField();
        	}
        	vm.groupByField = groupByField && groupByField.length > 0 ? groupByField : 'none';
        }
        
        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }
        
        function LoadProjects(callback) {
            vm.dataLoading = "";
            vm.projects = [];
            var projects = AuthenticationService.GetUserProjects();
            vm.projects = projects.filter(function (data) {
                if (data.daysToExpire <= 0) {
                    data.isExpired = 1;
                }
                return data;
            });
            vm.projects = $linq.Enumerable().From(vm.projects)
            .Where(function (x) {
                return x.active == 1
            })
            .OrderBy(function (x) {
                return x.status
            })
            .Select(function (x) {
                return x
            })
            .ToArray();
            if (vm.projects.length == 0) {
                vm.NoProjects = true;

            }
            else {
                vm.NoProjects = false;
                vm.dataLoading = false;
                GetSelectedProject();
            }
        }

        function GetSelectedProject() {
            var project = AuthenticationService.GetProject();
            if (project) {
                if (!project || !containsObject(vm.projects, "projectId", project.projectId)) {
                    vm.selectedProject = vm.projects[0];
                    vm.selectedVersion = vm.selectedProject.versions[0];
                }
                else {
                    vm.selectedProject = project;
                    var version = AuthenticationService.GetVersion();
                    if (version) {
                        vm.selectedVersion = version;
                    }
                    else {
                        vm.selectedVersion = vm.selectedProject.versions[0];
                    }
                }
            }
        }
        
        function containsObject(list, property, val) {
            if (list) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i][property] === val) {
                        return true;
                    }
                }
            }
            return false;
        }


        function searchFilterSelected(item) {
        	vm.selectedKeyword =  item;
        	resetVariables();
        	vm.searchResultsFound = false;
        	GetGroupByField();
        	getPypeSearchData();
        }

        $scope.collapseSubmittalGroup = function(key){
        	$timeout(function(){
        		vm.isCollapsedGroup[key] = !vm.isCollapsedGroup[key];
        	}, 0);

        }
        
        function CollapseAllRecords() {
        	var keys = Object.keys(vm.isCollapsedGroup);
        	$scope.isCollapsed = angular.copy(!$scope.isCollapsed);
            for(var i = 0; i < keys.length; i++) {
            	vm.isCollapsedGroup[keys[i]] = $scope.isCollapsed;
        	}
        }
        
        function checkPlansEnabled() {
        	if(vm.selectedProject) {
                var planVersionIdx = ProjectService.getPlanVersionIndex(vm.selectedProject, vm.selectedVersion);
                if(planVersionIdx !== -1) {
                    var planStatus = vm.selectedProject.planVersions[planVersionIdx].status.toLowerCase();
                }
        	}
        	if(planStatus && planStatus.toLowerCase() == 'completed') {
        		vm.enablePlans = true;
        	} else {
        		vm.enablePlans = false;
        	}
        }
        
        
        $scope.checkIfEnterKeyWasPressed = function($event) {
            var keyCode = $event.which || $event.keyCode;
            if (keyCode === 13 && vm.pypeSearchText && vm.pypeSearchText.length > 0) {
            	vm.showOptions = true;
            	resetVariables();
            	vm.searchResultsFound = false;
            	getPypeSearchData();
            }
         }

         function searchIconClicked() {
        	 vm.showOptions = true;
         	 resetVariables();
         	 vm.searchResultsFound = false;
         	 getPypeSearchData();
         }

         function resetVariables() {
        	 vm.recordsStart = 0;
         	 vm.stopPaginatedCall = false;
         	 vm.sortByKeysSearchRecords = [];
         }


        // function to set previous search text if not exits while searching
        function settingSearchVariable() {
           if(vm.pypeSearchText && vm.pypeSearchText.length > 0) {
         		vm.copyPypeSearchText = angular.copy(vm.pypeSearchText);
           } else {
         	  if(vm.copyPypeSearchText && vm.copyPypeSearchText.length > 0) {
         		  vm.pypeSearchText = angular.copy(vm.copyPypeSearchText);
         	  } else {
         		  return;
         	  }
           }
        }

        function exactMatchClicked() {
        	vm.showOptions = true;
        	vm.exactMatch = !vm.exactMatch;
        	vm.searchResultsFound = false;
        	resetVariables();
        	getPypeSearchData()
        }
        
      
        $scope.pageChanged= function() {
        	var pageNumber = $scope.pagination.currentPage;
        	if(pageNumber > 1) {
        		vm.recordsStart = (pageNumber-1) * vm.recordsSize;
        	} else {
        		vm.recordsStart = 0;
        	}
        	vm.sortByKeysSearchRecords = [];
        	getPypeSearchData();
        }

        function getPypeSearchData() {
        	settingSearchVariable();
        	if(!vm.pypeSearchText || vm.pypeSearchText.length == 0)
        		return;
        	vm.selectedSearchRecord = null;
        	vm.searchLoading = "Loading Search Results... Please wait"
        	vm.isSpecsSelected = vm.selectedKeyword === vm.specsLabel ? true : false;
        	vm.isPlansSelected = vm.selectedKeyword === vm.plansLabel ? true : false;
        	if(vm.pypeSearchText && vm.pypeSearchText.length > 0) {
            var batchSize = vm.recordsSize;
            var trimmedSearchText = vm.pypeSearchText.trim();
            if(trimmedSearchText.charAt(0) === '"' && trimmedSearchText.charAt(trimmedSearchText.length - 1) === '"') {
            	vm.exactMatch = true;
            }
            if(vm.recordsStart > 10000) {
            	return;
            }
        	PypeSearchService.GetAllResults(vm.selectedProject.projectId, vm.selectedVersion.versionId, vm.recordsStart, batchSize, vm.pypeSearchText, vm.isSpecsSelected, vm.isPlansSelected, vm.isBaseVersion, vm.exactMatch, function(response) {
                if (response.success) {
                	vm.searchResults = true;
                	if(response.data && response.data.responseDocuments.length > 0) {
                		vm.searchHits = response.data.searchHits;
                		setVariablesForPagination();
                		processSearchRecords(response.data.responseDocuments);
                		$timeout(function() {
                		       openFirstRecordAfterSearch();
                		}, 0);
                    } else {
                	  vm.searchLoading = false;
                	  if(vm.searchResultsFound == true) {
                		  vm.stopPaginatedCall = true;
                	  } else {
                		  vm.searchHits = 0;
                		  vm.sortByKeysSearchRecords = [];
                	  }
                  }
                      vm.searchLoading = false;
                } else {
                	  vm.searchHits = 0;
                	  vm.searchResults = true;
                	  vm.searchLoading = false;
                	  resetVariables();
                	  FlashService.Error(response.message ? response.message : "Search did not succeed.")
                }
              });
            }
        }
        
               
        function setVariablesForPagination() {
       		 $scope.totalItems = vm.searchHits;
       		 var totalPagesFound = vm.searchHits / vm.recordsSize;
       		 if(isInt(totalPagesFound)) {
       			 $scope.totalPagesFound = totalPagesFound;
       		 } else {
       			$scope.totalPagesFound = Math.floor(totalPagesFound) + 1;
       		 }
       	}
        
        function isInt(n) {
        	if(n % 1 == 0)
        		return true;
        	else 
        		return false;
        }
        
        function processSearchRecords(records) {
        	var searchRecords = [], filteredSearchRecords = [], filteredNonSRRecords =[], filteredSRRecords = [], filteredTotalRecords = [];
        	vm.searchResultsFound = true;
            records.map(function (totalObject) {
            	var record = totalObject.record
            	record.submittalMetaData = totalObject.metadata;
            	record.indexName = totalObject.indexName;
            	record.submittalData = totalObject.metadata.submittalData;
            	if(!record.submittalMetaData.submittalData) {
            		 record.specCategory = vm.otherRequirements;
            	} 
            	if(totalObject.matchedFields) {
            		if(totalObject.matchedFields['record.submittalDescription.analyzed']) {
            			record.highlightedSubmittalDescription = totalObject.matchedFields['record.submittalDescription.analyzed'];
            		} else if(totalObject.matchedFields['record.submittalDescription']) {
            			record.highlightedSubmittalDescription = totalObject.matchedFields['record.submittalDescription'];
            		} else {
            			record.highlightedSubmittalDescription = record.submittalDescription;
            		}
            	        record.footerMetadata = constructMetaDataField(totalObject, record);
            	}
            	
                filteredTotalRecords.push(record);
            });
            vm.filteredSearchRecords = angular.copy(filteredTotalRecords);
            if(vm.searchHits > vm.recordsSize) {
            	vm.groupByField = 'none';
            } else if(vm.selectedKeyword == vm.specsLabel) {
            	GetGroupByField();
            }
            // need to revise the logic
            if(vm.searchHits <= vm.recordsSize && vm.groupByField !== 'none' &&  vm.selectedKeyword == vm.specsLabel) {
                 prepareQuickFiltrDataNComboOptions(filteredTotalRecords);
                 applyFiltersForAll();
            } else if(vm.searchHits <= vm.recordsSize && vm.groupByField !== 'none' &&  vm.selectedKeyword == vm.plansLabel) {
            	prepareQuickFiltrDataNComboOptions(filteredTotalRecords);
                applyFiltersForAll();
            	//groupSearchRecords(vm.groupByField, vm.filteredSearchRecords);
            }  else if(vm.searchHits <= vm.recordsSize && vm.groupByField == 'none'){
            	  prepareQuickFiltrDataNComboOptions(filteredTotalRecords);
                  applyFiltersForAll();
            	//vm.sortByKeysSearchRecords = angular.copy(vm.filteredSearchRecords);
            } else {
            	vm.sortByKeysSearchRecords = angular.copy(vm.filteredSearchRecords);
            }
        }

        function constructMetaDataField(totalObject, record) {
        	var metadata = '';
        	var fields = ['specNumber', 'specName', 'submittalHeading', 'drawingSheetNumber', 'drawingSheetName'];
        	var recordPrefix = "record."
        	for(var ind = 0; ind < fields.length; ind++) {
        		if(totalObject.matchedFields[recordPrefix + fields[ind]]) {
        			metadata = metadata + totalObject.matchedFields[recordPrefix + fields[ind]] + ' ';
        		} else {
        			metadata = metadata + (record[fields[ind]] ? record[fields[ind]] : ' ') + ' ';
        		}
        	}
        	return metadata;
        }
        
        function groupSpecsRecords(field, records) {
        	vm.groupByField = field;
        	var groupByFilteredSearchRecords = {},  sortByKeysSearchRecords = [];
        	if(vm.groupByField == 'specNumber') {
        		groupByFilteredSearchRecords = PypeSearchService.GroupBy(records, 'specNumber', 'specName'); 
        		var keys = Object.keys(groupByFilteredSearchRecords);
        		for(var i = 0; i < keys.length; i++) {
        			groupByFilteredSearchRecords[keys[i]] = groupByFilteredSearchRecords[keys[i]].sort(PypeSearchService.sortByProperties(['pdfPageNumber', 'paraCode']));
        		}
        	} else {
        		groupByFilteredSearchRecords = PypeSearchService.GroupBy(records, vm.groupByField);
        	}
        	Object.keys(groupByFilteredSearchRecords).sort().forEach(function (key, index) {
        		if(index == 0)
        			vm.isCollapsedGroup[key] = angular.copy(false);
        		else
        			vm.isCollapsedGroup[key] = angular.copy(true);
        		sortByKeysSearchRecords.push([key, groupByFilteredSearchRecords[key]]);
            });
            vm.sortByKeysSearchRecords = angular.copy(sortByKeysSearchRecords);
        }

        function groupPlansRecords(field, records) {
        	vm.groupByField = field;
        	var groupByFilteredSearchRecords = {},  sortByKeysSearchRecords = [];
        	if(vm.groupByField == 'sheetNumber') {
            	groupByFilteredSearchRecords = PypeSearchService.GroupBy(records, 'drawingSheetNumber', 'drawingSheetName');
            } 
            Object.keys(groupByFilteredSearchRecords).sort().forEach(function (key, index) {
            	if(index == 0)
        			vm.isCollapsedGroup[key] = angular.copy(false);
        		else
        			vm.isCollapsedGroup[key] = angular.copy(true);
               	    sortByKeysSearchRecords.push([key, groupByFilteredSearchRecords[key]]);
             });
             vm.sortByKeysSearchRecords = angular.copy(sortByKeysSearchRecords);
        }
        
        function groupSearchRecords(field, records, openFirstRecord) {
            if(vm.selectedKeyword == vm.specsLabel && vm.groupByField !== 'none') {
            	groupSpecsRecords(field, records);
            } else if(vm.selectedKeyword == vm.plansLabel && vm.groupByField !== 'none') {
            	groupPlansRecords(field, records)
            } else {
            	vm.sortByKeysSearchRecords = angular.copy(records);
            }
            if(openFirstRecord) {
            	$timeout(function() {
      		       openFirstRecordAfterSearch();
            	}, 0);
            }
        }
        
       
        $scope.highlightSubmittalDescription = function(record) {
			var text;
			if(record.highlightedSubmittalDescription.length > vm.descriptionLength && !record.showmore)
				text = record.highlightedSubmittalDescription.substr(0, vm.descriptionLength)+ "...";
			else
				text = record.highlightedSubmittalDescription;
		    return $sce.trustAsHtml(text);
		}

        $scope.highlightMetadata = function(text) {
        	return $sce.trustAsHtml(text);
        }

        function openFirstRecordAfterSearch() {
        	var record, key;
        	// fetching first record
        	if(vm.groupByField !== 'none') {
            	record = vm.sortByKeysSearchRecords[0][1][0];
                key = vm.sortByKeysSearchRecords[0][0]; 
        	} else {
        		record = vm.sortByKeysSearchRecords[0];
        		key = 'Doc';
            }
            if(vm.selectedKeyword == vm.specsLabel) {
            	highlightSubmittalInSpecs(record, vm.selectedKeyword, key , 0, true);
            } else {
            	highlightSubmittalInPlans(record, vm.selectedKeyword, key, 0, true);
            }
         }
        	
        function createSearchSessionRecord(type, record) {
        	var data = {};
        	data.type = type
        	data.record = record;
        	AuthenticationService.SetPypeSearchRecordData(data);
        }

        function highlightSubmittalInPlans(record, keyword, key, index, max) {
        	AuthenticationService.SetSearchTextForPlans(vm.pypeSearchText);
        	vm.selectedSearchRecord = keyword + key + "-" + index;
        	createSearchSessionRecord('planview', record);
        	if($scope.$parent.vm.smartviewType == 'planview') {
        		 $rootScope.$broadcast("HighlightPlansPdf");
        	} else {
        		 $scope.$parent.vm.smartviewType = 'planview';
        	}
        	/*if(!vm.user.isSuperAdmin || max == true)
        		return;*/

        	$rootScope.enablePypeSearch = "MAX";
        	$rootScope.$broadcast("EnablePypeSearch", $rootScope.enablePypeSearch);
        }

        function highlightSubmittalInSpecs(record, keyword, key, index, max) {
        	AuthenticationService.SetSearchTextForSpecs(vm.pypeSearchText);
        	vm.selectedSearchRecord = keyword + key + "-" + index;
        	createSearchSessionRecord('specview', record);
        	if($scope.$parent.vm.smartviewType == 'specview') {
        		$rootScope.$broadcast("HighlightSpecPdf");
        	} else {
        		 $scope.$parent.vm.smartviewType = 'specview';
        	}

        	/*if(!vm.user.isSuperAdmin || max == true)
        		return;*/
        	$rootScope.enablePypeSearch = "MAX";
        	$rootScope.$broadcast("EnablePypeSearch", $rootScope.enablePypeSearch);
        }

        $rootScope.$on('EnablePypeSearch', function (event, data) {
        	$rootScope.enablePypeSearch = data;
        });

        function addSearchToSmartRegister(record) {
			var modalInstance = $uibModal.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/smartview/pypesearch/search.addtoregister.view.html?version=Beta_1.9',
						controller : 'SearchAddToRegisterPopupController',
						backdrop : 'static',
						size : 'md',
						windowClass : '',
						resolve : {
							items: function () {
		                        return record
		                    },
		                    submittalGroups : function() {
		                    	return vm.SubmittalGroups
		                    },
		                    submittalTypes : function() {
		                    	return vm.SubmittalTypes
		                    }
						}
					});
                modalInstance.result.then(function(data) {
                addNonSubmittalRecordToSmartRegister(data, record);
			}, function() {
			});
		}
        
        
        function addNonSubmittalRecordToSmartRegister(data, record) {
        	var changes = [];
            changes.push({ action: "Added", newRecord: data.record });
            vm.dataLoading = "Adding Record to Smart Register ... Please wait";
            SmartRegisterService.SaveMultiple(vm.selectedProject.projectId, vm.selectedVersion.versionId, "SpecView",
                    [data.record], [], [], [], null, changes, function (response) {
                        if (response.success === true) {
                        	 updateNonSubmittalRecord(record);
                        	 FlashService.Success("Added successfully.");
                        	 vm.dataLoading = false;
                        } else {
                             FlashService.Error(response.message || "Unable to add submittal");
                            //LOGGING EVENT
                             vm.dataLoading = false;
                        }
             });
        }
        
        function updateNonSubmittalRecord(record) {
        	record.submittalMetaData.submittalData = true;
        }


        // NEED TO CREATE DIRECTIVE FOR FILTERS

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
                getSelectedValuesBasedOnFilter();
                updateColumnSelectedValuesFlags(false,  true);
            }
            else {
                initializeAllFilterRelatedValues();
            }
                setAllFilterRelatedTempValues(true);
            }


        function initializeAllFilterRelatedValues(){
        	for(var key in vm.columnsTotalVarData){
        		vm[key + "SelectedItems"] = [];
        		vm[vm.columnsTotalVarData[key].allVar] = [];
        	}
        }

        function setAllFilterRelatedTempValues(isSubmittals) {
        	for(var key in vm.columnsTotalVarData) {
        		vm[vm.columnsTotalVarData[key].searchVar] = "";
        		vm[key + "SelectedItemsTemp"] = angular.copy(vm[key + "SelectedItems"]);
        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = angular.copy(vm[vm.columnsTotalVarData[key].allVar]);
        		vm[vm.columnsTotalVarData[key].selectAllVar] = commonSelectAllChecked(key);
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

        function commonSelectAllChecked(key){
        	if (((vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == '') &&
        			vm[key + "SelectedItemsTemp"] && vm[vm.columnsTotalVarData[key].number] === vm[key + "SelectedItemsTemp"].length)
        		|| (vm[vm.columnsTotalVarData[key].searchVar] && vm[key + "SelectedItemsTemp"].length && vm[key + "SelectedItemsTemp"].length === vm.currentSearchResults.length)){
        		return true;
        	}
        	return false;
        }

        function updateColumnsSelectedValues(key, trueFlag, falseFlag, isSubmittals){
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
        function toggleAllDivisionFiltersSelection(forceSelectAll) {
        	var key = vm.columnsList.division;
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
        	updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItemsTemp"], true);
        	applyFiltersForAll();
        }

        function toggleAllSpecSectionFiltersSelection(forceSelectAll) {
        	var key = vm.columnsList.specSection;
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
        	updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItemsTemp"], true);
        	applyFiltersForAll();

        }

        function toggleAllCommonFiltersSelection(key, clearAll) {
        	if(vm[vm.columnsTotalVarData[key].selectAllVar] == true || clearAll){
        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = vm[vm.columnsTotalVarData[key].allVar].filter(function(item){
        			item.selected = false;
        			/*if (vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == ''
            			|| (item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)) {
        				item.selected = false;
        			}*/
                	return item;
                });
        		vm[vm.columnsTotalVarData[key].searchVar] = '';
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
        	updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItemsTemp"], true);
        	applyFiltersForAll();
         	//updateSearchData();
         //	vm[key + "SelectedItemsTemp"] = [];

         }

        $scope.commonSearchValueChanged = function(key){
        	vm[key + "SelectedItemsTemp"] = [];
        	var currentAllVar, item;
        	vm.currentSearchResults = [];

        	if(key === "divisionCode") {
        		currentAllVar = vm[vm.columnsTotalVarData[key].allVar];
        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = [];
        		for(var i=0;i<currentAllVar.length;i++) {
        			item = currentAllVar[i];
        			if(vm.searchDivisionCodes == undefined || vm.searchDivisionCodes == '') {
        				vm[key + "SelectedItemsTemp"] = [];
        				item.selected = false;
        				vm[vm.columnsTotalVarData[key].allVar + "Temp"].push(item);
        			}
        			else if ((item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
                    		|| (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)){
            			vm[key + "SelectedItemsTemp"].push(item.divisionCode);
            			vm.currentSearchResults.push(item.divisionCode);
            			item.selected = true;
            			vm[vm.columnsTotalVarData[key].allVar + "Temp"].push(item);
                    } else {
                    	item.selected = false;
                    }
        		}
        	} else if(key === "specSection"){
        		currentAllVar = vm[vm.columnsTotalVarData[key].allVar];
        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = [];
        		for(var i=0;i<currentAllVar.length;i++){
        			item = currentAllVar[i];
        			if(vm.searchSpecSections == undefined || vm.searchSpecSections == '') {
        				vm[key + "SelectedItemsTemp"] = [];
        				item.selected = false;
        				vm[vm.columnsTotalVarData[key].allVar + "Temp"].push(item);
        				
        			}
        			else if ( (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1)
	                		|| (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)){
	        			vm[key + "SelectedItemsTemp"].push(item.specSection);
	        			vm.currentSearchResults.push(item.specSection);
	        			item.selected = true;
	        			vm[vm.columnsTotalVarData[key].allVar + "Temp"].push(item);
                    } else {
                    	item.selected = false;
                    }
        		}
        	} else {
        		currentAllVar = vm[vm.columnsTotalVarData[key].allVar], item = "";
        		vm[vm.columnsTotalVarData[key].allVar + "Temp"] = [];
        		for(var i=0;i<currentAllVar.length;i++) {
        			item = currentAllVar[i];
        			if(vm[vm.columnsTotalVarData[key].searchVar] == undefined || vm[vm.columnsTotalVarData[key].searchVar] == '') {
        				vm[key + "SelectedItemsTemp"] = [];
        				item.selected = false;
        				vm[vm.columnsTotalVarData[key].allVar + "Temp"].push(item);
        			}
        			else if ((item[vm.columnsTotalVarData[key].mapValue] && item[vm.columnsTotalVarData[key].mapValue].toUpperCase().indexOf(vm[vm.columnsTotalVarData[key].searchVar].toUpperCase()) > -1)){
	        			vm[key + "SelectedItemsTemp"].push(item[vm.columnsTotalVarData[key].mapValue]);
	        			vm.currentSearchResults.push(item[vm.columnsTotalVarData[key].mapValue]);
	        			item.selected = true;
	        			vm[vm.columnsTotalVarData[key].allVar + "Temp"].push(item);
	        		} else {
	        			item.selected = false;
	        		}
        		}
        	}
        	
        //	vm[vm.columnsTotalVarData[key].allVar + "Temp"] = angular.copy(vm[key + "SelectedItemsTemp"]);
            vm[vm.columnsTotalVarData[key].selectAllVar] = commonSelectAllChecked(key);
        	updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItemsTemp"], true);
            applyFiltersForAll();

        }

        $scope.getAllFiltersSelected = function() {
		    for(var key in vm.columnsTotalVarData) {
				if (vm[key + "SelectedItemsTemp"] && vm[key + "SelectedItemsTemp"].length > 0 && vm[key + "SelectedItems"].length != vm[vm.columnsTotalVarData[key].allVar + "Temp"].length)
						return true;
				}

           return false;
        }



        function toggleClearAllFiltersSelection(notes) {
            for(var key in vm.columnsTotalVarData) {
            	  toggleAllCommonFiltersSelection(key, true);
        	 }
          }

        function updateSearchDataVariable(fieldName, caption, values, visibility) {
            var found = -1;
            if (values && values.length >= 0) {
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

            updateSearchDataVariable(key, vm.columnsTotalVarData[key].mapName, vm[key + "SelectedItemsTemp"], true);
        	applyFiltersForAll();
        	/*updateSearchData();*/
        }

        function getFilterRelatedValues(filterData) {
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

        function applyFiltersForAll() {
    	    var filteredData = [], remainingData = [], filteredSRRecords = [], filteredNonSRRecords = [];
            if(vm.filteredSearchRecords && vm.filteredSearchRecords.length > 0){
            	vm.filteredSearchRecords.filter(function(record) {
            		if(((record.divisionCode !== '' && $.inArray(record.divisionCode, vm.divisionCodeSelectedItemsTemp) !== -1)
        						|| (record.divisionCode === '' && vm.divisionCodeSelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.divisionCodeSelectedItemsTemp.length === 0 ) &&
	    				((record.specNumber !== '' && $.inArray(record.specNumber, vm.specSectionSelectedItemsTemp) !== -1)
	    						|| (record.specNumber === '' && vm.specSectionSelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.specSectionSelectedItemsTemp.length === 0) &&
	    						((record.specCategory && vm.specCategorySelectedItemsTemp.indexOf(record.specCategory) !== -1)
	    	    						|| (record.specCategory === "" && vm.specCategorySelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.specCategorySelectedItemsTemp.length === 0) 
	    				/* && (($.inArray(record.projectSummaryGroup && record.projectSummaryGroup.toUpperCase(), vm.projectSummaryGroupSelectedItemsTemp) !== -1)
	    						|| (record.projectSummaryGroup === "" && $.inArray(emptyValuesLabel, vm.projectSummaryGroupSelectedItemsTemp) !== -1) || vm.projectSummaryGroupSelectedItemsTemp.length === 0) &&
	    				((record.specCategory && vm.specCategorySelectedItemsTemp.indexOf(record.specCategory) !== -1)
	    						|| (record.specCategory === "" && vm.specCategorySelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.specCategorySelectedItemsTemp.length === 0) &&
	    	    		((record.drawingSheetNumber && vm.drawingSheetNumberSelectedItemsTemp.indexOf(record.drawingSheetNumber) !== -1)
	    	    				|| (record.drawingSheetNumber === "" && vm.drawingSheetNumberSelectedItemsTemp.indexOf(emptyValuesLabel) !== -1) || vm.drawingSheetNumberSelectedItemsTemp.length === 0)*/){
            				filteredData.push(record);
            				// condition to check submittal or not
            				
            			} else {
            				remainingData.push(record);
            			}
            		
            		
    				});
                }
            	vm.filteredData = angular.copy(filteredData);
            	groupSearchRecords(vm.groupByField, vm.filteredData);
          }



        function LoadSubmittalGroups() {
        	 SmartRegisterService.GetProjectSummaryGroups(vm.selectedProject.projectId, vm.selectedVersion.versionId,
                     function (response) {
                         if (response.success === true) {
                         	vm.SubmittalGroups = response.data;
                         } else {
                        	 vm.SubmittalGroups = [];
                         }
             });
         }
        
        function LoadSubmittalTypes() {
        	SmartRegisterService.GetAllSubmittalTypes(vm.selectedProject.projectId, vm.selectedVersion.versionId,
                    function (response) {
                        if (response.success === true) {
                        	vm.SubmittalTypes = response.data;
                        } else {
                        	vm.SubmittalTypes = [];
                        }
            });
        }
        
        function groupSubmittalsByField(type) {
        	if(vm.selectedKeyword == vm.specsLabel)
        		AuthenticationService.SetSpecsGroupByField(type);
        	else
        		AuthenticationService.SetPlansGroupByField(type);
        	vm.groupByField = type;
        	$scope.isCollapsed = true;
        	if(vm.searchHits > vm.recordsSize) {
        		return;
        	}
        	groupSearchRecords(vm.groupByField, vm.filteredData, true);

        }

        function closePypeSearch() {
        	AuthenticationService.SetSearchTextForSpecs(null);
        	AuthenticationService.SetPypeSearchRecordData({});
        	$rootScope.enablePypeSearch = false;
        	$rootScope.toggleClass = true;
        	$rootScope.$broadcast("EnablePypeSearch", $rootScope.enablePypeSearch);
        }
        
        
    }
})();
