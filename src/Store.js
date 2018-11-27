import {createStore, applyMiddleware} from 'redux';
import Thunk from 'redux-thunk';

import Reducer from './Reducers.js';

export default function(preloadedState) {
    return createStore(
        Reducer,
        preloadedState,
        applyMiddleware(Thunk)
    );
}
