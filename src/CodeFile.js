import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './CodeFile.scss';
import './vendor-styles/pure-min.scss';

class CodeFile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsedComments: []
        };

        // In React components declared as ES6 classes, methods follow the same semantics
        // as regular ES6 classes. This means that they don’t automatically bind this to
        // the instance. You have to explicitly use .bind(this) in the constructor
        this.addEditComment = this.addEditComment.bind(this);
        this.toggleComment = this.toggleComment.bind(this);
    }

    //Wrap the onAddEditComment property so we can expand
    //a comment section when the comment form is shown.
    addEditComment(fileName, lineNumber, index, isEdit, e) {
        this.setState((state) => {
            let collapsedComments = state.collapsedComments.slice(0);
            collapsedComments[lineNumber] = false;

            return {collapsedComments: collapsedComments};
        });

        this.props.onAddEditComment(fileName, lineNumber, index, isEdit, e);
    }

    toggleComment(lineNumber, e) {
        if (e) {
            e.preventDefault();
        }

        this.setState((state) => {
            let collapsedComments = state.collapsedComments.slice(0);
            collapsedComments[lineNumber] = !collapsedComments[lineNumber];

            return {collapsedComments: collapsedComments}
        });
    }

    render() {
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
                                  collapsed={!!this.state.collapsedComments[num]}
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
}

CodeFile.propTypes = {
    name: PropTypes.string.isRequired,
    lines: PropTypes.array.isRequired,
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        htmlUrl: PropTypes.string.isRequired,
        avatarUrl: PropTypes.string.isRequired
    }),
    comments: PropTypes.array,
    onAddEditComment: PropTypes.func,
    onCancelComment: PropTypes.func,
    onSubmitComment: PropTypes.func
};

CodeFile.defaultProps = {
    onAddEditComment: function (fileName, lineNumber, index, isEdit, e) {},
    onCancelComment: function (e) {},
    onSubmitComment: function (comment, commentText, e) {}
};

export default CodeFile;

class CodeLine extends Component {
    //Code lines don't need to update, ever.
    shouldComponentUpdate() {
        return false;
    }

    render() {
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
}

CodeLine.propTypes = {
    fileName: PropTypes.string.isRequired,
    lineNumber: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};


class CommentsLine extends Component {
    constructor(props) {
        super(props);

        this.state = {
            commentText: ''
        };

        this.handleTextChange = this.handleTextChange.bind(this);
    }

    //componentWillReceiveProps: function(nextProps) {
    //    this.setState({
    //        commentText: '',
    //    });
    //},

    handleTextChange(e) {
        this.setState({
            commentText: e.target.value,
        })
    }

    render() {
        var comments = this.props.comments.map(function(comment, index) {
            if (this.props.collapsed) {
                return (
                    <CommentCollapsed key={"comment" + this.props.fileName + index}
                                      user={comment.user}
                                      onExpand={this.props.onToggle.bind(null, this.props.lineNumber)}/>
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
                    <button className="button-link" title="Toggle Comments" onClick={this.props.onToggle.bind(null, this.props.lineNumber)}>
                        {this.props.collapsed ?
                            <i className="fa fa-plus-square"/> :
                            <i className="fa fa-minus-square"/>
                        }
                    </button>
                </td>
                <td className={"line-content" + (this.props.collapsed ? " collapsed" : "")}>
                    {comments}
                </td>
            </tr>
        );
    }
}

CommentsLine.propTypes = {
    collapsed: PropTypes.bool.isRequired,
    fileName: PropTypes.string.isRequired,
    lineNumber: PropTypes.number.isRequired,
    comments: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            fileName: PropTypes.string.isRequired,
            lineNumber: PropTypes.number.isRequired,
            body: PropTypes.string,
            rawBody: PropTypes.string,
            user: PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
                htmlUrl: PropTypes.string.isRequired,
                avatarUrl: PropTypes.string.isRequired
            }),
            isOpen: PropTypes.bool.isRequired
        })
    ).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onReply: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
};

class Comment extends Component {
    render() {
        var headerLinks = [<a key={this.props.id + 'uname'} className="pull-left" href={this.props.user.htmlUrl} target="_blank" rel="noopener noreferrer">{this.props.user.name}</a>];
        if (this.props.onReply) {
            headerLinks.push(<button key={this.props.id + "reply"} className="pull-right reply button-link" onClick={this.props.onReply} title="Reply to Comment"><i className="fa fa-share"/></button>);
        }

        if (this.props.onEdit) {
            headerLinks.push(<button key={this.props.id + "edit"} className="pull-right edit button-link" onClick={this.props.onEdit} title="Edit Comment"><i className="fa fa-pencil"/></button>);
        }

        return (
            <div className="line-comment">
                <a className="avatar pull-left" href={this.props.user.htmlUrl} target="_blank" rel="noopener noreferrer">
                    <img src={this.props.user.avatarUrl} alt={this.props.user.name}/>
                </a>
                <div className="pull-left content">
                    <header className="comment-header">{headerLinks}</header>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

Comment.propTypes = {
    id: PropTypes.string.isRequired,
    user: PropTypes.shape({
        htmlUrl: PropTypes.string,
        avatarUrl: PropTypes.string,
        name: PropTypes.string
    }).isRequired,
    onReply: PropTypes.func,
    onEdit: PropTypes.func
};

Comment.defaultProps = {
    onReply: null,
    onEdit: null,
};

class CommentCollapsed extends Component {
    render() {
        return (
            <div className="avatar pull-left">
                <button className="button-link" onClick={this.props.onExpand}>
                    <img src={this.props.user.avatarUrl} alt={this.props.user.name}/>
                </button>
            </div>
        );
    }
}

CommentCollapsed.propTypes = {
    user: PropTypes.shape({
        avatarUrl: PropTypes.string,
        name: PropTypes.string
    }).isRequired,
    onExpand: PropTypes.func
};

CommentCollapsed.defaultProps = {
    onExpand: null
};