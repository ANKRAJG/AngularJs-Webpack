(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('DraftSubmittalMappingsCtrl', DraftSubmittalMappingsCtrl);

    DraftSubmittalMappingsCtrl.$inject = ['$scope', 'AccService', 'FlashService', '$location', 'AuthenticationService', 'ModalService'];
    function DraftSubmittalMappingsCtrl($scope, AccService, FlashService, $location, AuthenticationService, ModalService) {
        var vm = this;

        vm.accProject = AuthenticationService.GetACCProject();
        vm.selectedVersion = AuthenticationService.GetVersion();
        vm.lastRoute = AuthenticationService.GetLastRoute();
        vm.accMappings = [], vm.autospecsMappings = [];

        (function initController() {
            var accProjectId;
            if(vm.accProject) {
                accProjectId = vm.accProject.id;
            }
            AccService.initialiseACCDetails(accProjectId, function() {
                vm.lastRouteLabel = getLastRouteLabel(vm.lastRoute);
                getAccBuildMappings();
            });
        })();

        function getLastRouteLabel(lastRoute) {
        	var label = lastRoute.split("/")[1];
        	if(label == 'smartview')
        		return 'Spec View';
        	return 'Smart Register';
        }

        vm.contactSupport = function() {
			window.solvvyApi.open();
		}

        vm.close = function(headMsg) {
            if(vm.mappingsChanged) {
                var bodyMsg = 'Your submittal type assignments will be lost.';
                ModalService.OpenConfirmModal(headMsg, bodyMsg, false, 'Confirm', 'Cancel', true)
                .result.then(function() {
                    $location.path(vm.lastRoute);
                }, function() {});
            } else {
                $location.path(vm.lastRoute);
            }
        }

        vm.back = function() {
            var lastFeature = 'Smart Register';
            if(vm.lastRoute && vm.lastRoute.indexOf('smartview')>-1) {
                lastFeature = 'Spec View';
            }
            vm.close('Go back to ' + lastFeature + '?');
        }

        function getAccBuildMappings() {
            vm.dataLoading = true;
            AccService.getAccBuildSubmittalTypeMappings()
            .then(function(response) {
                if(response && response.data && response.data.success && response.data.data) {
                    var resData = response.data.data;
                    vm.accMappings = resData.mappings;
                    resData.autoSpecsSubTypes.forEach(function(item) {
                        var matchedMappings = vm.accMappings.filter(function(subType) {
                            return subType.mappedTypes.filter(function(category) {
                                return category.toLowerCase() === item.toLowerCase();
                            }).length>0;
                        });
                        vm.autospecsMappings.push({ name: item, mapped: matchedMappings.length>0 });
                    });
                }
                vm.dataLoading = false;
            })
            .catch(function(error) {
                FlashService.Error(error.data.message);
                vm.dataLoading = false;
            });
        }

        vm.onSubmiitalTypeDrop = function(index, item) {
            vm.autospecsMappings.forEach(function(subType) {
                if(subType.name.toLowerCase() === item.name.toLowerCase()) {
                    subType.mapped = true;
                }
            });
            var matchedMappings = vm.accMappings[index].mappedTypes.filter(function(category) {
                return category.toLowerCase() === item.name.toLowerCase();
            });
            if(!matchedMappings || matchedMappings.length===0) {
                vm.accMappings[index].mappedTypes.push(item.name);
            }
            vm.mappingsChanged = true;
            return false;
        }

        vm.removeMappings = function(list, category, idx) {
            list.splice(idx, 1);
            vm.mappingsChanged = true;
            var found = false;
            for(var i=0; i<vm.accMappings.length; i++) {
                for(var j=0; j<vm.accMappings[i].mappedTypes.length; j++) {
                    if(vm.accMappings[i].mappedTypes[j].toLowerCase() === category.toLowerCase()) {
                        found = true;
                        break;
                    }
                }
            }
            if(!found) {
                vm.autospecsMappings.forEach(function(subType) {
                    if(subType.name.toLowerCase() === category.toLowerCase()) {
                        subType.mapped = false;
                    }
                });
            }
        }

        vm.updateMappings = function() {
            vm.dataLoading = true;
            AccService.updateAccBuildSubmittalTypeMappings(vm.accMappings)
            .then(function(response) {
                if(response && response.data && response.data.success) {
                    $location.path('/draftsubmittals');
                }
                vm.dataLoading = false;
            })
            .catch(function(error) {
                FlashService.Error(error.data.message);
                vm.dataLoading = false;
            });
        }

    }
})();
