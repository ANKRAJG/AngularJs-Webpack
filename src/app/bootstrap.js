import 'bootstrap/dist/css/bootstrap.min.css';
require('../styles/main.css');
require('../index.html');

require('./app');
require('./backend/index');
require('./views/index');
require('./controllers/index');
require('./services/index')


//angular.module('EventsApp', ['ngRoute','ngMockE2E']);
// Mount function to start up the app
const mount = (el) => {
    //const rootNode = document.getElementById('_angularjs-dev-root');
    angular.bootstrap(el, ['EventsApp']);
    //angular.bootstrap(el, rootNode);

    // ReactDOM.render(<React.StrictMode>
    //     <App />
    //   </React.StrictMode>, el);

    // Need to import it in angularJs way
}

if (process.env.NODE_ENV === 'development') {
    //const rootNode = document.getElementById('_angularjs-dev-root');
    angular.bootstrap(document, ['EventsApp']);
    // if (rootNode) {
    //     mount(rootNode);
    // }
}

export { mount };
