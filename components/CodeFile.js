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
                          onClick={this.props.onAddEditComment}/>
            );

            //If comments exist for this line then add those in a new line just below.
            if (this.props.comments && this.props.comments[num] && this.props.comments[num].length > 0) {
                lines.push(
                    <CommentsLine key={"commentsline" + this.props.name + num}
                                  fileName={this.props.name}
                                  lineNumber={num}
                                  user={this.props.user}
                                  comments={this.props.comments[num]}
                                  onSubmit={this.props.onSubmitComment}
                                  onCancel={this.props.onCancelComment}
                                  onReply={this.props.onAddEditComment}
                                  onEdit={this.props.onAddEditComment}/>
                );
            }
        }

        return (
            <section className="code-file-container">
                <table id={this.props.name} className="code-file">
                    <tbody>
                    <tr className="spacer line">
                        <td className="line-marker"/>
                        <td className="line-num"/>
                        <td className="line-content"/>
                    </tr>
                    {lines}
                    <tr className="spacer line">
                        <td className="line-marker"/>
                        <td className="line-num"/>
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

    //Code lines don't need to update ever.
    shouldComponentUpdate: function() {
        return false;
    },

    render: function() {
        return (
            <Line fileName={this.props.fileName} lineNumber={this.props.lineNumber} onClick={this.props.onClick.bind(null, this.props.fileName, this.props.lineNumber, 0, false)}>
                <pre>
                    <code dangerouslySetInnerHTML={{__html: this.props.code}}/>
                </pre>
            </Line>
        );
    }
});

const CommentsLine = React.createClass({
    propTypes: {
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
    },

    getInitialState: function() {
        return {
            commentText: ''
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            commentText: ''
        });
    },

    handleTextChange: function(e) {
        this.setState({
            commentText: e.target.value
        })
    },

    render: function() {
        var comments = this.props.comments.map(function(comment, index) {
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
            <Line fileName={this.props.fileName} style="line-comments">
                {comments}
            </Line>
        );
    }
});

const Line = React.createClass({
    propTypes: {
        //Make this a string so that it can be empty. It's only for display anyways.
        lineNumber: React.PropTypes.number,
        style: React.PropTypes.string,
        fileName: React.PropTypes.string.isRequired,
        toggle: React.PropTypes.string,
        onClick: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            lineNumber: 0,
            style: '',
            toggle: '',
            onClick: function (fileName, lineNumber, index) {}
        }
    },

    render: function() {
        return (
            <tr className={this.props.style.length > 0 ? "line " + this.props.style : "line"}>
                <td className="line-marker"/>
                <td className="line-num">{this.props.lineNumber > 0 ? this.props.lineNumber : ''}</td>
                <td className="line-content" onClick={this.props.onClick.bind(null, this.props.fileName, this.props.lineNumber, 0)}>
                    {this.props.children}
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