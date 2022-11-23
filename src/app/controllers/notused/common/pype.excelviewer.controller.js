(function () {
    'use strict';

    angular.module('EventsApp').controller('PypeExcelViewerController', PypeExcelViewerController);

    PypeExcelViewerController.$inject = ['$scope', '$uibModalInstance', 'items', 'callback'];
    function PypeExcelViewerController($scope, $uibModalInstance, items, callback) {
        (function () {
        	$scope.columnsData = items.columns;
        	$scope.filename = items.filename;
        	$scope.recordsData = updateRecordsWithRecidIfNotExists(items.records);
            setTimeout(function() {
                $scope.gridReload($scope.recordsData, $scope.columnsData);
            });
            $scope.callback = callback;
       })();

       $scope.setGridEvents = function (gridReload) {
           $scope.gridReload = gridReload;
       };

        function updateRecordsWithRecidIfNotExists(records){
        	if (records && records.length > 0){
        		if (!records[0].hasOwnProperty('recid')) {
        			records.map(function(rec, ind){
        				rec.recid = ind + 1;
        			});
        		}
        	}
        	return records;
        }

        $scope.toggleModalWidth = function(){
        	if ($scope.isFullScreen) {
        		minimizeModel();
        	} else {
        		maximizeModel();
        	}
        }

        function maximizeModel(){
        	$('.download-highlighted-region-popup .modal-dialog').removeClass('modal-lg');
        	$('.download-highlighted-region-popup .modal-dialog').addClass('modal-xl');
        	$scope.isFullScreen = true;
        	$scope.$broadcast('RebuildGrid', $scope.recordsData);
        }

        function minimizeModel(){
        	$('.download-highlighted-region-popup .modal-dialog').addClass('modal-lg');
        	$('.download-highlighted-region-popup .modal-dialog').removeClass('modal-xl');
        	$scope.isFullScreen = false;
        	$scope.$broadcast('RebuildGrid', $scope.recordsData);
        }

        $scope.downloadExcel = function(gridName) {
        	if($scope.callback) {
        		$scope.callback('download');
        	}
        	$scope.$broadcast('ExportAllData', {gridName: gridName, fileName: $scope.filename});
        }

        $scope.Cancel = function () {
        	if($scope.callback) {
        		$scope.callback('cancel');
        	}
            $uibModalInstance.close();
        };

    }
})();
