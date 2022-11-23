(function () {
    'use strict';

    angular.module('EventsApp').controller('AddMultiDomainController',
    		AddMultiDomainController);

    AddMultiDomainController.$inject = ['$scope', '$uibModalInstance',
			'items', 'FlashService', 'UserService', 'CompanyService', '$timeout', 'fileReader'];
    function AddMultiDomainController($scope, $uibModalInstance, items,
			FlashService, UserService, CompanyService, $timeout, fileReader) {
        (function () {
            var vm = this;
            $scope.company = items;
            $scope.isActive = true;
            $scope.metadataFileObj = {};
            $scope.metadataFile = "";
            $scope.addEditMode = "Add";
            $scope.ssoFlagList = [
              { 'name' : 'Yes', 'value': 'ENABLED' },
              { 'name' : 'No', 'value': 'DISABLED' }
            ];
            if($scope.company.enterpriseFlag) {
                $scope.multiDomain = {};
                $scope.ssoFlagList.push({ 'name' : 'Parent', 'value': 'PARENT' });
            }
            else {
              $scope.multiDomain = { sso: 'DISABLED' };
            }
            getDefaultRoleList($scope.company.companyId);
            getMultiDomains();
        })();

    		function getDefaultRoleList(companyId) {
      			$scope.dataLoading = "Fetching Default Roles... Please wait...";
            UserService.GetDefaultRoleList(companyId)
        			.then(function(res) {
        				res = res.data;
        				$scope.defaultRoleList = res.data;
                $scope.dataLoading = false;
        			})
        			.catch(function(err) {
        				err = err.data;
                FlashService.Error(err.message);
                $scope.dataLoading = false;
        			});
    		}

    	$scope.getSSOFlagName = function(value) {
    		for(var i=0; i<$scope.ssoFlagList.length; i++) {
    			if($scope.ssoFlagList[i].value === value) {
    				return $scope.ssoFlagList[i].name;
    			}
    		}
    	}

    	$scope.getRoleName = function (id) {
    		for(var i=0; i<$scope.defaultRoleList.length; i++) {
    			if($scope.defaultRoleList[i].roleId === id) {
    				return $scope.defaultRoleList[i].name;
    			}
    		}
    	}

        function getMultiDomains() {
          $scope.dataLoading = "Fetching Multi Domains... Please wait...";
          CompanyService.GetMultiDomains($scope.company.companyId, function(res) {
            if(res.success) {
              $scope.multiDomainList = res.data;
              $scope.dataLoading = false;
            }
            else {
              FlashService.Error(res.message);
              $scope.dataLoading = false;
            }
          });
        }

        $timeout(function() {
          $('.modal-dialog').css('width', '85%');
          $('.modal-content').css('width', '100%');
        }, 0);


        $scope.uploadButtonClicked = function(){
    			$timeout(function(){
    				$('#metadatafile').click();
    			}, 0);
    		}

        $scope.getFile = function (target) {
    			fileReader.readAsDataUrl($scope.file, $scope)
    			.then(function (result) {
    				$scope[target] = result;
    			});
        }

        function toggleLoader() {
            $scope.dataLoading = "Loading... Please wait...";
            $timeout(function() {
              $scope.dataLoading = false;
            }, 500);
        }

        $scope.editModeOn = function(item) {
          toggleLoader();
          $scope.previousSSOFlag = item.sso;
          $scope.addEditMode = "Edit";
          item.defaultUserRoleId = item.defaultUserRoleId.toString();
          if(item.isActive)
            $scope.isActive = true;
          else
            $scope.isActive = false;
          $scope.multiDomain = angular.copy(item);
        }

        $scope.clear = function() {
          $scope.addEditMode = "Add";
          if($scope.company.enterpriseFlag) {
              $scope.multiDomain = {};
          }
          else {
            $scope.multiDomain = { sso: 'DISABLED' };
          }
          $scope.isActive = true;
          $scope.metadataFileObj = {};
          angular.element("input[type='file']").val(null);
        }

        $scope.myPopover = {
            templateUrl: 'confirmDelete.html',
            opened: false,
            open: function(idx) {
                $('.dropdown').removeClass('open');
                $scope.myPopover.opened = true;
                $scope.myPopover.isOpen = {};
                $scope.myPopover.isOpen[idx] = true;
                $scope.myPopover.idx = idx;
            },
            close: function() {
                $scope.myPopover.isOpen[$scope.myPopover.idx] = false;
            },
            delete: function () {
              DeleteEmailDomain($scope.company.companyId, $scope.myPopover.idx);
              $scope.myPopover.isOpen[$scope.myPopover.idx] = false;
            }
        }

        $scope.AddOrUpdate = function () {
            if($scope.isActive)
                $scope.multiDomain.isActive = 1;
            else
                $scope.multiDomain.isActive = 0;
            $scope.addEditMode == 'Add' ? addDomain() : updateDomain();
        };

        function addDomain() {
          if($scope.multiDomain.sso == 'ENABLED' && !$scope.metadataFileObj.name) {
            $scope.showMetaDataErrorMsg = true;
          }
          else {
            $scope.dataLoading = "Loading... Please wait...";
            $scope.showMetaDataErrorMsg = false;
            CompanyService.AddMultiDomain($scope.company.companyId, $scope.multiDomain, function(response) {
                if(response.success) {
                  if($scope.multiDomain.sso == 'ENABLED') {
                    CompanyService.AddUpdateSamlConfigMultiDomain($scope.company.companyId, $scope.multiDomain, $scope.metadataFileObj, function(reponse) {
                        if(response.success) {
                          FlashService.Success("Multi Domain Created Successfully");
                          getMultiDomains();
                          $scope.clear();
                          $scope.dataLoading = false;
                        }
                        else {
                          FlashService.Error(response.message);
                          $scope.dataLoading = false;
                        }
                    });
                  }
                  else {
                    getMultiDomains();
                    FlashService.Success("Multi Domain Created Successfully");
                    $scope.clear();
                    $scope.dataLoading = false;
                  }
                }
                else {
                  FlashService.Error(response.message);
                  $scope.dataLoading = false;
                }
            });
          }
        }

        function updateDomain() {
          if($scope.previousSSOFlag != 'ENABLED' && $scope.multiDomain.sso == 'ENABLED' && !$scope.metadataFileObj.name) {
            $scope.showMetaDataErrorMsg = true;
          }
          else {
            $scope.dataLoading = "Loading... Please wait...";
            $scope.showMetaDataErrorMsg = false;
            CompanyService.UpdateMultiDomain($scope.company.companyId, $scope.multiDomain, function(response) {
                if(response.success) {
                  if($scope.multiDomain.sso == 'ENABLED' && $scope.metadataFileObj.name) {
                    CompanyService.AddUpdateSamlConfigMultiDomain($scope.company.companyId, $scope.multiDomain, $scope.metadataFileObj, function(reponse) {
                        if(response.success) {
                          FlashService.Success("Multi Domain Updated Successfully");
                          getMultiDomains();
                          $scope.clear();
                          $scope.dataLoading = false;
                        }
                        else {
                          FlashService.Error(response.message);
                          $scope.dataLoading = false;
                        }
                    });
                  }
                  else {
                    FlashService.Success("Multi Domain Updated Successfully");
                    getMultiDomains();
                    $scope.clear();
                    $scope.dataLoading = false;
                  }
                }
                else {
                  FlashService.Error(response.message);
                  $scope.dataLoading = false;
                }
            });
          }
        }

        function DeleteEmailDomain(companyId, sisterCompanyId) {
            $scope.dataLoading = "Loading... Please wait...";
            CompanyService.DeleteMultiDomains(companyId, sisterCompanyId, function(response) {
              if(response.success) {
                FlashService.Success("Multi Domain Deleted Successfully");
                getMultiDomains();
                $scope.clear();
                $scope.dataLoading = false;
              }
              else {
                FlashService.Error(response.message);
                $scope.dataLoading = false;
              }
            });
        }

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
