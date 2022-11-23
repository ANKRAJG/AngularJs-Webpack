(function() {
  function AddSmartColumnsController($scope, $timeout, FlashService, $uibModalInstance, smartColumns, columnTypes) {
    $scope.colTypes = columnTypes;
    $scope.save = {
      atProject: true,
      atCompany: false
    };
    if (smartColumns) {
      $scope.smartColumnsRows = angular.copy(smartColumns);
    } else {
      $scope.smartColumnsRows = [];
    }

    $scope.newRecord = {
      type: $scope.colTypes[0].id,
      fieldName: "",
      label: "",
      description: ""
    };

    $scope.submit = function() {
      $scope.smartColumnsRows.splice(0, 0, $scope.newRecord);

      $uibModalInstance.close({
        smartColumnsRows: $scope.smartColumnsRows,
        saveAtProject: $scope.save.atProject,
        saveAtCompany: $scope.save.atCompany
      });
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss("cancel");
    };
  }
  angular.module("EventsApp").controller("AddSmartColumnsController", AddSmartColumnsController);
  AddSmartColumnsController.$inject = [
    "$scope",
    "$timeout",
    "FlashService",
    "$uibModalInstance",
    "smartColumns",
    "columnTypes"
  ];
})();
