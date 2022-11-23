(function() {
	'use strict';

	angular.module('EventsApp').controller(
			'CompareSmartRegisterController', CompareSmartRegisterController);

	CompareSmartRegisterController.$inject = [ '$scope', '$rootScope', '$uibModalInstance',
			'ProjectService', 'FlashService', 'category', 'project',
			'versions', '$timeout', '$uibModal', 'MAINURL', 'PDFJSURL',
			'APIURL', '$http', '$templateCache', 'AuthenticationService','SmartRegisterService','ExportService', 'DownloadService'];
	function CompareSmartRegisterController($scope, $rootScope, $uibModalInstance,
			ProjectService, FlashService, category, project, versions,
			$timeout, $uibModal, MAINURL, PDFJSURL, APIURL, $http,
			$templateCache, AuthenticationService,SmartRegisterService,ExportService, DownloadService) {

		(function() {
			$scope.category = category;
			$scope.project = project;
			$scope.selectedVersions = versions;
			$scope.smartregister = [];
			$scope.selectedOption = 'showAll';
			GetDiffData(project, $scope.selectedVersions[0], $scope.selectedVersions[1], $scope.category);
			$scope.selectedRows = [];
		})();

		function BuildGrid(data) {
			var getCellTemplate = function(record) {

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
						name : 'action',
						displayName : '',
						width : 26,
						headerTooltip : true,
						cellTemplate: '<div class="ui-grid-cell-contents" title="{{row.entity.action == \'D\'?\'Deleted\':row.entity.action == \'U\'?\'Modified\':\'\'}}"><span></span></div>',
						cellClass : function(grid, row, col, rowRenderIndex,
								colRenderIndex) {
							if (row.entity.action === 'D') {
								return 'redBackground';
							} else if (row.entity.action === 'U') {
								return 'yellowCellBackground';
							}
						}
					},
					{
						name : 'pdfPageNumber',
						displayName : 'Spec PDF',
						width : 50,
						headerTooltip : true,
						cellTemplate : '<div class="ui-grid-cell-contents text-center"><a ng-if="row.entity.action !== \'I\'" ng-click="grid.appScope.leftpdfClicked(row.entity);">'
							+ '<i class="spec-logo pos-b1 pos-r3"></i></a></div>'
					},
					{
						name : 'specNumber',
						displayName : 'Spec section',
						width : 100,
						headerTooltip : true,
						cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{row.entity.specNumber}}</span></div>'
					},
					{
						name : 'paraCode',
						displayName : 'Spec sub section',
						width : 75,
						headerTooltip : true,
						cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{row.entity.paraCode}}</span></div>'
					},
					{
						name : 'columns[2].oldValue',
						displayName : 'Submittal type',
						width : 200,
						headerTooltip : true,
						cellClass : function(grid, row, col, rowRenderIndex,
								colRenderIndex) {
							if (row.entity.columns[2].action === 'U') {
								return 'yellowCellBackground';
							}
						}
					},
					{
						name : 'columns[1].oldValue',
						displayName : 'Submittal description',
						width : 400,
						headerTooltip : true,
						cellClass : function(grid, row, col, rowRenderIndex,
								colRenderIndex) {
							if (row.entity.columns[1].action === 'U') {
								return 'yellowCellBackground';
							}
						}
					},
					{
						name : 'specName',
						displayName : 'Spec name',
						width : 200,
						headerTooltip : true,
						cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{row.entity.specName}}</span></div>'
					},
					{
						name : 'columns[0].oldValue',
						displayName : 'Submittal group',
						width : 200,
						headerTooltip : true,
						cellClass : function(grid, row, col, rowRenderIndex,
								colRenderIndex) {
							if (row.entity.columns[0].action === 'U') {
								return 'yellowCellBackground';
							}
						}
					} ];

			var columns2 = [
					{
						name : 'action',
						displayName : '',
						width : 26,
						headerTooltip : true,
						cellTemplate : '<div class="ui-grid-cell-contents" title="{{row.entity.action == \'I\'?\'Added\':row.entity.action == \'U\'?\'Modified\':\'\'}}"><span></span></div>',
						cellClass : function(grid, row, col, rowRenderIndex,
								colRenderIndex) {
							if (row.entity.action === 'I') {
								return 'greenBackground';
							} else if (row.entity.action === 'U') {
								return 'yellowCellBackground';
							}
						}
					},
					{
						name : 'pdfPageNumber',
						displayName : 'Spec PDF',
						width : 50,
						headerTooltip : true,
						cellTemplate :  '<div class="ui-grid-cell-contents text-center"><a ng-if="row.entity.action !== \'D\'" ng-click="row.entity.action !== \'D\' && grid.appScope.rightpdfClicked(row.entity);">'
								+ '<i class="spec-logo pos-b1 pos-r3" ></i></a></div>'
					},
					{
						name : 'specNumber',
						displayName : 'Spec section',
                        width : 100,
						headerTooltip : true,
						cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'D\'\">{{row.entity.specNumber}}</span></div>'
					},
					{
						name : 'paraCode',
						displayName : 'Spec sub section',
						width : 75,
						headerTooltip : true,
						cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'D\'\">{{row.entity.paraCode}}</span></div>'
					},
					{
						name : 'columns[2].newValue',
						displayName : 'Submittal type',
						width : 200,
						headerTooltip : true,
						cellClass : function(grid, row, col, rowRenderIndex,
								colRenderIndex) {
							if (row.entity.columns[2].action === 'U') {
								return 'yellowCellBackground';
							}
						}
					},
					{
						name : 'columns[1].newValue',
						displayName : 'Submittal description',
						width : 400,
						headerTooltip : true,
						cellClass : function(grid, row, col, rowRenderIndex,
								colRenderIndex) {
							if (row.entity.columns[1].action === 'U') {
								return 'yellowCellBackground';
							}
						}
					},
					{
						name : 'specName',
						displayName : 'Spec name',
						width : 200,
						headerTooltip : true,
						cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'D\'\">{{row.entity.specName}}</span></div>'
					},
					{
						name : 'columns[0].newValue',
						displayName : 'Submittal group',
						width : 200,
						headerTooltip : true,
						cellClass : function(grid, row, col, rowRenderIndex,
								colRenderIndex) {
							if (row.entity.columns[0].action === 'U') {
								return 'yellowCellBackground';
							}
						}
					} ];

			$scope.gridOptions1 = {
				data : data,
				columnDefs : columns1,
				enableColumnMenus : false,
				rowTemplate : '<div ng-click="grid.appScope.rowClicked(row,col,colRenderIndex)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="col.colIndex()" ui-grid-cell></div>'
			};

			$scope.gridOptions2 = {
				data : data,
				columnDefs : columns2,
				enableColumnMenus : false,
				rowTemplate : '<div ng-click="grid.appScope.rowClicked(row,col,colRenderIndex)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="col.colIndex()" ui-grid-cell></div>'
			};
		}

		$scope.SwitchVersions = function() {
			var versions = angular.copy($scope.selectedVersions);
			$scope.selectedVersions[0] = angular.copy(versions[1]);
			$scope.selectedVersions[1] = angular.copy(versions[0]);
			GetDiffData(project, $scope.selectedVersions[0],
					$scope.selectedVersions[1], $scope.category);
		}

		$scope.rowClicked = function(row, col, ind) {
			$scope.clickedRecord = row.uid;
			if (col.field !== "pdfPageNumber")
				showRowDifferencesPopup(row.entity);
		}

		$scope.rowHovered = function(row) {
			$scope.hoveredRecord = row;
		}

		$scope.rowHoverRemoved = function() {
			// Remove the hover index when user removes the mouse from
			// particular record
			$scope.hoveredIndex = -1;
		}

		$scope.leftpdfClicked = function(record) {
			if(record.sourceModule && ['plans', 'procurementlog'].indexOf(record.sourceModule.toLowerCase())>-1) {
        		openPlanPDF(record);
        	} else {
				var recordCopy = angular.copy(record);
				recordCopy.serialNumber = record.firstVersionSerialNumber;
				DownloadService.openSpecPdf(recordCopy, 50, null, null, $scope.selectedVersions[0]);
        	}
		}

		$scope.rightpdfClicked = function(record) {
			if(record.sourceModule && ['plans', 'procurementlog'].indexOf(record.sourceModule.toLowerCase())>-1) {
        		openPlanPDF(record);
        	} else {
				var recordCopy = angular.copy(record);
				recordCopy.serialNumber = record.secondVersionSerialNumber;
				DownloadService.openSpecPdf(recordCopy, 650, null, null, $scope.selectedVersions[1]);
        	}
		}

		function openPlanPDF(record) {
            AuthenticationService.SetPlanViewRecordData(record);
        	AuthenticationService.SetPlanViewSheetData({file : { sheettype_s: record.drawingSheetType}, page : {filename: record.drawingFileName, pagenumber_i : record.drawingPageNumber}});
			AuthenticationService.setSmartViewType('planview');
			AuthenticationService.SetPlanViewView(null);
            ExportService.openNewWindow('smartview?openmode=openplanspdf', 630, 605);
        }

		function showRowDifferencesPopup(data) {
			var modalInstance2 = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/smartregister/submittals/compare.smartregister.record.view.html?version=9.0',
						size : 'xl',
						controller : 'CompareRecordsController',
						resolve : {
							records : function() {
								return data
							},
							selectedVersions : function() {
								return $scope.selectedVersions
							}
						}
					});
			modalInstance2.result.then(function(data) {
			}, function() {
			});
		}

		function GetDiffData(project, firstVersion, secondVersion, category) {
			waitingDialog.show();
			ProjectService.GetVersionDiffData(project.projectId, firstVersion.versionId, secondVersion.versionId, category,
					function(response) {
						if (response.success) {
							if (response.data !== null && response.data.submittalRecords && response.data.submittalRecords.length > 0) {
							    $scope.finalSet = response.data;
							    $scope.originalData = response.data.submittalRecords;
                  $scope.clonedOriginalData = angular.copy($scope.originalData);
                  PrepareObjectsBasedOnActions($scope.clonedOriginalData);
							} else {
								FlashService
										.Error("Selected versions do not contain data. Please select a different version.");
								$scope.Cancel();
							}
						} else {
							FlashService.Error(response.message);
						}
						waitingDialog.hide();
					});
		}

		$scope.GetExcelDiffByCategory = function() {
			$scope.dataLoading = true;
			waitingDialog.show();
			SmartRegisterService.DownLoadExcelDifferencesByCategory(
					project.projectId, versions[0].versionId,
					versions[1].versionId, category, function(response) {
						if (response.success) {
							FlashService.Success(response.message);
							$scope.dataLoading = false;
						} else {
							FlashService.Error(response.message);
							$scope.dataLoading = false;
						}
						waitingDialog.hide();
					});

		}

		function PrepareObjectsBasedOnActions(data) {
			var all = data, onlyDiff = [], add = [], del = [], modified = [];
			for (var i = 0; i < data.length; i++) {
			    data[i].rowIndex = i;
				if (data[i].action === 'I') {
					onlyDiff.push(data[i]);
					add.push(data[i]);
				} else if (data[i].action === 'D') {
					onlyDiff.push(data[i]);
					del.push(data[i]);
				} else if (data[i].action === 'U') {
					onlyDiff.push(data[i]);
					modified.push(data[i]);
				}
			}
			$scope.all = all;
			$scope.onlyDiff = onlyDiff;
			$scope.add = add;
			$scope.del = del;
			$scope.modified = modified;
			$scope.ChangeDataObject();
		}

		$scope.ChangeDataObject = function(option) {
			var data = $scope.all;
			$scope.LeftGridRecords = $scope.finalSet.deletedRecordCount
					+ $scope.finalSet.updatedRecordCount
					+ $scope.finalSet.unchangedRecordCount;
			$scope.RightGridRecords = $scope.finalSet.addedRecordCount
					+ $scope.finalSet.updatedRecordCount
					+ $scope.finalSet.unchangedRecordCount;
			if (option !== undefined) {
				$scope.selectedOption = option;
			}
			switch ($scope.selectedOption) {
			case 'showOnlyDiff': {
				data = $scope.onlyDiff;
				$scope.LeftGridRecords = $scope.finalSet.deletedRecordCount
						+ $scope.finalSet.updatedRecordCount;
				$scope.RightGridRecords = $scope.finalSet.addedRecordCount
						+ $scope.finalSet.updatedRecordCount;
				break;
			}
			case 'showAdd': {
				data = $scope.add;
				$scope.LeftGridRecords = 0;
				$scope.RightGridRecords = $scope.finalSet.addedRecordCount;
				break;
			}
			case 'showDelete': {
				data = $scope.del;
				$scope.LeftGridRecords = $scope.finalSet.deletedRecordCount;
				$scope.RightGridRecords = 0;
				break;
			}
			case 'showUpdate': {
				data = $scope.modified;
				$scope.LeftGridRecords = $scope.finalSet.updatedRecordCount;
				$scope.RightGridRecords = $scope.finalSet.updatedRecordCount;
				break;
			}
			default: {
				data = $scope.all;
				$scope.LeftGridRecords = $scope.finalSet.deletedRecordCount
						+ $scope.finalSet.updatedRecordCount
						+ $scope.finalSet.unchangedRecordCount;
				$scope.RightGridRecords = $scope.finalSet.addedRecordCount
						+ $scope.finalSet.updatedRecordCount
						+ $scope.finalSet.unchangedRecordCount;
			}
			}
			BuildGrid(data);
		}

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};

		$scope.selectRow = function (row) {
		    debugger;
		    var index = $scope.selectedRows.indexOf(row.entity.rowIndex);
		    if (index <= -1)
		        $scope.selectedRows.push(row.entity.rowIndex);
		    else
		        $scope.selectedRows.splice(index, 1);
		};

		$scope.move = function () {
		    $scope.selectedRows.forEach(function (index) {
		        var rec = $scope.clonedOriginalData[index];
		        if (rec.action != "N") {
		            rec.action = "N";
		            rec.selected = false;
		            rec.columns.forEach(function (item) {
		                item.action = "N";
		                item.newValue = item.oldValue;
		            });
		        }
		    });

		    PrepareObjectsBasedOnActions($scope.clonedOriginalData);
		}

		$scope.save = function () {
		    $scope.originalData = angular.copy($scope.clonedOriginalData);
		    $scope.selectedRows = [];
		}

		$scope.reset = function () {
		    $scope.clonedOriginalData = angular.copy($scope.originalData);
		    $scope.selectedRows = [];
		    PrepareObjectsBasedOnActions($scope.clonedOriginalData);
		}

	}
})();

(function() {
	'use strict';

	angular.module('EventsApp').controller('CompareRecordsController',
			CompareRecordsController);

	CompareRecordsController.$inject = [ '$scope', '$uibModalInstance',
			'records', 'selectedVersions' ];
	function CompareRecordsController($scope, $uibModalInstance, records,
			selectedVersions) {
		$scope.record = records;
		$scope.versions = selectedVersions;
		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
	}
})();
