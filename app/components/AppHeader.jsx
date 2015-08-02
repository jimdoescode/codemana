var React = require("react");
var Qwest = require("qwest");
var Modal = require("react-modal");

module.exports = React.createClass({
    getDefaultProps: function() {
        return {origin: window.location.origin};
    },

    handleSubmit: function(event) {
        event.preventDefault();

        var gistId = event.target.children.namedItem("gistId").value.trim();
        if (gistId !== "")
            window.location.href = this.props.origin + "/" + gistId;
    },

    render: function() {
        return (
            <header className="app-header">
                <nav className="pure-menu pure-menu-horizontal pure-menu-fixed">
                    <div className="container">
                        <a className="pure-menu-heading pull-left logo" href={this.props.origin}>
                            <span>CODE</span><i className="fa fa-flask"/><span>MANA</span>
                        </a>

                        <form className="pure-form pull-left pure-u-2-3" onSubmit={this.handleSubmit} action="#">
                            <input className="pure-input-1-3" name="gistId" type="text" placeholder="Enter a Gist ID..." required="true"/>
                        </form>

                        <ul className="pure-menu-list pull-right">
                            <li className="pure-menu-item">
                                <a className="pure-menu-link" href="#"><i className="fa fa-github-square"/> GitHub Login</a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
        );
    }
});

var LoginModal = React.createClass({

    login: function() {
        Qwest.get('https://api.github.com/users/:username', {
            user: ':username',
            password: ''
        })
    },

    render: function() {
        return (
            <div/>
        );
    }

});