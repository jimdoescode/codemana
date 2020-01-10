import Utils from './Utils.js';

export const REQUEST_USER_LOGIN = 'REQUEST_USER_LOGIN';
export const RECEIVE_USER_LOGIN = 'RECEIVE_USER_LOGIN';
export const TOGGLE_LOGIN_MODAL = 'TOGGLE_LOGIN_MODAL';

export const CHANGE_HIGHLIGHT = 'CHANGE_HIGHLIGHT';

export const REQUEST_COMMENTS = 'REQUEST_COMMENTS';
export const RECEIVE_COMMENTS = 'RECEIVE_COMMENTS';
export const TOGGLE_COMMENT_FORM = 'TOGGLE_COMMENT_FORM';
export const REQUEST_POST_COMMENT = 'REQUEST_POST_COMMENT';
export const RECEIVE_POST_COMMENT = 'RECEIVE_POST_COMMENT';

export const REQUEST_CODE = 'REQUEST_CODE';
export const RECEIVE_CODE = 'RECEIVE_CODE';

function requestLogin() {
    return {
        type: REQUEST_USER_LOGIN
    };
}

function receiveLogin(token, user, showLoginModal) {
    return {
        type: RECEIVE_USER_LOGIN,
        token: token,
        data: user,
        displayLoginModal: showLoginModal
    };
}

export function userLogin(user, password) {
    return function(dispatch, getState) {
        var state = getState();
        var token = window.btoa(user.trim() + ':' + password.trim());

        dispatch(requestLogin(user.trim(), password.trim()));

        return Promise.race([
            Utils.timeoutPromise(),
            window.fetch(state.config.githubApi + '/user', {headers: Utils.getRequestHeaders(token)})
        ]).then (function (response) {
            var json = response.json();
            if (!response.ok) {
                throw Error(json.message);
            }
            return json;
        }).then(function(user) {

            state.config.storage.setItem('gistAuthToken', token);
            state.config.storage.setItem('githubUserData', JSON.stringify(user));

            dispatch(receiveLogin(token, Utils.parseGitHubUser(user), false));
        }).catch(function(message) {
            window.alert("Failed to login. Please try again.");
            console.log(message);

            dispatch(receiveLogin(null, null, true));
        });
    };
}

export function fetchStoredUser() {
    return function(dispatch, getState) {
        var state = getState();
        var token = state.config.storage.getItem('gistAuthToken');
        var user = JSON.parse(state.config.storage.getItem('githubUserData'));

        user = user ? Utils.parseUser(user.id, user.login, user.html_url, user.avatar_url) : null;

        dispatch(receiveLogin(token, user, false));
    };
}

export function userLogout() {
    return function(dispatch, getState) {
        var state = getState();
        state.config.storage.removeItem('gistAuthToken');
        state.config.storage.removeItem('githubUserData');

        dispatch(receiveLogin(null, null, false));
    };
}

export function showLoginModal() {
    return {
        type: TOGGLE_LOGIN_MODAL,
        display: true
    };
}

export function hideLoginModal() {
    return {
        type: TOGGLE_LOGIN_MODAL,
        display: false
    };
}


export function changeHighlight(highlight) {
    return {
        type: CHANGE_HIGHLIGHT,
        highlight: highlight
    };
}

function requestComments(gistId) {
    return {
        type: REQUEST_COMMENTS,
        gistId: gistId
    };
}

function receiveComments(gistId, entries) {
    return {
        type: RECEIVE_COMMENTS,
        gistId: gistId,
        entries: entries
    };
}

