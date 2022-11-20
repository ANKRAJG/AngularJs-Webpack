//import angular from "angular";

(function () {
	'use strict';

angular.module('EventsApp').controller('FormCtrl', FormCtrl);

    FormCtrl.$inject = ['EventFactory'];
	function FormCtrl(EventFactory) {

        var self = this;
        this.eventForm = {};
        //this.eventForm.date = new Date(2016,0,1);
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

    }
})();
