var React = require("react");

module.exports = React.createClass({
    getDefaultProps: function() {
        return {origin: window.location.origin};
    },

    gistRedirect: function(event) {
        event.preventDefault();

        var gistId = event.target.children.namedItem("gistId").value.trim();
        if (gistId !== "")
            window.location.href = this.props.origin + "/" + gistId;
    },

    updateStyle: function(event) {
        event.preventDefault();
        document.getElementById('highlight-style').href = event.target.value;
    },

    render: function() {
        return (
            <header className="app-header">
                <nav className="pure-menu pure-menu-horizontal pure-menu-fixed">
                    <div className="container">
                        <a className="pure-menu-heading pull-left logo" href={this.props.origin}>
                            <span>CODE</span><i className="fa fa-flask"/><span>MANA</span>
                        </a>

                        <form className="pure-form pull-left pure-u-2-3" onSubmit={this.gistRedirect} action="#">
                            <input className="pure-input-1-3" name="gistId" type="text" placeholder="Enter a Gist ID..." required="true"/>
                        </form>

                        <ul className="pure-menu-list pull-right">
                            {/*
                            <li className="pure-menu-item">
                                <a className="pure-menu-link" href="#"><i className="fa fa-github-square"/> GitHub Login</a>
                            </li>
                            */}
                            <li className="pure-menu-item">
                                <select onChange={this.updateStyle}>
                                    <option value="css/default.css">Default Highlighting</option>
                                    <option value="css/funky.css">Funky Highlighting</option>
                                    <option value="css/okaidia.css">Okaidia Highlighting</option>
                                </select>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
        );
    }
});