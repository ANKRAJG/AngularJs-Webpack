(function() {
	'use strict';

	angular.module('EventsApp').controller('SSOSettingsController',
			SSOSettingsController);

	SSOSettingsController.$inject = ['$scope', 'FlashService', '$timeout', 'fileReader', 'SSOService', 'items', '$uibModalInstance'];
	function SSOSettingsController($scope, FlashService, $timeout, fileReader, SSOService, items, $uibModalInstance) {

		var vm = this;
		vm.updateSSODetails = updateSSODetails;
		
		(function initController() {
			vm.selectedCompany = items;
			vm.metadataFileObj = {};
        	$scope.metadataFile = "";
        	vm.enableSSOFlag = vm.selectedCompany.ssoEnabledFlag?true:false; 
		})();
		
		$scope.uploadButtonClicked = function(){
			$timeout(function(){
				$('#metadatafile').click();
			}, 0);
		}
		
		$scope.getFile = function (target) {
			fileReader.readAsDataUrl($scope.file, $scope)
			.then(function (result) {
				$scope.vm[target] = result;
			});
        }
		
		function updateSSODetails(){
			var ssoFlag = vm.enableSSOFlag?1:0;
			var fileObj = angular.equals({}, vm.metadataFileObj)?null:vm.metadataFileObj;
			SSOService.UpdateSSOSettings(vm.selectedCompany.companyId, ssoFlag, fileObj, function(response){
				if(response && response.success){
					FlashService.Success(response.message);
					$uibModalInstance.close({});
					vm.dataLoading = false;
				} else {
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}
			});
		}
		
		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		
     }

})();
