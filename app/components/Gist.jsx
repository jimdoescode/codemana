var React = require("react");
var Qwest = require("qwest");
var SyntaxHighlightFile = require("./SyntaxHighlightFile.jsx");

module.exports = React.createClass({

    getInitialState: function() {
        return {
            files: [],
            comments: [],
            username: null,
            password: null
        };
    },

    parseComment: function(commentId, commentBody, commentUser) {
        //Annoyingly I couldn't get a single regex to separate everything out...
        var split = commentBody.match(/(\S+)\s(.*)/);
        var data = split[1].match(/http:\/\/codemana\.com\/(.*)#(.+)-L(\d+)/);
        if (data !== null) {
            return {
                gistId: data[1],
                id: commentId,
                filename: data[2],
                line: parseInt(data[3], 10),
                body: split[2],
                user: commentUser
            };
        }
        return null;
    },

    componentDidMount: function() {
        var self = this;
        Qwest.get('https://api.github.com/gists/'+self.props.id).then(function(xhr, gist) {
            var files = [];
            for (var name in gist.files)
                files.push(gist.files[name]);

            if (self.isMounted())
                self.setState({files: files});
        });

        Qwest.get('https://api.github.com/gists/'+self.props.id+'/comments').then(function(xhr, comments) {
            var parsedComments = {};
            var commentCount = comments.length;
            for (var i=0; i < commentCount; i++) {
                var parsed = self.parseComment(comments[i].id, comments[i].body, comments[i].user);

                if (parsedComments[parsed.filename] === undefined) {
                    parsedComments[parsed.filename] = [];
                }

                if (parsedComments[parsed.filename][parsed.line] === undefined) {
                    parsedComments[parsed.filename][parsed.line] = [];
                }

                parsedComments[parsed.filename][parsed.line].push(parsed);
            }

            if (self.isMounted()) {
                self.setState({
                    comments: parsedComments
                });
            }
        });
    },

    /**
     * If the comments AJAX call returns before the Gist
     * AJAX call then we don't want to render.
     */
    shouldComponentUpdate: function(newProps, newState) {
        return newProps.id !== this.props.id || newState.files.length !== 0;
    },

    render: function() {
        var self = this;

        return (
            <div className="container main">
            {
                this.state.files.map(function(file) {
                    return <SyntaxHighlightFile key={file.filename} name={file.filename} content={file.content} lang={file.language} comments={self.state.comments[file.filename]}/>
                })
            }
            </div>
        );
    }
});