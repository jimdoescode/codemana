var React = require("react");
var GistForm = require("./GistForm.js");

module.exports = React.createClass({
    getDefaultProps: function () {
        return {origin: window.location.origin};
    },

    shouldComponentUpdate: function (newProps, newState) {
        return false; //No need to update this thing, it's static
    },

    fireHighlightChangeEvent: function (e) {
        document.dispatchEvent(
            new CustomEvent('highlightChange', {detail: e.target.value})
        );
    },

    render: function () {
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
                                <select id="syntax-highlighting" onChange={this.fireHighlightChangeEvent}>
                                    <option value="okaidia">Okaidia Highlighting</option>
                                    <option value="twilight">Twilight Highlighting</option>
                                    <option value="funky">Funky Highlighting</option>
                                    <option value="dark">Dark Highlighting</option>
                                </select>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
        );
    }
});