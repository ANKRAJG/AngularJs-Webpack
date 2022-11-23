
(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('CompanyBulkEditModalCtrl', CompanyBulkEditModalCtrl);

    CompanyBulkEditModalCtrl.$inject = ['$scope', '$timeout', '$uibModalInstance', '$http', 'columnsData', 'recordData', 'UtilService', 'ModalService', 'CompanyService', 'FlashService', 'AuthenticationService'];
    function CompanyBulkEditModalCtrl($scope, $timeout, $uibModalInstance, $http, columnsData, recordData, UtilService, ModalService, CompanyService, FlashService, AuthenticationService) {
        var columnsData1 = {};
        $scope.setGridEvents = function (gridReload) {
            $scope.gridReload = gridReload;
        };
        $scope.recordDataCopy = [];
        $scope.GoToStep = function (step) {
            $scope.step = step;
            $scope.StepsLoaded.push(step);
        };
        $scope.company = AuthenticationService.GetCompany();

        (function () {
            getRegions();
            $scope.StepsLoaded = [];
            var columns = angular.copy(columnsData);
            var removedColumnsInput = ['companyId','name','user', 'description','createTime','ssoEnabledFlag', 'emailDomain', 'defaultUserRole', 'isIgnoredFlag'];
            var removedColumnsGrid = ['description','createTime','ssoEnabledFlag', 'defaultUserRole', 'isIgnoredFlag'];
            var gridColumns = columns.filter(function(data){return removedColumnsGrid.indexOf(data.field) <= -1 });
            $scope.selectedRecords = angular.copy(recordData);
            $scope.allColumns = angular.copy(gridColumns);
            columnsData1 = angular.copy(columnsData);
            $scope.columnsData = columnsData1.filter(function(data){
            	return removedColumnsInput.indexOf(data.field) <= -1
            });
      			setTimeout(function() {
      			  $scope.gridReload($scope.selectedRecords, $scope.allColumns);
      			}, 300);
            $scope.GoToStep(1);
        })();

        function getRegions(){
          $scope.dataLoading = "Fetching Regions... Please wait...";
          UtilService.GetRegions(function(response) {
            if (response.success) {
              $scope.companyRegionList = response.data.regions;
              $scope.dataLoading = false;
            } else {
              FlashService.Error(response.message);
              $scope.dataLoading = false;
            }
          });
        }

        $scope.yesNoFlags = [ {
  				name : "YES",
  				value : 1
  			}, {
  				name : "NO",
  				value : 0
  			} ];

        function changeDateFormat(objtxtDate) {
          return moment(objtxtDate).format("MM/DD/YYYY");
        }

        $scope.checkBoxCheck = function(bulkEditFlag) {
            $scope.enableConfirmButton = false;
            for(var i=0; i<$scope.columnsData.length; i++) {
              if($scope.columnsData[i].bulkEditFlag) {
                $scope.enableConfirmButton = true;
                break;
              }
            }
        }

        function getChangedValues(){
            var recordDataCopy = angular.copy(recordData);
            $(recordDataCopy).each(function (recIndex, record) {
                $($scope.columnsData).each(function (index, item) {
                    if(item.bulkEditFlag) {
                      recordDataCopy[recIndex][item.field] = (item.field === 'active') ? parseInt(item.value) : item.value;
                      if(item.fieldType === 'text' || item.fieldType === 'email') {
                        recordDataCopy[recIndex][item.field] = (item.value === '') ? null : item.value;
                      }
                    }
                });
            });
            $scope.recordDataCopy = recordDataCopy;
        }

        $scope.Confirm = function () {
            getChangedValues();
            var message = "Are you sure you want to update these company records?";
            var title = "Confirm";
            ModalService.OpenConfirmModal(title, message, false)
            .result.then(function () {
                  $scope.dataLoading = 'Updating...Please wait';
                  CompanyService.BulkUpdateCompanyRecords($scope.recordDataCopy, function(response) {
                    if (response.success) {
                      FlashService.Success('Successfully bulk updated Companies');
                      for(var i=0; i<$scope.recordDataCopy.length; i++) {
                        if($scope.recordDataCopy[i].companyId === $scope.company.companyId) {
                          AuthenticationService.SetCompany($scope.recordDataCopy[i]);
                          break;
                        }
                      }
                      $uibModalInstance.close({recordData: $scope.recordDataCopy, columnsData: $scope.columnsData});
                    } else {
                      FlashService.Error('Failed to bulk update Companies');
                    }
                    $scope.dataLoading = false;
                  });
            }, function() {});
        };

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
})();
