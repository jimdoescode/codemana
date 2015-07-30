var React = require("react");
var Qwest = require("qwest");
var File = require("./File.jsx");
var Utils = require("./Utils.jsx");

module.exports = React.createClass({

    createComment: function(gistId, commentId, filename, lineNumber, commentBody, commentUser, showForm = false) {
        return {
            gistId: gistId,
            id: commentId,
            fileName: filename,
            line: parseInt(lineNumber, 10),
            body: commentBody,
            user: commentUser,
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

        return data !== null ? this.createComment(data[1], comment.id, data[2], parseInt(data[3], 10), split[2], comment.user) : null;
    },

    parseFile: function(file) {
        var lines = Utils.syntaxHighlight(file.content, file.language);
        return this.createFile(file.filename, lines)
    },

    getInitialState: function() {
        return {
            files: [],
            comments: [],
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

    shouldComponentUpdate: function(newProps, newState) {
        return  newProps.id !== this.props.id ||
                newState.files.length !== this.state.files.length ||
                (this.state.files.length > 0 && newState.comments.length > 0);
    },

    render: function() {
        var self = this;

        return (
            <div className="container main">
            {
                self.state.files.map(function(file) {
                    return <File key={file.name} name={file.name} lines={file.parsedLines} comments={self.state.comments[file.name]}/>
                })
            }
            </div>
        );
    }
});