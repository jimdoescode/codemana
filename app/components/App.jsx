var React  = require("react");
var Router = require("react-router-component");

var Locations = Router.Locations;
var Location  = Router.Location;
var NotFound  = Router.NotFound

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

var AppHeader = require("./AppHeader.jsx");
var Gist = require("./Gist.jsx");
var AppFooter = require("./AppFooter.jsx");

var origin = window.location.origin;

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
                <AppHeader origin={origin}/>
                <div className="container main">
                    <section className="hero">
                        <p><i className="fa fa-flask fa-3x"/></p>
                        <p>Up your Gist magic with some Code Mana.</p>
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
                <AppHeader origin={origin}/>
                <div className="container main">

                </div>
                <AppFooter/>
            </div>
        );
    }
});

React.render(<App/>, document.body);