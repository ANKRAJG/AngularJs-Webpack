(function () {
	'use strict';

angular.module('EventsApp').controller('EventDetailsCtrl', EventDetailsCtrl);

    EventDetailsCtrl.$inject = ['$rootScope'];
	function EventDetailsCtrl($rootScope) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var prevBase = document.querySelector('base');
            if(prevBase) {
                prevBase.remove();
            }
            var base = document.createElement('base');
            base.href = '/';
            document.getElementsByTagName('head')[0].appendChild(base);
        });
    }
})();
