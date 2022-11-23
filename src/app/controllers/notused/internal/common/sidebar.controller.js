(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('SideBarController', SideBarController);

    SideBarController.$inject = ['$scope', '$rootScope', '$location', 'AuthenticationService', '$routeParams', '$timeout', 'AccService'];
    function SideBarController($scope, $rootScope, $location, AuthenticationService, $routeParams, $timeout, AccService) {

        var vm = $scope;
        vm.$location = $location;
        vm.goToPage = goToPage;
        vm.goToACCpage = goToACCpage;
        vm.toggleSideBar = toggleSideBar;
        vm.routeParams = angular.copy($routeParams);

        (function initController() {
            var prevprojectId = 0;
	        vm.accProjectId = $routeParams.id;
            if(!vm.accProjectId) {
                vm.accProject = AuthenticationService.GetACCProject();
                vm.accProjectId = vm.accProject.id;
            }
            loadSideNavMenu();
        })();

        function goToPage(page) {
            if(page === 'Spec View') {
                $location.path('/smartview/projects/' + vm.accProjectId);
            } else {
                $location.path('/' + page.replace(/\s+/g, '').toLowerCase() + '/projects/' + vm.accProjectId);
            }
        }

        function goToACCpage(tool) {
            AccService.clearStorageDataAndKeepToken();
            window.location = tool.url;
        }

        function toggleSideBar() {
            $rootScope.collapseSidebar = !$rootScope.collapseSidebar;
        }

        $rootScope.$on('userprojectschanged', function(event, args) {
			$timeout(function() {
                loadSideNavMenu();
            }, 10);
		});

        function loadSideNavMenu() {
            $scope.tools = [];
        	var products = AuthenticationService.GetACCProducts();
            if(products && products.length>0) {
                var autospecs = products.filter(function(item){return item.name.toUpperCase() == "AUTOSPECS"; });
                if(autospecs && autospecs.length>0) {
                    $scope.tools = autospecs[0].tools;
                }
            }
            AuthenticationService.setSideNavTools($scope.tools);
        }

        vm.highlightingPage = function(url) {
            if($location.absUrl() === url) {
                return true;
            } else if(url.indexOf('/smartregister')>-1 && ['/submittalschedule', '/compareversion'].indexOf($location.path())>-1) {
                return true;
            } else if(url.indexOf('/home')>-1 && $location.path().indexOf('/requirementsoverview')>-1) {
                return true;
            }
            return false;
        }

    }
})();
