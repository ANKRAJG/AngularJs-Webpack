(function() {
	'use strict';

	angular.module('EventsApp').controller('TopBannerController',
			TopBannerController);

	TopBannerController.$inject = ['$scope', '$location', '$timeout', 'AuthenticationService', 'CompanyService', 'FlashService',
			'$route', 'SmartRegisterService', 'ProjectService', '$uibModal', 'MAINURL', 'SubscriptionService', '$window',
			'$rootScope', 'ModalService'];
	function TopBannerController($scope, $location, $timeout, AuthenticationService, CompanyService, FlashService,
			$route, SmartRegisterService, ProjectService, $uibModal, MAINURL, SubscriptionService, $window,
			$rootScope, ModalService) {
		var vm = $scope;
		vm.unsavedChangesTitle = 'Alert';
		vm.unsavedChangesMessage = 'You have made changes to Smart Register. Please save or undo the changes before proceeding.';
		vm.$location = $location;
		vm.Register = Register;
		vm.Login = Login;
		vm.Logout = Logout;
		vm.SaveCompanySettings = SaveCompanySettings;
		vm.ShowCompanyModel = ShowCompanyModel;
		vm.showProjectLimits = showProjectLimits;
		vm.ShowEditProfileModal = ShowEditProfileModal;
		vm.$route = $route;
		vm.Set = Set;
		vm.Refresh = Refresh;
		vm.ShowChangePasswordModal = ShowChangePasswordModal;
		vm.NavigateToMainSite = NavigateToMainSite;
		vm.OpenSwitchCompanyModel = OpenSwitchCompanyModel;
		vm.SaveSwitchedCompany = SaveSwitchedCompany;
		vm.getAvailableUserTrialProjectsCount = getAvailableUserTrialProjectsCount;
		vm.getAvailableUserPaidProjectsCount = getAvailableUserPaidProjectsCount;
		vm.getAvailableCompanyProjectsCount = getAvailableCompanyProjectsCount;
		vm.showUpgradePlansPopup = showUpgradePlansPopup;
		vm.contactSupport = contactSupport;
		vm.showAboutBoxPopup = showAboutBoxPopup;

		vm.searchedText = { value: '' };
		// vm.readonly = $rootScope.globals.userInfo.isReadonly ? true : false;
		vm.projectShowingPagesList = [ '/smartregister', '/precondashboard', '/smartview', '/support', '/adminproducts',
				'/productdictionary', '/smartregisterevents', '/productdata', '/requirementsoverview', '/riggingplan', '/aconex',
				'/export', '/excelexport', '/procoreIntegration', '/procoremapping', '/plansupport', '/projectsightintegration', '/projectsightmapping',
				'/bim360submittals', '/bim360docs', '/bim360mapping', '/bluebeamExport', '/accbuildsubmittals', '/accbuilddocs', '/accbuildmapping' ];
		vm.getPlansButtonPageList = [ '/smartregister', '/dashboard', '/smartview', '/productdata' ];

		var items = {};
		(function initController() {
			vm.SmartRegisterDataDirty = false;
			// GetCompanyName();
			vm.defaultProject = {};
			LoadDefaults();
			getDataRelatedToSelectedProject();
		})();

		// Just For setting the session Storage for Projects in background
		function SetAllUserProjects() {
			ProjectService.GetAll(function(response) {
				if (response.success) {
					if (response.data) {
						AuthenticationService.SetUserProjects(response.data);
					}
				} else {
					// In case if this API fails we need to update the session
					// storage with projects list as empty.
					AuthenticationService.SetUserProjects([]);
				}
			});
		}

		function showAboutBoxPopup() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: MAINURL + 'views/common/aboutbox.modal.html',
                size: 'md',
                backdrop: 'static',
                windowClass: 'about-popup',
                controller: 'AboutBoxController',
                controllerAs: 'vm'
            });
			modalInstance.result.then(function() {}, function() {});
        }

		function contactSupport() {
			window.solvvyApi.open();
		}

		function showUpgradePlansPopup(project, user) {
			var items = {};
			items.feature = 'PlansUpsell';
			items.modalTitle = 'Upload Plans';
			items.user = user;
			items.projectName = project.name;
			ModalService.upgradeToPlansPopup().result.then(function() {
				ModalService.contactUsByFeaturePopup(items);
			});
		}

		$rootScope.$on('updateProjectInList', function() {
			// SetAllUserProjects();
		});

		function GetCompanyName() {
			vm.companyName = AuthenticationService.GetCompanyName();
		}

		function getDataRelatedToSelectedProject() {
			vm.selectedProject = AuthenticationService.GetProject();
			vm.selectedVersion = AuthenticationService.GetVersion();
			vm.accUserDetails = AuthenticationService.GetACCUser();
			vm.accAllProjects = AuthenticationService.GetUserProjects();
			vm.accProject = AuthenticationService.GetACCProject();
			if(vm.accProject && vm.accProject.id) {
				var currUrl = $location.absUrl();
				vm.notificationUrl = $location.protocol() + '://' + window.location.host + '/settings/projects/' + vm.accProject.id + '/notifications?previousPage=' + encodeURIComponent(currUrl);
				vm.currentProducts = vm.accProject.products;
				AuthenticationService.SetACCProducts(vm.currentProducts);
			}
			vm.projects = AuthenticationService.GetUserProjects();
			vm.NoProjects = !vm.projects || vm.projects.length <= 0;
			vm.showSelectedProjectLabel = showSelectedProject();
			setCurrentAndOtherProjects();
			if(vm.accUserDetails && vm.currentProducts && vm.currentProducts.length>0) {
				setTrialDetails();
			}
		}

		function setTrialDetails() {
			vm.trialProducts = vm.accUserDetails.licenses.filter(function(tp) {
				return tp.category && tp.type==='trial' && vm.currentProducts.filter(function(p) {
					return tp.productName.toLowerCase() === p.name.toLowerCase();
				}).length>0;
			});
			getExpirationDateDifference();
			if(vm.trialProducts.length === 1) {
				vm.trialProduct = vm.trialProducts[0];
			} else if(vm.trialProducts.length>1) {
				multipleTrialCase();
			}
		}

		function multipleTrialCase() {
			var trialProduct;
			if(vm.trialProducts.filter(function(p) { return p.expireDays===30; }).length>=2) {
				// Case with 2 or more products have 30 days trial
				var trialProduct = vm.trialProducts.filter(function(p) { return p.expireDays===30; });
			} else {
				// Case with 2 or more products have 30 days trial
				var minDays = getMinTrial();
				var trialProduct = vm.trialProducts.filter(function(p) { return p.expireDays===minDays; });
			}
			vm.trialProduct = trialProduct[0];
			vm.trialProduct.totalproducts = trialProduct.length;
		}

		function getMinTrial() {
			var minNum = 29;
			for(var i=0; i<vm.trialProducts.length; i++) {
				if(vm.trialProducts[i].expireDays < minNum) {
					minNum = vm.trialProducts[i].expireDays;
				}
			}
			return minNum;
		}

		function getExpirationDateDifference() {
			vm.trialProducts.forEach(function(item) {
				var date1 = new Date(item.expiration);
				var date2 = new Date();
				var expireDays = (date1.getTime() - date2.getTime()) / (1000*3600*24);
				item.expireDays = Math.round(expireDays);
				item.name = item.productName.toLowerCase()==='build' ? ('Autodesk ' + item.productName) : item.productName;
				item.pricingUrl = 'https://construction.autodesk.com/pricing/' + item.category;
			});
		}

		function showSelectedProject() {
			if (vm.NoProjects || !vm.selectedProject) {
				return false;
			} else if (vm.projectShowingPagesList.indexOf($location.path()) > -1) {
				return true;
			} else {
				return false;
			}
		}

		$rootScope.$on('userprojectschanged', function(event, args) {
			getDataRelatedToSelectedProject();
		});

		vm.ctrlFn = function(test) {
			var message = 'You have unsaved changes that will be lost if you decide to continue. <br> <b> Are you sure you want to leave this page? </b>';
			if ($rootScope.smartRegisterDataDirty || $rootScope.productDataDirty || $rootScope.plDataDirty || $rootScope.pLogTableExtracted) {
					ModalService.OpenConfirmModal('Confirm navigation', message)
					.result.then(function () {
	                    $rootScope.smartRegisterDataDirty = false;
	                    $rootScope.plDataDirty = false;
						$rootScope.productDataDirty = false;
						$rootScope.pLogTableExtracted = false;
	                    vm.ctrlFn(test);
		            }, function() {});
			}
			else {
				if(test.versionId != vm.selectedVersion.versionId) {
					returnUpdatedProject(test.projectId, function (data) {
							var project = angular.copy(data);
							var version = project.versions.filter(function (item) { if (item.versionId == test.versionId) { return item; } })[0];
							AuthenticationService.SetProject(project);
							AuthenticationService.SetVersion(version);
							$route.reload();
					});
				}
			}
        }

		function returnUpdatedProject(projectId, callback) {
			SmartRegisterService.GetProjectById(projectId, function(response) {
				if (response.success) {
					callback(response.data);
				} else {
					FlashService.Error(response.message);
				}
			});
		}

		function Upgrade(projectName) {
            $scope.user = vm.user;
            var upgradeItems = PopulatingUserDetails(projectName);
            ModalService.showContactUsPopup(upgradeItems);
        }

		function PopulatingUserDetails(projectName) {
            var upgradeItems = {};
            upgradeItems.user = vm.user;
            upgradeItems.user.companyName = angular.copy(vm.user.company.name);
            upgradeItems.modalTitle = vm.modalTitle;

            if (projectName) {
                upgradeItems.projectName = projectName;
                upgradeItems.RequestType = "Upgrade Request for " + projectName;
            } else {
                upgradeItems.RequestType = vm.RequestType;
            }
            return upgradeItems;
        }

		function setCurrentAndOtherProjects() {
			vm.currentProject = [];
			vm.otherProjects = [];
			if (vm.projects && vm.projects.length > 0) {
				if (vm.selectedProject) {
					vm.projects.forEach(function(item) {
						if (item.projectId === vm.selectedProject.projectId) {
							vm.currentProject.push(item);
						} else {
							vm.otherProjects.push(item);
						}
					});
				} else {
					vm.otherProjects = vm.projects;
					//checkAndContinueSelectedProjectFlow();
				}
			}
		}

		function checkAndContinueSelectedProjectFlow() {
			if (vm.projectShowingPagesList.indexOf($location.path()) > -1
					&& !vm.selectedProject) {
				ModalService.ProjectSelectionModal(vm.currentProject, vm.otherProjects);
			}
		}

		function getAvailableUserTrialProjectsCount() {
			return vm.userSettings.userTrialProjectLimit > vm.userSettings.usedUpTrialProject ?
						(vm.userSettings.userTrialProjectLimit - vm.userSettings.usedUpTrialProject) : 0;
		}

		function getAvailableUserPaidProjectsCount() {
			return vm.userSettings.userPaidProjectLimit > vm.userSettings.usedUpPaidProject ?
						(vm.userSettings.userPaidProjectLimit - vm.userSettings.usedUpPaidProject) : 0;
		}

		function getAvailableCompanyProjectsCount() {
			return vm.userSettings.companyProjectLimit > vm.userSettings.companyUsedUpProject ?
						(vm.userSettings.companyProjectLimit - vm.userSettings.companyUsedUpProject) : 0;
		}

		function NavigateToMainSite() {
			$window.open("https://pype.io", "");
		}

		$scope.openTrialBanner = function(){
			if(vm.trialProducts.length === 1) {
				var trial = vm.trialProducts[0];
				window.open(trial.pricingUrl, '_blank');
			} else {
				var modalInstance = $uibModal.open({
					animation : true,
					templateUrl : MAINURL + 'views/common/trialinfopopup.view.html',
					controller : 'TrialInfoPopupCtrl',
					backdrop : 'static',
					resolve : {
						trialProducts: function() { return vm.trialProducts; }
					}
				});
				modalInstance.result.then(function() {}, function() {});
			}
		}

		function ShowChangePasswordModal() {
			if (vm.SmartRegisterDataDirty !== true) {
				var modalInstance = $uibModal.open({
					animation : true,
					templateUrl : MAINURL + 'views/changepassword/change.password.view.html?version=9.0',
					controller : 'ChangePasswordController',
					backdrop : 'static'
				});

	            modalInstance.result.then(function (data) {
	                vm.modalTitle = 'Upgrade Project';
	                Upgrade(project.name);
	            });
			}
		}

		function checkForShowMoreFlag() {
			vm.showMoreBarFlag = (vm.recentSearches.length>4 || vm.customSearches.length>4);
		}

		function UpgradeCustomSearchVersion() {
			var upgradeItems = {};
			upgradeItems.user = vm.user;
			upgradeItems.user.companyName = angular.copy(vm.user.company.name);
			upgradeItems.modalTitle = 'Upgrade Custom Search Version';
			if (vm.selectedProject.projectName) {
				upgradeItems.RequestType = "Upgrade Request for " + vm.selectedProject.projectName;
			} else {
				upgradeItems.RequestType = "Upgrade Request";
			}
			ModalService.showContactUsPopup(upgradeItems);
		}

		function showProjectLimits() {
			vm.ShowUserSettingsDialog = true;
			FetchUserDetails();
		}

		function FetchUserDetails() {
			SubscriptionService.GetCurrentUserSubscriptionDetails(true, function(response) {
				if (response.success) {
					vm.userSettings = response.data.user;
					if (response.data.providers && response.data.providers.length > 0) {
						vm.providerInfo = response.data.providers[0];
					}
					vm.userSettingsCopy = angular.copy(vm.userSettings);
					var userObj = angular.copy(vm.user);
					if (!vm.user.company.enterpriseFlag) {
						vm.userSettingsCopy.shareConsumers.unshift(userObj);
						vm.userSettingsCopy.shareConsumers[0].name = vm.userSettingsCopy.shareConsumers[0].name + ' (Owner)';
						if (vm.userSettingsCopy.shareConsumers.length > 0 && vm.userSettingsCopy.consumedProjects) {
							vm.userSettingsCopy.shareConsumers.forEach(function(i) {
								var data2 = [];
								vm.userSettingsCopy.consumedProjects.forEach(function(item) {
									if (i.userId == item.ownerId) {
										data2.push(item.name);
									}
								});
								i.projects = data2;
							});
						}
					}
				} else {
					FlashService.Error(response.message);
				}
			});
		}

		$scope.$on("dirtyFlagChanged", function(event, data) {
			vm.SmartRegisterDataDirty = data;
		});

		function LoadDefaults() {
			LoadUserDetails();
		}

		function Refresh() {
			if ($location.path().indexOf('/smartregister') >= 0) {
				if ($scope.$parent.vm.dataDirty) {
					if (!confirm("Your changes are not saved. Please save you changes")) {
						return;
					}
				}
				$location.path('/smartregister')
			}
			$route.reload();
		}

		function Set() {
			AuthenticationService.SetCompanyInfo(vm.company);
			vm.ShowCompanySettingsDialog = false;
			$('.modal-backdrop').remove();
			$route.reload();
		}

		function LoadCompanyDetailsById() {
			vm.dataLoading = true;
			CompanyService.GetById(vm.company.companyId, function(response) {
				if (response.success) {
					vm.company = angular.copy(response.data);
					if (response.data && response.data.logo) {
						vm.imageSrc = "data:image/jpeg;base64, " + response.data.logo;
					} else {
						vm.imageSrc = null;
					}
				} else {
					FlashService.Error(response.message);
				}
				vm.dataLoading = false;
			});
		}

		function SaveSwitchedCompany(companyId) {
			if (companyId) {
				CompanyService.ChangeCompany(companyId, function(response) {
					if (response.success) {
						FlashService.Success(response.message);
						FlashService.Success("Your company has been switched. Please login again", true);
						Logout();
					} else {
						FlashService.Error(response.message);
					}
					vm.dataLoading = false;
				});
			} else {
				FlashService.Error('Unable to get the company Id');
			}
		}

		$scope.removeImage = function(imageSrcType) {
			if (imageSrcType) {
				if (imageSrcType == "companyImg") {
					$scope.imageSrc = null;
					$scope.company.logo = null;
					$('#companySettingsImg').val('');
				}
			}
		}

		function OpenSwitchProjectPopup() {
			var modalInstance = $uibModal.open({
				animation : true,
				templateUrl : MAINURL + 'views/common/switchcompany.view.html?version=9.1',
				controller : 'SwitchCompanyController',
				backdrop : 'static',
				resolve : {
					companies: function() { return vm.companies; },
		        	company : function() { return vm.company; }
				}
			});
			modalInstance.result.then(function(data) {
				SaveSwitchedCompany(data.companyId);
			});
		}



		function OpenSwitchCompanyModel() {
			if (vm.SmartRegisterDataDirty !== true) {
				vm.company = AuthenticationService.GetCompanyInfo();
				CompanyService.GetAll(function(response) {
					if (response.success) {
						vm.companies = response.data;
						OpenSwitchProjectPopup();
					} else {
						FlashService.Error(response.message);
					}
					vm.dataLoading = false;
				});
			} else {
				items.title = vm.unsavedChangesTitle;
				items.message = vm.unsavedChangesMessage;
				ModalService.showAlertMessage(items);
			}
		}

		function ShowCompanyModel() {
			if (vm.SmartRegisterDataDirty !== true) {
				vm.ShowCompanySettingsDialog = true;
				vm.company = AuthenticationService.GetCompanyInfo();
				if (vm.company && vm.company.companyId) {
					LoadCompanyDetailsById();
				} else {
					LoadCompanyDetails();
				}
			} else {
				items.title = vm.unsavedChangesTitle;
				items.message = vm.unsavedChangesMessage;
				ModalService.showAlertMessage(items);
			}
		}

		function ShowEditProfileModal() {
			if (vm.SmartRegisterDataDirty !== true) {
				var modalInstance = $uibModal.open({
					animation : true,
					templateUrl : MAINURL
							+ 'views/editprofile/edit.profile.view.html?version=9.0',
					controller : 'EditProfileController',
					backdrop : 'static',
					resolve : {
						user : vm.user
					}
				});
				modalInstance.result.then(function(data) {
					vm.user = data.user;
				});
			} else {
				items.title = vm.unsavedChangesTitle;
				items.message = vm.unsavedChangesMessage;
				ModalService.showAlertMessage(items);
			}
		}

		function containsObject(list, property, val) {
			for (var i = 0; i < list.length; i++) {
				if (list[i][property] === val) {
					return true;
				}
			}
			return false;
		}

		function LoadUserDetails() {
			vm.user = AuthenticationService.GetUserInfo();
			vm.adUser = AuthenticationService.GetADUserFlag();
			vm.company = AuthenticationService.GetCompanyInfo();
		}

		function LoadCompanyDetails() {
			vm.company = AuthenticationService.GetCompanyInfo();
			if (vm.company.companyId > 0) {
				vm.dataLoading = true;
				CompanyService.GetById(vm.company.companyId, function(response) {
					if (response.success) {
						vm.company = response.data;
						if (!vm.company || !vm.company.name) {
							vm.showCompanyModel = true;
						} else {
							AuthenticationService.SetCompanyInfo(response.data);
						}
						if (response.data && response.data.logo) {
							vm.imageSrc = "data:image/jpeg;base64, " + response.data.logo;
						}
					} else {
						FlashService.Error(response.message);
					}
					vm.dataLoading = false;
				});
			}
		}

		function SaveCompanySettings() {
			var _this = this;
			if (vm.company.companyId) {
				CompanyService.Update(vm.company,vm.company.logo,function(response) {
					if (response.success) {
						vm.company = response.data;
						AuthenticationService.SetCompanyInfo(response.data);
						vm.ShowCompanySettingsDialog = false;
						$('.modal-backdrop').remove();
						$('.modal.fade').each(function() {
							if (this.id) {
								$("#" + this.id).modal('hide');
							}
						});
						$('body').removeClass('modal-open');
						FlashService.Success(response.message);
						FlashService.Success("Company settings has been changed. Please login again", true);
						Logout();
					} else {
						FlashService.Error(response.message);
					}
					vm.dataLoading = false;
				});

			} else {

				CompanyService.Create(vm.company, vm.company.logo, false,
						function(response) {
							if (response.success) {
								vm.company = response.data;
								AuthenticationService
										.SetCompanyInfo(response.data);
								vm.ShowCompanySettingsDialog = false;
								$('.modal-backdrop').remove();
								$route.reload();
								vm.dataLoading = false;
								FlashService.Success(response.message);
							} else {
								FlashService.Error(response.message);
								vm.dataLoading = false;
							}
						});

			}
		}

		function Login() {
			$location.path('/login');
		}

		function Register() {
			$location.path('/register');
		}
		function Logout() {
			if (vm.SmartRegisterDataDirty !== true) {
				AuthenticationService.Logout(vm.user.userId);
				AuthenticationService.clearStorageData();
				$location.path('/login');
			} else {
				items.title = vm.unsavedChangesTitle;
				items.message = vm.unsavedChangesMessage;
				ModalService.showAlertMessage(items);
			}
		}
	}
})();

