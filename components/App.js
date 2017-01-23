const React  = require("react");
const ReactDOM = require("react-dom");
const Router = require("react-router").Router;
const Route = require("react-router").Route;
const IndexRoute = require("react-router").IndexRoute;
const browserHistory = require("react-router").browserHistory;
const GistForm = require("./GistForm.js");
const AppHeader = require("./AppHeader.js");
const AppFooter = require("./AppFooter.js");
const CodeBlock = require("./CodeBlock.js");
const Config = require("./Config.js");
const GistApi = require("./GistApi.js");
const LoginModal = require("./LoginModal.js");

const App = React.createClass({
    getInitialState: function () {
        return {
            showLoginModal: false,
        }
    },

    hideLoginModal: function () {
        this.setState({showLoginModal: false});
    },

    componentDidMount: function() {
        var self = this;
        document.addEventListener('showLoginModal', function(e) {
            self.setState({showLoginModal: true});
        });
    },

    render: function() {
        var userApi = this.props.route.api.user();

        return (
            <div className="app">
                <AppHeader origin={Config.origin} user={userApi}/>
                <LoginModal user={userApi} show={this.state.showLoginModal} onClose={this.hideLoginModal}/>
                {this.props.children}
                <AppFooter/>
            </div>
        );
    }
});

const GistRoute = React.createClass({
    render: function() {
        console.log(this.props.route);

        return (
            <CodeBlock user={this.props.route.api.user()}
                       code={this.props.route.api.code(this.props.params.gistId)}/>
        );
    }
});

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

ReactDOM.render((
    <Router history={browserHistory}>
        <Route name="app" path="/" api={GistApi(Config.githubApi)} component={App}>
            <IndexRoute component={HomeRoute}/>
            <Route name="gist" path="/:gistId" api={GistApi(Config.githubApi)} component={GistRoute}/>
        </Route>
    </Router>
), document.getElementById("mount-point"));