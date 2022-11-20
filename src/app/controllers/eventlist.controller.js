//import angular from "angular";

(function () {
	'use strict';

angular.module('EventsApp').controller('EventManagerCtrl', EventManagerCtrl);

    EventManagerCtrl.$inject = ['EventFactory', 'initialData'];
    function EventManagerCtrl(EventFactory, initialData) {
        var self = this;
        self.edit = {};
        self.eventList = initialData.data;
        self.update = function(event) {
            EventFactory.updateEvent(event).then(function(data) {
                self.eventList = data;
            }, function(error) {
                alert('An error occurred while updating the event')
            });
        }

        self.delete = function(event) {
              EventFactory.deleteEvent(event).then(function(data) {
                    self.eventList = data;

              }, function(error) {
                 alert('An error occurred');
              });
        }

    }
})();