export function fetchComments(gistId) {
    return function(dispatch, getState) {
        var state = getState();
        dispatch(requestComments(gistId));

        return Promise.race([
            Utils.timeoutPromise(),
            window.fetch(state.config.githubApi + '/gists/' + gistId + '/comments', {headers: Utils.getRequestHeaders(state.user.token)})
        ]).then(function (response) {
            var json = response.json();
            if (!response.ok) {
                throw Error(json.message);
            }
            return json;
        }).then(function (commentJson) {
            var comments = {};
            var commentCount = commentJson.length;

            for (var i=0; i < commentCount; i++) {
                var parsed = Utils.parseGitHubComment(commentJson[i]);
                if (parsed) {
                    if (!comments[parsed.fileName])
                        comments[parsed.fileName] = [];

                    if (!comments[parsed.fileName][parsed.lineNumber])
                        comments[parsed.fileName][parsed.lineNumber] = [];

                    comments[parsed.fileName][parsed.lineNumber].push(parsed);
                }
            }
            return comments;
        }).then(function(comments) {
            dispatch(receiveComments(gistId, comments));
        }).catch(function (message) {
            console.log(message);
            dispatch(receiveComments(gistId, {}));
        });
    };
}

export function showCommentForm(user, fileName, lineNumber, index = 0, isEdit = false) {
    return {
        type: TOGGLE_COMMENT_FORM,
        display: true,
        user: user,
        fileName: fileName,
        lineNumber: lineNumber,
        index: index,
        isEdit: isEdit
    };
}

export function hideCommentForm() {
    return {
        type: TOGGLE_COMMENT_FORM,
        display: false
    };
}

function requestPostComment(gistId, comment) {
    return {
        type: REQUEST_POST_COMMENT,
        gistId: gistId,
        comment: comment
    };
}

function receivePostComment(gistId, comment) {
    return {
        type: RECEIVE_POST_COMMENT,
        gistId: gistId,
        comment: comment
    };
}

export function postComment(gistId, comment, commentText) {
    return function(dispatch, getState) {
        var state = getState();
        var url = state.config.githubApi + '/gists/' + gistId + '/comments';
        if (comment.id) {
            url += '/' + comment.id;
        }

        // If the comment hasn't changed then save the http request
        if (comment.rawBody === commentText) {
            dispatch(hideCommentForm());
            return Promise.resolve();
        }

        dispatch(requestPostComment(gistId, comment));

        var commentBody = Utils.createCommentLink(gistId, comment.fileName, comment.lineNumber) + ' ' + commentText;

        return Promise.race([
            Utils.timeoutPromise(),
            window.fetch(url, {
                method: comment.id ? 'PATCH' : 'POST',
                headers: Utils.getRequestHeaders(state.user.token),
                body: JSON.stringify({body: commentBody})
            })
        ]).then(function (response) {
            var json = response.json();
            if (!response.ok) {
                throw Error(json.message);
            }
            return json;
        }).then(function (commentJson) {
            return Utils.parseGitHubComment(commentJson);
        }).then(function(comment) {
            dispatch(receivePostComment(gistId, comment));
        }).catch(function (message) {
            console.log(message);
            window.alert("There was a problem posting this comment!");
            dispatch(receivePostComment(gistId, null));
        });
    };
}

function requestCode(gistId) {
    return {
        type: REQUEST_CODE,
        gistId: gistId
    };
}

function receiveCode(gistId, files) {
    return {
        type: RECEIVE_CODE,
        gistId: gistId,
        files: files
    };
}

export function fetchCode(gistId) {
    return function(dispatch, getState) {
        var state = getState();
        dispatch(requestCode(gistId));

        return Promise.race([
            Utils.timeoutPromise(),
            window.fetch(state.config.githubApi + '/gists/' + gistId, {headers: Utils.getRequestHeaders(state.user.token)})
        ]).then(function(response) {
            if (!response.ok) {
                throw Error(response.json().message);
            }
            return response.json();
        }).then(function(gistJson) {
            var files = [];
            for (var name in gistJson.files) {
                files.push(Utils.parseFile(
                    gistJson.files[name].content,
                    gistJson.files[name].language,
                    gistJson.files[name].filename
                ));
            }
            return files;
        }).then(function(files) {
            dispatch(receiveCode(gistId, files));
        }).catch(function (message) {
            window.alert('There was a problem fetching or parsing this gist.');
            console.log(message);
            dispatch(receiveCode(gistId, []));
        });
    };
}
