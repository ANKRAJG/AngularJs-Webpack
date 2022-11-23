(function () {
  'use strict';

  angular.module('EventsApp')
      .controller('Bim360AccBuildExportOptionsCtrl', Bim360AccBuildExportOptionsCtrl );

  Bim360AccBuildExportOptionsCtrl.$inject = ['$scope', '$uibModalInstance', 'BIMIntegrationService', 'items', 'AuthenticationService', 'ACCBuildService', 'UtilService'];
  function Bim360AccBuildExportOptionsCtrl($scope, $uibModalInstance, BIMIntegrationService, items, AuthenticationService, ACCBuildService, UtilService) {
	  var vm = this;
      $scope.global = angular.copy(items);
      vm.exportName = $scope.global.exportName;

      $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
      };

      $scope.Submit = function (exportType) {
          $scope.global.exportType = exportType;
          $uibModalInstance.close({ global: $scope.global });
      };

      (function () {
          $scope.global = angular.copy(items);
		  vm.selectedProject = AuthenticationService.GetProject();
		  vm.selectedVersion = AuthenticationService.GetVersion();
		  getSubmittalTypeMappings();
      })();

      $scope.Submit = function (exportType) {
          $scope.global.exportType = exportType;
          $uibModalInstance.close({ global: $scope.global });
      };

      $scope.Cancel = function () {
          $uibModalInstance.dismiss('cancel');
      };

	  function getSubmittalTypeMappings() {
	      $scope.dataLoading = 'Checking for Submittal type mappings...';
          populateMappingsData(false, function(response) {
              vm.apiSubmittalMappings = UtilService.getIntegrationMappings(response);
              vm.noAPISubmittalMappings = vm.apiSubmittalMappings.length === 0;
              getExcelMappings();
          });
	  }

      function getExcelMappings() {
          populateMappingsData(true, function(response) {
              vm.excelSubmittalMappings = UtilService.getIntegrationMappings(response);
              vm.noExcelSubmittalMappings = vm.excelSubmittalMappings.length === 0;
              $scope.dataLoading = false;
          });
      }

      function populateMappingsData(flag, callback) {
          if(vm.exportName.toUpperCase() === 'BIM 360') {
              BIMIntegrationService.getSubmittalTypeMappings(vm.selectedProject.projectId, vm.selectedVersion.versionId, flag, function(response) {
                  if(callback) { callback(response); }
              });
          } else if(vm.exportName.toUpperCase() === 'ACC BUILD') {
              ACCBuildService.getSubmittalTypeMappings(vm.selectedProject.projectId, vm.selectedVersion.versionId, flag, function(response) {
                  if(callback) { callback(response); }
              });
          }
      }

  }
}) ();
