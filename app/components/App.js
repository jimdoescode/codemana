var React  = require("react");
var Router = require("react-router-component");
var GistForm = require("./GistForm.js");

var Locations = Router.Locations;
var Location  = Router.Location;
var NotFound  = Router.NotFound

var origin = window.location.origin;

var App = React.createClass({
    render: function() {
        return (
            <Locations>
                <Location path="/" handler={HomePage}/>
                <Location path="/:gistId" handler={GistPage}/>
                <NotFound handler={NotFoundPage}/>
            </Locations>
        );
    }
});

var AppHeader = require("./AppHeader.js");
var Gist = require("./Gist.js");
var AppFooter = require("./AppFooter.js");

var GistPage = React.createClass({
    render: function() {
        return (
            <div className="app">
                <AppHeader origin={origin}/>
                <Gist id={this.props.gistId}/>
                <AppFooter/>
            </div>
        );
    }
});

var HomePage = React.createClass({
    render: function() {
        return (
            <div className="app">
                <AppHeader origin={origin} onGistSubmit={App.updateGistAction}/>
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
                        <GistForm className="pure-form" showButton="true" origin={origin}/>
                    </section>
                </div>
                <AppFooter/>
            </div>
        );
    }
});

var NotFoundPage = React.createClass({
    render: function() {
        return (
            <div className="app">
                <AppHeader origin={origin} onGistSubmit={App.updateGistAction}/>
                <div className="container main">

                </div>
                <AppFooter/>
            </div>
        );
    }
});

React.render(<App/>, document.getElementById("mount-point"));