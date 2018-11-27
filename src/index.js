import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import Store from './Store.js';
import HomeRoute from './HomePage.js';
import GistRoute from './GistPage.js';
import * as serviceWorker from './serviceWorker';

ReactDOM.render((
    <Provider store={Store()}>
        <BrowserRouter>
            <App>
                <Switch>
                    <Route name="home" exact path="/" component={HomeRoute}/>
                    <Route name="gist" path="/:gistId" component={GistRoute}/>
                </Switch>
            </App>
        </BrowserRouter>
    </Provider>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
