(function() {
  function EditSmartColumnsController($scope, MAINURL, $uibModal, $uibModalInstance, SanitizationService, smartColumns, columnTypes, selectedColumn) {
    $scope.colTypes = columnTypes;
    $scope.save = {
      atProject: true,
      atCompany: false
    };
    if (smartColumns) {
      $scope.smartColumnsRows = angular.copy(smartColumns).map(function(c) {
        c.saved = true;
        return c;
      });
    } else {
      $scope.smartColumnsRows = [];
    }

    function selectDefaultRow() {
         if ($scope.smartColumnsRows.length > 0) {
            $scope.selectedCustomColumn = $scope.smartColumnsRows.filter(function(c) { return c.label === selectedColumn.label; })[0];
            decodeValues();
          } else {
            $scope.selectedCustomColumn = null;
          }
    }

    function decodeValues() {
        $scope.selectedCustomColumn.label = $scope.selectedCustomColumn.label ? SanitizationService.decode($scope.selectedCustomColumn.label) : '';
        $scope.selectedCustomColumn.description = $scope.selectedCustomColumn.description ? SanitizationService.decode($scope.selectedCustomColumn.description) : '';
    }

    $scope.customColumnClicked = function(col) {
      $scope.selectedCustomColumn = col;
      decodeValues();
    };

    $scope.removeRow = function(row) {
      for (var i = 0; i < $scope.smartColumnsRows.length; i++) {
        if ($scope.smartColumnsRows[i] === row) {
          $scope.smartColumnsRows.splice(i, 1);
          $scope.columnForm.$setDirty();
        }
      }
      selectDefaultRow();
    };

    $scope.submit = function() {
      if($scope.smartColumnsRows) {
      	for(var i = 0; i < $scope.smartColumnsRows.length; i++) {
      		if($scope.smartColumnsRows[i].fieldName == $scope.selectedCustomColumn.fieldName) {
      			$scope.smartColumnsRows[i].label = angular.copy($scope.selectedCustomColumn.label);
      			$scope.smartColumnsRows[i].type = angular.copy($scope.selectedCustomColumn.type);
      			$scope.smartColumnsRows[i].description = angular.copy($scope.selectedCustomColumn.description);
      		}
      	}
      }
      $uibModalInstance.close({
        smartColumnsRows: $scope.smartColumnsRows,
        saveAtProject: $scope.save.atProject,
        saveAtCompany: $scope.save.atCompany
      });
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss("cancel");
    };

    selectDefaultRow();
  }
  angular.module("EventsApp").controller("EditSmartColumnsController", EditSmartColumnsController);
  EditSmartColumnsController.$inject = [
    "$scope",
    "MAINURL",
    "$uibModal",
    "$uibModalInstance",
    "SanitizationService",
    "smartColumns",
    "columnTypes",
    "selectedColumn"
  ];
})();
