const React  = require("react");
const ReactDOM = require("react-dom");

const Router = require("react-router").Router;
const Route = require("react-router").Route;
const IndexRoute = require("react-router").IndexRoute;
const browserHistory = require("react-router").browserHistory;

const GistForm = require("./GistForm.js");
const AppHeader = require("./AppHeader.js");
const AppFooter = require("./AppFooter.js");
const Spinner = require("./Spinner.js");
const HighlightSelector = require("./HighlightSelector.js");
const CodeFile = require("./CodeFile.js");
const LoginModal = require("./LoginModal.js");

const Redux = require("react-redux");
const Actions = require('./Actions.js');
const Store = require('./Store.js');
const Provider = require('react-redux').Provider;

const App = React.createClass({
    componentWillMount: function() {
        this.props.dispatch(Actions.fetchStoredUser());
    },

    clickUserStatus: function(e) {
        e.preventDefault();
        if (this.props.user === null) {
            this.props.dispatch(Actions.showLoginModal());
        } else {
            this.props.dispatch(Actions.userLogout());
        }
    },

    hideLoginModal: function() {
        this.props.dispatch(Actions.hideLoginModal());
    },

    attemptLogin: function(username, password) {
        this.props.dispatch(Actions.userLogin(username, password));
    },

    render: function() {
        return (
            <div className="app">
                <AppHeader origin={this.props.config.origin} user={this.props.user} onClickUserStatus={this.clickUserStatus}/>
                <LoginModal github={this.props.config.github}
                            processing={this.props.processingLogin}
                            show={this.props.displayLoginModal}
                            onClose={this.hideLoginModal}
                            onLogin={this.attemptLogin}/>
                {this.props.children}
                <AppFooter/>
            </div>
        );
    }
});

function mapStateToAppProps(state) {
    return {
        user: state.user.data,
        config: state.config,
        displayLoginModal: state.user.displayLoginModal,
        processingLogin: state.user.isFetching
    }
}

const HomeRoute = React.createClass({
    render: function() {
        return (
            <div className="container main">
                <section className="hero">
                    <h1>
                        <div className="fa fa-flask fa-3x"/>
                        <p>Up your Gist magic <i className="fa fa-magic"/></p>
                    </h1>
                    <p>
                        CodeMana lets you comment in line on your Gists, simply click the line you want to talk about.
                        It works entirely in your browser, only calling GitHub to post comments and retrieve Gists.
                    </p>
                    <p>
                        If you're curious <a href="https://github.com/jimdoescode/codemana">peruse the code</a>. It's comprised mostly of React components.
                    </p>
                    <GistForm className="pure-form" showButton="true"/>
                </section>
            </div>
        );
    }
});

const GistRoute = React.createClass({
    componentDidMount: function() {
        this.props.dispatch(Actions.fetchCode(this.props.params.gistId));
        this.props.dispatch(Actions.fetchComments(this.props.params.gistId));
    },

    shouldComponentUpdate: function(nextProps) {
        return !nextProps.loading || (!this.props.loading && nextProps.loading);
    },

    selectHighlight: function(e) {
        if (e.target) {
            e.preventDefault();
        }
        this.props.dispatch(Actions.changeHighlight(e.target.value));
    },

    showCommentForm: function(fileName, lineNumber, index, isEdit, e) {
        if (e.target) {
            e.preventDefault();
        }
        this.props.dispatch(this.props.user === null ?
            Actions.showLoginModal() :
            Actions.showCommentForm(this.props.user, fileName, lineNumber, index, isEdit)
        );
    },

    hideCommentForm: function(e) {
        if (e.target) {
            e.preventDefault();
        }
        this.props.dispatch(Actions.hideCommentForm());
    },

    postComment: function(comment, commentText, e) {
        if (e.target) {
            e.preventDefault();
        }

        commentText = commentText.trim();

        if (commentText.length > 0) {
            this.props.dispatch(Actions.postComment(
                this.props.params.gistId,
                comment,
                commentText
            ));
        }
    },

    render: function() {
        return (
            <div className={"container main " + this.props.highlight}>
                <HighlightSelector highlight={this.props.highlight} onHighlightChange={this.selectHighlight}/>
                {
                    //Show either a spinner or however many files there are in the gist.
                    this.props.loading ?
                        <Spinner/> :
                        this.props.files.map(function(file) {
                            return <CodeFile key={file.name}
                                             name={file.name}
                                             lines={file.lines}
                                             user={this.props.user}
                                             comments={this.props.comments[file.name]}
                                             onAddEditComment={this.showCommentForm}
                                             onCancelComment={this.hideCommentForm}
                                             onSubmitComment={this.postComment}/>
                        }, this)
                }
            </div>
        );
    }
});

function mapStateToGistRouteProps(state) {
    return {
        user: state.user.data,
        highlight: state.highlight,
        files: state.code.files,
        comments: state.comments.entries,
        loading: state.code.isFetching || state.comments.isFetching
    }
}

ReactDOM.render((
    <Provider store={Store()}>
        <Router history={browserHistory}>
            <Route name="app" path="/" component={Redux.connect(mapStateToAppProps)(App)}>
                <IndexRoute component={HomeRoute}/>
                <Route name="gist" path="/:gistId" component={Redux.connect(mapStateToGistRouteProps)(GistRoute)}/>
            </Route>
        </Router>
    </Provider>
), document.getElementById("mount-point"));