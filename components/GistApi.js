var Utils = require("./Utils.js");

//Pull in the fetch shim
require('whatwg-fetch');

module.exports = function (baseUrl, timeoutSeconds, storage) {

    //These are private methods.
    var local = {
        getAuthToken: function () {
            return storage.getItem('gistAuthToken');
        },

        setAuthToken: function (token) {
            storage.setItem('gistAuthToken', token);
        },

        getUserData: function () {
            return JSON.parse(storage.getItem('githubUserData'));
        },

        setUserData: function (data) {
            return storage.setItem('githubUserData', data);
        },

        timeout: function () {
            return new Promise(function (resolve, reject) {
                window.setTimeout(function() {
                    reject('request timeout after ' + timeoutSeconds + ' seconds')
                }, timeoutSeconds * 1000);
            });
        },

        getHeaders: function () {
            var obj = {'Content-Type': 'application/json'};
            var token = this.getAuthToken();
            if (token)
                obj['Authorization'] = 'Basic ' + token;

            return new Headers(obj);
        },

        formatUser: function (githubUser) {
            if (!githubUser)
                return null;

            return {
                name: githubUser.login,
                avatar_url: githubUser.avatar_url,
                html_url: githubUser.html_url
            }
        }
    };

    //Set some defaults if they weren't set during initialization.
    baseUrl = !!baseUrl ? baseUrl : 'https://api.github.com';
    storage = !!storage ? storage : sessionStorage;
    timeoutSeconds = !!timeoutSeconds ? timeoutSeconds : 10;

    return {
        user: function () {
            var userBaseUrl = baseUrl + '/user';
            return {
                login: function (user, pass) {
                    local.setAuthToken(window.btoa(user + ':' + pass));

                    return Promise.race([
                        local.timeout(),
                        window.fetch(userBaseUrl, {headers: local.getHeaders()})
                    ]).then (function (response) {
                        return response.json();
                    }).then (function (json) {
                        local.setUserData(JSON.stringify(json));
                        return json;
                    }).catch (function (data) {
                        local.setAuthToken(null);
                        return data;
                    });
                },

                getData: function () {
                    if (this.isLoggedIn())
                        return local.formatUser(local.getUserData());

                    return null;
                },

                logout: function () {
                    local.setUserData(null);
                    local.setAuthToken(null);
                    return Promise.resolve();
                },

                isLoggedIn: function () {
                    return !!local.getAuthToken();
                }
            };
        },

        code: function(id) {
            var user = this.user();
            var gistBaseUrl = baseUrl + '/gists/' + id;

            return {
                fetch: function () {
                    return Promise.race([
                        local.timeout(),
                        window.fetch(gistBaseUrl)
                    ]).then(function (response) {
                        return response.json();
                    }).then(function (gistJson) {
                        var files = [];
                        for (var name in gistJson.files) {
                            files.push(Utils.parseFile(
                                gistJson.files[name].content,
                                gistJson.files[name].language,
                                gistJson.files[name].filename
                            ));
                        }
                        return files;
                    });
                },

                fetchComments: function () {
                    return Promise.race([
                        local.timeout(),
                        window.fetch(gistBaseUrl + '/comments')
                    ]).then(function (response) {
                        return response.json();
                    }).then(function (commentJson) {
                        var comments = {};
                        var commentCount = commentJson.length;
                        for (var i=0; i < commentCount; i++) {
                            var parsed = Utils.parseComment(
                                commentJson[i].id,
                                commentJson[i].body,
                                local.formatUser(commentJson[i].user)
                            );

                            if (comments[parsed.filename] === undefined)
                                comments[parsed.filename] = [];

                            if (comments[parsed.filename][parsed.line] === undefined)
                                comments[parsed.filename][parsed.line] = [];

                            comments[parsed.filename][parsed.line].push(parsed);
                        }
                        return comments;
                    });
                },

                commentTemplate: {
                    text: '',
                    filename: '',
                    linenumber: 0,
                    post: function () {
                        if (!user.isLoggedIn())
                            return Promise.reject('You must be logged in to make a comment.');

                        this.text = Utils.createCommentLink(id, this.filename, this.linenumber) + ' ' + this.text;

                        return Promise.race([
                            local.timeout(),
                            window.fetch(gistBaseUrl + '/comments', {
                                method: 'POST',
                                headers: local.getHeaders(),
                                body: this.text
                            })
                        ]).then(function (response) {
                            return response.json();
                        });
                    }
                }
            };
        }
    };
};