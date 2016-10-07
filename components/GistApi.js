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

        /**
         * Takes a user object from GitHub and formats it so that we
         * can use it generally throughout the rest of the code.
         *
         * @param githubUser
         * @returns {*}
         */
        formatUser: function (githubUser) {
            return githubUser ?
                Utils.parseUser(githubUser.login, githubUser.html_url, githubUser.avatar_url) :
                null;
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

        code: function (id) {
            var user = this.user();
            var gistBaseUrl = baseUrl + '/gists/' + id;

            //This function gets attached to each comment
            var saveComment = function () {
                if (!user.isLoggedIn())
                    return Promise.reject('You must be logged in to make a comment.');

                var commentBody = Utils.createCommentLink(id, this.fileName, this.lineNumber) + ' ' + this.body;

                return Promise.race([
                    local.timeout(),
                    window.fetch(gistBaseUrl + '/comments', {
                        method: 'POST',
                        headers: local.getHeaders(),
                        body: JSON.stringify({body: commentBody})
                    })
                ]).then(function (response) {
                    return response.json();
                }).then(function (commentJson) {
                    return Utils.parseComment(
                        commentJson.id,
                        commentJson.body,
                        false,
                        local.formatUser(commentJson.user),
                        saveComment
                    )
                });
            };

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
                                false,
                                local.formatUser(commentJson[i].user),
                                saveComment
                            );

                            if (!comments[parsed.fileName])
                                comments[parsed.fileName] = [];

                            if (!comments[parsed.fileName][parsed.lineNumber])
                                comments[parsed.fileName][parsed.lineNumber] = [];

                            comments[parsed.fileName][parsed.lineNumber].push(parsed);
                        }
                        return comments;
                    });
                },

                getNewComment: function () {
                    return Utils.parseComment(0, '', true, user.getData(), saveComment);
                }
            };
        }
    };
};