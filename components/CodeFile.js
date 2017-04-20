const React = require("react");

module.exports = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        lines: React.PropTypes.array.isRequired,
        user: React.PropTypes.shape({
            id: React.PropTypes.number.isRequired,
            name: React.PropTypes.string.isRequired,
            htmlUrl: React.PropTypes.string.isRequired,
            avatarUrl: React.PropTypes.string.isRequired
        }),
        comments: React.PropTypes.array,
        onAddEditComment: React.PropTypes.func,
        onCancelComment: React.PropTypes.func,
        onSubmitComment: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            onAddEditComment: function (fileName, lineNumber, index, isEdit, e) {},
            onCancelComment: function (e) {},
            onSubmitComment: function (comment, commentText, e) {}
        };
    },

    getInitialState: function() {
        return {
            expandedComments: [],
        };
    },

    //Wrap the onAddEditComment property so we can expand
    //a comment section when the comment form is shown.
    addEditComment: function(fileName, lineNumber, index, isEdit, e) {
        var expandedComments = this.state.expandedComments.slice(0);
        expandedComments[lineNumber] = true;

        this.setState({
            expandedComments: expandedComments
        });

        this.props.onAddEditComment(fileName, lineNumber, index, isEdit, e);
    },

    toggleComment: function(lineNumber, e) {
        if (e) {
            e.preventDefault();
        }

        var expandedComments = this.state.expandedComments.slice(0);
        expandedComments[lineNumber] = !expandedComments[lineNumber];

        this.setState({
            expandedComments: expandedComments
        });
    },

    render: function() {
        var lines = [];
        var lineCount = this.props.lines.length;

        for (var i=0; i < lineCount; i++) {
            var num = i + 1;
            lines.push(
                <CodeLine key={"codeline" + this.props.name + num}
                          fileName={this.props.name}
                          lineNumber={num}
                          code={this.props.lines[i]}
                          onClick={this.addEditComment}/>
            );

            //If comments exist for this line then add those in a new line just below.
            if (this.props.comments && this.props.comments[num] && this.props.comments[num].length > 0) {
                lines.push(
                    <CommentsLine key={"commentsline" + this.props.name + num}
                                  expanded={!!this.state.expandedComments[num]}
                                  fileName={this.props.name}
                                  lineNumber={num}
                                  user={this.props.user}
                                  comments={this.props.comments[num]}
                                  onSubmit={this.props.onSubmitComment}
                                  onCancel={this.props.onCancelComment}
                                  onReply={this.props.onAddEditComment}
                                  onEdit={this.props.onAddEditComment}
                                  onToggle={this.toggleComment}/>
                );
            }
        }

        return (
            <section className="code-file-container">
                <table id={this.props.name} className="code-file">
                    <tbody>
                    <tr className="spacer line">
                        <td className="line-marker"/>
                        <td className="line-content"/>
                    </tr>
                    {lines}
                    <tr className="spacer line">
                        <td className="line-marker"/>
                        <td className="line-content"/>
                    </tr>
                    </tbody>
                </table>
            </section>
        );
    }
});

const CodeLine = React.createClass({
    propTypes: {
        fileName: React.PropTypes.string.isRequired,
        lineNumber: React.PropTypes.number.isRequired,
        code: React.PropTypes.string.isRequired,
        onClick: React.PropTypes.func.isRequired
    },

    //Code lines don't need to update, ever.
    shouldComponentUpdate: function() {
        return false;
    },

    render: function() {
        return (
            <tr className="line">
                <td className="line-marker">
                    <span>{this.props.lineNumber}</span>
                </td>
                <td className="line-content" onClick={this.props.onClick.bind(null, this.props.fileName, this.props.lineNumber, 0, false)}>
                    <pre>
                        <code dangerouslySetInnerHTML={{__html: this.props.code}}/>
                    </pre>
                </td>
            </tr>
        );
    }
});

