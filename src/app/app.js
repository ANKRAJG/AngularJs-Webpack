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
		   templateUrl: 'views/event-details.html',
		   controller: 'EventDetailsCtrl',
	  })
	   .otherwise({redirectTo:'/'});
       $locationProvider.html5Mode(true);
}]);

//angular.bootstrap(document, ['EventsApp']);
