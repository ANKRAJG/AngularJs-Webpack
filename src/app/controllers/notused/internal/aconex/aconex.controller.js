(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('AconexController', AconexController);

    AconexController.$inject = ['$linq', 'AuthenticationService', 'FlashService', 'MAINURL', '$uibModal', '$scope', 'SmartRegisterService','AconexIntegrationService', '$window', '$timeout', 'ModalService'];
    function AconexController($linq, AuthenticationService, FlashService, MAINURL, $uibModal, $scope, SmartRegisterService, AconexIntegrationService, $window, $timeout, ModalService) {
        var vm = this;

        vm.selectColumn = true;
		vm.showToolbar = true;
		vm.RemoveFilterItem = RemoveFilterItem;
		vm.gridName = "aconexSubmittalGrid";
		vm.LoadCompanies = LoadCompanies;
		vm.LoadUser = LoadUser;
		vm.LoadProjects = LoadProjects;
		vm.LoadSubmittals = LoadSubmittals;
		vm.ConvertRecords = ConvertRecords;
		vm.ExportRecords = ExportRecords;
		vm.checkInAconex = checkInAconex;
		vm.isAconexIntegration = true;
		vm.goToStep1 = goToStep1;
		vm.NavigateToSmartRegister = NavigateToSmartRegister;

        (function initController() {
            LoadUserDetails();
            GetCompanyName();
            LoadProjects();
            vm.loaded = 0;
            init();
        })();

        function init(){
			vm.userDetails = JSON.parse($window.localStorage.getItem("userDetailsObject"));
			vm.filteredItems = JSON.parse($window.localStorage.getItem("filteredItems"));
			if (vm.userDetails !== null && vm.userDetails !== undefined) {
				vm.pypeUserID = vm.userDetails.pypeUserId;
				vm.pypeProjectID = vm.userDetails.pypeProjectId;
				vm.pypeCompanyID = vm.userDetails.pypeCompanyId;
				vm.pypeProjectVersionID = vm.userDetails.pypeVersionId;
				getUserDetails();
				PrepareSmartRegisterColumns();
				$scope.myForm = {};
				$scope.myForm.$invalid = false;
				initializeQuickFilterVaraiables();
				GetCompanyName();
			} else {
				problemOccuredPleaseRestartBrowser();
			}
        }

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

        function LoadProjects(callback) {
            vm.dataLoading = "Loading user projects...";
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
                vm.dataLoading = false;
            }
            else {
                vm.NoProjects = false;
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
            for (var i = 0; i < list.length; i++) {
                if (list[i][property] === val) {
                    return true;
                }
            }
            return false;
        }

        function initializeQuickFilterVaraiables(){
        	// Quick filter related variables
            $scope.myForm = {};
            $scope.myForm.$invalid = false;
    		$scope.divisionCodeForm = {};
    		$scope.divisionCodeForm.$invalid = false;
    		$scope.specSectionsForm = {};
    		$scope.specSectionsForm.$invalid = false;

    		$scope.filterSectionsRange = 10;
    		$scope.sectionsStart = 0;
    		$scope.sectionsLimit = $scope.filterSectionsRange;

    		$scope.filterDivisionsRange = 10;
    		$scope.divisionsStart = 0;
    		$scope.divisionsLimit = $scope.filterDivisionsRange;
        }

        /* Custom filter for spec section */
        $scope.specSectionFilter = function(item){
        	if(vm.searchSpecSections == undefined || vm.searchSpecSections == '' || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1)
        		|| (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1))
        		return true;
        	return false;
        }

        /* Custom filter for division code */
        $scope.divisionCodeFilter = function(item){
        	if(vm.searchDivisionCodes == undefined || vm.searchDivisionCodes == '' || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
        		|| (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1))
        		return true;
        	return false;
        }

				/* Custom filter for Submittal Type */
        $scope.submittalTypeFilter = function(item){
        	if(vm.searchSubmittalTypes == undefined || vm.searchSubmittalTypes == '' || (item.value && item.value.toUpperCase().indexOf(vm.searchSubmittalTypes.toUpperCase()) > -1)
        		|| (item.value && item.value.indexOf(vm.searchSubmittalTypes) > -1))
        		return true;
        	return false;
        }

				/* Custom filter for Submittal Type Group */
        $scope.submittalTypeGroupFilter = function(item){
        	if(vm.searchSubmittalTypeGroups == undefined || vm.searchSubmittalTypeGroups == '' || (item.value && item.value.toUpperCase().indexOf(vm.searchSubmittalTypeGroups.toUpperCase()) > -1)
        		|| (item.value && item.value.indexOf(vm.searchSubmittalTypeGroups) > -1))
        		return true;
        	return false;
        }

				/* Custom filter for Submittal Group */
        $scope.submittalGroupFilter = function(item){
        	if(vm.searchSubmittalGroups == undefined || vm.searchSubmittalGroups == '' || (item.value && item.value.toUpperCase().indexOf(vm.searchSubmittalGroups.toUpperCase()) > -1)
        		|| (item.value && item.value.indexOf(vm.searchSubmittalGroups) > -1))
        		return true;
        	return false;
        }

				/* Custom filter for Subcontractor Group */
        $scope.subcontractorFilter = function(item){
        	if(vm.searchSubcontractor == undefined || vm.searchSubcontractor == '' || (item.value && item.value.toUpperCase().indexOf(vm.searchSubcontractor.toUpperCase()) > -1)
        		|| (item.value && item.value.indexOf(vm.searchSubcontractor) > -1))
        		return true;
        	return false;
        }

        function reduceFilterSections(sectionsLimit, maxSections, range){
        	if(sectionsLimit <= maxSections && sectionsLimit > 0){
        		if(sectionsLimit == maxSections && maxSections%range != 0){
        			sectionsLimit = sectionsLimit - (maxSections%range);
        		} else {
        			sectionsLimit = sectionsLimit - range;
        		}
        	}
        	return sectionsLimit;
        }

        function increaseFilterSections(sectionsLimit, maxSections, range){
        	if(sectionsLimit < maxSections){
        		if(maxSections - sectionsLimit >= range){
        			sectionsLimit = sectionsLimit + range;
        		} else {
        			sectionsLimit = sectionsLimit + (maxSections - sectionsLimit);
        		}
        	}
        	return sectionsLimit;
        }

        // Filters related code ends here

	function problemOccuredPleaseRestartBrowser(){

			var items = {
					title : "Ooops!!",
					message : "Something went wrong. Please restart your browser.",
				};
			showWarningMessagePopup(items);
		}



		function getUserDetails() {
			vm.dataLoading = 'Loading User details';
			AconexIntegrationService.GetUserDetails(vm.pypeUserID,vm.pypeProjectID,vm.pypeProjectVersionID,vm.pypeCompanyID,vm.code,
					function(response) {

				if (response.success) {
					vm.pypeUserName =  response.data.pypeUserName;
					vm.pypeProjectName =  response.data.pypeProjectName;
					vm.pypeCompanyName =   response.data.pypeCompanyName;
					vm.pypeProjectVersionName =   response.data.pypeProjectVersionName;
					LoadSubmittalStatus();
					GetSmartRegister();
					PreparingRecordsData();
					$scope.isAconexIntegration = true;
					vm.isAconexIntegration = true;
				} else {
					response.message="Fail to connect to Aconex Page";
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}
			});
		}


		$scope.submittalTypeFilterPopover = {
				isOpen: false,
				templateUrl: 'confirmPopoverTemplate.html',
				open: function open() {
						$scope.submittalTypeFilterPopover.isOpen = true;
				},
				selectAll: function selectAll() {
						angular.forEach(vm.specCategories, function (item, index) {
								item.selected = true;
						});
				},
				unSelectAll: function unSelectAll() {
						angular.forEach(vm.specCategories, function (item, index) {
								item.selected = false;
						});
				},
				close: function close() {
					vm.dataLoading = "Applying Filters... Please wait..";
					$scope.myForm.$invalid = true;
					setTimeout(ApplyFilters,10);
					$scope.myForm.$invalid = false;
					$scope.submittalTypeFilterPopover.isOpen = false;
				}
		};

		$scope.submittalTypeGroupFilterPopover = {
				isOpen: false,
				templateUrl: 'confirmPopoverTemplate.html',
				open: function open() {
						$scope.submittalTypeGroupFilterPopover.isOpen = true;
				},
				selectAll: function selectAll() {
						angular.forEach(vm.specCategoryGroups, function (item, index) {
								item.selected = true;
						});
				},
				unSelectAll: function unSelectAll() {
						angular.forEach(vm.specCategoryGroups, function (item, index) {
								item.selected = false;
						});
				},
				close: function close() {
					vm.dataLoading = "Applying Filters... Please wait..";
					$scope.myForm.$invalid = true;
					setTimeout(ApplyFilters,10);
					$scope.myForm.$invalid = false;
					$scope.submittalTypeGroupFilterPopover.isOpen = false;
				}
		};

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
					vm.dataLoading = "Applying Filters... Please wait..";
        	$scope.myForm.$invalid = true;
          setTimeout(ApplyFilters,10);
          $scope.myForm.$invalid = false;
        	$scope.projectGroupFilterPopover.isOpen = false;
        }
	  };

		$scope.subContractorFilterPopover = {
				isOpen: false,
				templateUrl: 'confirmPopoverTemplate.html',
				open: function open() {
						$scope.subContractorFilterPopover.isOpen = true;
				},
				selectAll: function selectAll() {
						angular.forEach(vm.subcontractors, function (item, index) {
								item.selected = true;
						});
				},
				unSelectAll: function unSelectAll() {
						angular.forEach(vm.subcontractors, function (item, index) {
								item.selected = false;
						});
				},
				close: function close() {
					vm.dataLoading = "Applying Filters... Please wait..";
					$scope.myForm.$invalid = true;
					setTimeout(ApplyFilters,10);
					$scope.myForm.$invalid = false;
					$scope.subContractorFilterPopover.isOpen = false;
				}
		};

		$scope.exportStatusPopover = {
				isOpen: false,

				templateUrl: 'confirmPopoverTemplate.html',

				open: function open() {
						$scope.exportStatusPopover.isOpen = true;
						$scope.exportStatusPopover.data = 'Hello!';
				},
				close: function close() {
					vm.dataLoading = "Applying Filters...";
					$scope.myForm.$invalid = true;
					setTimeout(ApplyFilters,10);
					$scope.myForm.$invalid = false;
					$scope.exportStatusPopover.isOpen = false;
				}
		}


		 function ApplyFilters() {
				vm.dataLoading = "Applying necessary filters..."
			 	vm.divisionCodeSelectedItems = [];
				vm.specSectionSelectedItems = [];
				vm.specCategorySelectedItems = [];
				vm.specCategoryGroupSelectedItems = [];
			  vm.projectSummaryGroupSelectedItems = [];
				vm.subContractorSelectedItems = [];
				vm.exportStatusSelectedItems = [];
				angular.forEach(vm.allDivisions, function(item, index) {
					if (item.selected == true)
						vm.divisionCodeSelectedItems.push(item.divisionCode);
				});
				angular.forEach(vm.allSpecSections, function(item, index) {
					if (item.selected == true)
						vm.specSectionSelectedItems.push(item.specSection);
				});
				angular.forEach(vm.specCategories, function(item, index) {
					if (item.selected == true)
						vm.specCategorySelectedItems.push(item.value);
				});
				angular.forEach(vm.specCategoryGroups, function(item, index) {
					if (item.selected == true)
						vm.specCategoryGroupSelectedItems.push(item.value);
				});
				angular.forEach(vm.projectSummaryGroups, function(item, index) {
					if (item.selected == true)
						vm.projectSummaryGroupSelectedItems.push(item.value);
				});
				angular.forEach(vm.subcontractors, function(item, index) {
					if (item.selected == true)
						vm.subContractorSelectedItems.push(item.value);
				});
				angular.forEach(vm.exportStatuses, function(item, index) {
					if (item.selected == true)
						vm.exportStatusSelectedItems.push(item.value);
				});

				vm.filterSmartRegisteredData = vm.submittalregisters.filter(function(record) {
					var forProjectAlreadyUploaded = false;
					if(vm.projectSelected) {
						for(var key in record.aconexExportedData){
							if(key === vm.projectSelected.toString() ) {
								forProjectAlreadyUploaded = true;
							}
						}
					}
					if(vm.exportStatusSelectedItems.length%2 == 0) {
						if(vm.exportStatusSelectedItems.length == 2) {
							return (record.divisionCode === '' || $.inArray(record.divisionCode, vm.divisionCodeSelectedItems) != -1) &&
							(record.specNumber === '' || $.inArray(record.specNumber, vm.specSectionSelectedItems) != -1) &&
							(record.specCategory === '' || $.inArray(record.specCategory.toLowerCase(), vm.specCategorySelectedItems) != -1) &&
							(record.specCategoryGroup === '' || $.inArray(record.specCategoryGroup.toLowerCase(), vm.specCategoryGroupSelectedItems) != -1) &&
							(record.projectSummaryGroup === '' || $.inArray(record.projectSummaryGroup, vm.projectSummaryGroupSelectedItems) != -1) &&
							((vm.numberOfSubContractors === vm.subContractorSelectedItems.length) || $.inArray(record.subContractor.toLowerCase(), vm.subContractorSelectedItems) != -1);
						}
						return false;
					}
					else {
						return (record.divisionCode === '' || $.inArray(record.divisionCode, vm.divisionCodeSelectedItems) != -1) &&
						(record.specNumber === '' || $.inArray(record.specNumber, vm.specSectionSelectedItems) != -1) &&
						(record.specCategory === '' || $.inArray(record.specCategory.toLowerCase(), vm.specCategorySelectedItems) != -1) &&
						(record.specCategoryGroup === '' || $.inArray(record.specCategoryGroup.toLowerCase(), vm.specCategoryGroupSelectedItems) != -1) &&
						(record.projectSummaryGroup === '' || $.inArray(record.projectSummaryGroup, vm.projectSummaryGroupSelectedItems) != -1) &&
						((vm.numberOfSubContractors === vm.subContractorSelectedItems.length) || $.inArray(record.subContractor.toLowerCase(), vm.subContractorSelectedItems) != -1) &&
						(vm.exportStatusSelectedItems[0] == 'Previously Exported' ? (forProjectAlreadyUploaded && record.uploadedToAconex) :
						( !(forProjectAlreadyUploaded && record.uploadedToAconex) || !record.uploadedToAconex ));
					}
				});

				$scope.myForm.$invalid = false;
				$scope.projectGroupFilterPopover.isOpen = false;
				vm.dataLoading = false;
				console.log("filters end"+new Date().toISOString());
				$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
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

		 $scope.divisionCodeFilterPopover = {
		            isOpen: false,
		            templateUrl: 'confirmPopoverTemplate.html',
		            open: function open() {
		                $scope.divisionCodeFilterPopover.isOpen = true;
		            },
		            selectAll: function selectAll() {
		            	// Selecting only the result of search records
		                angular.forEach(vm.allDivisions, function (item, index) {
		                	if(!vm.searchDivisionCodes || (item.divisionName && item.divisionName.indexOf(vm.searchDivisionCodes.toUpperCase()) > -1) ||
		                			(item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)){
		                		item.selected = true;
		                	}
		                });
		            },
		            unSelectAll: function unSelectAll() {
		            	// Unselecting only the result of search records
		                angular.forEach(vm.allDivisions, function (item, index) {
		                	if(!vm.searchDivisionCodes || (item.divisionName && item.divisionName.indexOf(vm.searchDivisionCodes.toUpperCase()) > -1) ||
		                			(item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)){
		                		item.selected = false;
		                	}
		                });
		            },
		            close: function close() {
										vm.dataLoading = "Applying Filters... Please wait..";
			            	$scope.divisionCodeForm.$invalid = true;
			            	vm.applyingDivsionFilters = true;
			            	$scope.divisionsLimit = $scope.filterDivisionsRange; // Resetting
																					// the
																					// filter
																					// divisions
																					// range
																					// to
																					// default
			            	// intentional delay of 10 milli seconds to make
							// sure loader will appear
										setTimeout(ApplyFilters,10);
										$scope.divisionCodeFilterPopover.isOpen = false;
		            }
		        };

			$scope.specSectionFilterPopover = {
		            isOpen: false,
		            templateUrl: 'confirmPopoverTemplate.html',
		            open: function open() {
		                $scope.specSectionFilterPopover.isOpen = true;
		            },
		            selectAll: function selectAll() {
		            	// Selecting only the result of search records
		            	angular.forEach(vm.allSpecSections, function (item, index) {
		                	if(!vm.searchSpecSections || (item.specName && item.specName.indexOf(vm.searchSpecSections.toUpperCase()) > -1) ||
		                				(item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)){
		                		item.selected = true;
		                	}
		                });
		            },
		            unSelectAll: function unSelectAll() {
		            	// Unselecting only the result of search records
		                angular.forEach(vm.allSpecSections, function (item, index) {
		                    if(!vm.searchSpecSections || (item.specName && item.specName.indexOf(vm.searchSpecSections.toUpperCase()) > -1) ||
		                    		(item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)){
		                    	item.selected = false;
		                    }
		                });
		            },
		            close: function close() {
										vm.dataLoading = "Applying Filters... Please wait..";
			            	$scope.specSectionsForm.$invalid = true;
			            	vm.applyingSpecSectionFilters = true;
			            	$scope.sectionsLimit = $scope.filterSectionsRange; // Resetting
																				// the
																				// filter
																				// sections
																				// range
																				// to
																				// default
			            	// intentional delay of 10 milli seconds to make
							// sure loader will appear
										setTimeout(ApplyFilters,10);
										$scope.specSectionFilterPopover.isOpen = false;
		            }
		        };

			$scope.dismissPopOver = function(event){
				if (!event || event.target.className.indexOf("submittalGroupsPopOver") <= -1) {
	               $scope.projectGroupFilterPopover.isOpen = false;
	               // addOrCreateFilter('projectSummaryGroup',
					// vm.projectSummaryGroupSelectedItems);
	               for (var index = 0; index < vm.projectSummaryGroups.length; index++) {
	            	   if (vm.projectSummaryGroupSelectedItems.indexOf(vm.projectSummaryGroups[index].value) !== -1) {
	            		   vm.projectSummaryGroups[index].selected = true;
	            	   } else{
	            		   vm.projectSummaryGroups[index].selected = false;
	            	   }
	               }
		        }
						if (!event || event.target.className.indexOf("submittalTypesPopOver") <= -1) {
               $scope.submittalTypeFilterPopover.isOpen = false;
               for (var index = 0; index < vm.specCategories.length; index++) {
            	   if (vm.specCategorySelectedItems.indexOf(vm.specCategories[index].value) !== -1) {
            		   vm.specCategories[index].selected = true;
            	   } else{
            		   vm.specCategories[index].selected = false;
            	   }
               }
				    }
						if (!event || event.target.className.indexOf("submittalTypeGroupsPopOver") <= -1) {
               $scope.submittalTypeGroupFilterPopover.isOpen = false;
               for (var index = 0; index < vm.specCategoryGroups.length; index++) {
            	   if (vm.specCategoryGroupSelectedItems.indexOf(vm.specCategoryGroups[index].value) !== -1) {
            		   vm.specCategoryGroups[index].selected = true;
            	   } else{
            		   vm.specCategoryGroups[index].selected = false;
            	   }
               }
				    }
						if (!event || event.target.className.indexOf("subcontractorPopOver") <= -1) {
               $scope.subContractorFilterPopover.isOpen = false;
               for (var index = 0; index < vm.subcontractors.length; index++) {
            	   if (vm.subContractorSelectedItems.indexOf(vm.subcontractors[index].value) !== -1) {
            		   vm.subcontractors[index].selected = true;
            	   } else{
            		   vm.subcontractors[index].selected = false;
            	   }
               }
				    }
	        	if (!event || event.target.className.indexOf("divisionsPopOver") <= -1) {
		           $scope.divisionCodeFilterPopover.isOpen = false;
		           vm.searchDivisionCodes = '';
		           // addOrCreateFilter('divisionCode',
					// vm.divisionCodeSelectedItems);
		           $scope.divisionsLimit = $scope.filterDivisionsRange; // Resetting
																		// the
																		// filter
																		// divisions
																		// range
																		// to
																		// default
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
		           $scope.sectionsLimit = $scope.filterSectionsRange; // Resetting
																		// the
																		// filter
																		// sections
																		// range
																		// to
																		// default
			       for (var index = 0; index < vm.allSpecSections.length; index++) {
						if (vm.specSectionSelectedItems.indexOf(vm.allSpecSections[index].specSection) !== -1) {
							vm.allSpecSections[index].selected = true;
						} else{
							vm.allSpecSections[index].selected = false;
						}
					}
		       }
				 if (!event || event.target.className.indexOf("exportStatusesPopover") <= -1) {
		           $scope.exportStatusPopover.isOpen = false;
						 for (var index = 0; index < vm.exportStatuses.length; index++) {
							 if (vm.exportStatusSelectedItems.indexOf(vm.exportStatuses[index].value) !== -1) {
								 vm.exportStatuses[index].selected = true;
							 } else{
								 vm.exportStatuses[index].selected = false;
							 }
						 }
		      }
			}

//		function mapField(field){
//			switch(field){
//			case 'ContractorDocumentNumber': return 'specNumber';
//			default: return field;
//			}
//		}

		function PrepareTransformedGridData(rowData, columnsSchema){
			var configColumns = angular.copy(vm.aconexGridColumns);
			vm.columnsData = [];
			columnsSchema.forEach(function(column){
				if(column.field in configColumns){
					var matchedItem = configColumns[column.field];
				vm.columnsData.push({
					field : matchedItem.field,
					caption : column.modifiedFieldName === null?column.caption:column.modifiedFieldName,
					tooltip : column.caption,
					//sortable is coming as string from services, should be converted to boolean before assigning.
					sortable : matchedItem.sortable === "true",
					size : matchedItem.size,
					hidden:matchedItem.hidden,
					//resizable is coming as string from services, should be converted to boolean before assigning.
					resizable : matchedItem.resize === "true",
					editable : false,
					order: matchedItem.order
				});
				if(column.multiValues){
					// The row contains id. Get the actual value from multivalues and set in the row.
					rowData.forEach(function(row){
						var multiValues = column.multiValues[row[column.field]];
						if(typeof multiValues !== "undefined" ){
							row[column.field] = multiValues ;
						}
					});
				}
				}
			});
			vm.recordsData = rowData;
			//add exported status column only for the exported summary screen.
			if($scope.aconexRegisterFlag === true){
				vm.columnsData.push({
					field:"isExported",
					caption:"Export Status",
					sortable:true,
					hidden:false,
					resizable:true,
					size: "60px",
					order: 0,
					render: function(record){
						if(record.isExported) {
							return "<div class='text-center'><i class='fa fa-check-circle lblgreen  fontWeightXLarge'  title='Document creation is successful'></i></div>";
						}
						else{
							return "<div class='text-center'><i class='fa fa-times-circle lblOrange fontWeightXLarge '  title='Document creation failed'></i></div>";
						}
					}

				});
			}
			vm.columnsData.sort(function(a, b) {
			    return parseInt(a.order) - parseInt(b.order);
			});
			$timeout(function(){
				$scope.reinitializeGrid(false, false, vm.searchData, vm.recordsData.length);
				$scope.gridReload(vm.recordsData, vm.columnsData);
				$scope.selectNone();
			},100);
		}

		function PrepareAconexRegisterColumns(callback) {
			AconexIntegrationService.getSubmittalColumns(vm.projectSelected, function(response) {
				if (response.success) {
					var columnsData = response.data.submittalSchemaFields;
//					PrepareColumns(columnsData);
					callback();
				} else {
					response.message="Fail to connect to Aconex Page";
					FlashService.Error(response.message);
				}
			});

		}
		$scope.setGridEvents = function(event, getselection, getSelectedRecords, selectAll, selectNone, reinitializeGrid ) {

			$scope.gridReload = event;
			$scope.selectedRecords = getselection;
			$scope.getSelectedRecords = getSelectedRecords;
			$scope.selectNone = selectNone;
			$scope.reinitializeGrid = reinitializeGrid;
			$scope.selectAllRecords = selectAll;
		};
		function PreparingRecordsData()
		{
		}

		function getUrlParams(search) {
			/*
			 * let hashes = search.slice(search.indexOf('?') + 1).split('&') let
			 * params = {} hashes.map(hash => { let [key, val] = hash.split('=')
			 * params[key] = decodeURIComponent(val) })
			 */

			var hashes = search.slice(search.indexOf('?') + 1).split('&')
			var params = [],temp = [];
			for(var i=0;i<hashes.length;i++){
				temp = hashes[i].split('=');
				if(temp.length === 2)
					params[temp[0]] = temp[1];
				else
					console.log('Unable to find the key value pair for the hash' + temp);
			}

			return params;
		}


		function GetCompanyName() {
			vm.companyName = AuthenticationService.GetCompanyName();
		}

		function GetUser() {
			vm.user = AuthenticationService.GetUserInfo();
		}

		function getSelectedProject(){
			vm.selectedProject = AuthenticationService.GetProject();
		}

		function getSelectedVersion(){
			vm.selectedVersion = AuthenticationService.GetVersion();
		}

		$scope.loadOfRecords = function(){
			$scope.listOfRecords = [];
			return $scope.listOfRecords;
		};

		function PrepareSmartRegisterColumns() {
			//
			vm.searchData =
				[
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


			vm.columnsData  =
				[
					{
						field : 'uploadedToAconex',
						caption : 'Already Exported?',
						sortable : true,
						size : '70px',
						resizable : true,
						editable : false,
						render: function (record) {

							var projectNum = undefined;

							if(vm.projectSelected != undefined){
								projectNum = vm.projectSelected.toString();
							}

							if(projectNum === undefined) {
								return "";
							}

							if(record.uploadedToAconex){

								var log = [];
								var forProjectAlreadyUploaded = false;
								for(var key in record.aconexExportedData){
									if(key === projectNum ) {
										forProjectAlreadyUploaded = true;
									}
								}

								if(forProjectAlreadyUploaded) {
									return "<div class='text-center'><i class='fa fa-check-circle lblgreen  fontWeightXLarge'  title='Submittal already exported to project in Aconex, Re-exporting will update the existing submittal in Aconex'></i></div>";
								}
								else{
									return "<div class='text-center'><i class='fa fa-times-circle lblOrange fontWeightXLarge '  title='New Submittal will be created'></i></div>";
								}
							}
							else{
								return "<div class='text-center'><i class='fa fa-times-circle lblOrange  fontWeightXLarge '  title='New Submittal will be created'></i></div>";
							}
						}
					},
          { field: 'source', caption: 'Source Version', tooltip: 'Source Version', sortable: true, size: '55px', hidden: true, resizable: true, editable: false },
					{ field: 'serialNumber', caption: 'Sl. No.', sortable: true, size: '55px', resizable: true, editable: false, tooltip: 'Submittal Number' },
					{ field: 'divisionCode', caption: 'Division', hidden: true, sortable: true, size: '70px', resizable: true, tooltip: 'Division', editable: false },
					{ field: 'specNumber', caption: 'Spec Section', sortable: true, size: '80px',
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
						{ field: 'specName', caption: 'Spec name', sortable: true, size: '260px', resizable: true, tooltip: 'Spec name', editable: false },
						{ field: 'paraCode', caption: 'Spec sub section', tooltip: 'Paragraph', sortable: true, size: '65px', resizable: true, editable: false },
						{ field: 'submittalsHeading', caption: 'Sub section heading', sortable: true, size: '200px', hidden: false, tooltip: 'Sub section heading', resizable: true, editable: false},
						{ field: 'specCategory', caption: 'Submittal type', sortable: true, size: '160px', resizable: true, tooltip: 'Submittal type', editable: false },
						{ field: 'submittalDescription', caption: 'Submittal description', sortable: true, size: '340px', resizable: true, tooltip: 'Submittal description', editable: false },
						{ field: 'targetDate', caption: 'Target date', sortable: true, size: '80px', resizable: true, tooltip: 'Target date', editable: false },
						{ field: 'userNotes', caption: 'User notes', sortable: true, size: '80px', resizable: true,hidden: true, tooltip: 'User notes', editable: false },
						{ field: 'subContractor', caption: 'Subcontractor', sortable: true, size: '80px', resizable: true, tooltip: 'Subcontractor', editable: false, hidden: true },
						{ field: 'specCategoryGroup', caption: 'Submittal type group', hidden: true, sortable: true, size: '80px', tooltip: 'Spec category group', resizable: true, editable: false},
						{ field: 'projectSummaryGroup', caption: 'Submittals group', hidden: true, sortable: true, size: '80px', tooltip: 'Submittals group', resizable: true, editable: false },
						{ field: 'dateIssued', caption: 'Date issued', hidden: false, sortable: true, size: '80px', tooltip: 'Date issued', resizable: true, editable: false }
						];
            SmartRegisterService.initSmartColumns(vm.smartColumns, vm.columnsData, true, true);
		}
		function checkInAconex(){
			window.open("https://us1.aconex.com","_blank")
		}
		function PrepareAconexResponseColumns() {}
		function checkTimeOutAndShowConfirmDownload(msg){

			var items = {
					title : "Error",
					message : msg ? msg : "Timeout Occured please restart the process",
				};
			showWarningMessagePopup(items);
		}

		function checkWrongInputAndShowWarning(optionName){

			var items = {
					title : "Warning",
					message : "Please select appropiate " + optionName,
				};
			ModalService.showAlertMessage(items);
		}

		function showWarningMessagePopup(items) {
            ModalService.showAlertMessage(items)
            .result.then(function (data) {
				window.close();
			});
		}

		function LoadUser() {
			AconexIntegrationService.GetUser(vm.pypeUserID,
					function(response) {
				if (response.success) {
					var userData = response.data;
					$scope.aconexUserName = userData.email;
					vm.aconexUserName =  userData.email ;
					vm.dataLoading = false;


				} else {
					response.message="Fail to connect to Aconex Page";
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}
			});
		}

		function goToStep1() {
			$scope.aconexRegisterFlag = false;
			$scope.smartRegisterFlag = true;
			GetSmartRegister();
		}

		function LoadCompanies(dialog, callback) {
			// showUpdateWaitMessage(dialog, 'Getting Aconex Companies...');
			vm.dataLoading = 'Getting Aconex Companies...';
			AconexIntegrationService.GetCompanies(vm.pypeUserID,
					function(response) {
				if (response.success) {
					$scope.listOfCompanies = response.data;
					$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
				} else {
					response.message="Fail to connect to Aconex Page";
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}
				if (callback) {
					callback($scope.listOfCompanies, dialog);
				}
			});
		}

		function AconexLoadProjects(dialog, callback) {
			if(vm.selectedCompany !== null && vm.selectedCompany !== ''){
				// showUpdateWaitMessage(dialog, 'Getting Aconex Projects...');
				vm.dataLoading = 'Getting Aconex Projects...';
				AconexIntegrationService.GetProjects(vm.pypeUserID, vm.selectedCompany,
						function(response) {
					if (response.success) {
						$scope.listOfProjects = response.data;
						$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
						vm.dataLoading = false;

					} else {
						checkWrongInputAndShowWarning();
						FlashService.Error(response.message);
						vm.dataLoading = false;
					}
					if (callback) {
						callback(dialog, $scope.listOfProjects);
					}
				});
			}
			else {
				vm.dataLoading = false;
			}
		}


		function LoadSubmittalStatus() {
			vm.listOfSubmittalStatus = [ {
				"id" : 1,
				"name" : "Open"
			}, {
				"id" : 2,
				"name" : "Closed"
			}, {
				"id" : 2141,
				"name" : "Draft"
			} ];
			$scope.listOfSubmittalStatus = vm.listOfSubmittalStatus;
			vm.selectedStatusName = "Draft";
			vm.selectedSubmittalStatusId = 2141;
		}

		function LoadSubmittals() {
				if(vm.projectSelected !== null && vm.projectSelected !== ''){
								var searchDataTemp = angular.copy(vm.searchData);
								vm.searchData = angular.copy(searchDataTemp);

								setTimeout(ApplyFilters,10);
								//$scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
								vm.dataLoading = false;
				} else {
					vm.dataLoading = false;
				}
		}
		 function NavigateToSmartRegister () {
	        	//Go back to previous page
	        	$window.history.back();

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

		vm.exportStatuses = [
				{ value: 'Not Exported', selected: true },
				{ value: 'Previously Exported', selected: false }
		]
		vm.exportStatusSelectedItems = ['Not Exported'];
		function GetSmartRegister() {
			vm.dataLoading = 'Loading Smart register data...';
			AconexIntegrationService.GetSmartRegister(vm.pypeUserID,vm.pypeProjectID,vm.pypeProjectVersionID,vm.code,
					function(response) {
                  if (response.success) {
					vm.MaxId = 0;
					vm.submittalregisters = response.data.smartRegisterRecords;
					vm.recordsData = vm.submittalregisters;
					SmartRegisterService.prepareAndSetSmartColumns(vm, vm.submittalregisters, response.data.smartColumnsContainer);
					PrepareSmartRegisterColumns();

					// Project Summary Groups Initializations
					var uniqueProjectSummaryGroup = getDistinctValuesByProperty(vm.submittalregisters, "projectSummaryGroup", true);
					uniqueProjectSummaryGroup.sort();
		      var ProjectRequirements = ["DIVISION 01 REQUIREMENTS", "PERFORMANCE REQUIREMENTS", "FIELD QUALITY CONTROL", "QUALITY ASSURANCE", "TESTS AND INSPECTIONS"];
					vm.projectSummaryGroups = [];
	        vm.numberOfSummaryGroups = angular.copy(uniqueProjectSummaryGroup.length);
	        angular.forEach(uniqueProjectSummaryGroup, function (item, index) {
	            var record = { id: index, value: item, selected: true };
							if(vm.filteredItems && vm.filteredItems.projectSummaryGroupSelectedItems.length>0 && vm.filteredItems.projectSummaryGroupSelectedItems.indexOf(item) === -1) {
								record.selected = false;
							}

	            if ($.inArray(item, ProjectRequirements) != -1) {
	                record.group = "PR"
	            } else {
	                record.group = "SR"
	            }
	            vm.projectSummaryGroups.push(record);
	        });

					// Spec Category Initialization
					var uniqueSpecCategory = getDistinctValuesByProperty(vm.submittalregisters, "specCategory", true);
					uniqueSpecCategory = convertAllValuesToLowerCase(uniqueSpecCategory);
					uniqueSpecCategory.sort();
					vm.numberOfSpecCategories = angular.copy(uniqueSpecCategory.length);
					vm.specCategories = [];
	        angular.forEach(uniqueSpecCategory, function (item, index) {
	            var record = { id: index, value: item, selected: true };
							if(vm.filteredItems && vm.filteredItems.specCategorySelectedItems.length>0 && vm.filteredItems.specCategorySelectedItems.indexOf(item) === -1) {
								record.selected = false;
							}
	            vm.specCategories.push(record);
	        });

					// Spec Category Group Initialization
					var uniqueSpecCategoryGroup = getDistinctValuesByProperty(vm.submittalregisters, "specCategoryGroup", true);
					uniqueSpecCategoryGroup = convertAllValuesToLowerCase(uniqueSpecCategoryGroup);
					uniqueSpecCategoryGroup.sort();
					vm.numberOfSpecCategoryGroups = angular.copy(uniqueSpecCategoryGroup.length);
					vm.specCategoryGroups = [];
	        angular.forEach(uniqueSpecCategoryGroup, function (item, index) {
	            var record = { id: index, value: item, selected: true };
							if(vm.filteredItems && vm.filteredItems.specCategoryGroupSelectedItems.length>0 && vm.filteredItems.specCategoryGroupSelectedItems.indexOf(item) === -1) {
								record.selected = false;
							}
	            vm.specCategoryGroups.push(record);
	        });

					// Subcontractor Initialization
					var uniqueSubcontractor = getDistinctValuesByProperty(vm.submittalregisters, "subContractor", true);
					uniqueSubcontractor = convertAllValuesToLowerCase(uniqueSubcontractor);
					uniqueSubcontractor.sort();
					vm.numberOfSubContractors = angular.copy(uniqueSubcontractor.length);
					vm.subcontractors = [];
	        angular.forEach(uniqueSubcontractor, function (item, index) {
	            var record = { id: index, value: item, selected: true };
							if(vm.filteredItems && vm.filteredItems.subContractorSelectedItems.length>0 && vm.filteredItems.subContractorSelectedItems.indexOf(item) === -1) {
								record.selected = false;
							}
	            vm.subcontractors.push(record);
	        });

		        if (vm.submittalregisters.length > 0) {
		              var highest = 0;
		              $.each(vm.submittalregisters, function (key, submittalregister) {
		                  if (submittalregister.recid > highest) highest = submittalregister.recid;
		              });
		              vm.MaxId = highest;
		          }
		        else
		        	{
		        	vm.MaxId = 0;
		              vm.submittalregisters = [];
		        	}

	          if(vm.submittalregisters.length > 0){
	                    	// Division codes filter related code
							var divisions = [], record;
							var uniqueDivisionResult = getUniqueDivisions(vm.submittalregisters);

							vm.uniqueDivisions = uniqueDivisionResult.uniqueDivisionRecords;

							angular.forEach(vm.uniqueDivisions, function (item, index) {
              	record = { id: index, divisionCode: item.divisionCode, divisionName : item.divisionName,  selected: true };
								if(vm.filteredItems && vm.filteredItems.divisionCodeSelectedItems.length>0 && vm.filteredItems.divisionCodeSelectedItems.indexOf(item.divisionCode) === -1) {
									record.selected = false;
								}
              	divisions.push(record);
              });
							vm.allDivisions = divisions;
							vm.divisionCodeSelectedItems = uniqueDivisionResult.uniqueDivisionCodes;

	                    	// Spec sections filter related code
							var specSections = [], record;
							var uniqueSpecSectionResult = getUniqueSpecSections(vm.submittalregisters);

							vm.uniqueSpecSections = uniqueSpecSectionResult.uniqueSpecSectionRecords;

							angular.forEach(vm.uniqueSpecSections, function (item, index) {
			                	record = { id: index, specSection: item.specSection, specName : item.specName,  selected: true };
												if(vm.filteredItems && vm.filteredItems.specSectionSelectedItems.length>0 && vm.filteredItems.specSectionSelectedItems.indexOf(item.specSection) === -1) {
													record.selected = false;
												}
			                	specSections.push(record);
			                });
							vm.allSpecSections = specSections;
							vm.specSectionSelectedItems = uniqueSpecSectionResult.uniqueSpecSections;

							vm.uniqueSpecNumberUnchanged = angular.copy(uniqueSpecSectionResult.uniqueSpecSections);

							vm.numberOfSpecSections = angular.copy(vm.uniqueSpecSections.length);
							vm.numberOfDivisions = angular.copy(vm.uniqueDivisions.length);
	          }
						else {
							vm.allDivisions = [];
							vm.allSpecSections = [];
						}

					ApplyFilters();
					$scope.smartRegisterFlag = true;
					$scope.aconexRegisterFlag =  false;
					vm.LoadCompanies(waitingDialog, checkSingleCompany);
					vm.LoadUser();
				} else {
					var msg = response.message ? response.message : "Failed to connect to Aconex";
					checkTimeOutAndShowConfirmDownload(msg);
					FlashService.Error(response.message);
				}
			});
		}

		function checkSingleCompany(companies, dialog) {
			if ($scope.listOfCompanies && $scope.listOfCompanies.length == 1) {
				vm.selectedCompany = $scope.listOfCompanies[0].id;
					AconexLoadProjects(dialog, function(){
					dialog.hide();
				});
			} else if (dialog) {
				dialog.hide();
			}
		}

		function getAconexSpecSections(successCallback) {
			if (vm.projectSelected !== null && vm.projectSelected !== '') {
				vm.dataLoading = 'Checking Aconex Spec sections...';
				AconexIntegrationService.getAconexSpecSections(vm.pypeUserID, vm.projectSelected, vm.selectedCompany,
						function(response) {
					if (response.success) {
						successCallback(response.data);
					} else {
						FlashService.Error(response.message);
					}
					vm.dataLoading = false;
				});
			} else {
				successCallback();
			}
		}

		function ConvertRecords(gridName) {
			var selectedRecords = $scope.getSelectedRecords(gridName);
			// Add the PopUp selected records in Aconex format
			if(selectedRecords.length <= 0) {
				$scope.selectAllRecords();
				selectedRecords = $scope.getSelectedRecords(gridName);
			}
processSelectedRecords(selectedRecords); // ... and remove this line
		}

		function isAlreadyExported(record) {
			var uploaded = false;
			if (record.uploadedToAconex) {
				for(var key in record.aconexExportedData) {
					if(key === vm.projectSelected.toString()) {
						uploaded = true;
						break;
					}
				}
			}
			return uploaded;
		}

		function isSpecSectionMissing(specSections, record) {
// Uncomment this when we decide to show the missing spec sections in Aconex
// return !specSections || specSections.length === 0 ||
// !specSections[record.specNumber.replace(/\s/g, "")];
return false;
		}

		function processSelectedRecords(selectedRecords, aconexSpecSections) {
			var alreadyExportedRecords = [];
			var missingSpecSectionRecords = [];
			for (var i = 0; i < selectedRecords.length; i++) {
				var rec = selectedRecords[i];
				if (isAlreadyExported(rec)) {
					alreadyExportedRecords.push(rec);
				}
				if (isSpecSectionMissing(aconexSpecSections, rec)
						&& !_.find(missingSpecSectionRecords, function(mrec) {
							return mrec.specNumber === rec.specNumber && mrec.specName === rec.specName;
						})) {
					// rec.style = "background-color: #FFDDDD";
					missingSpecSectionRecords.push(rec);
				}
			}

			if(alreadyExportedRecords.length > 0 || Object.keys(missingSpecSectionRecords).length > 0) {
				var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: MAINURL + 'views/aconex/warning.records.view.html?version=9.0',
					controller: function ($scope, $uibModalInstance, alreadyExportedMessage, missingSpecSectionRecords) {
						(function () {
							$scope.alreadyExportedMessage = alreadyExportedMessage;
							$scope.missingSpecSectionRecords = missingSpecSectionRecords;
						})();
						$scope.Close = function (response) {
							$uibModalInstance.close(response);
						}
					},
					backdrop: 'static',
					resolve: {
						alreadyExportedMessage: function () {
							if (alreadyExportedRecords.length > 0) {
								return (selectedRecords.length == alreadyExportedRecords.length) ?
										'The selected submittals already exist in Aconex. Exporting them again will supersede existing Aconex documents. Do you want to supersede?' :
										'Some of the selected submittals already exist Aconex. Exporting them again will supersede existing Aconex documents. Do you want to supersede?';
							} else {
								return null;
							}
						},
						missingSpecSectionRecords: function () {
							return missingSpecSectionRecords;
						}
					}
				});
				modalInstance.result.then(function (data) {
					if(data == 'Yes') {
						convertSelectedRecordsToAconex(vm.pypeUserID,  vm.projectSelected, vm.selectedCompany, vm.selectedSubmittalManagerId,vm.selectedSubmittalStatusId, selectedRecords);
					}
				}, function () {
// $scope.$broadcast("RebuildGrid", vm.filterSmartRegisteredData);
				});
			}
			else {
				convertSelectedRecordsToAconex(vm.pypeUserID,  vm.projectSelected, vm.selectedCompany, vm.selectedSubmittalManagerId,vm.selectedSubmittalStatusId, selectedRecords);
			}
		}

		function showWarningPopUp(title, message, callback) {
			ModalService.OpenConfirmModal(title, message, false)
			.result.then(function () {
				callback();
			}, function() {});
		}

		function showConfirmExportPopup( title, message, userId, projectSelected, selectedCompany, selectedSubmittalManagerId, smartRegisterContainer) {
			var modalInstance = $uibModal
			.open({
				animation: true,
				templateUrl: MAINURL + 'views/support/support.enterpriseconfirmation.view.html',
				controller: 'ConfirmUpgradeToEnterprise',
				backdrop: 'static',
				windowClass: 'smallmodal',
				resolve: {
					items: { title : title, message: message }
				}
			});

			modalInstance.result.then(function (data) {

				convertSelectedRecordsToAconex(userId, projectSelected, selectedCompany, selectedSubmittalManagerId,vm.selectedSubmittalStatusId,  smartRegisterContainer);
			}, function () {
			});
		}

		function convertSelectedRecordsToAconex( userId, projectSelected, selectedCompany, selectedSubmittalManagerId, selectedSubmittalStatusId, smartRegisterRecords ) {
			// Call the convert Api and Reload the grid with new Data and
			// Columns and Change the buttons Too!!

			var smartRegisterContainer = {
				smartRegisterRecords: smartRegisterRecords
			};

			GetSmartRegisterInAconexFormat (userId, projectSelected, selectedCompany, selectedSubmittalManagerId, selectedSubmittalStatusId,  smartRegisterContainer);
		}

		function GetSmartRegisterInAconexFormat(userId, projectSelected, selectedCompany, selectedSubmittalManagerId, selectedSubmittalStatusId, smartRegisterContainer) {
			vm.dataLoading = 'Converting Submittals To Aconex Format...';
			AconexIntegrationService.GetConvertedRegisterInAconexFormat(
					userId,vm.pypeCompanyID,vm.pypeProjectID,vm.pypeProjectVersionID, projectSelected, selectedCompany, selectedSubmittalManagerId, selectedSubmittalStatusId,
					smartRegisterContainer,
					function(response) {
						if (response.success) {
							if(response.data){
								vm.transformedData = response.data.submittals;
								vm.aconexGridColumns = response.data.columns;
								var rows = angular.copy(vm.transformedData.rows);
								var schemaFields = angular.copy(vm.transformedData.schemaFields);
								PrepareTransformedGridData(rows, schemaFields);
								GetAconexObjectNames();
								$scope.aconexRegisterFlag = true;
								$scope.smartRegisterFlag = false;
							}
						} else {
							checkTimeOutAndShowConfirmDownload(response.message);
							FlashService.Error(response.message);
						}
						vm.dataLoading = false;
					});
		}

		function GetAconexObjectNames(){
			var companyList = $scope.listOfCompanies;
			for(var i=0; i < companyList.length; i++) {
				if(companyList[i].id=== vm.selectedCompany)
					vm.selectedCompanyName  = companyList[i].name;
			}
			var projectList = $scope.listOfProjects;
			for(var i=0; i < projectList.length; i++) {
				if(projectList[i].id=== vm.projectSelected)
					vm.projectSelectedName  = projectList[i].name;
			}
		}
		function RemoveFilterItem(index) {
			   vm.searchData.splice(index, 1);
			   $scope.$broadcast('search', vm.searchData);
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

				console.log(columns.filter(function(column) {
					return column.field == dataItem.field;
				})[0]);
				return columns.filter(function(column) {
					return column.field == dataItem.field;
				})[0].caption;
			}

		function ExportRecords (gridName, targetgridName) {
			$scope.selectAllRecords();
			var 	selectedRecords = $scope.getSelectedRecords(gridName);
			vm.dataLoading = 'Exporting Submittals to Aconex System...Normally takes about 1-5 minutes depending on the number of submittals.';
			for(var i=0; i < selectedRecords.length; i++) {
				delete selectedRecords[i].style;
			}

			AconexIntegrationService.UploadRecords(vm.pypeUserID,vm.pypeProjectID,vm.pypeProjectVersionID, vm.projectSelected, vm.selectedCompany, vm.transformedData,
					function(response) {

				if (response.success) {

					vm.transformedData = response.data;
					var rows = angular.copy(vm.transformedData.rows);
					var schemaFields = angular.copy(vm.transformedData.schemaFields);
					PrepareTransformedGridData(rows, schemaFields);

					$scope.isAconexSummary = true;
					$scope.smartRegisterFlag = false;
					$scope.aconexRegisterFlag = false;
					vm.selectColumn = false;
					vm.showToolbar = false;
					FlashService.Success("Successfully exported the submittals to Aconex");
					vm.dataLoading = false;
					// waitingLoader.hide();

				} else {
					checkTimeOutAndShowConfirmDownload(response.message);
					FlashService.Error(response.message);
					vm.dataLoading = false;

					waitingLoader.hide();
				}
			});
		}
    }
})();