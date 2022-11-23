(function() {
	'use strict';

	angular.module('EventsApp').controller('CreateCompanyController',
			CreateCompanyController);

	CreateCompanyController.$inject = ['$scope', '$uibModalInstance', 'UtilService'];
	function CreateCompanyController($scope, $uibModalInstance, UtilService) {

		// Enabling Basic Company Subscription Settings
		$scope.company = {
			active : true,
			shareFlag: true,
			productDataFlag: true,
			specViewFlag: true,
			historyFlag: true,
			versionFlag: true,
			versionLimit: 10,
			searchViewFlag: true,
			pypeAIFlag: true
		};
		$scope.notifyToUser = false;
		$scope.projectRegionList = ["MULTI", "USA", "CANADA"];
		$scope.company.region = "USA";

		(function initController() {
			LoadSubscriptionStatus();
			getRegions();
		})();

		function getRegions(){
			UtilService.GetRegions(function(response) {
				if (response.success) {
					$scope.projectRegionList = response.data.regions;
				}
			})
		}

		function LoadSubscriptionStatus(){
			$scope.subscriptionSettingsList = [ {
				name : "Enterprise",
				value : "1"
			}, {
				name : "Non Enterprise",
				value : "0"
			} ];
		}

		function convertAllFlagsToNumbers(company){
			for(var key in company){
				if(typeof company[key] === "boolean"){
					if(company[key] === true){
						company[key] = 1;
					} else {
						company[key] = 0;
					}
				}
			}
			return company;
		}

		$scope.Submit = function() {
			$scope.company = convertAllFlagsToNumbers($scope.company);
			$scope.notifyToUser = $scope.notifyToUser?1:0;
			$uibModalInstance.close({company : $scope.company, notifyToUser : $scope.notifyToUser});
		};

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};

     }

})();
