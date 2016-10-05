const React = require("react");
const Spinner = require("./Spinner.js");
const LoginModal = require("./LoginModal.js");

module.exports = React.createClass({

    propTypes: {
        code: React.PropTypes.shape({
            fetch: React.PropTypes.func,
            fetchComments: React.PropTypes.func,
            commentTemplate: React.PropTypes.object
        }).isRequired,

        user: React.PropTypes.shape({
            login: React.PropTypes.func,
            logout: React.PropTypes.func,
            isLoggedIn: React.PropTypes.func,
            getData: React.PropTypes.func
        }).isRequired,

        style: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
        return {
            files: [],
            comments: [],
            openComment: null,
            showLoginModal: false,
            processing: true
        };
    },

    componentDidMount: function () {
        this.populate();
    },

    componentDidUpdate: function (prevProps, prevState) {
        //If there is a hash specified then attempt to scroll there.
        if (window.location.hash) {
            var elm = document.getElementById(window.location.hash.substring(1));
            if (elm)
                window.scrollTo(0, elm.offsetTop);
        }
    },

    populate: function () {
        var self = this;

        self.props.code.fetch().then(function (files) {
            if (self.isMounted())
                self.setState({files: files, processing: false});
        }).catch(function (message) {
            console.log(message);
            window.alert('There was a problem fetching and or parsing this Gist.');
            self.setState({processing: false});
        });

        self.props.code.fetchComments().then(function (comments) {
            if (self.isMounted() && comments.length)
                self.setState({comments: comments});
        }).catch(function (message) {
            console.log(message);
            window.alert('There was a problem fetching the comments for this Gist.');
        });
    },

    hideLoginModal: function () {
        this.setState({showLoginModal: false});
    },

    showLoginModal: function () {
        this.setState({showLoginModal: true});
    },

    setNewComment: function (filename, linenumber) {
        if (!this.props.user.isLoggedIn()) {
            this.showLoginModal();
            return;
        }

        //TODO: Use filename and line number to splice a new comment into the comments array
    },

    removeNewComment: function (comment) {

    },

    render: function() {
        return (
            <div className={"container main " + this.props.style}>
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
                                         onCancelComment={this.removeNewComment}/>
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
        onCancelComment: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            onLineClick: function (filename, linenumber) {},
            onCancelComment: function (comment) {}
        };
    },

    submitComment: function(comment) {

    },

    render: function() {
        var lines = [];
        var lineCount = this.props.lines.length;

        for (var i=0; i < lineCount; i++) {
            var num = i + 1;
            lines.push(
                <Line key={this.props.name + num} filename={this.props.name} number={num} onClick={this.props.onLineClick}>
                    <pre>
                        <code dangerouslySetInnerHTML={{__html: this.props.lines[i]}}/>
                    </pre>
                </Line>
            );

            //If comments exist for this line then add those in a new line just below.
            if (this.props.comments && this.props.comments[num] && this.props.comments[num].length > 0) {
                var comments = this.props.comments[num].map(function (comment) {
                    return (
                        <Comment user={comment.user} key={comment.id}>
                            {
                                comment.closed ?
                                    <p className="comment-body">{comment.body}</p> :
                                    <form action="#" onSubmit={this.submitComment.bind(this, comment)}
                                          className="comment-body">
                                        <textarea name="text" placeholder="Enter your comment..."
                                                  defaultValue={comment.body}/>
                                        <button type="submit" className="pure-button button-primary">
                                            <i className="fa fa-comment"/> Comment
                                        </button>
                                        <button type="button" className="pure-button button-error"
                                                onClick={this.props.onCancelComment.bind(null, comment)}>
                                            <i className="fa fa-times-circle"/> Cancel
                                        </button>
                                    </form>
                            }
                        </Comment>
                    );
                }, this);

                lines.push(
                    <Line key={this.props.name + num + 'comments'} filename={this.props.name}>
                        {comments}
                    </Line>
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

const Line = React.createClass({
    propTypes: {
        //Make this a string so that it can be empty. It's only for display anyways.
        number: React.PropTypes.number,
        filename: React.PropTypes.string.isRequired,
        toggleable: React.PropTypes.bool
    },

    getDefaultProps: function () {
        return {
            number: '',
            toggleable: false,
            onClick: function () {}
        }
    },

    shouldComponentUpdate: function (newProps, newState) {
        return this.props.content !== newProps.content ||
            this.props.filename !== newProps.filename ||
            this.props.toggleable !== newProps.toggleable;
    },

    render: function () {
        return (
            <tr className="line">
                <td className="line-marker"/>
                <td className="line-num">{this.props.number}</td>
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
            html_url: React.PropTypes.string,
            avatar_url: React.PropTypes.string,
            name: React.PropTypes.string
        }).isRequired,
    },

    render: function () {
        return (
            <div className="line-comment">
                <a className="avatar pull-left" href={this.props.user.html_url}><img src={this.props.user.avatar_url} alt=""/></a>
                <div className="pull-left content">
                    <header className="comment-header">
                        <a href={this.props.user.html_url}>{this.props.user.name}</a>
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