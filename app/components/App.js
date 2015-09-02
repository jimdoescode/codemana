var React  = require("react");
var Router = require('react-router');
var GistForm = require("./GistForm.js");
var AppHeader = require("./AppHeader.js");
var AppFooter = require("./AppFooter.js");
var Gist = require("./Gist.js");
var Config = require("./Config.js");

var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var App = React.createClass({
    render: function() {
        return (
            <div className="app">
                <AppHeader origin={Config.origin}/>
                <RouteHandler/>
                <AppFooter/>
            </div>
        );
    }
});

var GistRoute = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    render: function() {
        return (
            <Gist id={this.context.router.getCurrentParams().gistId}/>
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

var FourOhFourRoute = React.createClass({
    render: function() {
        return (
            <div className="container main">
                NOT FOUND!!
            </div>
        );
    }
});

var routes = (
    <Route name="app" path={Config.root} handler={App}>
        <Route name="gist" path=":gistId" handler={GistRoute}/>
        <DefaultRoute handler={HomeRoute}/>
        <NotFoundRoute handler={FourOhFourRoute}/>
    </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler) {
    React.render(<Handler/>, document.getElementById("mount-point"));
});