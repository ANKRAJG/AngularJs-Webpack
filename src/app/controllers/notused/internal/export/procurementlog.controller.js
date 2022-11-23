
(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('ProcurementLogController', ProcurementLogController);

    ProcurementLogController.$inject = ['$scope','$rootScope', 'FlashService', 'ProcurementLogService', 'AuthenticationService', 'ModalService', '$log', 'SmartRegisterService',
                                        'UtilService', '$timeout','$window','$location'];
    function ProcurementLogController($scope,$rootScope, FlashService, ProcurementLogService, AuthenticationService, ModalService, $log, SmartRegisterService,
                                         UtilService, $timeout,$window,$location) {

        var vm = this;
//      vm.readonly = $rootScope.globals.userInfo.isReadonly;
        vm.readonly = false; 

        // Functions
        vm.saveProcureLogs = saveProcureLogs;
        vm.onToolbarColumnsClick = onToolbarColumnsClick;
        vm.canShowAddEditSmartColumns = canShowAddEditSmartColumns;
        vm.saveCustomColumns = saveCustomColumns;
        vm.openAddProcurementLogsSubmittalsPopup = openAddProcurementLogsSubmittalsPopup;
        vm.openProcurementLogPlanview = openProcurementLogPlanview;
        vm.openSchedulesInPlanView = openSchedulesInPlanView;

        (function initController() {
            LoadUserDetails();
            var project = AuthenticationService.GetProject();
            vm.procurementLogs = [];
            vm.MaxId = -1;
            getSelectedProject();
            vm.wrapTextFlag = AuthenticationService.getWrapTextFlag();
        })();

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function openAddProcurementLogsSubmittalsPopup(gridName) {
			$scope.$broadcast("openAddProcurementLogsSubmittalsPopup", gridName);
        }

        function addProcurementLogsAsSubmittals(records){
        	vm.dataLoading = "Adding procurement log items as submittals";
        	var changesets = [];
        	records.forEach(function(item){
        		changesets.push({record:item,actions:["ADD_TO_SMARTREGISTER"]})
        	});
        	ProcurementLogService.saveProcurementLogs(vm.selectedVersion.versionId,changesets,function(response){
        		if(response.success){
        			FlashService.Success("Successfully added procurement logs as submittals")
        			vm.procurementLogs = response.data.records;
                    vm.procurementLogs.forEach(function(item) { item.recid = item.serialNumber; });
                    $timeout(function(){
                    	$scope.$broadcast("RebuildGrid", vm.procurementLogs);
                    },50);
        		}else{
        			FlashService.Error("Failed to add the procurement logs as submittals")
        		}
        		vm.dataLoading = false;
        	});
        }

        function canShowAddEditSmartColumns(){
        	return !checkAndShowDataShouldBeSavedMsg();
        }

        function checkAndShowDataShouldBeSavedMsg() {
            if ($rootScope.plDataDirty) {
                items.title = vm.unsavedChangesTitle;
                items.message = vm.unsavedChangesMessage;
                showWarningMessagePopup(items);
                return true;
            }
            return false;
        }

        function getSelectedProject() {
            var project = AuthenticationService.GetProject();
            if (project) {
				vm.dataLoading = "Loading Procurement Log... Please wait..";
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

                    // Chaining of Promises
                    ProcurementLogService.getAllSchedulesPromise(vm.selectedProject.projectId, vm.selectedVersion.versionId)
                    .then(function(response) {
                        setAllSchedules(response.data);
                        return ProcurementLogService.getMasterSpecDataPromise(vm.selectedProject.projectId);
                    })
                    .then(function(response) {
                        setMasterSpecData(response.data);
                        validateAndLoad(vm.selectedProject, vm.selectedVersion);
                    })
                    .catch(function(error) {
                        console.log("An error occured: " + error);
                        FlashService.Error('Failed to get Schedules OR Master Spec data');
                        validateAndLoad(vm.selectedProject, vm.selectedVersion);
                    });
                });
            }
        }

        function setAllSchedules(response) {
			vm.allSchedulesListForGrid = [];
			if (response.success) {
				if(response.data && response.data.schedstodivmap) {
                    var allSchedules = response.data.schedstodivmap;
					vm.allSchedulesListForGrid = allSchedules.map(function(item) {
						// loop through each items in item.refs if all schedules(with uuid) is required.
                        return { id: item.refs[0].scheduleUid, text: item.scheduletitle }
                    });
				}
            }
        }

        function setMasterSpecData(response) {
            vm.masterSpecCodes = [];
            vm.masterSpecNames = [];
            if (response && response.success) {
                if(response.data && response.data.length>0) {
                    response.data.forEach(function(item) {
                        vm.masterSpecCodes.push(item.specCode);
                        vm.masterSpecNames.push(item.specName);
                    });
                }
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

        function validateAndLoad(project, version) {
            if (project.isExpired && !vm.user.isSuperAdmin) {
                vm.dataLoading = false;
                vm.Selectedexpired = true;
                if (project.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    showUpgradePopup(project);
                } else if (project.subscriptionStatus.toUpperCase() !== 'TRIAL') {
                    showRenewPopup(project);
                }
            } else {
                LoadProcurementLogList(version.versionId);
            }
        }

        function prepareComboNListOptions() {
            vm.columns.forEach(function(item) {
                switch (item.field) {
                    case 'specNumber': {
                        item.editable = vm.readonly ? false : { type: 'combo', showAll: true, items: vm.masterSpecCodes };
                        break;
                    } case 'specName': {
                        item.editable = vm.readonly ? false : { type: 'combo', showAll: true, items: vm.masterSpecNames };
                        break;
                    } case 'scheduleName': {
                        item.editable = vm.readonly ? false : { type: 'combo', showAll: true, items: vm.allSchedulesListForGrid };
                        break;
                    } default:
                        //do nothing
                }
            });
        }

        function SetGridDefaults() {
            vm.search = [
				{ field: 'serialNumber', caption: 'S. No', type: 'text' },
                { field: 'sheetNumber', caption: 'Sheet Number', type: 'text', hidden: true },
                { field: 'sheetName', caption: 'Sheet Name', type: 'text', hidden: true },
                { field: 'specNumber', caption: 'Spec Section', type: 'text' },
                { field: 'specName', caption: 'Spec Name', type: 'text', hidden: true },
                { field: 'scheduleName', caption: 'Schedule Name', type: 'text', hidden: true },
				{ field: 'description', caption: 'Material Description', type: 'text', hidden: true }
            ];

            var smartRegisterColumns = [
                { field: 'serialNumber', caption: 'S. No', tooltip: 'Serial Number', sortable: true, size: UtilService.GetColumnWidthsInPixels(4), resizable: true, editable: false },
                { field: 'sheetNumber', caption: 'Sheet #', sortable: true, size: UtilService.GetColumnWidthsInPixels(6), resizable: true, tooltip: 'Sheet Number', editable: false },
                { field: 'sheetName', caption: 'Sheet Name', sortable: true, size: UtilService.GetColumnWidthsInPixels(14), resizable: true, tooltip: 'Sheet Name', editable: false },
                { field: 'specNumber', caption: 'Spec Section', sortable: true, size: UtilService.GetColumnWidthsInPixels(7), resizable: true, tooltip: 'Spec Number', editable: vm.readonly ? false : { type: 'combo' } },
				{ field: 'specName', caption: 'Spec Name', sortable: true, size: UtilService.GetColumnWidthsInPixels(14), resizable: true, tooltip: 'Spec Name', editable: vm.readonly ? false : { type: 'combo' } },
				{ field: 'scheduleName', caption: 'Schedule Name', sortable: true, size: UtilService.GetColumnWidthsInPixels(12), resizable: true, tooltip: 'Schedule Name', editable: vm.readonly ? false : { type: 'combo' },
					render: function(record, index, col_index) {
                        var updatedScheduleName = this.getCellValue(index, col_index);
						// we are using coordinates to differentiate between a manually added item and items which are extracted from PDF.
						if(record.coordinates && record.coordinates.length > 0) {
							return '<img src="images/plans.png" class="m-t0 m-r0 pull-left w-18 pos-t2 pos-r1 hide" title="Added via Schedule"/><a class="handCursor pos-t3 text-restricted" title="Go to planview" onclick="openProcurementLogPlanview(' +record.id+ ')">' + updatedScheduleName + '</a>';
						} else {
							return '<img src="images/pl-manual-add.png" width="18px" class="m-r3 hide" title="Added Manually"><span class="pos-t2" title="' + updatedScheduleName + '">' + updatedScheduleName + '</span>';
						}
				    }
	            },
				{ field: 'description', caption: 'Material Description', tooltip: 'Material Description', sortable: true, size: UtilService.GetColumnWidthsInPixels(40), resizable: true, editable: vm.readonly ? false : { type: 'textarea' },
                    render: function(record, index, col_index) {
                        var updatedDescription = this.getCellValue(index, col_index);
                        if(record.addedToSmartRegister && record.submittalTypes) {
                        	var submittalTypes = record.submittalTypes.join();
                            return '<div class="pypeLink pull-left added-plgrid"><img src="images/smart-register-icons.png" title="Added as '+submittalTypes+'" class="al-addedpl w-16"><span class="al-addedpldescr">'+ updatedDescription + '</span></div>';
                        } else {
                            return '<div class="pypeLink pull-left added-plgrid"><span class="al-addedpldescr" title=\'' + updatedDescription + '\'>' + updatedDescription + '</span></div>';
                        }
                    }
                }
            ];

            SmartRegisterService.initSmartColumns(vm.smartColumns, smartRegisterColumns);
            var columns = AuthenticationService.GetProcurementLogColumns();
            if(columns) {
            	SmartRegisterService.updateStoredColumns(columns, smartRegisterColumns);
                var descriptionRender = '', scheduleNameRender = '';
                smartRegisterColumns.forEach(function (data) {
                    if (data.field === 'description') {
						descriptionRender = data.render;
					}
                    if(data.field === 'scheduleName'){
                    	scheduleNameRender = data.render;
                    }
                });

                for (var i = 0; i < columns.length; i++) {
                    if (columns[i].field === 'description') {
                        columns[i].render = angular.copy(descriptionRender);
                    }
                    if (columns[i].field === 'scheduleName') {
                        columns[i].render = angular.copy(scheduleNameRender);
                    }
                }
                vm.columns = columns;
            } else {
            	vm.columns = smartRegisterColumns;
            }
            vm.sortData = AuthenticationService.GetPLSortData();
            if (!vm.sortData) {
                vm.sortData = [{field: "specNumber", direction: "asc"}];
            }

            // Prepare suggestion list for fields
            prepareComboNListOptions();
        }

        function LoadProcurementLogList(versionId) {
            vm.dataLoading = "Loading Procurement Log... Please wait..";
            ProcurementLogService.getProcurementLogs(versionId, function(response) {
                if(response.success) {
                    vm.MaxId = 0;
                    if (response.data && response.data.records) {
                        vm.procurementLogs = response.data.records;
                        vm.procurementLogs.forEach(function(item) { item.recid = item.serialNumber; });
                        if (vm.procurementLogs.length > 0) {
                            vm.MaxId = calculateAndSetMaxID(vm.procurementLogs);
                        }
                        ProcurementLogService.prepareAndSetSmartColumns(vm, vm.procurementLogs, response.data.smartColumnsContainer);
                    }
                    SetGridDefaults();
                    $timeout(function(){
                    	$scope.$broadcast("RebuildGrid", vm.procurementLogs);
                    }, 50);
                } else {
                    FlashService.Error('Failed to get Procurement logs');
                }
                $scope.$emit('updatedPLMaxRecId', vm.MaxId);
                vm.dataLoading = false;
            });
        }

        function saveCustomColumns(columnSaveData) {
        	vm.dataLoading = "Saving Custom columns...";
			vm.smartColumnsContainer = vm.smartColumnsContainer || {};
			vm.smartColumnsContainer.smartColumns = columnSaveData.smartColumnsRows;
			ProcurementLogService.saveSmartColumns(vm.selectedVersion.versionId, vm.smartColumnsContainer, !!columnSaveData.saveAtProject, !!columnSaveData.saveAtCompany, function(response) {
				if(response.success) {
                    FlashService.Success(response.message);
					vm.dataLoading = response.message + "... Loading Procurement Log...";
					LoadProcurementLogList(vm.selectedVersion.versionId);
				}
				else {
                    FlashService.Error(response.message);
				}
			});
        }

        function saveProcureLogs() {
            EmptyStackData();
            var changesSet = prepareChangeSet();

            if(changesSet.length > 0) {
                vm.dataLoading = "Saving Procurement Log... Please wait..";
                ProcurementLogService.saveProcurementLogs(vm.selectedVersion.versionId, changesSet, function(response) {
                    if(response.success) {
                        vm.MaxId = 0;
                        if (response.data && response.data.records) {
                            vm.procurementLogs = response.data.records;
                            vm.procurementLogs.forEach(function(item) { item.recid = item.serialNumber; });
                            if (vm.procurementLogs.length > 0) {
                                vm.MaxId = calculateAndSetMaxID(vm.procurementLogs);
                            }
                        }
                        SetGridDefaults();
                        ProcurementLogService.prepareAndSetSmartColumns(vm, vm.procurementLogs, response.data.smartColumnsContainer);
                        $timeout(function(){
                        	$scope.$broadcast("RebuildGrid", vm.procurementLogs);
                        },0);
                        $rootScope.plDataDirty = false;
                        vm.pLogChanged = false;
                        FlashService.Success('Updated Procurement log successfully');
                    } else {
                        FlashService.Error('Failed to update Procurement log');
                    }
                    $scope.$emit('updatedPLMaxRecId', vm.MaxId);
                    vm.dataLoading = false;
                });
            } else {
                SetGridDefaults();
                $scope.$broadcast("RebuildGrid", vm.procurementLogs);
                $rootScope.plDataDirty = false;
                vm.pLogChanged = false;
            }
        }

        function prepareChangeSet() {
            var record, changesSet = [], ignoredRecids = [];
            var sortDataFields = UtilService.getSortDataFieldNames(vm.sortData);
            for (var index = 0; index < vm.procurementLogs.length ; index++) {
                record = angular.copy(vm.procurementLogs[index]);
                if(record.changes && !record.isDeletedRecord) {
                    for (var change in record.changes) {
                        record[change] = record.changes[change];
                        if (sortDataFields.indexOf(change) > -1) { //If the changed data is related to any column which is currently sorted then
                            UtilService.removeSortDataColumn(vm.sortData, change); //Remove the sorting for that specific column to make sure that it will not go to some other place
                        }
                    }
                    ProcurementLogService.setSmartColumnValuesOnRecord(vm.smartColumns, record, record, false, true);
                    if(!record.isNewRecord) {
                        changesSet.push({ record: record, actions: ['UPDATE'] });
                    }
                }
                if(record.isNewRecord && !record.isDeletedRecord) {
                    if (record.changes && record.changes.sourceRecId) {
                        changesSet.push({ record: record, actions: ['COPY'] });
                    } else {
                    	record.specName = record.specName ? record.specName.toUpperCase() : '';
                        changesSet.push({ record: record, actions: ['CREATE'] });
                    }
                }

                if(record.isDeletedRecord && !record.isNewRecord && (!record.changes || (record.changes && record.recid<=vm.MaxId))) {
                    changesSet.push({ record: record, actions: ['DELETE'] });
                }

                if((record.isDeletedRecord && record.isNewRecord) || (record.isDeletedRecord && record.changes && record.recid>vm.MaxId)) {
                    ignoredRecids.push(record.recid);
                }
            }
            AuthenticationService.SetPLSortData(vm.sortData);

            var plColumns = ['id','serialNumber','pdfFileName','pdfPageNumber','sheetNumber','sheetName','coordinates','specName','specNumber','scheduleUid','scheduleName','description','addedToSmartRegister','submittalType','createdTime','updatedTime','code'];
            changesSet = ProcurementLogService.getFilteredRecordObject(changesSet, plColumns);

            vm.procurementLogs = vm.procurementLogs.filter(function(record) {
                return ignoredRecids.indexOf(record.recid) <= -1;
            });
            return changesSet;
        }

        $scope.$watch('vm.columns', function (newCol, oldCol) {
            if (newCol) {
                AuthenticationService.SetProcurementLogColumns(newCol);
            }
        }, true);

        vm.setSmartGrid = function(g) {
        	vm.smartRegisterGrid = g;
        }

        vm.columnDropdownIsOpen = false;
        function onToolbarColumnsClick(e) {
        	// Disable the columns button and show our custom dropdown
        	$timeout(function() {
    			vm.columnDropdownIsOpen = !vm.columnDropdownIsOpen;
			},10);
        	return true;
        }

        function calculateAndSetMaxID(pLogs) {
            var highest = 0;
            $.each(pLogs, function (key, plog) {
                if (plog.recid > highest) highest = plog.recid;
            });
            return highest;
        }

        function showUpgradePopup(project) {
            ModalService.showUpgradePopup(project)
            .result.then(function(data) {
                vm.modalTitle = 'Upgrade Project';
                Upgrade(project.name);
            });
        }

        function Upgrade(projectName) {
            var upgradeItems = PopulatingUserDetails(projectName);
            ModalService.showContactUsPopup(upgradeItems);
        }

        function showRenewPopup(project) {
            ModalService.showRenewPopup(project)
            .result.then(function(data) {
                vm.modalTitle = 'Renew Project';
                Renew(project.name);
            });
        }

        function Renew(projectName) {
            var renewItems = PopulatingUserDetails(projectName);
            renewItems.RequestType = "Renew project for " + projectName;
            ModalService.showRenewProjectPopup(renewItems);
        }

        $scope.setGridEvents = function (reloadEvent) {
            $scope.gridReload = reloadEvent;
        };

        $scope.$on('DataChanged', function (event, data) {
        	dataChanged();
        });

        function dataChanged(){
            vm.pLogChanged = true;
            $timeout(function () {
                $scope.$apply(function () {
                    $rootScope.plDataDirty = true;
                });
            });
        }

        $scope.$on('DataReset', function (event, data) {
            vm.pLogChanged = false;
            $timeout(function () {
                $scope.$apply(function () {
                    $rootScope.plDataDirty = false;
                });
            });
        });

        vm.GoBackToPreviousStep = function() {
            $scope.$broadcast("UndoPreviousStep", true);
        }

        vm.showUndoConfirmation = function(message) {
            ModalService.OpenConfirmModal('Undo changes?', message)
			.result.then(function () {
				undoChanges();
            }, function() {});
        }

        function undoChanges() {
            EmptyStackData();
            LoadProcurementLogList(vm.selectedVersion.versionId);
            $rootScope.plDataDirty = false;
            vm.pLogChanged = false;
        }

        function EmptyStackData() {
            $scope.$broadcast("EmptyStackData", true);
        }

        $window.onbeforeunload = function (event) {
            if ($rootScope.plDataDirty) {
                return true;
            }
        };

        $scope.$on('addProcurementLogsAsSubmittals', function (event, data) {
        	addProcurementLogsAsSubmittals(data.records);
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

        vm.wrapTextToogle = function(gridName) {
			vm.dataLoading = "Loading...Please wait";
			AuthenticationService.setWrapTextFlag(vm.wrapTextFlag);
			$timeout(function() {
				$scope.$broadcast("RebuildGrid", vm.procurementLogs);
				vm.dataLoading = false;
			}, 250);
		}
        function openProcurementLogPlanview(id){
        	var record = vm.procurementLogs.filter(function( item ) { return item.id === id; })[0];
	       	if(record){
		        var accProject = AuthenticationService.GetACCProject();
	       		AuthenticationService.SetPlanViewRecordData(record);
		       	AuthenticationService.SetPlanViewSheetData({page : {filename: record.pdfFileName, pagenumber_i : record.pdfPageNumber}});
		       	AuthenticationService.SetPlanViewView('ProcurementLog');
		       	AuthenticationService.setSmartViewType('planview');
                $location.path('/smartview/projects/' + accProject.id);
	       	}
        }

        function openSchedulesInPlanView(){
	        var accProject = AuthenticationService.GetACCProject();
	       	AuthenticationService.SetPlanViewView('Schedule');
	       	AuthenticationService.setSmartViewType('planview');
            $location.path('/smartview/projects/' + accProject.id);
        }


    }
})();

function openProcurementLogPlanview(record){
	 angular.element(document.getElementById('element')).scope().vm.openProcurementLogPlanview(record);
}
