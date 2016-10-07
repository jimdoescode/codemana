const React = require("react");
const Spinner = require("./Spinner.js");
const LoginModal = require("./LoginModal.js");

module.exports = React.createClass({

    propTypes: {
        code: React.PropTypes.shape({
            fetch: React.PropTypes.func,
            fetchComments: React.PropTypes.func,
            getNewComment: React.PropTypes.func
        }).isRequired,

        user: React.PropTypes.shape({
            login: React.PropTypes.func,
            logout: React.PropTypes.func,
            isLoggedIn: React.PropTypes.func,
            getData: React.PropTypes.func
        }).isRequired,

        className: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
        return {
            files: [],
            comments: [],
            newComment: null,
            showLoginModal: false,
            processing: true
        };
    },

    componentDidMount: function () {
        var self = this;

        self.props.code.fetch().then(function (files) {
            self.setState({
                files: files,
                processing: false
            });
        }).catch(function (message) {
            console.log(message);
            window.alert('There was a problem fetching and or parsing this Gist.');
            self.setState({processing: false});
        });

        self.props.code.fetchComments().then(function (comments) {
            if (Object.keys(comments).length > 0)
                self.setState({comments: comments});
        }).catch(function (message) {
            console.log(message);
        });
    },

    componentDidUpdate: function (prevProps, prevState) {
        //If there is a hash specified then attempt to scroll there.
        if (window.location.hash) {
            var elm = document.getElementById(window.location.hash.substring(1));
            if (elm)
                window.scrollTo(0, elm.offsetTop);
        }
    },

    hideLoginModal: function () {
        this.setState({showLoginModal: false});
    },

    showLoginModal: function () {
        this.setState({showLoginModal: true});
    },

    setNewComment: function (fileName, lineNumber, e) {
        var self = this;
        if (!this.props.user.isLoggedIn()) {
            self.showLoginModal();
            return;
        }

        self.setState(function (oldState, props) {
            //Check if we already have a new comment some where.
            var newComment = oldState.newComment ? oldState.newComment : props.code.getNewComment();
            var allComments = oldState.comments;

            //If the location of this comment doesn't
            //currently exist then we create it.
            if (allComments[fileName] === undefined)
                allComments[fileName] = [];

            if (allComments[fileName][lineNumber] === undefined)
                allComments[fileName][lineNumber] = [];

            var comments = allComments[fileName][lineNumber];
            var commentCount = comments.length;

            //Remove the old comment if it existed
            for (var i=0; i < commentCount; i++) {
                if (comments[i].isOpen) {
                    comments.splice(i, 1);
                    commentCount--; //We just removed a comment from the array so adjust the array count.
                }
            }

            allComments[fileName][lineNumber] = comments;

            lineNumber = parseInt(lineNumber, 10);
            newComment.fileName = fileName;
            newComment.lineNumber = lineNumber;
            newComment.body = '';

            allComments[fileName][lineNumber].unshift(newComment);

            return {
                comments: allComments,
                newComment: newComment
            };
        });
    },

    submitComment: function (comment, e) {
        e.preventDefault();

        var self = this;
        comment.save().then(function (postedComment) {
            self.setState(function (oldState, props) {
                var allComments = oldState.comments;
                var comments = allComments[postedComment.fileName][postedComment.lineNumber];
                var commentCount = comments.length;

                for (var i=0; i < commentCount; i++) {
                    if (comments[i].isOpen) {
                        comments[i] = postedComment;
                    }
                }

                allComments[postedComment.fileName][postedComment.lineNumber] = comments;

                return {
                    comments: allComments
                };
            });
        }).catch(function (message) {
            window.alert("There was a problem posting this comment. Please try again.");
            console.log(message);
        });
    },

    removeComment: function (comment, e) {
        this.setState(function (oldState, props) {
            var allComments = oldState.comments;
            var comments = allComments[comment.fileName][comment.lineNumber];
            var commentCount = comments.length;

            for (var i=0; i < commentCount; i++) {
                if (comments[i].isOpen) {
                    comments.splice(i, 1);
                    commentCount--; //We just removed a comment from the array so adjust the array count.
                }
            }

            allComments[comment.fileName][comment.lineNumber] = comments;

            return {
                comments: allComments
            };
        });
    },

    render: function() {
        return (
            <div className={"container main " + this.props.className}>
                <LoginModal user={this.props.user} show={this.state.showLoginModal} onClose={this.hideLoginModal}/>
                {
                    //Show either a spinner or however many files there are in the gist.
                    this.state.processing ?
                        <Spinner/> :
                        this.state.files.map(function (file) {
                            return <File key={file.name}
                                         name={file.name}
                                         lines={file.lines}
                                         comments={this.state.comments[file.name]}
                                         currentUser={this.props.user}
                                         onLineClick={this.setNewComment}
                                         onCancelComment={this.removeComment}
                                         onSubmitComment={this.submitComment}/>
                        }, this)
                }
            </div>
        );
    }
});

