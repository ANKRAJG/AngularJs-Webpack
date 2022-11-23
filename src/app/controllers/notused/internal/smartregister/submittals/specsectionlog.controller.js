(function() {
	'use strict';

	angular.module('EventsApp').controller('SpecSectionLogController',
			SpecSectionLogController);

	SpecSectionLogController.$inject = [ 'AuthenticationService',
			'SmartRegisterService', 'projectData', 'FlashService','$scope', 'ModalService' ];

	function SpecSectionLogController(AuthenticationService,
			SmartRegisterService, projectData, FlashService,$scope, ModalService) {

		var vm = this;
		vm.downloadSpecSectionLog = downloadSpecSectionLog;

		(function initController() {
			getSpecSectionDetails(projectData);
		})();

		function getSpecSectionDetails(projectData) {
			vm.specSectionLoader = 'Generating spec section log, please wait...';
			SmartRegisterService.DownLoadSpecCodesList(projectData.projectId,
					projectData.versionId, function(response) {
						if (response.success) {
							vm.requestFailed = false;
							vm.specSectionData = response.data;
						} else {
							vm.requestFailed = true;
							FlashService.Error(response.message);
						}
						vm.specSectionLoader = false;
					});
		}

		function downloadSpecSectionLog(){
			var fileName = projectData.projectName + "-Spec Section Log.xlsx"
			var options = {
					headers:true
			};
			alasql('SELECT specCode AS [Spec Section],specName as [Spec Name] INTO XLSX("'+fileName+'",?) FROM ?',[options,vm.specSectionData]);
			//ModalService.ConfirmSpecSectionDownloadModal();
			FlashService.Success("Spec section log downloaded successfully.");
			
		}

        vm.closeSlide = function() {
            $scope.$hide();
          }

	}

})();
