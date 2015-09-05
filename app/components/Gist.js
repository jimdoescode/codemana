var React = require("react");
var Qwest = require("qwest");
var Modal = require("react-modal");
var File = require("./File.js");
var Utils = require("./Utils.js");
var Spinner = require("./Spinner.js");
var Config = require("./Config.js");

Modal.setAppElement(document.getElementById("mount-point"));
Modal.injectCSS();
Qwest.base = Config.gistApi;

module.exports = React.createClass({
    getHeaders: function() {
        var headers = {};
        if (this.state.user !== null)
            headers["Authorization"] = 'Basic ' + btoa(this.state.user.login + ':' + this.state.user.password);
        return headers;
    },

    getInitialState: function() {
        return {
            files: [],
            comments: [],
            openComment: null,
            showLoginModal: false,
            user: Utils.getUserFromStorage(sessionStorage),
            processing: true
        };
    },

    fetchGist: function(gistId) {
        var self = this;
        var options = {
            headers: this.getHeaders(),
            responseType: 'json'
        };

        Qwest.get('/gists/'+gistId, null, options).then(function(xhr, gist) {
            var files = [];
            for (var name in gist.files)
                files.push(Utils.parseFile(gist.files[name]));

            if (self.isMounted())
                self.setState({
                    files: files,
                    processing: false
                });
        }).catch(function(xhr, response, e) {
            console.log(xhr, response, e);
            alert('There was a problem fetching and or parsing this Gist.');
            self.setState({processing: false});
        });

        Qwest.get('/gists/'+gistId+'/comments', null, options).then(function(xhr, comments) {
            var parsedComments = {};
            var commentCount = comments.length;
            for (var i=0; i < commentCount; i++) {
                var parsed = Utils.parseComment(comments[i]);

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
        }).catch(function(xhr, response, e) {
            console.log(xhr, response, e);
            alert('There was a problem fetching the comments for this Gist.');
        });
    },

    componentDidMount: function() {
        this.fetchGist(this.props.id);
    },

    componentWillReceiveProps: function(newProps) {
        this.setState({processing: true});
        this.fetchGist(newProps.id);
    },

    componentDidUpdate: function(prevProps, prevState) {
        //If there is a hash specified then attempt to scroll there.
        if (window.location.hash) {
            var elm = document.getElementById(window.location.hash.substring(1));
            if (elm)
                window.scrollTo(0, elm.offsetTop);
        }
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
            Qwest.post('/gists/'+this.props.id+'/comments', {body: Utils.createCommentLink(this.props.id, open.filename, open.line) + ' ' + text}, options);

            this.setState({
                comments: comments,
                openComment: null
            });
        }
    },

    insertCommentForm: function(filename, line, replyTo, event) {
        var comments = this.state.comments;
        var open = this.state.openComment;
        var newOpen = Utils.createComment(this.props.id, 0, filename, line, '', this.state.user, replyTo, true);

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
        var body = this.state.processing ?
                    <Spinner/> : this.state.files.map(function(file) {
                        return <File onCommentFormOpen={this.insertCommentForm}
                                     onCommentFormCancel={this.removeCommentForm}
                                     onCommentFormSubmit={this.postGistComment}
                                     key={file.name}
                                     name={file.name}
                                     lines={file.parsedLines}
                                     comments={this.state.comments[file.name]}/>
                    }, this);

        return (
            <div className="container main">
                <LoginModal show={this.state.showLoginModal} onSuccess={this.handleLogin} onClose={this.closeModal}/>
                {body}
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
                    <input name="username" className="pure-input-1" type="text" placeholder="GitHub User Name..." required="true"/>
                    <input name="password" className="pure-input-1" type="password" placeholder="GitHub Password or Token..." required="true"/>
                    <label><input name="store" type="checkbox"/> Store in Memory</label>
                </fieldset>
                <fieldset>
                    <button type="submit" className="pure-button button-primary"><i className="fa fa-save"/> Save</button>
                    <button className="pure-button button-error" onClick={this.props.onClose}><i className="fa fa-times-circle"/> Cancel</button>
                </fieldset>
            </form>
        );

        return (
            <Modal isOpen={this.props.show} onRequestClose={this.props.onClose} className="react-modal-content" overlayClassName="react-modal-overlay">
                <h2><i className="fa fa-github"/> GitHub Access</h2>
                <p>To leave a comment you need to enter your GitHub user name and GitHub password. This is <strong>only</strong> used to post Gist comments to GitHub.</p>
                <p>If you prefer not to enter your password you can use a <a target="_blank" href="https://github.com/settings/tokens/new">personal access token</a>. Make sure it has Gist access.</p>
                <hr/>
                { this.state.processing ? <Spinner className="fa-github-alt"/> : form }
            </Modal>
        );
    }
});