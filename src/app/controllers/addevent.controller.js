//import angular from "angular";

(function () {
	'use strict';

angular.module('EventsApp').controller('FormCtrl', FormCtrl);

    FormCtrl.$inject = ['EventFactory', '$location'];
	function FormCtrl(EventFactory, $location) {

        var self = this;
        this.eventForm = {};
        this.categories = [{
            id: 1,
            name: 'Music'
        }, {
            id: 2,
            name: 'Cinema'
        }, {
            id: 3,
            name: 'Games'
        }, {
            id: 4,
            name: 'Special Category'
        }];
        this.selectedOption = {
            id: 1,
            name: 'Music'
        };
        this.submitForm = function(form) {
            form.category = this.selectedOption;
            EventFactory.createEvent(angular.copy(form)).then(function(data) {
                alert("Event Added Succesfully");
            }, function(error) {
                alert('An error occurred ' + error.statusText);
            });
        }

		this.gotoDetails = function() {
			EventFactory.changeBasePath('http://localhost:8083/');
			$location.path('/event-details');
        }


    }
})();
