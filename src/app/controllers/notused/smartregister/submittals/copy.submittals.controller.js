
(function () {
    'use strict';

    angular.module('EventsApp').controller(
			'CopySubmittalsController', CopySubmittalsController);

    CopySubmittalsController.$inject = ['$scope', '$rootScope', '$uibModalInstance',
			'ProjectService', 'FlashService', '$timeout', '$uibModal', 'MAINURL',
			'APIURL', '$http', '$templateCache', 'AuthenticationService', 'SmartRegisterService', 'ModalService'];
    function CopySubmittalsController($scope, $rootScope, $uibModalInstance,
			ProjectService, FlashService,
			$timeout, $uibModal, MAINURL, APIURL, $http,
			$templateCache, AuthenticationService, SmartRegisterService, ModalService) {

    	var vm = this;

    	var existingFilter = AuthenticationService.UpdateFilterDataAccordingToFormat([]);

        (function () {
        	$scope.closeDirtyFlag = false;
            $scope.myForm = {};
            $scope.myForm.$invalid = false;
            $scope.step = 1;

            $scope.project = AuthenticationService.GetProject();

            GetVersions();

            $scope.showDialog = true;

        })();

        /*Custom filter for spec section*/
        $scope.specSectionFilter = function (item) {
            if (vm.searchSpecSections == undefined || vm.searchSpecSections == '' || (item.specName && item.specName.toUpperCase().indexOf(vm.searchSpecSections.toUpperCase()) > -1)
        		|| (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1))
                return true;
            return false;
        }

        /*Custom filter for division code*/
        $scope.divisionCodeFilter = function (item) {
            if (vm.searchDivisionCodes == undefined || vm.searchDivisionCodes == '' || (item.divisionName && item.divisionName.toUpperCase().indexOf(vm.searchDivisionCodes.toUpperCase()) > -1)
        		|| (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1))
                return true;
            return false;
        }

        /*Custom filter for submittal type*/
        $scope.submittalTypeFilter = function (item) {
            if (vm.searchSubmittalTypes == undefined || vm.searchSubmittalTypes == '' || (item && item.toUpperCase().indexOf(vm.searchSubmittalTypes.toUpperCase()) > -1))
                return true;
            return false;
        }

        $scope.Next = function () {
            if ($scope.firstSelected.versionId == $scope.secondSelected.versionId) {
                FlashService.Error("Please select a different version.");
            }

            else if($scope.firstSelected.versionStatus.toLowerCase() === 'in progress' || $scope.secondSelected.versionStatus.toLowerCase() === 'in progress') {
            	var errormessage = "";
            	if($scope.firstSelected.versionStatus.toLowerCase() === 'in progress')
            		errormessage = "Version '" + $scope.firstSelected.versionName + "' is in progress now. Please do copy once run specs action completes.";
                else
                	errormessage = "Version '" + $scope.secondSelected.versionName + "' is in progress now. Please do copy once run specs action completes.";
            	FlashService.Error(errormessage);

            } else if ($scope.firstSelected.versionStatus.toLowerCase() === 'not started' || $scope.secondSelected.versionStatus.toLowerCase() === 'not started') {
            	var errormessage = "";
            	//Specs are not uploaded. Submittal data is not available
            	if($scope.firstSelected.versionStatus.toLowerCase() === 'not started')
            		errormessage = "Submittal data is not available for the version '"+ $scope.firstSelected.versionName + "'";
                else
                	errormessage = "Submittal data is not available for the version '"+ $scope.secondSelected.versionName + "'";
            	FlashService.Error(errormessage);
            }
           else {

                $scope.selectedVersions = [];
                $scope.selectedVersions.push($scope.firstSelected);
                $scope.selectedVersions.push($scope.secondSelected);
                $scope.smartregister = [];
                $scope.selectedOption = 'showAll';
                //$scope.showDialog = false;
                $(".modal-content").css("width", "100%");
                // $(".modal-body").css("height", "530px");

                GetDiffData($scope.project, $scope.selectedVersions[0],
                        $scope.selectedVersions[1], "Total Submittals");
                $scope.selectedRows = [];

            }
        }
        $scope.Back = function () {
            if ($scope.selectedRows && $scope.selectedRows.length > 0) {
                var message = "Your changes will be lost. Click Yes to continue.";
              	var title = "Confirm";
                var yesText = "Yes";
                ModalService.OpenConfirmModal(title, message, false, yesText)
              	.result.then(function () {
                      $scope.step = 1;
                      $scope.selectedRows = [];
              	}, function() {});
            } else {
                $scope.step = 1;
            }
        }
        function GetVersions() {
            $scope.dataLoading = true;
            $scope.versionDetails = [];
            ProjectService.GetAllProjectRelatedCharts($scope.project.projectId, function (response) {
                if (response.success) {
                    if (response.data) {
                        $scope.versionDetails = angular.copy(response.data);
                        $scope.firstSelected = $scope.versionDetails[0];
                        var selectedVersion = AuthenticationService.GetVersion();
                        if (selectedVersion && selectedVersion.versionId)
                            $scope.secondSelected = $scope.versionDetails.filter(function (item) { return item.versionId == AuthenticationService.GetVersion().versionId })[0];
                        else
                            $scope.secondSelected = $scope.versionDetails[0];
                    }
                }
                $scope.dataLoading = false;
            });
        }

        $scope.LeftSelect = function (version) {
            $scope.firstSelected = version;
        }

        $scope.RightSelect = function (version) {
            $scope.secondSelected = version;
        }

        function BuildGrid(data) {
            var getCellTemplate = function (record) {

                if (record.specNumber
						&& record.specNumber.indexOf('_revised_') > -1) {
                    var specNumber = record.specNumber.slice(0,
							record.specNumber.indexOf('_revised_'));
                    return '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{specNumber}}</span></div>';
                }
                return '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{record.specNumber}}</span></div>';
            };
            var columns1 = [
					{
					    name: 'action',
					    //displayName : '',
					    headerCellTemplate: '<input type="checkbox" id="selectAllChkbx" style="width:18px;height:18px;margin-left: 8px;margin-top: 5px;" ng-model="selectedAll" ng-click="$event.stopPropagation();grid.appScope.selectAll()"/>',
					    width: 26,
					    headerTooltip: true,
					    cellTemplate: '<div class="ui-grid-cell-contents" title="{{row.entity.action == \'D\'?\'To Copy\':row.entity.action == \'U\'?\'To Overwrite\':\'\'}}"><span><input style="width:18px;height:18px;margin-left: 4px;margin-top: 5px;" type="checkbox" ng-show="row.entity.action==\'D\' || row.entity.action==\'U\'" ng-model="row.entity.selected" ng-click="$event.stopPropagation();grid.appScope.selectRow(row)"></span></div>',
					    cellClass: function (grid, row, col, rowRenderIndex,
								colRenderIndex) {
					        if (row.entity.action === 'D') {
					            return 'redBackground';
					        } else if (row.entity.action === 'U') {
					            return 'yellowBackground';
					        }
					    }
					},
					{
					    name: 'specNumber',
					    displayName: 'Spec section',
					    width: 100,
					    headerTooltip: true,
					    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{row.entity.specNumber}}</span></div>'
					},
					{
					    name: 'paraCode',
					    displayName: 'Spec sub section',
					    width: 75,
					    headerTooltip: true,
					    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{row.entity.paraCode}}</span></div>'
					},
					{
					    name: 'columns[2].oldValue',
					    displayName: 'Submittal type',
					    width: 200,
					    headerTooltip: true,
					    cellClass: function (grid, row, col, rowRenderIndex,
								colRenderIndex) {
					        if (row.entity.columns[2].action === 'U') {
					            return 'yellowBackground';
					        }
					    }
					},
					{
					    name: 'columns[1].oldValue',
					    displayName: 'Submittal description',
					    width: 400,
					    headerTooltip: true,
					    cellClass: function (grid, row, col, rowRenderIndex,
								colRenderIndex) {
					        if (row.entity.columns[1].action === 'U') {
					            return 'yellowBackground';
					        }
					    }
					},
					{
					    name: 'specName',
					    displayName: 'Spec name',
					    width: 200,
					    headerTooltip: true,
					    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{row.entity.specName}}</span></div>'
					},
					{
					    name: 'columns[3].oldValue',
					    displayName: 'Submittal group',
					    width: 200,
					    headerTooltip: true,
					    cellClass: function (grid, row, col, rowRenderIndex,
								colRenderIndex) {
					        if (row.entity.columns[0].action === 'U') {
					            return 'yellowBackground';
					        }
					    }
					}];

            var columns2 = [
					{
					    name: 'action',
					    displayName: '',
					    width: 26,
					    headerTooltip: true,
					    cellTemplate: '<div class="ui-grid-cell-contents" title="{{row.entity.action == \'I\'?\'Existing\':row.entity.action == \'U\'?\'To Overwrite\':row.entity.action == \'M\'?\'Copied\':\'\'}}"><span></span></div>',
					    cellClass: function (grid, row, col, rowRenderIndex,
								colRenderIndex) {
					        if (row.entity.action === 'I') {
					            return 'greenBackground';
					        } else if (row.entity.action === 'U') {
					            return 'yellowBackground';
					        } else if (row.entity.action === 'M') {
					            return 'violetBackground';
					        }
					    }
					},
					{
					    name: 'specNumber',
					    displayName: 'Spec section',
					    width: 100,
					    headerTooltip: true,
					    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'D\'\">{{row.entity.specNumber}}</span></div>'
					},
					{
					    name: 'paraCode',
					    displayName: 'Spec sub section',
					    width: 75,
					    headerTooltip: true,
					    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'D\'\">{{row.entity.paraCode}}</span></div>'
					},
					{
					    name: 'columns[2].newValue',
					    displayName: 'Submittal type',
					    width: 200,
					    headerTooltip: true,
					    cellClass: function (grid, row, col, rowRenderIndex,
								colRenderIndex) {
					        if (row.entity.columns[2].action === 'U') {
					            return 'yellowBackground';
					        }
					    }
					},
					{
					    name: 'columns[1].newValue',
					    displayName: 'Submittal description',
					    width: 400,
					    headerTooltip: true,
					    cellClass: function (grid, row, col, rowRenderIndex,
								colRenderIndex) {
					        if (row.entity.columns[1].action === 'U') {
					            return 'yellowBackground';
					        }
					    }
					},
					{
					    name: 'specName',
					    displayName: 'Spec name',
					    width: 200,
					    headerTooltip: true,
					    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'D\'\">{{row.entity.specName}}</span></div>'
					},
					{
					    name: 'columns[3].newValue',
					    displayName: 'Submittal group',
					    width: 200,
					    headerTooltip: true,
					    cellClass: function (grid, row, col, rowRenderIndex,
								colRenderIndex) {
					        if (row.entity.columns[0].action === 'U') {
					            return 'yellowBackground';
					        }
					    }
					}];

            $scope.gridOptions1 = {
                data: data,
                columnDefs: columns1,
                enableSorting: false,
                enableColumnMenus: false,
                multiSelect: true,
                rowTemplate: '<div ng-mouseover="rowStyle={\'background-color\': \'red\'}; grid.appScope.onRowHover(this);" ng-mouseleave="rowStyle={}" ng-click="grid.appScope.rowClicked(row,col,colRenderIndex)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="col.colIndex()" ui-grid-cell></div>',
            };

            $scope.gridOptions2 = {
                data: data,
                columnDefs: columns2,
                enableSorting: false,
                enableColumnMenus: false,
                rowTemplate: '<div ng-click="grid.appScope.rowClicked(row,col,colRenderIndex)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="col.colIndex()" ui-grid-cell></div>',
            };
        }

        $scope.SwitchVersions = function () {
            var versions = angular.copy($scope.selectedVersions);
            $scope.selectedVersions[0] = angular.copy(versions[1]);
            $scope.selectedVersions[1] = angular.copy(versions[0]);
            GetDiffData(project, $scope.selectedVersions[0], $scope.selectedVersions[1], $scope.category);
        }

        $scope.rowClicked = function (row, col, ind) {
            if (ind == 0) return;
            $scope.clickedRecord = row.uid;
            showRowDifferencesPopup(row.entity);
        }

        $scope.rowHovered = function (row) {
            $scope.hoveredRecord = row;
        }

        $scope.rowHoverRemoved = function () {
            // Remove the hover index when user removes the mouse from particular record
            $scope.hoveredIndex = -1;
        }


        function showRowDifferencesPopup(data) {
            $uibModal.open({
			    animation: true,
			    templateUrl: MAINURL
						+ 'views/smartregister/submittals/copysubmittal.record.view.html?version=9.0',
			    size: 'xl',
			    controller: 'CopySubmittalRecordViewController',
			    resolve: {
			        records: function () {
			            return data
			        },
			        selectedVersions: function () {
			            return $scope.selectedVersions
			        }
			    }
			});
        }

        function GetDiffData(project, firstVersion, secondVersion, category) {
            waitingDialog.show();
            ProjectService.GetVersionDiffData(
							project.projectId,
							firstVersion.versionId,
							secondVersion.versionId,
							category,
							function (response) {
							    if (response.success) {
                                    if (response.data !== null && response.data.submittalRecords && response.data.submittalRecords.length > 0) {
							            $scope.finalSet = response.data;
							            indexingData(response.data.submittalRecords);
							            $scope.clonedOriginalData = angular.copy($scope.originalData);
							            $scope.filteredData = $scope.clonedOriginalData;
							            $scope.pageDirty = false;
							            $scope.selectedAll = false;
							            PrepareObjectsBasedOnActions($scope.clonedOriginalData);
							        } else {
							            FlashService.Error("Selected versions do not contain data. Please select a different version.");
							            $scope.Cancel();
							        }
                      $scope.showDialog = true;
                      $scope.step = 2;
							    } else {
							        FlashService.Error(response.message);
							        $scope.step = 2;
							        $scope.showDialog = true;
							    }
                  waitingDialog.hide();
							});
        }

        function indexingData(data) {
            for (var i = 0; i < data.length; i++) {
                data[i].rowIndex = i;
            }
            $scope.originalData = data;
        }

        $scope.GetExcelDiffByCategory = function () {
            waitingDialog.show();
            SmartRegisterService.DownLoadExcelDifferencesByCategory(
					project.projectId, versions[0].versionId,
					versions[1].versionId, category, function (response) {
					    if (response.success) {
					        FlashService.Success(response.message);
					    } else {
					        FlashService.Error(response.message);
					    }
              waitingDialog.hide();
					});

        }

        function getUniqueSpecSections(submittals) {
            var uniqueSpecSectionRecords = [], uniqueSpecSections = [];
            var record = {};
            for (var i = 0; i < submittals.length; i++) {
                if (submittals[i].specNumber != null && submittals[i].specNumber != '' && uniqueSpecSections.indexOf(submittals[i].specNumber) === -1) {

                    record = { specSection: submittals[i].specNumber, specName: submittals[i].specName };

                    uniqueSpecSectionRecords.push(angular.copy(record));
                    uniqueSpecSections.push(submittals[i].specNumber);
                }
            }
            return { uniqueSpecSectionRecords: uniqueSpecSectionRecords, uniqueSpecSections: uniqueSpecSections };
        }

        function getUniqueDivisions(submittals) {
            var uniqueDivisions = [], uniqueDivsionCodes = [];
            var record = {};
            for (var i = 0; i < submittals.length; i++) {
                if (submittals[i].divisionCode != null && submittals[i].divisionCode != '' && uniqueDivsionCodes.indexOf(submittals[i].divisionCode) === -1) {

                    record = { divisionCode: submittals[i].divisionCode, divisionName: submittals[i].divisionName };

                    uniqueDivisions.push(angular.copy(record));
                    uniqueDivsionCodes.push(submittals[i].divisionCode);
                }
            }
            return { uniqueDivisionRecords: uniqueDivisions, uniqueDivisionCodes: uniqueDivsionCodes };
        }

        function PrepareObjectsBasedOnActions(data) {

            $scope.submittalGroups = getDistinctValues(data, "projectSummaryGroup");
            $scope.submittalTypes = getDistinctValues(data, "specCategory");

            prepareDivisionAndSpecFilterData(data);

            $scope.submittalGroupsSelectedItems = angular.copy($scope.submittalGroups);
            $scope.submittalGroupsSelectedItemsFinal = angular.copy($scope.submittalGroups);

            $scope.submittalTypeSelectedItems = angular.copy($scope.submittalTypes);
            $scope.submittalTypeSelectedItemsFinal = angular.copy($scope.submittalTypeSelectedItems);

            $scope.getRecordsCount(data);

            BuildGrid(data);

            //ApplyFilters();
        }

        function prepareDivisionAndSpecFilterData(data){
        	 //Division codes filter related code
            var divisions = [], record;
            var uniqueDivisionResult = getUniqueDivisions(data);

            $scope.uniqueDivisions = uniqueDivisionResult.uniqueDivisionRecords;

            angular.forEach($scope.uniqueDivisions, function (item, index) {
                record = { id: index, divisionCode: item.divisionCode, divisionName: item.divisionName, selected: true };
                divisions.push(record);
            });
            $scope.allDivisions = divisions;
            $scope.divisionCodeSelectedItems = uniqueDivisionResult.uniqueDivisionCodes;

            //Spec sections filter related code
            var specSections = [], record;
            var uniqueSpecSectionResult = getUniqueSpecSections(data);

            $scope.uniqueSpecSections = uniqueSpecSectionResult.uniqueSpecSectionRecords;

            angular.forEach($scope.uniqueSpecSections, function (item, index) {
                record = { id: index, specSection: item.specSection, specName: item.specName, selected: true };
                specSections.push(record);
            });
            $scope.allSpecSections = specSections;
            $scope.specSectionSelectedItems = uniqueSpecSectionResult.uniqueSpecSections;

            $scope.uniqueSpecNumberUnchanged = angular.copy(uniqueSpecSectionResult.uniqueSpecSections);

            $scope.numberOfSpecSections = angular.copy($scope.specSectionSelectedItems.length);
            $scope.numberOfDivisions = angular.copy($scope.divisionCodeSelectedItems.length);
        }

        $scope.getRecordsCount = function (data, option) {
            var rightCount = data.filter(function (item) {
                return item.action != "D";
            });
            var leftCount = data.filter(function (item) {
                return item.action != "I";
            });
            $scope.RightGridRecords = rightCount.length;
            $scope.LeftGridRecords = leftCount.length;

        }

        function updateRightGridRecordsCount(data, option) {
            var rightCount = data.filter(function (record) {
            	return record.action != "D"
            	&& ((record.divisionCode != null && $.inArray(record.divisionCode, $scope.divisionCodeSelectedItems) != -1)
    			&& (record.specNumber != null && $.inArray(record.specNumber, $scope.specSectionSelectedItems) != -1)
    		    && (record.columns[3].newValue != null && $.inArray(record.columns[3].newValue, $scope.submittalGroupsSelectedItems) != -1)
    		    && (record.columns[2].newValue != null && $.inArray(record.columns[2].newValue, $scope.submittalTypeSelectedItems) != -1));
            });
            $scope.RightGridRecords = rightCount.length;
        }


        // query popover
        $scope.divisionFilterPopover = {

            isOpen: false,

            open: function open() {
            	if($scope.status){
            		$scope.status.isopen = false;
            	}
                $scope.divisionFilterPopover.isOpen = true;
            },
            selectAll: function selectAll(key) {
	            vm[key]=!vm[key];
                angular.forEach($scope.allDivisions, function (item, index) {
                    if (!vm.searchDivisionCodes || (item.divisionName && item.divisionName.indexOf(vm.searchDivisionCodes.toUpperCase()) > -1) ||
                            (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)) {
                        item.selected = vm[key];
                    }
                });
            },
            unSelectAll: function unSelectAll() {
                angular.forEach($scope.allDivisions, function (item, index) {
                    if (!vm.searchDivisionCodes || (item.divisionName && item.divisionName.indexOf(vm.searchDivisionCodes.toUpperCase()) > -1) ||
                            (item.divisionCode && item.divisionCode.indexOf(vm.searchDivisionCodes) > -1)) {
                        item.selected = false;
                    }
                });
            },

            close: function close() {
                $scope.myForm.$invalid = true;
                $scope.applyingFilters = true;
                $scope.divisionCodeSelectedItems = [];
                angular.forEach($scope.allDivisions, function (item, index) {
                    if (item.selected == true)
                        $scope.divisionCodeSelectedItems.push(item.divisionCode);
                });
                ApplyFilters();
                //$scope.divisionSelectedItemsFinal = angular.copy($scope.divisionSelectedItems);
                $scope.divisionFilterPopover.isOpen = false;
            },

            dismiss: function dismiss(event) {
                if (!event || event.target.className.indexOf("popover") <= -1) {
                    $scope.divisionFilterPopover.isOpen = false;
                    for (var index = 0; index < $scope.allDivisions.length; index++) {
                        if ($scope.divisionCodeSelectedItems.indexOf($scope.allDivisions[index].divisionCode) !== -1) {
                        	$scope.allDivisions[index].selected = true;
                        } else {
                        	$scope.allDivisions[index].selected = false;
                        }
                    }
                }
            }
        };

        $scope.specSectionsFilterPopover = {

                isOpen: false,

                open: function open() {
                	if($scope.status){
                		$scope.status.isopen = false;
                	}
                    $scope.specSectionsFilterPopover.isOpen = true;
                },
                selectAll: function selectAll(key) {
	                vm[key]=!vm[key];
                	angular.forEach($scope.allSpecSections, function (item, index) {
                        if (!vm.searchSpecSections || (item.specName && item.specName.indexOf(vm.searchSpecSections.toUpperCase()) > -1) ||
                                    (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)) {
                           item.selected = vm[key];
                        }
                    });
                },
                unSelectAll: function unSelectAll() {
                	angular.forEach($scope.allSpecSections, function (item, index) {
                        if (!vm.searchSpecSections || (item.specName && item.specName.indexOf(vm.searchSpecSections.toUpperCase()) > -1) ||
                                (item.specSection && item.specSection.indexOf(vm.searchSpecSections) > -1)) {
                            item.selected = false;
                        }
                    });
                },

                close: function close() {
                    $scope.myForm.$invalid = true;
                    $scope.applyingFilters = true;
                    $scope.specSectionSelectedItems = [];
                    angular.forEach($scope.allSpecSections, function (item, index) {
                        if (item.selected == true)
                        	$scope.specSectionSelectedItems.push(item.specSection);
                    });
                    ApplyFilters();
                    vm.searchSpecSections = '';
                    $scope.specSectionsFilterPopover.isOpen = false;
                },

                dismiss: function dismiss(event) {
                    if (!event || event.target.className.indexOf("popover") <= -1) {
                        $scope.specSectionsFilterPopover.isOpen = false;
                        vm.searchSpecSections = '';
                        for (var index = 0; index < $scope.allSpecSections.length; index++) {
                            if ($scope.specSectionSelectedItems.indexOf($scope.allSpecSections[index].specSection) !== -1) {
                            	$scope.allSpecSections[index].selected = true;
                            } else {
                            	$scope.allSpecSections[index].selected = false;
                            }
                        }
                    }
                }
            };


        $scope.submittalGroupFilterPopover = {

                isOpen: false,

                open: function open() {
                	if($scope.status){
                		$scope.status.isopen = false;
                	}
                    $scope.submittalGroupFilterPopover.isOpen = true;
                },
                select: function select(item) {
                    var index = $scope.submittalGroupsSelectedItems.indexOf(item);
                    if (index == -1) {
                        $scope.submittalGroupsSelectedItems.push(item);
                    } else
                        $scope.submittalGroupsSelectedItems.splice(index, 1);
                },

               selectAll: function selectAll(key) {
	                vm[key]=!vm[key];
                    $scope.submittalGroupsSelectedItems = [];
                    if(vm[key]) {
                   		 $scope.submittalGroupsSelectedItems = angular.copy($scope.submittalGroups);
                    }
                 	angular.forEach($scope.allSubmittalGroups, function (item, index) {
                        if (!vm.searchSubmittalGroups || (item.SubmittalGroup && item.SubmittalGroup.indexOf(vm.searchSubmittalGroups.toUpperCase()) > -1)) {
                           item.selected = vm[key];
                        }
                    });
                },
               //selectAll: function selectAll(key) {
	             //   vm[key]=!vm[key];
                   // $scope.submittalGroupsSelectedItems = angular.copy($scope.submittalGroups);

                //},
                unSelectAll: function unSelectAll() {
                    $scope.submittalGroupsSelectedItems = [];
                },

                close: function close() {
                    $scope.myForm.$invalid = true;
                    $scope.applyingFilters = true;
                    ApplyFilters();
                    $scope.submittalGroupsSelectedItemsFinal = angular.copy($scope.submittalGroupsSelectedItems);
                    $scope.submittalGroupFilterPopover.isOpen = false;
                },

                dismiss: function dismiss(event) {
                    if (!event || event.target.className.indexOf("popover") <= -1) {
                        $scope.submittalGroupFilterPopover.isOpen = false;
                        $scope.submittalGroupsSelectedItems = angular.copy($scope.submittalGroupsSelectedItemsFinal);
                    }
                }
            };

        $scope.submittalTypeFilterPopover = {

                isOpen: false,

                open: function open() {
                	if($scope.status){
                		$scope.status.isopen = false;
                	}
                    $scope.submittalTypeFilterPopover.isOpen = true;
                },
                select: function select(item) {
                    var index = $scope.submittalTypeSelectedItems.indexOf(item);
                    if (index == -1) {
                        $scope.submittalTypeSelectedItems.push(item);
                    } else
                        $scope.submittalTypeSelectedItems.splice(index, 1);
                },
                selectAll: function selectAll(key) {
	                vm[key]=!vm[key];
                    $scope.submittalTypeSelectedItems = [];
                    if(vm[key]) {
                   		 $scope.submittalTypeSelectedItems = angular.copy($scope.submittalTypes);
                    }
                 	angular.forEach($scope.allsubmittalTypes, function (item, index) {
                        if (!vm.searchSubmittalTypes || (item.submittalType && item.submittalType.indexOf(vm.searchSubmittalTypes.toUpperCase()) > -1)) {
                           item.selected = vm[key];
                        }
                    });
                },

                unSelectAll: function unSelectAll() {
                    $scope.submittalTypeSelectedItems = [];
                },

                close: function close() {
                    $scope.myForm.$invalid = true;
                    $scope.applyingFilters = true;
                    ApplyFilters();
                    $scope.submittalTypeSelectedItemsFinal = angular.copy($scope.submittalTypeSelectedItems);
                    $scope.submittalTypeFilterPopover.isOpen = false;
                },

                dismiss: function dismiss(event) {
                    if (!event || event.target.className.indexOf("popover") <= -1) {
                        $scope.submittalTypeFilterPopover.isOpen = false;
                        $scope.submittalTypeSelectedItems = angular.copy($scope.submittalTypeSelectedItemsFinal);
                    }
                }
            };

        function ApplyFilters() {
            var filterData = $scope.clonedOriginalData
					.filter(function (record) {
					    return ((record.divisionCode != null && $.inArray(record.divisionCode, $scope.divisionCodeSelectedItems) != -1) || $scope.divisionCodeSelectedItems.length == 0
							    || (record.divisionCode != null && $.inArray(record.divisionCode, $scope.divisionCodeSelectedItems) != -1))
						&& ((record.specNumber != null && $.inArray(record.specNumber, $scope.specSectionSelectedItems) != -1) || $scope.specSectionSelectedItems.length == 0
							    || (record.specNumber != null && $.inArray(record.specNumber, $scope.specSectionSelectedItems) != -1))
					    && ((record.columns[3].oldValue != null && $.inArray(record.columns[3].oldValue, $scope.submittalGroupsSelectedItems) != -1) || $scope.submittalGroupsSelectedItems.length == 0
					    		|| (record.columns[3].newValue != null && $.inArray(record.columns[3].newValue, $scope.submittalGroupsSelectedItems) != -1))
					    && ((record.columns[2].oldValue != null && $.inArray(record.columns[2].oldValue, $scope.submittalTypeSelectedItems) != -1) || $scope.submittalTypeSelectedItems.length == 0
					    		|| (record.columns[2].newValue != null && $.inArray(record.columns[2].newValue, $scope.submittalTypeSelectedItems) != -1));
					});

            $scope.myForm.$invalid = false;
            $scope.applyingFilters = false;
            $scope.filteredData = filterData;
            $scope.getRecordsCount($scope.filteredData);

            BuildGrid($scope.filteredData);
        }

        function getDistinctValues(data, field) {
            var values = [];
            data.forEach(function (item) {
                var founded = item.columns.filter(function (i) {
                    if (i.columnName == field) return i;
                });
                if (founded && founded.length > 0 && founded[0].oldValue && values.indexOf(founded[0].oldValue) <= -1) {
                    values.push(founded[0].oldValue);
                } else if(founded && founded.length > 0 && founded[0].newValue && values.indexOf(founded[0].newValue) <= -1){
                	values.push(founded[0].newValue);
                }
            });
            return values;
        }

        $scope.Cancel = function () {
          if ($scope.selectedRows && $scope.selectedRows.length > 0) {
              var message = "Your changes will be lost. Click Yes to continue.";
              var title = "Confirm";
              var yesText = "Yes";
              ModalService.OpenConfirmModal(title, message, false, yesText)
              .result.then(function () {
                    $uibModalInstance.close('Refresh');
              }, function() {});
          } else {
          	if($scope.closeDirtyFlag !== undefined && $scope.closeDirtyFlag === true)
                 $uibModalInstance.close('Refresh');
          	else
          		$uibModalInstance.dismiss('cancel');
          }
        };

        $scope.dismissPopOver = function (event) {
        	//This function will close all the unnecessary opened popovers and reset their values... This way is bad as this function will be triggered on every body click
        	//You can write alternative for this if you find any...
            if (!event || event.target.className.indexOf("submittalGroupsPopOver") <= -1) {
                $scope.submittalGroupFilterPopover.isOpen = false;
                $scope.submittalGroupsSelectedItems = angular.copy($scope.submittalGroupsSelectedItemsFinal);
            }
            if (!event || event.target.className.indexOf("divisionsPopOver") <= -1) {
            	$scope.divisionFilterPopover.isOpen = false;
            	vm.searchDivisionCodes = '';
                for (var index = 0; index < $scope.allDivisions.length; index++) {
                    if ($scope.divisionCodeSelectedItems.indexOf($scope.allDivisions[index].divisionCode) !== -1) {
                    	$scope.allDivisions[index].selected = true;
                    } else {
                    	$scope.allDivisions[index].selected = false;
                    }
                }
            }
            if (!event || event.target.className.indexOf("specSectionsPopOver") <= -1) {
                $scope.specSectionsFilterPopover.isOpen = false;
                vm.searchSpecSections = '';
                for (var index = 0; index < $scope.allSpecSections.length; index++) {
                    if ($scope.specSectionSelectedItems.indexOf($scope.allSpecSections[index].specSection) !== -1) {
                    	$scope.allSpecSections[index].selected = true;
                    } else {
                    	$scope.allSpecSections[index].selected = false;
                    }
                }
            }
            if (!event || event.target.className.indexOf("submittalTypePopover") <= -1) {
                $scope.submittalTypeFilterPopover.isOpen = false;
                $scope.submittalTypeSelectedItems = angular.copy($scope.submittalTypeSelectedItemsFinal);
            }
        }

        $scope.selectAll = function () {
            $scope.selectedAll = !$scope.selectedAll;
            if (!$scope.selectedAll) {
                $scope.selectedRows = [];
            }
            $scope.selectedTotalRecords = false;
            $scope.clonedOriginalData.forEach(function (item, index) {
            if ($.inArray(item.divisionCode, $scope.divisionCodeSelectedItems) != -1
            		&& $.inArray(item.specNumber, $scope.specSectionSelectedItems) != -1
            		&& $.inArray(item.columns[3].oldValue, $scope.submittalGroupsSelectedItems) != -1
            		&& ($.inArray(item.columns[2].oldValue, $scope.submittalTypeSelectedItems) != -1) || item.columns[2].oldValue === "") {
                    if (item.action == "D" || item.action == "U") {
                        item.selected = $scope.selectedAll;
                        $scope.selectedTotalRecords = true;
                    }
                }
            });
            //ApplyFilters();
        }

        $scope.selectRow = function (row) {
        	$scope.clonedOriginalData[row.entity.rowIndex].selected = row.entity.selected;
        	$scope.selectedTotalRecords = true;
        };

        $scope.move = function () {
        	$('#selectAllChkbx').prop('checked',false);
        	var count = 0;
        	if ($scope.selectedTotalRecords == true) {
      				$scope.clonedOriginalData.forEach(function(item, index) {
                if (item.selected === true && item.action !== "M") {
      						$scope.selectedRows.push(index);
      						count++;
      						item.action = "M";
      						item.selected = true;
      						item.columns.forEach(function(innerItem) {
      							innerItem.action = "N";
      							innerItem.newValue = innerItem.oldValue;
      						});
      					}
      				});

      				if (count > 0) {
      					$scope.pageDirty = true;
      				} else {
      					var items = {};
      					items.title = 'Alert';
      					items.message = "Please select at least one record to copy.";
      					ModalService.showAlertMessage(items);
      				}
      				ApplyFilters();
    			}
    			else {
    				var items = {};
    				items.title = 'Alert';
    				items.message = "There are no selected records to copy";
    				ModalService.showAlertMessage(items);
    			}
        }

        $scope.save = function (isExit) {
          $scope.saveDirty = 1;
        	if ($scope.pageDirty == true) {
                waitingDialog.show();
                $scope.copiedData = [];
                $scope.selectedRows.forEach(function (itemAsIndex) {
                    delete $scope.originalData[itemAsIndex].rowIndex;
                    delete $scope.originalData[itemAsIndex].selected;
                    $scope.copiedData.push($scope.originalData[itemAsIndex]);
                });
              ProjectService.CopySubmittlas($scope.project.projectId, $scope.selectedVersions[0].versionId, $scope.selectedVersions[1].versionId, $scope.copiedData, function (response) {
                    if (response.success) {
                    	var smartRegisterSearchData = [
            				{ field: 'source', caption: 'Version', value: $scope.selectedVersions[0].versionName, operator: 'is', type: 'text' }

            				];
                        $scope.originalData = angular.copy($scope.clonedOriginalData);
                        $scope.selectedRows = [];
                        $scope.pageDirty = false;
                        if (isExit) {

                        	$scope.closeDirtyFlag = true;
                            AuthenticationService.SetProject($scope.project);
                            AuthenticationService.SetVersion($scope.selectedVersions[1]);

                            existingFilter = AuthenticationService.UpdateFilterDataWithNewValuesAndVisibility(existingFilter, smartRegisterSearchData);
                            AuthenticationService.SetSmartRegisterFilter(existingFilter);
                            AuthenticationService.SetShowSaveSmartRegisterFilter(true);

                			$uibModalInstance.close('Refresh');
                            FlashService.SuccessWithTimeInterval(response.message, undefined, 20);
                            $scope.saveDirty = 0;
                        }
                        else {
	                        AuthenticationService.SetProject($scope.project);
	                        AuthenticationService.SetVersion($scope.selectedVersions[1]);

                        	existingFilter = AuthenticationService.UpdateFilterDataWithNewValuesAndVisibility(existingFilter, smartRegisterSearchData);
                            AuthenticationService.SetSmartRegisterFilter(existingFilter);
                            AuthenticationService.SetShowSaveSmartRegisterFilter(true);

	                        $scope.closeDirtyFlag = true;
	                        $scope.saveDirty = 0;
	                        updateRightGridRecordsCount($scope.originalData);
	                        FlashService.SuccessWithTimeInterval(response.message, undefined, 20);
                        }
                    } else {
                    	$scope.closeDirtyFlag = true;
                    	$scope.saveDirty = 0;
                        FlashService.Error(response.message);

                    }
                    waitingDialog.hide();
                });
            } else if (isExit) {
            	AuthenticationService.SetProject($scope.project);
                AuthenticationService.SetVersion($scope.selectedVersions[1]);

                existingFilter = AuthenticationService.UpdateFilterDataWithNewValuesAndVisibility(existingFilter, smartRegisterSearchData);
                AuthenticationService.SetSmartRegisterFilter(existingFilter);
                AuthenticationService.SetShowSaveSmartRegisterFilter(true);

                $uibModalInstance.close('Refresh');
                $scope.saveDirty = 0;
            }

        }

        $scope.reset = function () {
            indexingData($scope.originalData);
            $scope.clonedOriginalData = angular.copy($scope.originalData);
            $scope.selectedRows = [];
            $scope.pageDirty = false;
            $('#selectAllChkbx').prop('checked',false); //Unchecking the selectAll button using Jquery as it didn't work for angular way
            $scope.selectedAll = false;
            ApplyFilters();
        }
    }
})();

(function() {
	'use strict';

	angular.module('EventsApp').controller('CopySubmittalRecordViewController',
			CopySubmittalRecordViewController);

	CopySubmittalRecordViewController.$inject = [ '$scope', '$uibModalInstance',
			'records', 'selectedVersions' ];
	function CopySubmittalRecordViewController($scope, $uibModalInstance, records,
			selectedVersions) {

	    $scope.record = records;
		$scope.versions = selectedVersions;
		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
	}
})();
