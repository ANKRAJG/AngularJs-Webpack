
(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('AddProcurementLogsAsSubmittalsController', AddProcurementLogsAsSubmittalsController);

    AddProcurementLogsAsSubmittalsController.$inject = ['$scope', '$uibModalInstance', 'recordData','GlobalPropertyService'];
    function AddProcurementLogsAsSubmittalsController($scope, $uibModalInstance, recordData,GlobalPropertyService) {

        (function () {
        	$scope.procurementLogs = angular.copy(recordData);
        	var globalUISettings = GlobalPropertyService.getGlobalUISettings();
			$scope.allowedTypes = globalUISettings['procurementlog-submittal-types'];
        	$scope.procurementLogs.forEach(function(item){
        		item.selected = true;
        		item.selectedTypes = [$scope.allowedTypes[0]];
        	});
        	$scope.selectedCount = $scope.procurementLogs.length;
        	$scope.isAllSelected = true;
        })();

		$scope.loadSubmittalTypes = function ($query,item) {
            var totalSubmittalTypes = $scope.allowedTypes;
            var values = [];
            for (var i = 0; i < totalSubmittalTypes.length; i++) {
                if (item.selectedTypes.indexOf(totalSubmittalTypes[i]) == -1) {
                    values.push(totalSubmittalTypes[i]);
                }
            }
            return values.filter(function (type) {
			    return (type.toLowerCase().indexOf($query.toLowerCase()) != -1);
			});
        };

        $scope.validateType = function ($tag) {
        	return $scope.allowedTypes.indexOf($tag.submittalType) !== -1;
        }

        $scope.selectAll = function(){
        	$scope.isAllSelected = !$scope.isAllSelected;
        	$scope.procurementLogs.forEach(function(item){
        		item.selected = $scope.isAllSelected;
        	});
           if($scope.isAllSelected)
        	   $scope.selectedCount = $scope.procurementLogs.length;
           else
        	   $scope.selectedCount = 0;
        }

        $scope.updateSelectedCount = function(item){
        	if(item.selected)
        		$scope.selectedCount++;
        	else
        		$scope.selectedCount--;
        	if($scope.selectedCount === $scope.procurementLogs.length)
        		$scope.isAllSelected = true;
        	else
        		$scope.isAllSelected = false;
        }

        $scope.Confirm = function () {
        	var selectedRecords = [];
        	$scope.procurementLogs.forEach(function(item){
        		if(item.selected){
        			var selectedTypes = [];
        			item.selectedTypes.forEach(function(item){
        				selectedTypes.push(item.submittalType);
        			});
        			if(selectedTypes.length > 0){
        				item.submittalTypes = selectedTypes;
        				selectedRecords.push(item);
        			}
        		}
        		delete item.selectedTypes;
        		delete item.selected;
        	});
            $uibModalInstance.close(selectedRecords);
        };

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
})();
