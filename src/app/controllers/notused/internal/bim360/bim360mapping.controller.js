(function () {
  'use strict';

  angular
      .module('EventsApp')
      .controller('Bim360MappingController', Bim360MappingController);

      Bim360MappingController.$inject = ['$scope', '$location', '$routeParams', 'AuthenticationService', 'ModalService',
        'BIMIntegrationService', 'ImageURL', 'ACCBuildService', 'UtilService'];
    function Bim360MappingController($scope, $location, $routeParams, AuthenticationService, ModalService,
            BIMIntegrationService, ImageURL, ACCBuildService, UtilService) {

        var vm = this ;
        vm.NavigateToSmartRegister = NavigateToSmartRegister;
    	vm.routeParams = angular.copy($routeParams);
    	$location.search({});

        (function initController() {
            vm.absUrl = $location.absUrl();
            populateExportObj();
        	GetCompanyName();
    		vm.selectedProject = AuthenticationService.GetProject();
    		vm.selectedVersion = AuthenticationService.GetVersion();
    		getSubmittalTypeMappings();
    		vm.user = AuthenticationService.GetUserInfo();
    	})();

        function populateExportObj() {
            vm.exportObj = {};
            if(vm.absUrl.indexOf('bim360') !== -1) {
                vm.exportType = 'bim360';
                vm.exportObj.name = 'BIM 360';
                vm.exportObj.url = ImageURL + 'exports/b-logo.png';
            } else if(vm.absUrl.indexOf('accbuild') !== -1) {
                vm.exportType = 'accbuild';
                vm.exportObj.name = 'ACC Build';
                vm.exportObj.url = ImageURL + 'exports/acc-build.svg';
                vm.exportObj.style = {'padding': '4px'};
            }
        }

	    vm.setDontShowFlag = function() {
            if(vm.absUrl.indexOf("bim360") !== -1) {
                AuthenticationService.SetDontShowBimMappingPage(vm.dontShowMeAgain);
            } else if(vm.absUrl.indexOf("accbuild") !== -1) {
                AuthenticationService.SetDontShowAccBuildMappingPage(vm.dontShowMeAgain);
            }
	     }

		function GetCompanyName() {
			vm.companyName = AuthenticationService.GetCompanyName();
		}

		vm.GoToBimExport = function() {
            if(vm.routeParams.hasOwnProperty('fromExcelExport') && vm.routeParams.fromExcelExport) {
                $location.path('/excelexport/').search({sourcePage: vm.routeParams.sourcePage, 'fromExcelExport': true});
            }
            else {
                $location.path('/' + vm.exportType + 'submittals');
            }
		}

		function getSubmittalTypeMappings() {
			vm.dataLoading = 'Getting Submittal type mapping...';
			var file = vm.routeParams.file ? true : false;
            populateMappingsData(file, function(response) {
                vm.submittalMappings = UtilService.getSTMappings(response);
				vm.dataLoading = false;
            });
		}

        function populateMappingsData(file, callback) {
            if(vm.exportObj.name.toUpperCase() === 'BIM 360') {
                BIMIntegrationService.getSubmittalTypeMappings(vm.selectedProject.projectId, vm.selectedVersion.versionId, file, function(response) {
                    if(callback) { callback(response); }
                });
            } else if(vm.exportObj.name.toUpperCase() === 'ACC BUILD') {
                ACCBuildService.getSubmittalTypeMappings(vm.selectedProject.projectId, vm.selectedVersion.versionId, file, function(response) {
                    if(callback) { callback(response); }
                });
            }
        }

		vm.ContactUs = function() {
			var items = PopulatingUserDetails(vm.selectedProject.name);
			items.feature = vm.exportObj.name + ' Submittal Mapping';
			ModalService.contactUsByFeaturePopup(items);
		}

		function PopulatingUserDetails(projectName) {
			var contactItems = {};
			contactItems.user = vm.user;
			contactItems.user.companyName = angular.copy(vm.user.company.name);
			contactItems.modalTitle = 'CONTACT US';
			if (projectName) {
				contactItems.projectName = projectName;
				contactItems.RequestType = vm.exportObj.name + " Submittal Mapping Request for " + projectName;
			}
			else {
				contactItems.RequestType = vm.exportObj.name + " Submittal Mapping Request";
			}
			return contactItems;
		}

		function NavigateToSmartRegister () {
			//Go back to previous page
			var accProject = AuthenticationService.GetACCProject();
			if(vm.routeParams && vm.routeParams.sourcePage === 'specview') {
				AuthenticationService.setSmartViewType('specview');
				$location.path('/smartview/projects/' + accProject.id);
			} else {
				$location.path('/smartregister/projects/' + accProject.id);
			}
		}

  }
}) ();
