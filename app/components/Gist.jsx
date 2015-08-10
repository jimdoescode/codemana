var React = require("react");
var Qwest = require("qwest");
var Modal = require("react-modal");
var File = require("./File.jsx");
var Utils = require("./Utils.jsx");

Modal.setAppElement(document.getElementById("mount-point"));
Modal.injectCSS();
Qwest.base = 'https://api.github.com';

module.exports = React.createClass({

    createComment: function(gistId, commentId, filename, lineNumber, commentBody, commentUser, replyTo, showForm) {
        return {
            gistId: gistId,
            id: commentId,
            filename: filename,
            line: parseInt(lineNumber, 10),
            body: commentBody,
            user: commentUser,
            replyTo: replyTo,
            showForm: showForm
        };
    },

    createFile: function(name, parsedLines) {
        return {
            name: name,
            parsedLines: parsedLines
        };
    },

    createCommentLink: function(filename, lineNumber) {
        return 'http://codemana.com/'+this.props.id+'#'+filename+'-L'+lineNumber;
    },

    getHeaders: function() {
        var headers = {};

        if (this.state.user !== null) {
            headers["Authorization"] = 'Basic '+btoa(this.state.user.login+':'+this.state.user.password);
        }

        return headers;
    },

    parseComment: function(comment) {
        //Annoyingly I couldn't get a single regex to separate everything out...
        var split = comment.body.match(/(\S+)\s(.*)/);
        var data = split[1].match(/http:\/\/codemana\.com\/(.*)#(.+)-L(\d+)/);

        return data !== null ? this.createComment(data[1], comment.id, data[2], parseInt(data[3], 10), split[2], comment.user, 0, false) : null;
    },

    parseFile: function(file) {
        var lines = Utils.syntaxHighlight(file.content, file.language);
        return this.createFile(file.filename, lines)
    },

    getInitialState: function() {
        return {
            files: [],
            comments: [],
            openComment: null,
            showLoginModal: false,
            user: Utils.getUserFromStorage(sessionStorage)
        };
    },

    componentDidMount: function() {
        var self = this;
        var options = {
            headers: this.getHeaders(),
            responseType: 'json'
        };

        Qwest.get('/gists/'+self.props.id, null, options).then(function(xhr, gist) {
            var files = [];
            for (var name in gist.files)
                files.push(self.parseFile(gist.files[name]));

            if (self.isMounted())
                self.setState({files: files});
        });

        Qwest.get('/gists/'+self.props.id+'/comments', null, options).then(function(xhr, comments) {
            var parsedComments = {};
            var commentCount = comments.length;
            for (var i=0; i < commentCount; i++) {
                var parsed = self.parseComment(comments[i]);

                if (parsedComments[parsed.filename] === undefined)
                    parsedComments[parsed.filename] = [];

                if (parsedComments[parsed.filename][parsed.line] === undefined)
                    parsedComments[parsed.filename][parsed.line] = [];

                parsedComments[parsed.filename][parsed.line].push(parsed);
            }

            if (self.isMounted()) {
                self.setState({
                    comments: parsedComments
                });
            }
        });
    },

    postGistComment: function(event) {
        var text = event.target.children.namedItem("text").value.trim();
        var comments = this.state.comments;
        var open = this.state.openComment;
        var options = {
            headers: this.getHeaders(),
            dataType: 'json',
            responseType: 'json'
        };

        event.preventDefault();

        if (text !== "" && open !== null) {
            open.body = text;
            open.showForm = false;
            comments[open.filename][open.line].splice(open.replyTo, 1, open);

            //Send the comment to GitHub. We only need to handle the case where it doesn't make it
            Qwest.post('/gists/'+this.props.id+'/comments', {body: this.createCommentLink(open.filename, open.line) + ' ' + text}, options);

            this.setState({
                comments: comments,
                openComment: null
            });
        }
    },

    insertCommentForm: function(filename, line, replyTo, event) {
        var comments = this.state.comments;
        var open = this.state.openComment;
        var newOpen = this.createComment(this.props.id, 0, filename, line, '', this.state.user, replyTo, true);

        if (this.state.user === null) {
            this.setState({showLoginModal: true});
            return;
        }

        event.preventDefault();

        if (open !== null)
            comments[open.filename][open.line].splice(open.replyTo, 1);

        if (!comments[filename])
            comments[filename] = [];

        if (!comments[filename][line])
            comments[filename][line] = [];

        if (open === null || open.filename !== newOpen.filename || open.line !== newOpen.line || open.replyTo !== newOpen.replyTo) {
            newOpen.id = comments[filename][line].length;
            comments[filename][line].splice(replyTo, 0, newOpen);
        } else {
            newOpen = null;
        }

        this.setState({
            comments: comments,
            openComment: newOpen
        });
    },

    removeCommentForm: function(event) {
        var comments = this.state.comments;
        var open = this.state.openComment;

        event.preventDefault();

        if (open !== null) {
            comments[open.filename][open.line].splice(open.replyTo, 1);
            this.setState({
                comments: comments,
                openComment: null
            });
        }
    },

    handleLogin: function(user) {
        this.setState({
            user: user,
            showLoginModal: false
        });
    },

    closeModal: function(event) {
        event.preventDefault();
        this.setState({showLoginModal: false});
    },

    render: function() {
        return (
            <div className="container main">
                <LoginModal show={this.state.showLoginModal} onSuccess={this.handleLogin} onClose={this.closeModal}/>
                {
                    this.state.files.map(function(file) {
                        return <File onCommentFormOpen={this.insertCommentForm}
                                     onCommentFormCancel={this.removeCommentForm}
                                     onCommentFormSubmit={this.postGistComment}
                                     key={file.name}
                                     name={file.name}
                                     lines={file.parsedLines}
                                     comments={this.state.comments[file.name]}/>
                    }, this)
                }
            </div>
        );
    }
});

var LoginModal = React.createClass({

    getDefaultProps: function() {
        return {
            show: false,
            onSuccess: function(user) {},
            onClose: function() {}
        };
    },

    getInitialState: function() {
        return {
            processing: false
        };
    },

    attemptLogin: function(event) {
        var username = event.target.elements.namedItem("username").value.trim();
        var password = event.target.elements.namedItem("password").value;
        var store = event.target.elements.namedItem("store").checked;
        var self = this;

        event.preventDefault();

        if (username && password) {

            var options = {
                headers: {
                    Authorization: 'Basic ' + btoa(username + ':' + password)
                },
                responseType: 'json'
            };

            this.setState({processing: true});
            Qwest.get('/user', null, options).then(function(xhr, user) {

                user.password = password;

                if (store)
                    Utils.saveUserToStorage(user, sessionStorage);

                self.props.onSuccess(user);

            }).complete(function(xhr, user) {

                self.setState({processing: false});

            });
        }
    },

    render: function() {
        var form = (
            <form className="pure-form pure-form-stacked" onSubmit={this.attemptLogin}>
                <fieldset>
                    <input name="username" className="pure-input-1" type="text" placeholder="GitHub User Name..."/>
                    <input name="password" className="pure-input-1" type="password" placeholder="GitHub Password or Token..."/>
                    <label><input name="store" type="checkbox"/> Store in Memory</label>
                </fieldset>
                <fieldset>
                    <button type="submit" className="pure-button button-primary"><i className="fa fa-save"/> Save</button>
                    <button className="pure-button button-error" onClick={this.props.onClose}><i className="fa fa-times-circle"/> Cancel</button>
                </fieldset>
            </form>
        );

        var spinner = (
            <p>Processing...</p>
        );

        return (
            <Modal isOpen={this.props.show} onRequestClose={this.props.onClose} className="react-modal-content" overlayClassName="react-modal-overlay">
                <h2><i className="fa fa-github"/> GitHub Access</h2>
                <p>You need to enter your GitHub user name and GitHub password. This is <strong>only</strong> used to post Gist comments to GitHub.</p>
                <p>If you prefer not to enter your password you can use a <a href="https://github.com/settings/tokens/new">personal access token</a>. Make sure it has Gist access.</p>
                <hr/>
                { this.state.processing ? spinner : form }
            </Modal>
        );
    }
});