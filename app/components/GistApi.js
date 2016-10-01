//Pull in the fetch shim
require('whatwg-fetch');

module.exports = function(baseUrl, timeoutSeconds, storage) {

    //These are private methods.
    var local = {
        getAuthToken: function() {
            return storage.getItem('gistAuthToken');
        },

        setAuthToken: function(token) {
            storage.setItem('gistAuthToken', token);
        },

        timeout: function () {
            return new Promise(function (resolve, reject) {
                window.setTimeout(reject, (timeoutSeconds * 1000), 'request timeout after ' + timeoutSeconds + ' seconds');
            });
        },

        getHeaders: function() {
            var obj = {'Content-Type': 'application/json'};
            var token = this.getAuthToken();
            if (token) {
                obj['Authorization'] = 'Basic ' + token;
            }

            return new Headers(obj);
        },
    };

    //Set some defaults if they weren't set during initialization.
    baseUrl = !!baseUrl ? baseUrl : 'https://api.github.com/';
    storage = !!storage ? storage : sessionStorage;
    timeoutSeconds = !!timeoutSeconds ? timeoutSeconds : 10;

    return {
        user: function() {
            var userBaseUrl = baseUrl + 'user';
            return {
                login: function(user, pass) {
                    local.setAuthToken(user + ':' + pass);

                    return Promise.race([
                        local.timeout(),
                        window.fetch(userBaseUrl, {headers: local.getHeaders()})
                    ]).then(function(response) {
                        return response.json();
                    }).catch(function() {
                        local.setAuthToken(null);
                    });
                },

                logout: function() {
                    local.setAuthToken(null);
                    return Promise.resolve();
                },

                isLoggedIn: function() {
                    return !!local.getAuthToken();
                }
            };
        },

        code: function(id) {
            var user = this.user();
            var gistBaseUrl = baseUrl + 'gist/' + id + '/';

            return {
                fetch: function() {
                    return Promise.race([
                        local.timeout(),
                        window.fetch(gistBaseUrl)
                    ]).then(function(response) {
                        return response.json();
                    });
                },

                fetchComments: function() {
                    return Promise.race([
                        local.timeout(),
                        window.fetch(gistBaseUrl + 'comments')
                    ]).then(function(response) {
                        return response.json();
                    });
                },

                postComment: function(comment) {
                    if (!user.isLoggedIn()) {
                        return Promise.reject('You must be logged in to make a comment.');
                    }

                    return Promise.race([
                        local.timeout(),
                        window.fetch(gistBaseUrl + 'comments', {
                            method: 'POST',
                            headers: local.getHeaders(),
                            body: comment
                        })
                    ]);
                }
            };
        }
    };
};