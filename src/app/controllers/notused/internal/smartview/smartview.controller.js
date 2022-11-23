(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('SmartviewController', SmartviewController);

    SmartviewController.$inject = ['$scope', 'AuthenticationService', '$routeParams','$timeout', '$rootScope', 'ModalService', 'ProjectService', 'AccService'];
    function SmartviewController($scope, AuthenticationService, $routeParams, $timeout, $rootScope, ModalService, ProjectService, AccService) {
        var vm = this;
        vm.fullScreeMode = false;
        vm.togglePypeSearch = togglePypeSearch;
        vm.toggleSmartViewFullScreen = toggleSmartViewFullScreen;
        vm.exitFullScreen = exitFullScreen;

        (function initController() {
            // This check is when we open Plan PDF from Smart Register in New Window
            //if (opener && !opener.closed) {
            if($routeParams && $routeParams.openmode && $routeParams.openmode.toLowerCase() === 'openplanspdf') {
                $("#wrapper").removeClass('toggled');
                vm.hideTopSideNavs = true;
            }

             var accProjectId = $routeParams.id;
             vm.dataLoading = "Loading Smart View, Please Wait...";
             AccService.initialiseACCDetails(accProjectId, function(){
            	LoadUserDetails();
                GetCompanyName();
                vm.selectedProject = AuthenticationService.GetProject();
                vm.selectedVersion = AuthenticationService.GetVersion();
                $rootScope.searchClicked = false;
                if(vm.selectedProject) {
                	$rootScope.enablePypeSearch = false;
                    getTypeOfSmartView();
                    AuthenticationService.SetPypeSearchRecordData({});
                    AuthenticationService.SetSearchTextForSpecs(null);
                    vm.dataLoading = false;
                }
             });
        })();

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

        $scope.$on('loadSmartViewType', function(event, data) {
            vm.smartviewType = data;
        });

        $scope.$on('searchInBox', function(event, searchText) {
            $scope.$broadcast('searchInSpecviewFromBox', searchText);
        });

        vm.setSelectedView = function(selectedView) {
            if ($rootScope.pLogTableExtracted) {
                showNavigateConfirmation(selectedView, null);
            } else {
                vm.smartviewType = selectedView;
                AuthenticationService.setSmartViewType(selectedView);
            }
        }

        function showNavigateConfirmation(selectedView, next) {
            $('.modal-backdrop').show();
            var message = 'You have unsaved changes that will be lost if you decide to continue. <br> <b> Are you sure you want to leave this page? </b>';
			ModalService.OpenConfirmModal('Confirm navigation', message)
			.result.then(function () {
                $rootScope.pLogTableExtracted = false;
                if(selectedView) {
                    vm.smartviewType = selectedView;
                    AuthenticationService.setSmartViewType(selectedView);
                } else if(next) {
                    $location.path(next.slice(next.lastIndexOf('/')));
                }
                $('.modal-backdrop').hide();
            }, function() {});
        }

        $scope.$on('$locationChangeStart', function (event, next, current) {
            if ($rootScope.pLogTableExtracted) {
                event.preventDefault();
                showNavigateConfirmation(null, next);
            }
        });

        function getTypeOfSmartView() {
            if($routeParams && $routeParams.schedule) {
                vm.smartviewType = 'planview';
            } else {
                var view = AuthenticationService.getSmartViewType();
                var planVersionIdx = ProjectService.getPlanVersionIndex(vm.selectedProject, vm.selectedVersion);
                if(planVersionIdx!==-1) {
                    var planStatus = vm.selectedProject.planVersions[planVersionIdx].status.toLowerCase();
                }
                vm.smartviewType = (vm.selectedProject && vm.selectedProject.planViewFlag &&
                                    (vm.selectedVersion.status.toLowerCase()==='completed') &&
                                    (planStatus==='completed' || planStatus==='in progress') &&
                                    view) ? view : 'specview';
            }
        }

        function togglePypeSearch(enablePypeSearch) {
        	if(enablePypeSearch == "MAX") {
        		 $rootScope.enablePypeSearch = "MIN";
        	} else if(enablePypeSearch == "MIN") {
        		 $rootScope.enablePypeSearch = "MAX";
        	}
        }

        $rootScope.$on('SmartRegisterView', function (event, data) {
        	 vm.smartviewType = data;
        });

        $rootScope.$on('EnablePypeSearch', function (event, data) {
        	 $rootScope.enablePypeSearch = data;
        });

        $rootScope.$watch('toggleClass', function (data) {
        	 vm.toggleClass = data;
        });

        function toggleSmartViewFullScreen() {
        	$timeout(function(){
        		if(!vm.fullScreenMode) {
        		vm.fullScreenMode = true;
        		$('#wrapper').addClass('fullscreen-specview-container');
        		$(".pypeTopHeader").hide();
        		$("#wrapper").removeClass('toggled');
        		$("#wrapper").addClass('fullscreen-planview');
        		$('#sidebar-wrapper').hide();
        		$('#wrapper').fullScreen(true);
    		} else {
    			exitFullScreen();
    		}
          }, 0);
    	}

    	function exitFullScreen() {
    		$timeout(function(){
    			vm.fullScreenMode = false;
    			$('#wrapper').removeClass('fullscreen-specview-container');
    			$(".pypeTopHeader").show();
    			$("#wrapper").addClass('toggled');
    			$("#wrapper").removeClass('fullscreen-planview');
    			$('#sidebar-wrapper').show();
    			// fix to exit full screen without an exception in browser
    			if (document.fullscreenElement) {
 				document.exitFullscreen()
                        }
    			//$('#wrapper').fullScreen(false);
    		 }, 0);
    	}


    }
})();
if (document.addEventListener) {
    document.addEventListener('webkitfullscreenchange', exitHandler, false);
    document.addEventListener('mozfullscreenchange', exitHandler, false);
    document.addEventListener('fullscreenchange', exitHandler, false);
    document.addEventListener('MSFullscreenChange', function() {
        if (document.msFullscreenElement == null) {
        	var scope = angular.element("#smartview-wrapper").scope();
        	scope.vm.exitFullScreen();
        }

    }, false);
}

function exitHandler() {
    if (document.webkitIsFullScreen == false
            || document.mozFullScreen == false) {
    	var scope = angular.element("#smartview-wrapper").scope();
    	scope.vm.exitFullScreen();
    }
}