const File = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        lines: React.PropTypes.array.isRequired,
        comments: React.PropTypes.array,
        currentUser: React.PropTypes.shape({
            isLoggedIn: React.PropTypes.func,
            getData: React.PropTypes.func
        }).isRequired,
        onLineClick: React.PropTypes.func,
        onCancelComment: React.PropTypes.func,
        onSubmitComment: React.PropTypes.func
    },

    getDefaultProps: function () {
        return {
            onLineClick: function (fileName, lineNumber, e) {},
            onCancelComment: function (comment, e) {},
            onSubmitComment: function (comment, e) {}
        };
    },

    render: function () {
        var lines = [];
        var lineCount = this.props.lines.length;

        for (var i=0; i < lineCount; i++) {
            var num = i + 1;
            lines.push(
                <CodeLine key={"codeline"+this.props.name+num}
                          filename={this.props.name}
                          number={num}
                          code={this.props.lines[i]}
                          onClick={this.props.onLineClick}/>
            );

            //If comments exist for this line then add those in a new line just below.
            if (this.props.comments && this.props.comments[num] && this.props.comments[num].length > 0) {
                lines.push(
                    <CommentsLine key={"commentsline"+this.props.name+num}
                                  filename={this.props.name}
                                  comments={this.props.comments[num]}
                                  onSubmit={this.props.onSubmitComment}
                                  onCancel={this.props.onCancelComment}/>
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
        filename: React.PropTypes.string.isRequired,
        number: React.PropTypes.number.isRequired,
        code: React.PropTypes.string.isRequired,
        onClick: React.PropTypes.func.isRequired
    },

    //Code lines don't need to update ever.
    shouldComponentUpdate: function () {
        return false;
    },

    render: function () {
        return (
            <Line filename={this.props.filename} number={this.props.number} onClick={this.props.onClick}>
                <pre>
                    <code dangerouslySetInnerHTML={{__html: this.props.code}}/>
                </pre>
            </Line>
        );
    }
});

const CommentsLine = React.createClass({
    propTypes: {
        filename: React.PropTypes.string.isRequired,
        comments: React.PropTypes.array.isRequired,
        onSubmit: React.PropTypes.func.isRequired,
        onCancel: React.PropTypes.func.isRequired
    },

    updateCommentText: function (index, e) {
        this.props.comments[index].body = e.target.value;
    },

    render: function () {
        var comments = this.props.comments.map(function (comment, index) {
            return (
                <Comment key={"comment"+this.props.filename+comment.id} user={comment.user}>
                    {comment.isOpen ?
                        <form action="#" onSubmit={this.props.onSubmit.bind(null, comment)} className="comment-body">
                            <textarea name="text" placeholder="Enter your comment..." defaultValue={comment.body} onChange={this.updateCommentText.bind(this, index)}/>
                            <button type="submit" className="pure-button button-primary">
                                <i className="fa fa-comment"/> Comment
                            </button>
                            <button type="button" className="pure-button button-error" onClick={this.props.onCancel.bind(null, comment)}>
                                <i className="fa fa-times-circle"/> Cancel
                            </button>
                        </form> :
                        <p className="comment-body">{comment.body}</p>
                    }
                </Comment>
            );
        }, this);

        return (
            <Line filename={this.props.filename} style="line-comments">
                {comments}
            </Line>
        );
    }
});

const Line = React.createClass({
    propTypes: {
        //Make this a string so that it can be empty. It's only for display anyways.
        number: React.PropTypes.number,
        style: React.PropTypes.string,
        filename: React.PropTypes.string.isRequired,
        toggleable: React.PropTypes.bool,
        onClick: React.PropTypes.func
    },

    getDefaultProps: function () {
        return {
            number: 0,
            style: '',
            toggleable: false,
            onClick: function () {}
        }
    },

    render: function () {
        return (
            <tr className={this.props.style.length > 0 ? "line " + this.props.style : "line"}>
                <td className="line-marker"/>
                <td className="line-num">{this.props.number > 0 ? this.props.number : ''}</td>
                <td className="line-content" onClick={this.props.onClick.bind(null, this.props.filename, this.props.number)}>
                    {this.props.children}
                </td>
            </tr>
        );
    }
});

const Comment = React.createClass({
    propTypes: {
        user: React.PropTypes.shape({
            htmlUrl: React.PropTypes.string,
            avatarUrl: React.PropTypes.string,
            name: React.PropTypes.string
        }).isRequired,
    },

    render: function () {
        return (
            <div className="line-comment">
                <a className="avatar pull-left" href={this.props.user.htmlUrl}><img src={this.props.user.avatarUrl} alt=""/></a>
                <div className="pull-left content">
                    <header className="comment-header">
                        <a href={this.props.user.htmlUrl}>{this.props.user.name}</a>
                    </header>
                    {this.props.children}
                </div>
            </div>
        );
    }
});

const CommentToggle = React.createClass({
    getInitialState: function () {
        return {
            display: 'none',
            symbolClass: this.props.closeIcon
        };
    },

    getDefaultProps: function () {
        return {
            toggle: '',
            closeIcon: 'fa-comment-o fa-flip-horizontal',
            openIcon: 'fa-comment fa-flip-horizontal'
        };
    },

    handleClick: function (event) {
        var elm = document.getElementById(this.props.toggle);
        var display = elm.style.display;

        event.preventDefault();
        elm.style.display = this.state.display;

        this.setState({
            symbolClass: display === 'none' ? this.props.closeIcon : this.props.openIcon,
            display: display
        });
    },

    render: function () {
        return (
            <a href='#' onClick={this.handleClick}>
                <i className={"fa " + this.state.symbolClass + " fa-fw"}/>
            </a>
        );
    }
});