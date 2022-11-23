(function() {
	'use strict';

	angular.module('EventsApp').controller('SwitchCompanyController',
			SwitchCompanyController);

	SwitchCompanyController.$inject = [ '$scope', '$uibModalInstance','companies','company','SanitizationService'];
	function SwitchCompanyController($scope, $uibModalInstance,companies, company,SanitizationService) {

		var vm = this;
		$scope.companies = companies;
		$scope.company = company;
		$scope.selectedCompany = $scope.company;
		$scope.preSelectedCompany = angular.copy($scope.selectedCompany);
		
		$scope.companies.forEach(function(item){
			item.decodedName = SanitizationService.decode(item.name);
		});
		
		$scope.ChangeCompany = function(selectedCompany) {
			$scope.showError = true;
			$scope.selectedCompany = selectedCompany;
		}

		$scope.SaveSwitchedCompany = function() {
		  var company = $scope.selectedCompany;
		  for (var i = 0; i < $scope.companies.length; i++) {
			if ($scope.companies[i].companyId === $scope.selectedCompany.companyId) {
			  company = $scope.companies[i];
			}
		  }
		  $uibModalInstance.close(company);
		};
		
		$scope.getFilteredCompanies = function(viewValue) {
			return $scope.companies.filter(function(c) {
				return c.decodedName && c.decodedName.toLowerCase().startsWith(viewValue.toLowerCase());
			});
		}

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
	}
})();
