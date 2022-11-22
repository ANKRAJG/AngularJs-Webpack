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
    var prevBase = document.querySelector('base');
    if(prevBase) {
        prevBase.remove();
    }
    var base = document.createElement('base');
    base.href = basePath;
    document.getElementsByTagName('head')[0].appendChild(base);
}

// Mount function to start up the app
const mount = (el) => {
    changeBasePath('http://localhost:8083/');
    angular.bootstrap(el.childNodes[0], ['EventsApp']);
    localStorage.setItem('previousUrl', window.location.pathname);

    // After bootstraping angular app, changing base path back to '/' to again get back to react context
    changeBasePath('/');

    return {
        onParentNavigate(location) {
            // Not a good solution as we are rebootstraoing again
            if(localStorage.previousUrl !== window.location.pathname) {
                console.log('Container url changed');
                changeBasePath('http://localhost:8083/');

                // Kill the app and rebootstrap again
                angular.element(el.childNodes[0]).remove();
                var newDiv = document.createElement("div");
                var ngView = document.createElement("ng-view");
                newDiv.appendChild(ngView);
                el.appendChild(newDiv);
                angular.bootstrap(el.childNodes[0], ['EventsApp']);
                localStorage.setItem('previousUrl', window.location.pathname);

                // After bootstraping angular app, changing base path back to '/' to again get back to react context
                changeBasePath('/');
            }
        }
    }
}

if (process.env.NODE_ENV === 'development' && location.origin === 'http://localhost:8083') {
    //const rootNode = document.getElementById('_angularjs-dev-root');
    angular.bootstrap(document, ['EventsApp']);
    // if (rootNode) {
    //     mount(rootNode);
    // }
}

export { mount };
