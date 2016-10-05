var React  = require("react");
var ReactDOM = require("react-dom");
var Router = require("react-router").Router;
var Route = require("react-router").Route;
var IndexRoute = require("react-router").IndexRoute;
var browserHistory = require("react-router").browserHistory;
var GistForm = require("./GistForm.js");
var AppHeader = require("./AppHeader.js");
var AppFooter = require("./AppFooter.js");
var CodeBlock = require("./CodeBlock.js");
var Config = require("./Config.js");
var GistApi = require("./GistApi.js");

var App = React.createClass({
    render: function() {
        return (
            <div className="app">
                <AppHeader origin={Config.origin}/>
                {this.props.children}
                <AppFooter/>
            </div>
        );
    }
});

var GistRoute = React.createClass({
    render: function() {
        var Api = GistApi(Config.githubApi);
        return (
            <CodeBlock code={Api.code(this.props.params.gistId)} user={Api.user()} style="okaidia"/>
        );
    }
});

var HomeRoute = React.createClass({
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
        <Route name="app" path="/" component={App}>
            <IndexRoute component={HomeRoute}/>
            <Route name="gist" path="/:gistId" component={GistRoute}/>
        </Route>
    </Router>
), document.getElementById("mount-point"));