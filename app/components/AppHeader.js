var React = require("react");
var GistForm = require("./GistForm.js");

module.exports = React.createClass({
    getDefaultProps: function() {
        return {origin: window.location.origin};
    },

    updateStyle: function(event) {
        event.preventDefault();
        document.getElementById('highlight-style').href = event.target.value;
    },

    shouldComponentUpdate: function(newProps, newState) {
        return false; //No need to update this thing, it's static
    },

    render: function() {
        return (
            <header className="app-header">
                <nav className="pure-menu pure-menu-horizontal pure-menu-fixed">
                    <div className="container">
                        <a className="pure-menu-heading pull-left logo" href={this.props.origin}>
                            <span>CODE</span><i className="fa fa-flask"/><span>MANA</span>
                        </a>

                        <GistForm className="pure-form pull-left pure-u-2-3"/>

                        <ul className="pure-menu-list pull-right">
                            <li className="pure-menu-item">
                                <select onChange={this.updateStyle}>
                                    <option value="css/default.css">Default Highlighting</option>
                                    <option value="css/funky.css">Funky Highlighting</option>
                                    <option value="css/okaidia.css">Okaidia Highlighting</option>
                                    <option value="css/dark.css">Dark Highlighting</option>
                                </select>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
        );
    }
});