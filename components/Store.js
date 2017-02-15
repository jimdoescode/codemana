const Redux = require('redux');
const Thunk = require('redux-thunk');
const Reducer = require('./Reducers.js');

module.exports = function(preloadedState) {
    return Redux.createStore(
        Reducer,
        preloadedState,
        Redux.applyMiddleware(Thunk.default)
    )
};