(function() {
	'use strict';

	angular.module('EventsApp').controller('ChangePasswordController',
			ChangePasswordController);

	ChangePasswordController.$inject = [ '$scope', '$uibModalInstance',
			'$location', 'UserService', 'FlashService', 'AuthenticationService' ];
	function ChangePasswordController($scope, $uibModalInstance, $location,
			UserService, FlashService, AuthenticationService) {
		(function() {
		})();

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.Save = function() {
			$scope.dataLoading = true;
			UserService.ChangePassword($scope.user, function(response) {

				if (response.success === true) {
					FlashService.Success(response.message, true);
					$scope.dataLoading = false;
					$uibModalInstance.close({});

					AuthenticationService.Logout(AuthenticationService
							.GetUserInfo().userId);
					AuthenticationService.clearStorageData();
					$location.path('/login');
				} else {
					FlashService.Error(response.message, true);
					$scope.dataLoading = false;
				}
			});
		}
	}


})();

(function() {
	'use strict';

	angular.module('EventsApp').controller('EditProfileController',
			EditProfileController);

	EditProfileController.$inject = [ '$scope', '$uibModalInstance',
			'UserService', 'FlashService', 'user', 'AuthenticationService' ];
	function EditProfileController($scope, $uibModalInstance, UserService,
			FlashService, user, AuthenticationService) {
		(function() {
			$scope.user = angular.copy(user);
		})();

		$scope.Cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.Save = function() {
			$scope.dataLoading = true;
			var userTobeUpdated = $scope.user;
			delete userTobeUpdated.isSuperAdmin;
			delete userTobeUpdated.isPypeSales;
			delete userTobeUpdated.isCompanyAdmin;
			if (userTobeUpdated.company.invalid !== undefined) {
				delete userTobeUpdated.company.invalid;
			}
			if (userTobeUpdated.companyName !== undefined)
				delete userTobeUpdated.companyName;
			// delete userTobeUpdated.isSuperAdmin;
			UserService.Update(userTobeUpdated, function(response) {
				if (response.success === true) {
					AuthenticationService.SetUserInfo(response.data);
					var userInfo = AuthenticationService.GetUserInfo();
					$scope.dataLoading = false;
					$uibModalInstance.close({
						user : userInfo
					});
					FlashService.Success(response.message);
				} else {
					FlashService.Error(response.message);
					$scope.dataLoading = false;
				}
			});
		}
	}
})();
