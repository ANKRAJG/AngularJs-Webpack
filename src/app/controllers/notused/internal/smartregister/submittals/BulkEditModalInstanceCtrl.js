
(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('BulkEditModalInstanceCtrl', BulkEditModalInstanceCtrl);

    BulkEditModalInstanceCtrl.$inject = ['$scope', '$timeout', '$uibModalInstance', '$http', 'columnsData', 'recordData'];
    function BulkEditModalInstanceCtrl($scope, $timeout, $uibModalInstance, $http, columnsData, recordData) {
        var columnsData1 = {};
        $scope.step1Toaster = false;
        $scope.step2Toaster = false;
        $scope.setGridEvents = function (gridReload) {
            $scope.gridReload = gridReload;
        };
        $scope.recordDataCopy = {};
        $scope.GoToStep = function (step) {
        	if(step === 1){
        		$scope.columnsData.forEach(function(column){
        			column.editable = false;
        		});
        	}else if(step == 2){
        		$scope.columnsData.forEach(function(column){
        			column.editable = $scope.editableTypes[column.field];
        		});
        	}
            $scope.step = step;
            $scope.StepsLoaded.push(step);
        };

        (function () {
            $scope.StepsLoaded = [];
            var columns = angular.copy(columnsData);
            var removedColumnsInput = ['pdfPageNumber','serialNumber','divisionCode','source','drawingsPageNumber', 'drawingSheetNumber', 'drawingSheetName', 'drawingPageNumber'];
            var removedColumnsGrid = ['pdfPageNumber','divisionCode','submittalsHeading','targetDate',
            	'subContractor','specCategoryGroup','projectSummaryGroup','source', 'drawingSheetNumber', 'drawingSheetName', 'drawingsPageNumber'];
            var gridColumns = columns.filter(function(data){return removedColumnsGrid.indexOf(data.field) <= -1 });
            $scope.selectedRecords = angular.copy(recordData);
            $scope.allColumns = angular.copy(gridColumns);
            columnsData1 = angular.copy(columnsData);
            $scope.editableTypes = {};
            $scope.columnsData = columnsData1.filter(function(data){
            	$scope.editableTypes[data.field] = data.editable;
            	if(data.field == 'paraCode')
            		data.caption = data.tooltip;
            	return removedColumnsInput.indexOf(data.field) <= -1
            	}
            );
			setTimeout(function() {
			  $scope.gridReload($scope.selectedRecords, $scope.columnsData);
			}, 300);
            $scope.GoToStep(1);
        })();

        function changeDateFormat(objtxtDate) {
          return moment(objtxtDate).format("MM/DD/YYYY");
        }

        function getChangedValues(){
        	var columnsAppliedData = $scope.columnsData.filter(function (item) {
                if (item.value)
                    return item;
            });

            var recordDataCopy = angular.copy(recordData);
            $(recordDataCopy).each(function (recIndex, record) {
                $(columnsAppliedData).each(function (index, item) {
                    if((item.editable && item.editable.type == 'date') && item.value) {
                      recordDataCopy[recIndex][item.field] = changeDateFormat(item.value);
                      if (!recordDataCopy[recIndex].changes)
                          recordDataCopy[recIndex].changes = {};
                      recordDataCopy[recIndex].changes[item.field] = changeDateFormat(item.value);
                    }
                    else {
                      recordDataCopy[recIndex][item.field] = item.value;
                      if (!recordDataCopy[recIndex].changes)
                          recordDataCopy[recIndex].changes = {};
                      recordDataCopy[recIndex].changes[item.field] = item.value;
                    }
                });
            });
            $scope.recordDataCopy = recordDataCopy;
        }
        
        $scope.removeToaster1 = function() {
        	$scope.step1Toaster = true;
        }
        
        $scope.removeToaster2 = function() {
        	$scope.step2Toaster = true;
        }


        $scope.Confirm = function () {
            getChangedValues();
            $uibModalInstance.close($scope.recordDataCopy);
        };

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
})();
