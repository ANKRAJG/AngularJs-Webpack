(function () {
	'use strict';

    angular.module('EventsApp').factory('EventFactory', EventFactory);

    EventFactory.$inject = ['$http', '$q'];
    function EventFactory($http, $q) {
        var eventFactory = {};

        eventFactory.getAllEvents = function() {
           return $http.get('api/events');
        }

        eventFactory.createEvent = function(event) {
            return $http.post('api/events/new',event);
        }

        eventFactory.deleteEvent = function(event) {
            return $http.post('api/events/delete',event).then(function(response) {
             	var data = response.data.events;
             	return data;
             });
        }

        eventFactory.updateEvent = function(event) {
            return $http.post('api/events/update', event).then(function(response) {
             	var data = response.data.events;
             	return data;
             }, function(error) {return false;});
        }

		eventFactory.changeBasePath = basePath => {
			let prevBase = document.querySelector('base');
			if(prevBase) {
				prevBase.remove();
			}
			let base = document.createElement('base');
			base.href = basePath;
			document.getElementsByTagName('head')[0].appendChild(base);
		}
		
        return eventFactory;

    }
})();
