const Config = require("./Config.js");

const Actions = require("./Actions.js");
const Redux = require("redux");

function config(state = Config, action) {
    return state;
}

function user(state = {displayLoginModal: false, isFetching: false, data: null, token: null}, action) {
    switch (action.type) {
        case Actions.TOGGLE_LOGIN_MODAL:
            return Object.assign({}, state, {
                displayLoginModal: action.display
            });

        case Actions.REQUEST_USER_LOGIN:
            return Object.assign({}, state, {
                displayLoginModal: true,
                isFetching: true
            });

        case Actions.RECEIVE_USER_LOGIN:
            return Object.assign({}, state, {
                displayLoginModal: action.displayLoginModal,
                isFetching: false,
                data: action.data,
                token: action.token
            });

        default:
            return state;
    }
}

function highlight(state = 'okaidia', action) {
    switch (action.type) {
        case Actions.CHANGE_HIGHLIGHT:
            return action.highlight;
        default:
            return state;
    }
}

function code(state = {isFetching: true, files: []}, action) {
    switch (action.type) {
        case Actions.REQUEST_CODE:
            return Object.assign({}, state, {
                isFetching: true
            });

        case Actions.RECEIVE_CODE:
            return Object.assign({}, state, {
                isFetching: false,
                files: action.files
            });

        default:
            return state;
    }
}

function comments(state = {isFetching: true, isPosting: false, entries: {}, openComment: null}, action) {
    var entries;
    switch (action.type) {
        case Actions.REQUEST_COMMENTS:
            return Object.assign({}, state, {
                isFetching: true
            });

        case Actions.RECEIVE_COMMENTS:
            return Object.assign({}, state, {
                isFetching: false,
                entries: action.entries
            });

        case Actions.TOGGLE_COMMENT_FORM:
            entries = Object.assign({}, state.entries);
            if (state.openComment !== null) {
                if (entries[state.openComment.fileName][state.openComment.lineNumber][state.openComment.index].id) {
                    entries[state.openComment.fileName][state.openComment.lineNumber][state.openComment.index].isOpen = false;
                } else {
                    entries[state.openComment.fileName][state.openComment.lineNumber].splice(state.openComment.index, 1);
                }
            }

            if (!action.display) {
                return Object.assign({}, state, {
                    entries: entries,
                    openComment: null
                });
            }

            if (!state.entries[action.fileName]) {
                entries[action.fileName] = [];
                entries[action.fileName][action.lineNumber] = [];
            } else if (!state.entries[action.fileName][action.lineNumber]) {
                entries[action.fileName][action.lineNumber] = [];
            }

            if (!action.isEdit) {
                entries[action.fileName][action.lineNumber].splice(action.index, 0, {
                    body: '',
                    fileName: action.fileName,
                    lineNumber: action.lineNumber,
                    user: action.user,
                    isOpen: true,
                    isPosting: false
                });
            } else {
                entries[action.fileName][action.lineNumber][action.index].isOpen = true;
            }

            return Object.assign({}, state, {
                entries: entries,
                openComment: {fileName: action.fileName, lineNumber: action.lineNumber, index: action.index}
            });

        case Actions.REQUEST_POST_COMMENT:
            entries = Object.assign({}, state.entries);
            entries[state.openComment.fileName][state.openComment.lineNumber][state.openComment.index].isPosting = true;

            return Object.assign({}, state, {
                entries: entries
            });

        case Actions.RECEIVE_POST_COMMENT:
            entries = Object.assign({}, state.entries);
            entries[state.openComment.fileName][state.openComment.lineNumber][state.openComment.index] = action.comment;

            return Object.assign({}, state, {
                openComment: null,
                entries: entries
            });

        default:
            return state;
    }
}

// In redux you can only have a single root reducer
// so combine all the reducers together.
module.exports = Redux.combineReducers({
    config,
    user,
    highlight,
    code,
    comments
});