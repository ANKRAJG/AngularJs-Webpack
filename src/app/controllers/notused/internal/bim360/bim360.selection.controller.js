(function () {
  'use strict';

  angular
      .module('EventsApp')
      .controller('Bim360SelectionModalCtrl', Bim360SelectionModalCtrl);

  Bim360SelectionModalCtrl.$inject = ['MAINURL', '$scope', '$uibModalInstance', '$location', '$window', 'ModalService', 'AuthenticationService', 'BIMIntegrationService', 'sourcePage', 'exportType', 'FlashService'];
  function Bim360SelectionModalCtrl(MAINURL, $scope, $uibModalInstance, $location, $window, ModalService , AuthenticationService, BIMIntegrationService, sourcePage, exportType, FlashService) {
      var vm = this;
      vm.LoadProjects = LoadProjects;
      vm.sourcePage = sourcePage;
      vm.exportType = exportType;
      vm.exportTypeSmall = vm.exportType.replace(/\s/g, '').toLowerCase();

      (function initController() {
          vm.absUrl = $location.absUrl();
          if((vm.absUrl.indexOf('/' + vm.exportTypeSmall + 'submittals') !== -1) || (vm.absUrl.indexOf('/' + vm.exportTypeSmall + 'docs') !== -1)) {
              initBim360SelectVariables();
          } else {
        	  var externalUserInfo = AuthenticationService.GetExternalUserInfo();
        	  vm.bimEmailId = externalUserInfo.userProfile.emailId;
              LoadCompanies();
          }
      }) ();

      vm.Close = function () {
          $uibModalInstance.close();
      }

      function initBim360SelectVariables() {
          var bim360Selections = JSON.parse(sessionStorage.bim360Selections);
          if(bim360Selections) {
            $scope.listOfCompanies = bim360Selections.listOfCompanies;
            $scope.listOfProjects =  bim360Selections.listOfProjects;
            vm.selectedCompany = bim360Selections.selectedCompany;
            vm.selectedProject = bim360Selections.selectedProject;
            vm.selectedCompanyId = vm.selectedCompany.id;
            vm.selectedProjectId = vm.selectedProject.id;
          }
      }

      function LoadCompanies() {
    		vm.dataLoading = 'Getting ' + vm.exportType + ' Companies...';
    		BIMIntegrationService.GetAllCompanies(vm.bimEmailId, null, function(response) {
				if (response.success) {
			        $scope.listOfCompanies = response.data ? response.data.companies : [];
                    checkSingleCompany();
				} else {
					FlashService.Error("Failed to get Companies");
                    vm.dataLoading = false;
				}
    		});
  		}

      function checkSingleCompany() {
    	  if ($scope.listOfCompanies && $scope.listOfCompanies.length === 1) {
			  vm.selectedCompanyId = $scope.listOfCompanies[0].id;
              vm.selectedCompany = $scope.listOfCompanies[0];
			  LoadProjects();
    	  } else {
              vm.dataLoading = false;
          }
  	  }

      function LoadProjects() {
			if(vm.selectedCompanyId) {
                if($scope.listOfCompanies.length > 1) {
                    getCompanyByCompanyId();
                }
				vm.dataLoading = 'Getting ' + vm.exportType + ' Projects...';
				BIMIntegrationService.GetProjects(vm.bimEmailId, vm.selectedCompanyId, vm.selectedCompany.name, function(response) {
  					if (response.success) {
                        if(response.data) {
                            $scope.listOfProjects = response.data.filter(function(item) {
                                return vm.exportTypeSmall.indexOf(item.type.toLowerCase()) !== -1;
                            });
                        } else {
                            $scope.listOfProjects = [];
                        }
                        checkSingleProject();
  					} else {
  						FlashService.Error(response.message);
  					}
                    vm.dataLoading = false;
				});
			}
			else {
                vm.selectedProjectId = null;
				vm.dataLoading = false;
			}
  		}

        function checkSingleProject() {
  		    if ($scope.listOfProjects && $scope.listOfProjects.length === 1) {
    			vm.selectedProjectId = $scope.listOfProjects[0].id;
                vm.selectedProject = $scope.listOfProjects[0];
  		    } else {
                vm.selectedProjectId = null;
            }
    	}

        function getCompanyByCompanyId() {
            vm.selectedCompany = $scope.listOfCompanies.filter(function(item) {
                return item.id === vm.selectedCompanyId;
            })[0];
        }

        vm.getProjectByProjectId = function() {
            if($scope.listOfProjects.length > 1) {
                vm.selectedProject = $scope.listOfProjects.filter(function(item) {
                    return item.id === vm.selectedProjectId;
                })[0];
            }
        }

      function checkTimeOutAndShowConfirmDownload(msg){
          var items = {
              title : "Error",
              message : msg ? msg : "Timeout Occured please restart the process",
          };
          ModalService.showAlertMessage(items);
      }

      $scope.goToSubmittalMappingPreview = function() {
          var bim360Selections = {
              listOfCompanies: $scope.listOfCompanies,
              listOfProjects: $scope.listOfProjects,
              selectedCompany: vm.selectedCompany,
              selectedProject: vm.selectedProject
          }
          sessionStorage.bim360Selections = JSON.stringify(bim360Selections);
          if((vm.absUrl.indexOf('/' + vm.exportTypeSmall + 'submittals') !== -1) || (vm.absUrl.indexOf('/' + vm.exportTypeSmall + 'docs') !== -1)) {
              $uibModalInstance.close('done');
          } else {
              var showDocs = JSON.parse($window.localStorage.getItem('isBIM360Docs'));
              if(showDocs) {
                  $location.path('/' + vm.exportTypeSmall + 'docs');
              } else {
                  var dontShowMeAgain = AuthenticationService.GetDontShowBimMappingPage();
                  if(vm.exportTypeSmall === 'accbuild') {
                      dontShowMeAgain = AuthenticationService.GetDontShowAccBuildMappingPage();
                  }
                  dontShowMeAgain ? $location.path('/' + vm.exportTypeSmall + 'submittals') : $location.path('/' + vm.exportTypeSmall + 'mapping/').search({ sourcePage: vm.sourcePage });
              }
          }
      }

      $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
      };

  }
}) ();
