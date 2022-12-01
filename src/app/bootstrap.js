import 'bootstrap/dist/css/bootstrap.min.css';
require('../styles/main.css');
require('../index.html');

require('./app');
require('./backend/index');
require('./views/index');
require('./controllers/index');
require('./services/index')


// angular.module('EventsApp', ['ngRoute','ngMockE2E']);

const changeBasePath = basePath => {
    const prevBase = document.querySelector('base');
    if(prevBase) {
        prevBase.remove();
    }
    const base = document.createElement('base');
    base.href = basePath;
    document.getElementsByTagName('head')[0].appendChild(base);
}

const postRouteChange = () => {
    // Moved these lines to app.js '$locationChangeSuccess' function
    localStorage.setItem('previousUrl', window.location.pathname);
    // After bootstraping angular app, changing base path back to '/' to again get back to react context
    changeBasePath('/');
}

const checkForAnyContainerNavigation = (onNavigate, el) => {
    if(onNavigate) {
        var scope = angular.element(el.childNodes[0]).scope();
        scope.$on('getRouteToContainer', function(event, route) {
            console.log('route = ', route);
            onNavigate({ pathname: route });
        });
    }
}

// Mount function to start up the app
const mount = (el, { onNavigate }) => {
    changeBasePath('http://localhost:8083/');
    angular.bootstrap(el.childNodes[0], ['EventsApp']);
    // postRouteChange();
    checkForAnyContainerNavigation(onNavigate, el);

    return {
        onParentNavigate(location) {
            // Not a good solution as we are rebootstraping again
            var newPath = window.location.pathname;
            var excludedRoutes = ['/auth/signup'];
            if(localStorage.previousUrl !== newPath &&
                (localStorage.angularJsRoutes.indexOf(newPath) > -1 && excludedRoutes.indexOf(newPath) <= -1)) {
                console.log('Container url changed');
                changeBasePath('http://localhost:8083/');

                // Kill the app and rebootstrap again
                angular.element(el.childNodes[0]).remove();
                var newDiv = document.createElement("div");
                var ngView = document.createElement("ng-view");
                newDiv.appendChild(ngView);
                el.appendChild(newDiv);
                angular.bootstrap(el.childNodes[0], ['EventsApp']);
                //postRouteChange();
            }

            checkForAnyContainerNavigation(onNavigate, el);
        }
    }
}

if (process.env.NODE_ENV === 'development' && location.origin === 'http://localhost:8083') {
    //const rootNode = document.getElementById('_angularjs-dev-root');
    // if (rootNode) {
    //     mount(rootNode);
    // }
    angular.bootstrap(document, ['EventsApp']);
}

export { mount };
