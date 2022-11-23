(function () {
	'use strict';

	angular.module('EventsApp').controller('Bim360DocsCtrl', Bim360DocsCtrl);

	Bim360DocsCtrl.$inject = ['$scope', 'FlashService', 'AuthenticationService', 'ModalService', 'MAINURL',
		'$uibModal', '$location', 'BIMIntegrationService', '$window', 'ImageURL'];
	function Bim360DocsCtrl($scope, FlashService, AuthenticationService, ModalService, MAINURL,
			$uibModal, $location, BIMIntegrationService, $window, ImageURL) {

		var vm = this;
		vm.displayExportOptions = displayExportOptions;
		vm.createNewFolderClicked = createNewFolderClicked;
		vm.exportButtonClicked = exportButtonClicked;
		vm.navigateToBIM360 = navigateToBIM360;

		//Variables
		vm.reqoverview = true;
		vm.specPdfs = true;
		vm.pypeFormatExcel = true;
		vm.exportDone = false;


		(function initController() {
			vm.absUrl = $location.absUrl();
			populateExportObj();
			vm.showDocs = getIsBIM360Docs();
			getUserDetails();
			GetCompanyName();
			var externalUserInfo = AuthenticationService.GetExternalUserInfo();
			vm.userDetails = externalUserInfo.userProfile;
			initBim360SelectVariables();
			displayExportOptions();
		})();

		function GetCompanyName() {
			vm.companyName = AuthenticationService.GetCompanyName();
		}

		function populateExportObj() {
            vm.exportObj = {};
            if(vm.absUrl.indexOf('bim360') !== -1) {
                vm.exportObj.name = 'BIM 360';
                vm.exportObj.url = ImageURL + 'logos/bim360-logo-small.png';
            } else if(vm.absUrl.indexOf('accbuild') !== -1) {
                vm.exportObj.name = 'ACC Build';
                vm.exportObj.url = ImageURL + 'exports/acc-build.svg';
            }
        }

		vm.openBim360SelectionModal = function() {
			ModalService.Bim360SelectionModal(vm.exportObj.name)
			.result.then(function(data) {
				if(data) {
					initBim360SelectVariables();
					displayExportOptions();
				}
			});
		}

		function getIsBIM360Docs(){
			return JSON.parse($window.localStorage.getItem("isBIM360Docs"));
		}

		function getUserDetails(){
			vm.userDetailsPype = JSON.parse($window.localStorage.getItem("userDetailsObject"));
			if (vm.userDetailsPype === null || vm.userDetailsPype === undefined) {
				var items = {
					title : "Ooops!!",
					message : "Something went wrong. Please restart your browser."
				};
				showWarningMessagePopup(items);
			}
		}

		function initBim360SelectVariables() {
			var bim360Selections = JSON.parse(sessionStorage.bim360Selections);
			if(bim360Selections) {
				vm.listOfCompanies = bim360Selections.listOfCompanies;
				vm.listOfProjects =  bim360Selections.listOfProjects;
				vm.selectedCompany = bim360Selections.selectedCompany;
				vm.selectedProject = bim360Selections.selectedProject;
				GetBim360ObjectNames();
			}
		}

		function GetBim360ObjectNames() {
				var companyList = vm.listOfCompanies;
				for(var i=0; i < companyList.length; i++) {
					if(companyList[i].id === vm.selectedCompany.id) {
						vm.selectedCompanyName = companyList[i].name;
					}
				}
				var projectList = vm.listOfProjects;
				for(var i=0; i < projectList.length; i++) {
					if(projectList[i].id === vm.selectedProject.id) {
						vm.selectedProjectName = projectList[i].name;
					}
				}
		}

		function displayExportOptions() {
			vm.exportDone = false;
			if(vm.selectedProject !== null && vm.selectedProject !== ''){
				waitingDialog.show('Getting Project Folders... Please wait');
				vm.foldersLoading = true;
				BIMIntegrationService.GetProjectFolders(vm.userDetails.emailId, vm.selectedCompany.id, vm.selectedCompany.name,
						vm.selectedProject.id, vm.selectedProject.name, function(response) {
					if (response.success) {
						var folders = response.data;
						vm.listOfFolders = folders;
						vm.selectedFolder = vm.listOfFolders[0];
					} else {
						FlashService.Error(response.message);
					}
					vm.showExportOptions = true;
					vm.foldersLoading = false;
					waitingDialog.hide();
				});
			}
			else {
				vm.showExportOptions = false;
			}
		}

		function createNewFolderClicked(){
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: MAINURL + 'views/bim360/createnewfolder.view.html?version=9.1',
				controller: 'CreateNewFolderController',
				backdrop: 'static',
				controllerAs: 'vm',
                bindToController: true,
				resolve: {
					totalFolderList : function(){
						return vm.listOfFolders;
					}
				}
			});

			modalInstance.result.then(function (data) {
				createNewProjectFolder(data.Name);
			});
		}

		function createNewProjectFolder(folderName){
			waitingDialog.show('Creating New Folder... Please wait');
			BIMIntegrationService.CreateNewFolder(vm.userDetails.emailId, vm.selectedCompany.id, vm.selectedCompany.name,
					vm.selectedProject.id, vm.selectedProject.name, folderName, function(response) {
				if (response.success) {
					displayExportOptions();
				} else {
					FlashService.Error(response.message);
					waitingDialog.hide();
				}
			});
		}

		function exportButtonClicked(){
			if((vm.specPdfs === false) || (vm.specPdfs && vm.listOfFolders && vm.listOfFolders.length > 0)){
				vm.specPdfsSuccess = false;
				vm.reqoverviewSuccess = false;
				vm.pypeFormatExcelSuccess = false;
				vm.specPdfsAsync = false;
				vm.reqoverviewAsync = false;
				vm.pypeFormatExcelAsync = false;

				vm.specPDFsResult = angular.copy(vm.specPdfs);
				vm.reqOverviewResult = angular.copy(vm.reqoverview);
				vm.pypeFormatExcelResult = angular.copy(vm.pypeFormatExcel);

				waitingDialog.show("Uploading files, please wait.");
				Promise.all([exportSpecPdfs(), exportRequirementOverview(), exportpypeFormatExcel()]).then(function() {
					waitingDialog.hide();
					vm.exportDone = true;
					if(vm.specPdfsAsync || vm.reqoverviewAsync || vm.pypeFormatExcelAsync) {
						var items = {title: "Alert", message: 'Uploads may take some time. You’ll receive an email once it is completed.'};
						ModalService.showAlertMessage(items);
					} else {
						FlashService.Success('Successfully exported to ' + vm.exportObj.name);
					}
				});

			} else if(vm.specPdfs) {
				var items = {title : "Alert",message : 'No folders present in your ' + vm.exportObj.name + ' project. Please add one before exporting.'};
				ModalService.showAlertMessage(items);
			}
		}

		function exportSpecPdfs(){
			if(vm.specPdfs){
				return BIMIntegrationService.ExportSpecPDFs(vm.userDetails.emailId, vm.selectedCompany.id, vm.selectedCompany.name,
						vm.selectedProject.id, vm.selectedProject.name, vm.selectedFolder.id, vm.selectedFolder.name,
						vm.userDetailsPype.pypeProjectId, vm.userDetailsPype.pypeVersionId, function(response) {
					if (response.success) {
						vm.specPdfsSuccess = true;
						vm.specPdfsAsync = response.data===true;
						vm.specPdfsMessage = response.message;
					} else {
						vm.specPdfsMessage = response.message ? response.message : "Export failed";
						FlashService.Error(response.message);
					}
					vm.exportDone = true;
				}).catch(function(){return true;});
			} else {
				return Promise.resolve();
			}
		}

		function exportRequirementOverview(){
			if(vm.reqoverview){
				return BIMIntegrationService.ExportReqOverview(vm.userDetails.emailId, vm.selectedCompany.id, vm.selectedCompany.name,
						vm.selectedProject.id, vm.selectedProject.name,vm.userDetailsPype.pypeProjectId, vm.userDetailsPype.pypeVersionId,
						function(response) {
					if (response.success) {
						vm.reqoverviewSuccess = true;
						vm.reqoverviewAsync = response.data===true;
						vm.reqoverviewMessage = response.message;
					} else {
						vm.reqoverviewMessage = response.message ? response.message : "Export failed";
						FlashService.Error(response.message);
					}
					vm.exportDone = true;
				}).catch(function(){return true;});
			} else {
				return Promise.resolve();
			}
		}

		function exportpypeFormatExcel(){
			if(vm.pypeFormatExcel){
				return BIMIntegrationService.ExportPypeFormatExcel(vm.userDetails.emailId, vm.selectedCompany.id, vm.selectedCompany.name,
						vm.selectedProject.id, vm.selectedProject.name,vm.userDetailsPype.pypeProjectId, vm.userDetailsPype.pypeVersionId,
						function(response) {
							if (response.success) {
								vm.pypeFormatExcelSuccess = true;
								vm.pypeFormatExcelAsync = response.data===true;
								vm.pypeFormatExcelMessage = response.message;
							} else {
								vm.pypeFormatExcelMessage = response.message ? response.message : "Export failed";
								FlashService.Error(response.message);
							}
							vm.exportDone = true;
						}).catch(function(){return true;});
			} else {
				return Promise.resolve();
			}
		}

		function navigateToBIM360() {
			var projectId = vm.selectedProject.id;
			var parentFolderId = vm.selectedFolder.parentFolderId;
			projectId = projectId.slice(2, projectId.length);  //Removing the 'b.' from the project id which is not required
			if(vm.exportObj.name === 'BIM 360') {
				$window.open('https://docs.b360.autodesk.com/projects/' + projectId + '/folders/' + parentFolderId);
			} else if(vm.exportObj.name === 'ACC Build') {
				$window.open('https://acc.autodesk.com/docs/files/projects/' + projectId + '?folderUrn=' + encodeURIComponent(parentFolderId));
			}
		}

		function showWarningMessagePopup(items) {
			 var accProject = AuthenticationService.GetACCProject();
			ModalService.showAlertMessage(items)
			.result.then(function (data) {
               if($routeParams.id){
	              $location.path('/smartregister/projects/' + $routeParams.id);
               }else{
	              $location.path('/smartregister/projects/' + accProject.id);
               }    
			}, function () {
               if($routeParams.id){
	              $location.path('/smartregister/projects/' + $routeParams.id);
               }else{
	              $location.path('/smartregister/projects/' + accProject.id);
               }   
			});
		}

	}

})();

(function () {
    'use strict';

    angular.module('EventsApp').controller(
			'CreateNewFolderController',
			CreateNewFolderController);

    CreateNewFolderController.$inject = ['$scope', '$uibModalInstance','totalFolderList'];
    function CreateNewFolderController($scope, $uibModalInstance,totalFolderList) {
        var vm = this;
        vm.validateFolderNames = validateFolderNames;

        (function initController() {

        	if(totalFolderList && totalFolderList.length == 0){
        		vm.folderName = "1.Specifications";
        	}
        	else{
        		vm.folderName = ""
        	}
        	vm.validateFolderNames();
		})();

        	function validateFolderNames() {
        	var folderNameList = totalFolderList.map(function(currentFolder) {return currentFolder.name.toLowerCase();});

        	if (vm.folderName != undefined && folderNameList.includes(vm.folderName.toLowerCase())){
        		vm.folderNameInvalid = true;
        	}
        	else{
        		vm.folderNameInvalid = false;
        	}
        };
        $scope.Submit = function () {
            $uibModalInstance.close({ Name: vm.folderName });
        };

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
