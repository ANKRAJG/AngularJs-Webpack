(function() {
	'use strict';

	angular.module('EventsApp').controller(
			'CompareSpecSectionSubmittalsController', CompareSpecSectionSubmittalsController);

	CompareSpecSectionSubmittalsController.$inject = [ '$scope', '$uibModalInstance', 'ProjectService', 'FlashService', 'items',
		'$uibModal', 'MAINURL', 'AuthenticationService', 'DownloadService', 'ExportService'];
	function CompareSpecSectionSubmittalsController($scope, $uibModalInstance, ProjectService, FlashService, items,
			$uibModal, MAINURL, AuthenticationService, DownloadService, ExportService) {

		(function() {
			$scope.step = 'compareSubmittals';
			$scope.items = angular.copy(items);
			$scope.specNumber = $scope.items.specNumber;
			$scope.version = $scope.items.version;
			$scope.addendum = $scope.items.addendum;
			$scope.projectId = $scope.items.projectId;
			$scope.data = $scope.items.data;
			BuildGrid($scope.data);
		})();

		function GetDiffData(version, addendum, specNumber){
			ProjectService.GetAddendumDiffData(specNumber, addendum.addendumId, version.versionId, function(response) {
				if (response.success) {
					if (response.data !== null && response.data.submittalRecords && response.data.submittalRecords.length > 0) {
					    $scope.finalSet = response.data;
					    $scope.originalData = response.data.submittalRecords;
                        $scope.clonedOriginalData = angular.copy($scope.originalData);
						BuildGrid(response.data);
						$scope.dataLoading = false;
					} else {
						$scope.Cancel();
						$scope.dataLoading = false;
					}
					waitingDialog.hide();
				} else {
					waitingDialog.hide();
					FlashService.Error(response.message);
					$scope.dataLoading = false;
				}
			});
		}

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};

		function BuildGrid(data) {
			var getCellTemplate = function(record) {
				if (record.specNumber && record.specNumber.indexOf('_revised_') > -1) {
					var specNumber = record.specNumber.slice(0,
							record.specNumber.indexOf('_revised_'));
					return '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{specNumber}}</span></div>';
				}
				return '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{record.specNumber}}</span></div>';
			};
			var columns1 = [{
				name : 'pdfPageNumber',
				displayName : 'Spec PDF',
				width : 75,
				headerTooltip : true,
				cellTemplate : '<div class="ui-grid-cell-contents text-center"><a ng-if="row.entity.action !== \'I\'" ng-click="grid.appScope.leftpdfClicked(row.entity);">'
					+ '<i class="spec-logo pos-b4 m-l5"></i></a></div>'
			}, {
				name : 'specNumber',
				displayName : 'Spec section',
				width : 100,
				headerTooltip : true,
				cellTemplate : '<div class="ui-grid-cell-contents" title="{{row.entity.action == \'D\'?\'Deleted\':row.entity.action == \'U\'?\'Modified\':\'\'}}"><span ng-if=\"row.entity.action !== \'I\'\">{{row.entity.specNumber}}</span></div>',
				cellClass : function(grid, row, col, rowRenderIndex, colRenderIndex) {
					if (row.entity.action === 'D') {
						return 'redBackground';
					} else if (row.entity.action === 'U') {
						return 'yellowBackground';
					}
				}
			}, {
				name : 'paraCode',
				displayName : 'Spec sub section',
				width : 75,
				headerTooltip : true,
				cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{row.entity.paraCode}}</span></div>'
			}, {
				name : 'columns[2].oldValue',
				displayName : 'Submittal type',
				width : 200,
				headerTooltip : true,
				cellClass : function(grid, row, col, rowRenderIndex, colRenderIndex) {
					if (row.entity.columns[2].action === 'U') {
						return 'yellowBackground';
					}
				}
			}, {
				name : 'columns[1].oldValue',
				displayName : 'Submittal description',
				width : 400,
				headerTooltip : true,
				cellClass : function(grid, row, col, rowRenderIndex, colRenderIndex) {
					if (row.entity.columns[1].action === 'U') {
						return 'yellowBackground';
					}
				}
			}, {
				name : 'specName',
				displayName : 'Spec name',
				width : 200,
				headerTooltip : true,
				cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'I\'\">{{row.entity.specName}}</span></div>'
			}, {
				name : 'columns[0].oldValue',
				displayName : 'Submittal group',
				width : 200,
				headerTooltip : true,
				cellClass : function(grid, row, col, rowRenderIndex, colRenderIndex) {
					if (row.entity.columns[0].action === 'U') {
						return 'yellowBackground';
					}
				}
			}];

			var columns2 = [{
				name : 'pdfPageNumber',
				displayName : 'Spec PDF',
				width : 75,
				headerTooltip : true,
				cellTemplate :  '<div class="ui-grid-cell-contents text-center"><a ng-if="row.entity.action !== \'D\'" ng-click="row.entity.action !== \'D\' && grid.appScope.rightpdfClicked(row.entity);">'
						+ '<i class="spec-logo pos-b4 m-l5" ></i></a></div>'
			}, {
				name : 'specNumber',
				displayName : 'Spec section',
                width : 100,
				headerTooltip : true,
				cellTemplate : '<div class="ui-grid-cell-contents" title="{{row.entity.action == \'I\'?\'Added\':row.entity.action == \'U\'?\'Modified\':\'\'}}"><span ng-if=\"row.entity.action !== \'D\'\">{{row.entity.specNumber}}</span></div>',
				cellClass : function(grid, row, col, rowRenderIndex, colRenderIndex) {
					if (row.entity.action === 'I') {
						return 'greenBackground';
					} else if (row.entity.action === 'U') {
						return 'yellowBackground';
					}
				}
			}, {
				name : 'paraCode',
				displayName : 'Spec sub section',
				width : 75,
				headerTooltip : true,
				cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'D\'\">{{row.entity.paraCode}}</span></div>'
			}, {
				name : 'columns[2].newValue',
				displayName : 'Submittal type',
				width : 200,
				headerTooltip : true,
				cellClass : function(grid, row, col, rowRenderIndex, colRenderIndex) {
					if (row.entity.columns[2].action === 'U') {
						return 'yellowBackground';
					}
				}
			}, {
				name : 'columns[1].newValue',
				displayName : 'Submittal description',
				width : 400,
				headerTooltip : true,
				cellClass : function(grid, row, col, rowRenderIndex, colRenderIndex) {
					if (row.entity.columns[1].action === 'U') {
						return 'yellowBackground';
					}
				}
			}, {
				name : 'specName',
				displayName : 'Spec name',
				width : 200,
				headerTooltip : true,
				cellTemplate : '<div class="ui-grid-cell-contents"><span ng-if=\"row.entity.action !== \'D\'\">{{row.entity.specName}}</span></div>'
			}, {
				name : 'columns[0].newValue',
				displayName : 'Submittal group',
				width : 200,
				headerTooltip : true,
				cellClass : function(grid, row, col, rowRenderIndex, colRenderIndex) {
					if (row.entity.columns[0].action === 'U') {
						return 'yellowBackground';
					}
				}
			}];

			$scope.gridOptions1 = {
				data : data,
				columnDefs : columns1,
				enableColumnMenus : false,
				rowTemplate : '<div ng-click="grid.appScope.rowClicked(row,col,colRenderIndex)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="{\'compare-row-active\': row.entity.id===grid.appScope.record.id}" ui-grid-cell></div>',
			};

			$scope.gridOptions2 = {
				data : data,
				columnDefs : columns2,
				enableColumnMenus : false,
				rowTemplate : '<div ng-click="grid.appScope.rowClicked(row,col,colRenderIndex)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="{\'compare-row-active\': row.entity.id===grid.appScope.record.id}" ui-grid-cell></div>',
			};
		}

		$scope.leftpdfClicked = function(record) {
			AuthenticationService.SetGenericRecordData({ record: record });
			ExportService.openNewWindow('loadspecpdf?addendum=' + $scope.addendum.addendumId, 630, 605, 50);
		}

		$scope.rightpdfClicked = function(record) {
			if(record.sourceModule && ['plans', 'procurementlog'].indexOf(record.sourceModule.toLowerCase())>-1) {
        		openPlanPDF(record);
        	} else {
				var recordCopy = angular.copy(record);
				recordCopy.serialNumber = record.secondVersionSerialNumber;
				DownloadService.openSpecPdf(recordCopy, 650, null, $scope.projectId, $scope.version);
        	}
		}

		function openPlanPDF(record) {
            AuthenticationService.SetPlanViewRecordData(record);
        	AuthenticationService.SetPlanViewSheetData({file : { sheettype_s: record.drawingSheetType}, page : {filename: record.drawingFileName, pagenumber_i : record.drawingPageNumber}});
			AuthenticationService.setSmartViewType('planview');
			AuthenticationService.SetPlanViewView(null);
            ExportService.openNewWindow('smartview?openmode=openplanspdf', 630, 605);
        }

		$scope.SwitchVersions = function() {
			var versions = angular.copy($scope.selectedVersions);
			$scope.selectedVersions[0] = angular.copy(versions[1]);
			$scope.selectedVersions[1] = angular.copy(versions[0]);
			GetDiffData(project, $scope.selectedVersions[0], $scope.selectedVersions[1]);
		}

		$scope.rowClicked = function(row, col, ind) {
			$scope.clickedRecord = row.uid;
			if (col.field !== "pdfPageNumber") {
				$scope.record = row.entity;
			}
		}

		$scope.showDifferences = function() {
			$scope.step = 'showDifferences';
		}

		$scope.back = function() {
			$scope.step = 'compareSubmittals';
		}

	};
})();
