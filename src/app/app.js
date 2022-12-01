import angular from 'angular';
import 'angular-route';
import 'angular-mocks';

import 'jquery';
import 'bootstrap/dist/js/bootstrap';


angular.module('EventsApp', ['ngRoute','ngMockE2E'])
.filter ('customLowerCase', function () {
	  return function (item) {
	  	 return item.toLowerCase();
	  }
})

.config(['$routeProvider','$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
        .when('/', {
    	   	templateUrl: 'views/home.html'
    	})
        .when('/add-event', {
    	   	templateUrl: 'views/add-event.html',
    	   	controller: 'FormCtrl',
    	   	controllerAs: 'eventCtl'
	   })
    	.when('/event-list', {
    	   	templateUrl: 'views/event-list.html',
    	   	controller: 'EventManagerCtrl',
    	   	controllerAs: 'managerCtl',
    	   	resolve: {
    	   	    initialData: function(EventFactory) {
    	   			return EventFactory.getAllEvents();
    	   	    }
    	   	}
       })
	   .when('/event-details', {
		   templateUrl: 'views/event-details.html'
	   })
	   .when('/auth/signup', {})
	   .otherwise({redirectTo:'/'});
       $locationProvider.html5Mode(true);
}])

.run(['$rootScope', '$timeout', '$route', function($rootScope, $timeout, $route) {
	const changeBasePath = basePath => {
		const prevBase = document.querySelector('base');
		if(prevBase) {
			prevBase.remove();
		}
		const base = document.createElement('base');
		base.href = basePath;
		document.getElementsByTagName('head')[0].appendChild(base);
	}

	var allRoutes = [];
	for (const property in $route.routes) {
		if($route.routes.hasOwnProperty(property)) {
			allRoutes.push(property);
		}
	}
	// console.log('routes = ', allRoutes);
	localStorage.setItem('angularJsRoutes', allRoutes);

	$rootScope.$on('$locationChangeSuccess', function (event, next, current) {
		$timeout(function() {
			localStorage.setItem('previousUrl', window.location.pathname);
			// After bootstraping angular app, changing base path back to '/' to again get back to react context
			changeBasePath('/');
		}, 0);
	});
}]);