const CommentsLine = React.createClass({
    propTypes: {
        expanded: React.PropTypes.bool.isRequired,
        fileName: React.PropTypes.string.isRequired,
        lineNumber: React.PropTypes.number.isRequired,
        comments: React.PropTypes.arrayOf(
            React.PropTypes.shape({
                id: React.PropTypes.number,
                fileName: React.PropTypes.string.isRequired,
                lineNumber: React.PropTypes.number.isRequired,
                body: React.PropTypes.string,
                rawBody: React.PropTypes.string,
                user: React.PropTypes.shape({
                    id: React.PropTypes.number.isRequired,
                    name: React.PropTypes.string.isRequired,
                    htmlUrl: React.PropTypes.string.isRequired,
                    avatarUrl: React.PropTypes.string.isRequired
                }),
                isOpen: React.PropTypes.bool.isRequired
            })
        ).isRequired,
        onSubmit: React.PropTypes.func.isRequired,
        onCancel: React.PropTypes.func.isRequired,
        onReply: React.PropTypes.func.isRequired,
        onEdit: React.PropTypes.func.isRequired,
        onToggle: React.PropTypes.func.isRequired,
    },

    getInitialState: function() {
        return {
            commentText: '',
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            commentText: '',
        });
    },

    handleTextChange: function(e) {
        this.setState({
            commentText: e.target.value,
        })
    },

    render: function() {
        var comments = this.props.comments.map(function(comment, index) {
            if (!this.props.expanded) {
                return (
                    <div key={"comment" + this.props.fileName + index} className="avatar pull-left">
                        <a href="#" onClick={this.props.onToggle.bind(null, this.props.lineNumber)}>
                            <img src={comment.user.avatarUrl} alt={comment.user.name}/>
                        </a>
                    </div>
                );
            }

            return (
                <Comment key={"comment" + this.props.fileName + index}
                         id={"comment" + this.props.fileName + index}
                         user={comment.user}
                         onReply={!comment.isOpen ? this.props.onReply.bind(null, this.props.fileName, this.props.lineNumber, index + 1, false) : null}
                         onEdit={!comment.isOpen && this.props.user && this.props.user.id === comment.user.id ? this.props.onEdit.bind(null, this.props.fileName, this.props.lineNumber, index, true) : null}>
                    {comment.isOpen ?
                        <form action="#" onSubmit={this.props.onSubmit.bind(null, comment, this.state.commentText)} className="comment-body">
                            <textarea name="text" placeholder="Enter your comment..." defaultValue={comment.rawBody} onChange={this.handleTextChange}/>
                            <button type="submit" className={"pure-button button-primary" + (comment.isPosting ? " pure-button-disabled" : "")} disabled={comment.isPosting}>
                                <i className="fa fa-comment"/> Comment
                            </button>
                            <button type="button" className={"pure-button button-error" + (comment.isPosting ? " pure-button-disabled" : "")} onClick={this.props.onCancel} disabled={comment.isPosting}>
                                <i className="fa fa-times-circle"/> Cancel
                            </button>
                        </form> :
                        <div className="comment-body" dangerouslySetInnerHTML={{__html: comment.body}}/>
                    }
                </Comment>
            );
        }, this);

        return (
            <tr className="line line-comments">
                <td className="line-marker">
                    <a href="#" title="Toggle Comments" onClick={this.props.onToggle.bind(null, this.props.lineNumber)}>
                        {this.props.expanded ?
                            <i className="fa fa-minus-square"/> :
                            <i className="fa fa-plus-square"/>
                        }
                    </a>
                </td>
                <td className={this.props.expanded ? 'line-content' : 'line-content-collapsed'}>
                    {comments}
                </td>
            </tr>
        );
    }
});

const Comment = React.createClass({
    propTypes: {
        id: React.PropTypes.string.isRequired,
        user: React.PropTypes.shape({
            htmlUrl: React.PropTypes.string,
            avatarUrl: React.PropTypes.string,
            name: React.PropTypes.string
        }).isRequired,
        onReply: React.PropTypes.func,
        onEdit: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            onReply: null,
            onEdit: null,
        }
    },

    render: function() {
        var headerLinks = [<a key={this.props.id + 'uname'} className="pull-left" href={this.props.user.htmlUrl} target="_blank">{this.props.user.name}</a>];
        if (this.props.onReply) {
            headerLinks.push(<a key={this.props.id + "reply"} className="pull-right reply" href="#" onClick={this.props.onReply} title="Reply"><i className="fa fa-share"/></a>);
        }

        if (this.props.onEdit) {
            headerLinks.push(<a key={this.props.id + "edit"} className="pull-right edit" href="#" onClick={this.props.onEdit} title="Edit Comment"><i className="fa fa-pencil"/></a>);
        }


        return (
            <div className="line-comment">
                <a className="avatar pull-left" href={this.props.user.htmlUrl} target="_blank"><img src={this.props.user.avatarUrl} alt=""/></a>
                <div className="pull-left content">
                    <header className="comment-header">{headerLinks}</header>
                    {this.props.children}
                </div>
            </div>
        );
    }
});