var React = require("react");
var Qwest = require("qwest");
var File = require("./File.jsx");
var Utils = require("./Utils.jsx");

module.exports = React.createClass({

    createComment: function(gistId, commentId, filename, lineNumber, commentBody, commentUser, replyTo, showForm = false) {
        return {
            gistId: gistId,
            id: commentId,
            fileName: filename,
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

    parseComment: function(comment) {
        //Annoyingly I couldn't get a single regex to separate everything out...
        var split = comment.body.match(/(\S+)\s(.*)/);
        var data = split[1].match(/http:\/\/codemana\.com\/(.*)#(.+)-L(\d+)/);

        return data !== null ? this.createComment(data[1], comment.id, data[2], parseInt(data[3], 10), split[2], comment.user, 0) : null;
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
            username: null,
            password: null
        };
    },

    componentDidMount: function() {
        var self = this;
        Qwest.get('https://api.github.com/gists/'+self.props.id).then(function(xhr, gist) {
            var files = [];
            for (var name in gist.files)
                files.push(self.parseFile(gist.files[name]));

            if (self.isMounted())
                self.setState({files: files});
        });

        Qwest.get('https://api.github.com/gists/'+self.props.id+'/comments').then(function(xhr, comments) {
            var parsedComments = {};
            var commentCount = comments.length;
            for (var i=0; i < commentCount; i++) {
                var parsed = self.parseComment(comments[i]);

                if (parsedComments[parsed.fileName] === undefined) {
                    parsedComments[parsed.fileName] = [];
                }

                if (parsedComments[parsed.fileName][parsed.line] === undefined) {
                    parsedComments[parsed.fileName][parsed.line] = [];
                }

                parsedComments[parsed.fileName][parsed.line].push(parsed);
            }

            if (self.isMounted()) {
                self.setState({
                    comments: parsedComments
                });
            }
        });
    },

    postGistComment: function(text) {

    },

    handleLineClick: function(filename, line, replyTo, event) {
        var comments = this.state.comments;
        var open = this.state.openComment;
        var newOpen = this.createComment(this.props.id, 0, filename, line, 'test', null, replyTo, true);

        event.preventDefault();

        if (open !== null)
            comments[open.fileName][open.line].splice(open.replyTo, 1);

        if (!comments[filename])
            comments[filename] = [];

        if (!comments[filename][line])
            comments[filename][line] = [];

        if (open === null || open.fileName !== newOpen.fileName || open.line !== newOpen.line || open.replyTo !== newOpen.replyTo)
            comments[filename][line].splice(replyTo, 0, newOpen);
        else
            newOpen = null;

        this.setState({
            comments: comments,
            openComment: newOpen
        });
    },

    render: function() {
        return (
            <div className="container main">
            {
                this.state.files.map(function(file) {
                    return <File onLineClick={this.handleLineClick} key={file.name} name={file.name} lines={file.parsedLines} comments={this.state.comments[file.name]}/>
                }, this)
            }
            </div>
        );
    }
});